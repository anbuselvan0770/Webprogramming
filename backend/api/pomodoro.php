<?php
require_once __DIR__ . '/../config/db.php';

$pdo = getDB();
$userId = getAuthUserId();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    // 1. Today's stats
    $stmtToday = $pdo->prepare("
        SELECT 
            COUNT(CASE WHEN session_type = 'Focus' THEN 1 END) AS today_focus_sessions,
            COALESCE(SUM(CASE WHEN session_type = 'Focus' THEN duration_minutes ELSE 0 END), 0) AS today_focus_minutes,
            COUNT(*) AS total_today_sessions
        FROM pomodoro_sessions
        WHERE user_id = ? AND DATE(completed_at) = CURDATE()
    ");
    $stmtToday->execute([$userId]);
    $todayStats = $stmtToday->fetch();

    // 2. Recent session list (last 15)
    $stmtRecent = $pdo->prepare("
        SELECT ps.*, 
               s.name AS subject_name, 
               s.color AS subject_color,
               t.title AS task_title
        FROM pomodoro_sessions ps
        LEFT JOIN subjects s ON ps.subject_id = s.id
        LEFT JOIN tasks t ON ps.task_id = t.id
        WHERE ps.user_id = ?
        ORDER BY ps.completed_at DESC
        LIMIT 15
    ");
    $stmtRecent->execute([$userId]);
    $recent = $stmtRecent->fetchAll();

    // 3. Past 7 days breakdown
    $stmtWeekly = $pdo->prepare("
        SELECT DATE(completed_at) as session_date, 
               DAYNAME(completed_at) as day_name,
               SUM(CASE WHEN session_type = 'Focus' THEN duration_minutes ELSE 0 END) as focus_minutes,
               COUNT(CASE WHEN session_type = 'Focus' THEN 1 END) as sessions_count
        FROM pomodoro_sessions
        WHERE user_id = ? AND completed_at >= (CURDATE() - INTERVAL 6 DAY)
        GROUP BY DATE(completed_at), DAYNAME(completed_at)
        ORDER BY session_date ASC
    ");
    $stmtWeekly->execute([$userId]);
    $weekly = $stmtWeekly->fetchAll();

    // 4. Calculate study streak (consecutive days with at least 1 focus session)
    $stmtDays = $pdo->prepare("
        SELECT DISTINCT DATE(completed_at) AS active_date
        FROM pomodoro_sessions
        WHERE user_id = ? AND session_type = 'Focus'
        ORDER BY active_date DESC
    ");
    $stmtDays->execute([$userId]);
    $activeDates = $stmtDays->fetchAll(PDO::FETCH_COLUMN);

    $streak = 0;
    $today = new DateTime();
    $yesterday = (new DateTime())->modify('-1 day');
    $checkDate = new DateTime();

    // If today has session, start checking from today, else if yesterday had one, streak is active
    $todayStr = $today->format('Y-m-d');
    $yesterdayStr = $yesterday->format('Y-m-d');

    if (in_array($todayStr, $activeDates)) {
        $cur = $today;
    } else if (in_array($yesterdayStr, $activeDates)) {
        $cur = $yesterday;
    } else {
        $cur = null;
    }

    if ($cur !== null) {
        while (in_array($cur->format('Y-m-d'), $activeDates)) {
            $streak++;
            $cur->modify('-1 day');
        }
    }

    sendResponse(200, [
        'today_sessions' => (int)$todayStats['today_focus_sessions'],
        'today_minutes' => (int)$todayStats['today_focus_minutes'],
        'streak_days' => max(1, $streak),
        'recent_sessions' => $recent,
        'weekly_history' => $weekly
    ], "Pomodoro statistics retrieved.");
}

if ($method === 'POST') {
    $data = getJsonInput();
    $subjectId = !empty($data['subject_id']) ? (int)$data['subject_id'] : null;
    $taskId = !empty($data['task_id']) ? (int)$data['task_id'] : null;
    $duration = (int)($data['duration_minutes'] ?? 25);
    $type = in_array($data['session_type'] ?? '', ['Focus', 'Short Break', 'Long Break']) ? $data['session_type'] : 'Focus';
    $notes = trim($data['notes'] ?? '');

    $stmt = $pdo->prepare("
        INSERT INTO pomodoro_sessions (user_id, subject_id, task_id, duration_minutes, session_type, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$userId, $subjectId, $taskId, $duration, $type, $notes]);
    $id = (int)$pdo->lastInsertId();

    // Also auto-generate a notification if focus session completed
    if ($type === 'Focus') {
        $notif = $pdo->prepare("
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (?, '🎯 Pomodoro Session Logged', ?, 'pomodoro')
        ");
        $notif->execute([$userId, "Awesome! Completed {$duration}-minute {$type} session."]);
    }

    $fetch = $pdo->prepare("
        SELECT ps.*, s.name as subject_name, s.color as subject_color, t.title as task_title
        FROM pomodoro_sessions ps
        LEFT JOIN subjects s ON ps.subject_id = s.id
        LEFT JOIN tasks t ON ps.task_id = t.id
        WHERE ps.id = ?
    ");
    $fetch->execute([$id]);
    $session = $fetch->fetch();

    sendResponse(201, $session, "Pomodoro session saved successfully.");
}
?>
