<?php
require_once __DIR__ . '/../config/db.php';

$pdo = getDB();
$userId = getAuthUserId();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $stmt = $pdo->prepare("
        SELECT e.*, 
               s.name AS subject_name, 
               s.code AS subject_code, 
               s.color AS subject_color,
               DATEDIFF(e.exam_date, CURDATE()) AS days_left
        FROM exams e
        LEFT JOIN subjects s ON e.subject_id = s.id
        WHERE e.user_id = ?
        ORDER BY e.exam_date ASC, e.start_time ASC
    ");
    $stmt->execute([$userId]);
    $exams = $stmt->fetchAll();

    sendResponse(200, $exams, "Exams retrieved successfully.");
}

if ($method === 'POST') {
    $data = getJsonInput();
    $subjectId = !empty($data['subject_id']) ? (int)$data['subject_id'] : null;
    $title = trim($data['title'] ?? '');
    $examDate = $data['exam_date'] ?? date('Y-m-d', strtotime('+7 days'));
    $startTime = !empty($data['start_time']) ? $data['start_time'] : '10:00:00';
    $venue = trim($data['venue'] ?? '');
    $syllabus = trim($data['syllabus'] ?? '');

    if (!$title) {
        sendResponse(400, null, "Exam title is required.");
    }

    $stmt = $pdo->prepare("
        INSERT INTO exams (user_id, subject_id, title, exam_date, start_time, venue, syllabus)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$userId, $subjectId, $title, $examDate, $startTime, $venue, $syllabus]);
    $id = (int)$pdo->lastInsertId();

    $fetch = $pdo->prepare("SELECT e.*, s.name as subject_name, s.color as subject_color FROM exams e LEFT JOIN subjects s ON e.subject_id = s.id WHERE e.id = ?");
    $fetch->execute([$id]);
    $exam = $fetch->fetch();

    sendResponse(201, $exam, "Exam added to schedule.");
}

if ($method === 'DELETE') {
    $data = getJsonInput();
    $id = (int)($_GET['id'] ?? ($data['id'] ?? 0));

    if (!$id) {
        sendResponse(400, null, "Valid exam ID required.");
    }

    $stmt = $pdo->prepare("DELETE FROM exams WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $userId]);

    sendResponse(200, ['deleted_id' => $id], "Exam entry deleted.");
}
?>
