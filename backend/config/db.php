<?php
require_once __DIR__ . '/cors.php';

class Database {
    private $host = "127.0.0.1";
    private $port = "3306";
    private $db_name = "studysync_db";
    private $username = "root";
    private $password = "root"; // tested working password
    public $conn = null;

    public function getConnection() {
        if ($this->conn !== null) {
            return $this->conn;
        }

        // List of candidate passwords to try if standard root/root fails
        $passwords = ["Anbu@123", $this->password, ""];
        $connected = false;

        foreach ($passwords as $pwd) {
            try {
                // First test connecting to server
                $dsn = "mysql:host=" . $this->host . ";port=" . $this->port . ";charset=utf8mb4";
                $pdo = new PDO($dsn, $this->username, $pwd, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);

                // Auto-create database if not exists
                $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$this->db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
                $pdo->exec("USE `{$this->db_name}`;");

                $this->password = $pwd;
                $this->conn = $pdo;
                $connected = true;
                break;
            } catch (PDOException $e) {
                // Continue trying next password
                continue;
            }
        }

        if (!$connected) {
            sendResponse(500, null, "Database connection error. Please verify MySQL service is running.");
        }

        return $this->conn;
    }
}

// Global helper for endpoints
function getDB() {
    static $dbInstance = null;
    if ($dbInstance === null) {
        $db = new Database();
        $dbInstance = $db->getConnection();
    }
    return $dbInstance;
}

// Resolve the signed-in student from the bearer token.
function getAuthUserId() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!preg_match('/^Bearer\s+([a-f0-9]{64})$/i', trim($authHeader), $matches)) {
        sendResponse(401, null, "Please sign in to continue.");
    }

    $stmt = getDB()->prepare("SELECT user_id FROM user_sessions WHERE token_hash = ? AND expires_at > NOW()");
    $stmt->execute([hash('sha256', $matches[1])]);
    $userId = $stmt->fetchColumn();
    if (!$userId) {
        sendResponse(401, null, "Your session is invalid. Please sign in again.");
    }

    return (int)$userId;
}
?>
