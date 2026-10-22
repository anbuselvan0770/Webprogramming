<?php
require_once __DIR__ . '/../config/db.php';

$pdo = getDB();
$userId = getAuthUserId();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    if ($action === 'stats') {
        // Return summary calculations
        $stmt = $pdo->prepare("
            SELECT 
                COUNT(*) AS total_tasks,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks,
                SUM(CASE WHEN status != 'Completed' THEN 1 ELSE 0 END) AS pending_tasks,
                SUM(CASE WHEN due_date = CURDATE() THEN 1 ELSE 0 END) AS due_today,
                SUM(CASE WHEN due_date = CURDATE() AND status = 'Completed' THEN 1 ELSE 0 END) AS completed_today,
                SUM(CASE WHEN priority = 'High' AND status != 'Completed' THEN 1 ELSE 0 END) AS high_priority_pending
            FROM tasks
            WHERE user_id = ?
        ");
        $stmt->execute([$userId]);
        $stats = $stmt->fetch();

        $totalToday = (int)$stats['due_today'];
        $compToday = (int)$stats['completed_today'];
        $stats['today_progress_pct'] = $totalToday > 0 ? round(($compToday / $totalToday) * 100) : ($stats['total_tasks'] > 0 ? round(((int)$stats['completed_tasks'] / (int)$stats['total_tasks']) * 100) : 0);

        sendResponse(200, $stats, "Task statistics retrieved.");
    }

    // List tasks with filters
    $status = $_GET['status'] ?? '';
    $priority = $_GET['priority'] ?? '';
    $subjectId = isset($_GET['subject_id']) && is_numeric($_GET['subject_id']) ? (int)$_GET['subject_id'] : null;
    $search = trim($_GET['search'] ?? '');
    $todayOnly = isset($_GET['today']) && ($_GET['today'] === '1' || $_GET['today'] === 'true');
    $sort = $_GET['sort'] ?? 'due_date_asc';

    $sql = "
        SELECT t.*, 
               s.name AS subject_name, 
               s.code AS subject_code, 
               s.color AS subject_color
        FROM tasks t
        LEFT JOIN subjects s ON t.subject_id = s.id
        WHERE t.user_id = ?
    ";
    $params = [$userId];

    if ($status && in_array($status, ['Pending', 'In Progress', 'Completed'])) {
        $sql .= " AND t.status = ?";
        $params[] = $status;
    }

    if ($priority && in_array($priority, ['Low', 'Medium', 'High'])) {
        $sql .= " AND t.priority = ?";
        $params[] = $priority;
    }

    if ($subjectId) {
        $sql .= " AND t.subject_id = ?";
        $params[] = $subjectId;
    }

    if ($search) {
        $sql .= " AND (t.title LIKE ? OR t.description LIKE ?)";
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
    }

    if ($todayOnly) {
        $sql .= " AND t.due_date = CURDATE()";
    }

    // Sorting
    switch ($sort) {
        case 'due_date_desc':
            $sql .= " ORDER BY t.due_date DESC, t.due_time DESC";
            break;
        case 'priority_desc':
            $sql .= " ORDER CASE t.priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END, t.due_date ASC";
            break;
        case 'title_asc':
            $sql .= " ORDER BY t.title ASC";
            break;
        case 'due_date_asc':
        default:
            $sql .= " ORDER BY (t.status = 'Completed') ASC, t.due_date ASC, t.due_time ASC";
            break;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $tasks = $stmt->fetchAll();

    sendResponse(200, $tasks, "Tasks retrieved successfully.");
}

if ($method === 'POST') {
    $data = getJsonInput();

    // Handle toggle completion
    if ($action === 'toggle' || isset($data['toggle_id'])) {
        $taskId = (int)($_GET['id'] ?? ($data['id'] ?? $data['toggle_id']));
        $stmt = $pdo->prepare("SELECT status FROM tasks WHERE id = ? AND user_id = ?");
        $stmt->execute([$taskId, $userId]);
        $current = $stmt->fetch();

        if (!$current) {
            sendResponse(404, null, "Task not found.");
        }

        $newStatus = ($current['status'] === 'Completed') ? 'Pending' : 'Completed';
        $completedAt = ($newStatus === 'Completed') ? date('Y-m-d H:i:s') : null;

        $update = $pdo->prepare("UPDATE tasks SET status = ?, completed_at = ? WHERE id = ? AND user_id = ?");
        $update->execute([$newStatus, $completedAt, $taskId, $userId]);

        $fetch = $pdo->prepare("SELECT t.*, s.name as subject_name, s.code as subject_code, s.color as subject_color FROM tasks t LEFT JOIN subjects s ON t.subject_id = s.id WHERE t.id = ?");
        $fetch->execute([$taskId]);
        $task = $fetch->fetch();

        sendResponse(200, $task, "Task status updated to " . $newStatus);
    }

    // Create task
    $title = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');
    $subjectId = !empty($data['subject_id']) ? (int)$data['subject_id'] : null;
    $priority = in_array($data['priority'] ?? '', ['Low', 'Medium', 'High']) ? $data['priority'] : 'Medium';
    $dueDate = !empty($data['due_date']) ? $data['due_date'] : date('Y-m-d');
    $dueTime = !empty($data['due_time']) ? $data['due_time'] : '23:59:00';
    $status = in_array($data['status'] ?? '', ['Pending', 'In Progress', 'Completed']) ? $data['status'] : 'Pending';
    $estimatedMinutes = (int)($data['estimated_minutes'] ?? 30);

    if (!$title) {
        sendResponse(400, null, "Task title is required.");
    }

    $stmt = $pdo->prepare("
        INSERT INTO tasks (user_id, subject_id, title, description, priority, due_date, due_time, status, estimated_minutes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$userId, $subjectId, $title, $description, $priority, $dueDate, $dueTime, $status, $estimatedMinutes]);
    $id = (int)$pdo->lastInsertId();

    $fetch = $pdo->prepare("SELECT t.*, s.name as subject_name, s.code as subject_code, s.color as subject_color FROM tasks t LEFT JOIN subjects s ON t.subject_id = s.id WHERE t.id = ?");
    $fetch->execute([$id]);
    $task = $fetch->fetch();

    sendResponse(201, $task, "Task created successfully.");
}

if ($method === 'PUT') {
    $data = getJsonInput();
    $id = (int)($data['id'] ?? 0);
    $title = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');
    $subjectId = !empty($data['subject_id']) ? (int)$data['subject_id'] : null;
    $priority = in_array($data['priority'] ?? '', ['Low', 'Medium', 'High']) ? $data['priority'] : 'Medium';
    $dueDate = !empty($data['due_date']) ? $data['due_date'] : date('Y-m-d');
    $dueTime = !empty($data['due_time']) ? $data['due_time'] : '23:59:00';
    $status = in_array($data['status'] ?? '', ['Pending', 'In Progress', 'Completed']) ? $data['status'] : 'Pending';
    $estimatedMinutes = (int)($data['estimated_minutes'] ?? 30);
    $completedAt = ($status === 'Completed') ? date('Y-m-d H:i:s') : null;

    if (!$id || !$title) {
        sendResponse(400, null, "Valid task ID and title are required.");
    }

    $stmt = $pdo->prepare("
        UPDATE tasks 
        SET subject_id = ?, title = ?, description = ?, priority = ?, due_date = ?, due_time = ?, status = ?, completed_at = ?, estimated_minutes = ?
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$subjectId, $title, $description, $priority, $dueDate, $dueTime, $status, $completedAt, $estimatedMinutes, $id, $userId]);

    $fetch = $pdo->prepare("SELECT t.*, s.name as subject_name, s.code as subject_code, s.color as subject_color FROM tasks t LEFT JOIN subjects s ON t.subject_id = s.id WHERE t.id = ?");
    $fetch->execute([$id]);
    $task = $fetch->fetch();

    sendResponse(200, $task, "Task updated successfully.");
}

if ($method === 'DELETE') {
    $data = getJsonInput();
    $id = (int)($_GET['id'] ?? ($data['id'] ?? 0));

    if (!$id) {
        sendResponse(400, null, "Valid task ID is required.");
    }

    $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $userId]);

    sendResponse(200, ['deleted_id' => $id], "Task deleted successfully.");
}
?>
