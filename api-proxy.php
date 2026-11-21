<?php
declare(strict_types=1);

/*
 * Same-origin API relay for HAX_NON_ROOT.
 * Only the four public client endpoints are allowed; this is not an open proxy.
 */
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');

$path = (string)($_GET['path'] ?? '');
$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));

$allowed = [
    'GET' => ['/health', '/api/public/maintenance'],
    'POST' => ['/api/check', '/api/verify'],
];

if (!isset($allowed[$method]) || !in_array($path, $allowed[$method], true)) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Not found'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!function_exists('curl_init')) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'cURL is not enabled on this hosting account'], JSON_UNESCAPED_UNICODE);
    exit;
}

$body = '';
if ($method === 'POST') {
    $body = file_get_contents('php://input') ?: '';
    if (strlen($body) > 20480) {
        http_response_code(413);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Request too large'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

$upstream = 'https://haxreseller-production.up.railway.app' . $path;
$ch = curl_init($upstream);
$options = [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 22,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_HTTPHEADER => ['Accept: application/json', 'Content-Type: application/json'],
    CURLOPT_CUSTOMREQUEST => $method,
];

if ($method === 'POST') {
    $options[CURLOPT_POSTFIELDS] = $body;
}
curl_setopt_array($ch, $options);

$response = curl_exec($ch);
$status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$error = curl_error($ch);
curl_close($ch);

if ($response === false || $status < 100) {
    http_response_code(502);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => 'تعذر على خادم الموقع الاتصال بخادم التحقق.',
        'detail' => $error ?: 'Upstream connection failed'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code($status);
header('Content-Type: ' . ($contentType ?: 'application/json; charset=utf-8'));
echo $response;
