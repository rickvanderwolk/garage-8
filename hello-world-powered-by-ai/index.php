<?php
// Load environment variables
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        if (!array_key_exists($name, $_ENV)) {
            $_ENV[$name] = $value;
        }
    }
}

loadEnv(__DIR__ . '/.env');

$apiKey = $_ENV['OPENAI_API_KEY'] ?? '';

if (empty($apiKey)) {
    die('Error: No API key found. Create a .env file with your OPENAI_API_KEY.');
}

// Ask AI to generate HTML for Hello World
$prompt = "I have an HTML page and want to show Hello World as a header. Return ONLY the HTML code for the header element, nothing else. No explanation, no markdown, just pure HTML.";

$data = [
    'model' => 'gpt-3.5-turbo',
    'messages' => [
        [
            'role' => 'user',
            'content' => $prompt
        ]
    ],
    'max_tokens' => 50
];

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    die('Error: OpenAI API error: ' . $httpCode);
}

$result = json_decode($response, true);

if (!isset($result['choices'][0]['message']['content'])) {
    die('Error: Unexpected response format from OpenAI');
}

$aiGeneratedHTML = trim($result['choices'][0]['message']['content']);
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Hello World Powered by AI</title>
</head>
<body>
<?php echo $aiGeneratedHTML; ?>
</body>
</html>
