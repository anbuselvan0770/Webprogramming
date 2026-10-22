<?php
require_once __DIR__ . '/../config/db.php';

$pdo = getDB();
$userId = getAuthUserId();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $stmt = $pdo->prepare("
        SELECT s.*, 
               COUNT(DISTINCT t.id) AS total_tasks,
               SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks,
               COUNT(DISTINCT tt.id) AS weekly_classes
        FROM subjects s
        LEFT JOIN tasks t ON s.id = t.subject_id
        LEFT JOIN timetable tt ON s.id = tt.subject_id
        WHERE s.user_id = ?
        GROUP BY s.id
        ORDER BY s.name ASC
    ");
    $stmt->execute([$userId]);
    $subjects = $stmt->fetchAll();

    foreach ($subjects as &$sub) {
        $total = (int)$sub['total_tasks'];
        $completed = (int)$sub['completed_tasks'];
        $sub['progress_pct'] = $total > 0 ? round(($completed / $total) * 100) : 0;
    }

    sendResponse(200, $subjects, "Subjects retrieved successfully.");
}

if ($method === 'POST') {
    $data = getJsonInput();
    $name = trim($data['name'] ?? '');
    $code = trim($data['code'] ?? '');
    $color = trim($data['color'] ?? '#52796F');
    $instructor = trim($data['instructor'] ?? '');

    if (!$name) {
        sendResponse(400, null, "Subject name is required.");
    }
    if (mb_strlen($name) > 100) {
        sendResponse(400, null, "Subject name must be 100 characters or fewer.");
    }

    $duplicate = $pdo->prepare("SELECT id FROM subjects WHERE user_id = ? AND name = ?");
    $duplicate->execute([$userId, $name]);
    if ($duplicate->fetch()) {
        sendResponse(409, null, "You already added this subject.");
    }

    $stmt = $pdo->prepare("INSERT INTO subjects (user_id, name, code, color, instructor) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $name, $code, $color, $instructor]);
    $id = (int)$pdo->lastInsertId();

    $fetch = $pdo->prepare("SELECT * FROM subjects WHERE id = ?");
    $fetch->execute([$id]);
    $subject = $fetch->fetch();
    $subject['total_tasks'] = 0;
    $subject['completed_tasks'] = 0;
    $subject['weekly_classes'] = 0;
    $subject['progress_pct'] = 0;

    sendResponse(201, $subject, "Subject created successfully.");
}

if ($method === 'PUT') {
    $data = getJsonInput();
    $id = (int)($data['id'] ?? 0);
    $name = trim($data['name'] ?? '');
    $code = trim($data['code'] ?? '');
    $color = trim($data['color'] ?? '#52796F');
    $instructor = trim($data['instructor'] ?? '');

    if (!$id || !$name) {
        sendResponse(400, null, "Valid subject ID and name are required.");
    }
    if (mb_strlen($name) > 100) {
        sendResponse(400, null, "Subject name must be 100 characters or fewer.");
    }

    $duplicate = $pdo->prepare("SELECT id FROM subjects WHERE user_id = ? AND name = ? AND id != ?");
    $duplicate->execute([$userId, $name, $id]);
    if ($duplicate->fetch()) {
        sendResponse(409, null, "You already added this subject.");
    }

    $stmt = $pdo->prepare("UPDATE subjects SET name = ?, code = ?, color = ?, instructor = ? WHERE id = ? AND user_id = ?");
    $stmt->execute([$name, $code, $color, $instructor, $id, $userId]);

    $fetch = $pdo->prepare("SELECT * FROM subjects WHERE id = ?");
    $fetch->execute([$id]);
    $subject = $fetch->fetch();

    if (!$subject || (int)$subject['user_id'] !== $userId) {
        sendResponse(404, null, "Subject not found.");
    }

    sendResponse(200, $subject, "Subject updated successfully.");
}

if ($method === 'DELETE') {
    $data = getJsonInput();
    $id = (int)($_GET['id'] ?? ($data['id'] ?? 0));

    if (!$id) {
        sendResponse(400, null, "Valid subject ID is required.");
    }

    $stmt = $pdo->prepare("DELETE FROM subjects WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $userId]);

    sendResponse(200, ['deleted_id' => $id], "Subject deleted successfully.");
}
?>
