<?php
require_once __DIR__ . '/../config/db.php';

$pdo = getDB();
$userId = getAuthUserId();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    // 1. User Profile
    $userStmt = $pdo->prepare("SELECT id, name, email, course, department, year_of_study, daily_goal_minutes, theme_preference FROM users WHERE id = ?");
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch();
    if (!$user) {
        sendResponse(401, null, "Your session is invalid. Please sign in again.");
    }
    if ($user) {
        $user['student_id'] = $user['id'];
    }

    // 2. Task Progress Stats
    $taskStatsStmt = $pdo->prepare("
        SELECT 
            COUNT(*) AS total_tasks,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks,
            SUM(CASE WHEN status != 'Completed' THEN 1 ELSE 0 END) AS pending_tasks,
            SUM(CASE WHEN due_date = CURDATE() THEN 1 ELSE 0 END) AS due_today,
            SUM(CASE WHEN due_date = CURDATE() AND status = 'Completed' THEN 1 ELSE 0 END) AS completed_today
        FROM tasks
        WHERE user_id = ?
    ");
    $taskStatsStmt->execute([$userId]);
    $taskStats = $taskStatsStmt->fetch();

    $total = (int)$taskStats['total_tasks'];
    $completed = (int)$taskStats['completed_tasks'];
    $pending = (int)$taskStats['pending_tasks'];
    $percent = $total > 0 ? round(($completed / $total) * 100) : 0;

    // 3. Priority Tasks (High/Medium, Pending or In Progress, limit 6)
    $priorityStmt = $pdo->prepare("
        SELECT t.*, s.name AS subject_name, s.code AS subject_code, s.color AS subject_color
        FROM tasks t
        LEFT JOIN subjects s ON t.subject_id = s.id
        WHERE t.user_id = ?
        ORDER BY 
            (t.status = 'Completed') ASC,
            FIELD(t.priority, 'High', 'Medium', 'Low'),
            t.due_date ASC
        LIMIT 6
    ");
    $priorityStmt->execute([$userId]);
    $priorityTasks = $priorityStmt->fetchAll();

    // 4. Today's Classes
    $dayName = date('l');
    $classStmt = $pdo->prepare("
        SELECT tt.*, s.name AS subject_name, s.code AS subject_code, s.color AS subject_color, s.instructor
        FROM timetable tt
        LEFT JOIN subjects s ON tt.subject_id = s.id
        WHERE tt.user_id = ? AND tt.day_of_week = ?
        ORDER BY tt.start_time ASC
    ");
    $classStmt->execute([$userId, $dayName]);
    $todayClasses = $classStmt->fetchAll();

    // If no classes today (e.g. weekend), also fetch Monday classes as preview
    if (empty($todayClasses)) {
        $previewStmt = $pdo->prepare("
            SELECT tt.*, s.name AS subject_name, s.code AS subject_code, s.color AS subject_color, s.instructor
            FROM timetable tt
            LEFT JOIN subjects s ON tt.subject_id = s.id
            WHERE tt.user_id = ? AND tt.day_of_week = 'Monday'
            ORDER BY tt.start_time ASC
        ");
        $previewStmt->execute([$userId]);
        $todayClasses = $previewStmt->fetchAll();
    }

    // 5. Pomodoro Stats & Streak
    $pomoStmt = $pdo->prepare("
        SELECT 
            COUNT(CASE WHEN session_type = 'Focus' THEN 1 END) AS today_focus_sessions,
            COALESCE(SUM(CASE WHEN session_type = 'Focus' THEN duration_minutes ELSE 0 END), 0) AS today_focus_minutes
        FROM pomodoro_sessions
        WHERE user_id = ? AND DATE(completed_at) = CURDATE()
    ");
    $pomoStmt->execute([$userId]);
    $pomoStats = $pomoStmt->fetch();

    // Calculate streak
    $streakStmt = $pdo->prepare("SELECT DISTINCT DATE(completed_at) AS d FROM pomodoro_sessions WHERE user_id = ? AND session_type = 'Focus' ORDER BY d DESC");
    $streakStmt->execute([$userId]);
    $dates = $streakStmt->fetchAll(PDO::FETCH_COLUMN);
    $streak = count($dates) > 0 ? count($dates) : 1;

    // 6. Upcoming Deadlines & Exams (Next 14 days)
    $examStmt = $pdo->prepare("
        SELECT e.id, e.title, e.exam_date as due_date, e.start_time as due_time, 'exam' as item_type, s.name as subject_name, s.color as subject_color, e.venue as location
        FROM exams e
        LEFT JOIN subjects s ON e.subject_id = s.id
        WHERE e.user_id = ? AND e.exam_date >= CURDATE()
        ORDER BY e.exam_date ASC
        LIMIT 4
    ");
    $examStmt->execute([$userId]);
    $upcomingExams = $examStmt->fetchAll();

    $taskDueStmt = $pdo->prepare("
        SELECT t.id, t.title, t.due_date, t.due_time, 'task' as item_type, s.name as subject_name, s.color as subject_color, t.priority as location
        FROM tasks t
        LEFT JOIN subjects s ON t.subject_id = s.id
        WHERE t.user_id = ? AND t.status != 'Completed' AND t.due_date >= CURDATE()
        ORDER BY t.due_date ASC, t.due_time ASC
        LIMIT 4
    ");
    $taskDueStmt->execute([$userId]);
    $upcomingTasks = $taskDueStmt->fetchAll();

    // 7. Recent Notifications
    $notifStmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5");
    $notifStmt->execute([$userId]);
    $notifications = $notifStmt->fetchAll();

    // Compute dynamic greeting based on hour
    $hour = (int)date('H');
    $greeting = "Good morning";
    if ($hour >= 12 && $hour < 17) {
        $greeting = "Good afternoon";
    } else if ($hour >= 17) {
        $greeting = "Good evening";
    }

    sendResponse(200, [
        'greeting' => "{$greeting}, " . htmlspecialchars($user['name'] ?? 'Student') . "! Let's focus.",
        'student' => $user,
        'date' => [
            'formatted' => date('l, F j, Y'),
            'day_name' => $dayName,
            'time' => date('h:i A')
        ],
        'progress' => [
            'total_tasks' => $total,
            'completed_tasks' => $completed,
            'pending_tasks' => $pending,
            'completion_percentage' => $percent
        ],
        'focus' => [
            'today_minutes' => (int)$pomoStats['today_focus_minutes'],
            'today_sessions' => (int)$pomoStats['today_focus_sessions'],
            'daily_goal_minutes' => (int)($user['daily_goal_minutes'] ?? 120),
            'streak_days' => $streak
        ],
        'priority_tasks' => $priorityTasks,
        'today_classes' => $todayClasses,
        'upcoming_schedule' => array_merge($upcomingExams, $upcomingTasks),
        'notifications' => $notifications
    ], "Dashboard data loaded.");
}
?>
