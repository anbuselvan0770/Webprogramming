<?php
require_once __DIR__ . '/config/db.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    $db = new Database();
    $conn = $db->getConnection();

    $existingTables = $conn->query("SHOW TABLES;")->fetchAll(PDO::FETCH_COLUMN);
    if (!empty($existingTables)) {
        if (in_array('users', $existingTables, true)) {
            $conn->exec("
                CREATE TABLE IF NOT EXISTS `user_sessions` (
                    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
                    `user_id` INT NOT NULL,
                    `token_hash` CHAR(64) NOT NULL UNIQUE,
                    `expires_at` DATETIME NOT NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX `idx_user_sessions_user` (`user_id`),
                    CONSTRAINT `fk_user_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
            $existingTables = $conn->query("SHOW TABLES;")->fetchAll(PDO::FETCH_COLUMN);
        }

        $requiredTables = ['users', 'user_sessions', 'subjects', 'tasks', 'timetable', 'pomodoro_sessions', 'resources', 'exams', 'notifications'];
        $missingTables = array_values(array_diff($requiredTables, $existingTables));
        if (!empty($missingTables)) {
            sendResponse(500, ['missing_tables' => $missingTables], "The existing database is incomplete. No data was changed.");
        }

        $stats = [];
        foreach ($requiredTables as $table) {
            $stats[$table] = (int)$conn->query("SELECT COUNT(*) FROM `{$table}`;")->fetchColumn();
        }
        sendResponse(200, [
            'database' => 'studysync_db',
            'tables' => $requiredTables,
            'records' => $stats,
            'status' => 'already_initialized'
        ], "StudySync database is ready.");
    }

    $sqlPath = __DIR__ . '/schema.sql';
    if (!file_exists($sqlPath)) {
        sendResponse(404, null, "schema.sql not found at " . $sqlPath);
    }

    $sql = file_get_contents($sqlPath);

    // Run statements
    $conn->exec($sql);

    // Verify tables
    $stmt = $conn->query("SHOW TABLES;");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Query stats
    $stats = [];
    foreach ($tables as $table) {
        $countStmt = $conn->query("SELECT COUNT(*) FROM `{$table}`;");
        $stats[$table] = (int)$countStmt->fetchColumn();
    }

    $requiredTables = ['users', 'user_sessions', 'subjects', 'tasks', 'timetable', 'pomodoro_sessions', 'resources', 'exams', 'notifications'];

    sendResponse(200, [
        'database' => 'studysync_db',
        'tables' => $requiredTables,
        'records' => $stats,
        'status' => 'initialized_successfully'
    ], "StudySync database initialized successfully.");

} catch (PDOException $e) {
    sendResponse(500, ['error' => $e->getMessage()], "Failed to initialize database: " . $e->getMessage());
}
?>
