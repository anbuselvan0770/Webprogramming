<?php
require_once __DIR__ . '/../config/db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? ($method === 'GET' ? 'me' : 'login');

function createUserSession(PDO $pdo, int $userId): string {
    $token = bin2hex(random_bytes(32));
    $stmt = $pdo->prepare("INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))");
    $stmt->execute([$userId, hash('sha256', $token)]);
    return $token;
}

if ($method === 'POST' && $action === 'logout') {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (preg_match('/^Bearer\s+([a-f0-9]{64})$/i', trim($authHeader), $matches)) {
        $stmt = $pdo->prepare("DELETE FROM user_sessions WHERE token_hash = ?");
        $stmt->execute([hash('sha256', $matches[1])]);
    }
    sendResponse(200, null, "Signed out successfully.");
}

if ($method === 'POST') {
    $data = getJsonInput();
    if (empty($data)) {
        $data = $_POST;
    }

    if ($action === 'register') {
        $name = trim($data['name'] ?? '');
        $email = trim(strtolower($data['email'] ?? ''));
        $password = $data['password'] ?? '';
        $course = trim($data['course'] ?? 'B.Tech Computer Science & Engineering');
        $department = trim($data['department'] ?? 'School of Computing');
        $year = trim($data['year_of_study'] ?? '3rd Year');

        if (!$name || !$email || !$password) {
            sendResponse(400, null, "Name, email, and password are required.");
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(400, null, "Enter a valid email address.");
        }
        if (strlen($password) < 8) {
            sendResponse(400, null, "Password must be at least 8 characters.");
        }

        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            sendResponse(409, null, "An account with this email already exists.");
        }

        $password_hash = password_hash($password, PASSWORD_BCRYPT);
        $insert = $pdo->prepare("INSERT INTO users (name, email, password_hash, course, department, year_of_study) VALUES (?, ?, ?, ?, ?, ?)");
        $insert->execute([$name, $email, $password_hash, $course, $department, $year]);
        $userId = (int)$pdo->lastInsertId();

        $token = createUserSession($pdo, $userId);

        sendResponse(201, [
            'token' => $token,
            'user' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email,
                'course' => $course,
                'department' => $department,
                'year_of_study' => $year,
                'theme_preference' => 'cosmic-amethyst',
                'daily_goal_minutes' => 120
            ]
        ], "Registration successful!");

    } else if ($action === 'login') {
        $email = trim(strtolower($data['email'] ?? ''));
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            sendResponse(400, null, "Email and password are required.");
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            sendResponse(401, null, "Invalid email or password.");
        }

        if (!password_verify($password, $user['password_hash'])) {
            sendResponse(401, null, "Invalid email or password.");
        }

        unset($user['password_hash']);
        $token = createUserSession($pdo, (int)$user['id']);

        sendResponse(200, [
            'token' => $token,
            'user' => $user
        ], "Login successful. Welcome back!");

    } else if ($action === 'profile') {
        $userId = getAuthUserId();
        $name = trim($data['name'] ?? '');
        $course = trim($data['course'] ?? '');
        $department = trim($data['department'] ?? '');
        $year = trim($data['year_of_study'] ?? '');
        $dailyGoal = (int)($data['daily_goal_minutes'] ?? 120);
        $theme = trim($data['theme_preference'] ?? 'cosmic-amethyst');

        if (!in_array($theme, ['cosmic-amethyst', 'sage-green', 'calm-blue', 'slate-minimal'], true)) {
            sendResponse(400, null, "Select a valid interface theme.");
        }

        if (!$name) {
            sendResponse(400, null, "Student name cannot be empty.");
        }

        $update = $pdo->prepare("UPDATE users SET name = ?, course = ?, department = ?, year_of_study = ?, daily_goal_minutes = ?, theme_preference = ? WHERE id = ?");
        $update->execute([$name, $course, $department, $year, $dailyGoal, $theme, $userId]);

        $stmt = $pdo->prepare("SELECT id, name, email, course, department, year_of_study, theme_preference, daily_goal_minutes FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $updatedUser = $stmt->fetch();

        sendResponse(200, ['user' => $updatedUser], "Profile updated successfully.");
    }
}

if ($method === 'GET') {
    $userId = getAuthUserId();
    $stmt = $pdo->prepare("SELECT id, name, email, course, department, year_of_study, avatar_url, theme_preference, daily_goal_minutes, created_at FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        sendResponse(401, null, "Your session is invalid. Please sign in again.");
    }

    sendResponse(200, ['user' => $user], "User details fetched successfully.");
}
?>
