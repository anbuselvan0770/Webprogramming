<?php
require_once __DIR__ . '/../config/db.php';

$pdo = getDB();
$userId = getAuthUserId();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    $stmt = $pdo->prepare("
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 25
    ");
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll();

    $unreadStmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = FALSE");
    $unreadStmt->execute([$userId]);
    $unreadCount = (int)$unreadStmt->fetchColumn();

    sendResponse(200, [
        'list' => $notifications,
        'unread_count' => $unreadCount
    ], "Notifications retrieved.");
}

if ($method === 'POST') {
    $data = getJsonInput();

    if ($action === 'read') {
        $id = (int)($data['id'] ?? ($_GET['id'] ?? 0));
        if ($id) {
            $stmt = $pdo->prepare("UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?");
            $stmt->execute([$id, $userId]);
        }
        sendResponse(200, null, "Notification marked as read.");
    }

    if ($action === 'read_all') {
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = TRUE WHERE user_id = ?");
        $stmt->execute([$userId]);
        sendResponse(200, null, "All notifications marked as read.");
    }

    if ($action === 'create') {
        $title = trim($data['title'] ?? '');
        $message = trim($data['message'] ?? '');
        $type = in_array($data['type'] ?? '', ['deadline', 'class', 'pomodoro', 'system']) ? $data['type'] : 'system';

        if (!$title || !$message) {
            sendResponse(400, null, "Title and message are required.");
        }

        $stmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)");
        $stmt->execute([$userId, $title, $message, $type]);
        $id = (int)$pdo->lastInsertId();

        sendResponse(201, ['id' => $id], "Notification created.");
    }
}
?>
