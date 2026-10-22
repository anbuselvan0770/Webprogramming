<?php
// PHP Built-in development server router
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Check if direct file exists
$filePath = __DIR__ . $uri;
if ($uri !== '/' && file_exists($filePath) && !is_dir($filePath)) {
    return false; // serve as is
}

// Route /api/... to api/...
if (preg_match('#^/api/(.+)$#', $uri, $matches)) {
    $script = __DIR__ . '/api/' . $matches[1];
    if (file_exists($script) && !is_dir($script)) {
        require $script;
        exit();
    }
    // Also check if .php was omitted
    if (file_exists($script . '.php')) {
        require $script . '.php';
        exit();
    }
}

// Fallback for root
if ($uri === '/' || $uri === '/index.php') {
    require_once __DIR__ . '/init_db.php';
    exit();
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint not found', 'path' => $uri]);
?>
