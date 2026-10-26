<?php
declare(strict_types=1);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false]);
    exit;
}

$config = @include __DIR__ . '/lead-proxy.config.php';
$apiKey = is_array($config) ? ($config['ERP_LEADS_API_KEY'] ?? '') : '';
if ($apiKey === '') {
    http_response_code(500);
    echo json_encode(['ok' => false]);
    exit;
}

$input = json_decode((string) file_get_contents('php://input'), true);
$email = is_array($input) ? trim((string) ($input['email'] ?? '')) : '';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false]);
    exit;
}

$name = trim((string) ($input['name'] ?? '')) ?: $email;
$product = trim((string) ($input['product'] ?? ''));
$language = trim((string) ($input['language'] ?? 'es')) ?: 'es';

$payload = [
    'name' => $name,
    'email' => $email,
    'language' => $language,
];
if ($product !== '') {
    $payload['product'] = $product;
    $payload['message'] = 'Pidió la ficha técnica desde el catálogo del sitio web.';
}

$ch = curl_init('https://erp.hadete.com/api/public/leads-web');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'X-Api-Key: ' . $apiKey,
    ],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 5,
]);
curl_exec($ch);
curl_close($ch);

echo json_encode(['ok' => true]);
