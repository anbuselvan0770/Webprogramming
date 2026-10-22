<?php
require_once __DIR__ . '/../config/db.php';

$pdo = getDB();
$userId = getAuthUserId();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $day = $_GET['day'] ?? '';
    $todayOnly = isset($_GET['today']) && ($_GET['today'] === '1' || $_GET['today'] === 'true');

    if ($todayOnly) {
        $day = date('l'); // Current day name: Monday, Tuesday, etc.
    }

    $sql = "
        SELECT tt.*, 
               s.name AS subject_name, 
               s.code AS subject_code, 
               s.color AS subject_color,
               s.instructor AS instructor
        FROM timetable tt
        LEFT JOIN subjects s ON tt.subject_id = s.id
        WHERE tt.user_id = ?
    ";
    $params = [$userId];

    if ($day) {
        $sql .= " AND tt.day_of_week = ?";
        $params[] = $day;
    }

    $sql .= " ORDER BY FIELD(tt.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), tt.start_time ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $entries = $stmt->fetchAll();

    // Group by day for convenience if requested
    $grouped = [
        'Monday' => [],
        'Tuesday' => [],
        'Wednesday' => [],
        'Thursday' => [],
        'Friday' => [],
        'Saturday' => [],
        'Sunday' => []
    ];
    foreach ($entries as $item) {
        $grouped[$item['day_of_week']][] = $item;
    }

    sendResponse(200, [
        'list' => $entries,
        'by_day' => $grouped,
        'current_day' => date('l')
    ], "Timetable entries retrieved successfully.");
}

if ($method === 'POST') {
    $data = getJsonInput();
    $subjectId = (int)($data['subject_id'] ?? 0);
    $day = $data['day_of_week'] ?? 'Monday';
    $startTime = $data['start_time'] ?? '09:00:00';
    $endTime = $data['end_time'] ?? '10:00:00';
    $room = trim($data['room'] ?? '');
    $type = in_array($data['type'] ?? '', ['Lecture', 'Lab', 'Tutorial', 'Seminar']) ? $data['type'] : 'Lecture';

    $validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!in_array($day, $validDays)) {
        sendResponse(400, null, "Invalid day of week.");
    }

    $stmt = $pdo->prepare("
        INSERT INTO timetable (user_id, subject_id, day_of_week, start_time, end_time, room, type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$userId, $subjectId ?: null, $day, $startTime, $endTime, $room, $type]);
    $id = (int)$pdo->lastInsertId();

    $fetch = $pdo->prepare("
        SELECT tt.*, s.name as subject_name, s.code as subject_code, s.color as subject_color, s.instructor 
        FROM timetable tt 
        LEFT JOIN subjects s ON tt.subject_id = s.id 
        WHERE tt.id = ?
    ");
    $fetch->execute([$id]);
    $entry = $fetch->fetch();

    sendResponse(201, $entry, "Class added to timetable.");
}

if ($method === 'PUT') {
    $data = getJsonInput();
    $id = (int)($data['id'] ?? 0);
    $subjectId = (int)($data['subject_id'] ?? 0);
    $day = $data['day_of_week'] ?? 'Monday';
    $startTime = $data['start_time'] ?? '09:00:00';
    $endTime = $data['end_time'] ?? '10:00:00';
    $room = trim($data['room'] ?? '');
    $type = in_array($data['type'] ?? '', ['Lecture', 'Lab', 'Tutorial', 'Seminar']) ? $data['type'] : 'Lecture';

    if (!$id) {
        sendResponse(400, null, "Valid timetable ID required.");
    }

    $stmt = $pdo->prepare("
        UPDATE timetable
        SET subject_id = ?, day_of_week = ?, start_time = ?, end_time = ?, room = ?, type = ?
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$subjectId ?: null, $day, $startTime, $endTime, $room, $type, $id, $userId]);

    $fetch = $pdo->prepare("
        SELECT tt.*, s.name as subject_name, s.code as subject_code, s.color as subject_color, s.instructor 
        FROM timetable tt 
        LEFT JOIN subjects s ON tt.subject_id = s.id 
        WHERE tt.id = ?
    ");
    $fetch->execute([$id]);
    $entry = $fetch->fetch();

    sendResponse(200, $entry, "Class updated successfully.");
}

if ($method === 'DELETE') {
    $data = getJsonInput();
    $id = (int)($_GET['id'] ?? ($data['id'] ?? 0));

    if (!$id) {
        sendResponse(400, null, "Valid timetable ID required.");
    }

    $stmt = $pdo->prepare("DELETE FROM timetable WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $userId]);

    sendResponse(200, ['deleted_id' => $id], "Class schedule removed.");
}
?>
