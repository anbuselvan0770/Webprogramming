<?php
require_once __DIR__ . '/../config/db.php';

$pdo = getDB();
$userId = getAuthUserId();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $category = $_GET['category'] ?? '';
    $subjectId = isset($_GET['subject_id']) && is_numeric($_GET['subject_id']) ? (int)$_GET['subject_id'] : null;
    $search = trim($_GET['search'] ?? '');

    $sql = "
        SELECT r.*, 
               s.name AS subject_name, 
               s.code AS subject_code, 
               s.color AS subject_color
        FROM resources r
        LEFT JOIN subjects s ON r.subject_id = s.id
        WHERE r.user_id = ?
    ";
    $params = [$userId];

    if ($category && $category !== 'All') {
        $sql .= " AND r.category = ?";
        $params[] = $category;
    }

    if ($subjectId) {
        $sql .= " AND r.subject_id = ?";
        $params[] = $subjectId;
    }

    if ($search) {
        $sql .= " AND (r.title LIKE ? OR r.description LIKE ?)";
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
    }

    $sql .= " ORDER BY r.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $resources = $stmt->fetchAll();

    sendResponse(200, $resources, "Resources retrieved successfully.");
}

if ($method === 'POST') {
    $data = getJsonInput();
    $title = trim($data['title'] ?? '');
    $category = in_array($data['category'] ?? '', ['Notes', 'PDF Document', 'YouTube Link', 'Website', 'Reference Book']) ? $data['category'] : 'Notes';
    $url = trim($data['url'] ?? '');
    $subjectId = !empty($data['subject_id']) ? (int)$data['subject_id'] : null;
    $description = trim($data['description'] ?? '');

    if (!$title) {
        sendResponse(400, null, "Resource title is required.");
    }

    $stmt = $pdo->prepare("
        INSERT INTO resources (user_id, subject_id, title, category, url, description)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$userId, $subjectId, $title, $category, $url, $description]);
    $id = (int)$pdo->lastInsertId();

    $fetch = $pdo->prepare("
        SELECT r.*, s.name as subject_name, s.code as subject_code, s.color as subject_color 
        FROM resources r 
        LEFT JOIN subjects s ON r.subject_id = s.id 
        WHERE r.id = ?
    ");
    $fetch->execute([$id]);
    $resource = $fetch->fetch();

    sendResponse(201, $resource, "Resource added to vault.");
}

if ($method === 'PUT') {
    $data = getJsonInput();
    $id = (int)($data['id'] ?? 0);
    $title = trim($data['title'] ?? '');
    $category = in_array($data['category'] ?? '', ['Notes', 'PDF Document', 'YouTube Link', 'Website', 'Reference Book']) ? $data['category'] : 'Notes';
    $url = trim($data['url'] ?? '');
    $subjectId = !empty($data['subject_id']) ? (int)$data['subject_id'] : null;
    $description = trim($data['description'] ?? '');

    if (!$id || !$title) {
        sendResponse(400, null, "Valid resource ID and title required.");
    }

    $stmt = $pdo->prepare("
        UPDATE resources
        SET subject_id = ?, title = ?, category = ?, url = ?, description = ?
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$subjectId, $title, $category, $url, $description, $id, $userId]);

    $fetch = $pdo->prepare("
        SELECT r.*, s.name as subject_name, s.code as subject_code, s.color as subject_color 
        FROM resources r 
        LEFT JOIN subjects s ON r.subject_id = s.id 
        WHERE r.id = ?
    ");
    $fetch->execute([$id]);
    $resource = $fetch->fetch();

    sendResponse(200, $resource, "Resource updated successfully.");
}

if ($method === 'DELETE') {
    $data = getJsonInput();
    $id = (int)($_GET['id'] ?? ($data['id'] ?? 0));

    if (!$id) {
        sendResponse(400, null, "Valid resource ID required.");
    }

    $stmt = $pdo->prepare("DELETE FROM resources WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $userId]);

    sendResponse(200, ['deleted_id' => $id], "Resource removed from vault.");
}
?>
