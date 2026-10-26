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
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['ok' => false]);
    exit;
}

/* honeypot: bots fill every field, including this one, which stays empty
   and hidden for real visitors. Pretend it worked so they don't learn. */
if (trim((string) ($input['_honey'] ?? '')) !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

$email = trim((string) ($input['email'] ?? ''));
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false]);
    exit;
}

$name = trim((string) ($input['name'] ?? ''));
$company = trim((string) ($input['company'] ?? ''));
$product = trim((string) ($input['product'] ?? ''));
$port = trim((string) ($input['port'] ?? ''));
$volume = trim((string) ($input['volume'] ?? ''));
$message = trim((string) ($input['message'] ?? ''));
$source = trim((string) ($input['source'] ?? ''));
$language = trim((string) ($input['language'] ?? 'es')) ?: 'es';

$notes = [];
if ($source === 'catalog') {
    $notes[] = 'Pidió la ficha técnica desde el catálogo del sitio web.';
}
if ($company !== '' && $name !== '') {
    $notes[] = 'Empresa: ' . $company;
}
if ($port !== '') {
    $notes[] = 'Destino: ' . $port;
}
if ($volume !== '') {
    $notes[] = 'Volumen: ' . $volume;
}
if ($message !== '') {
    $notes[] = $message;
}

$payload = [
    'name' => $name !== '' ? $name : ($company !== '' ? $company : $email),
    'email' => $email,
    'language' => $language,
];
if ($product !== '') {
    $payload['product'] = $product;
}
if ($notes) {
    $payload['message'] = implode("\n", $notes);
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
$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

$ok = $curlError === '' && $status >= 200 && $status < 300;

if (!$ok) {
    $line = sprintf(
        "[%s] status=%s curl_error=%s email=%s response=%s\n",
        date('c'),
        $status,
        $curlError,
        $email,
        is_string($response) ? substr($response, 0, 500) : ''
    );
    @file_put_contents(__DIR__ . '/lead-proxy.log', $line, FILE_APPEND);
}

http_response_code($ok ? 200 : 502);
echo json_encode(['ok' => $ok]);
