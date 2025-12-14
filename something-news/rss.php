<?php

$feedUrl = 'https://feeds.nos.nl/nosnieuwsalgemeen';
$cacheFile = __DIR__ . '/cache.json';
$cacheTime = 15 * 60; // 15 minuten

// Check of cache nog geldig is
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    header('Content-Type: application/json');
    echo file_get_contents($cacheFile);
    exit;
}

// Haal RSS feed op
$xml = @simplexml_load_file($feedUrl);

if ($xml === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Kan RSS feed niet ophalen']);
    exit;
}

// Converteer naar array
$items = [];
foreach ($xml->channel->item as $item) {
    $items[] = [
        'title' => (string) $item->title,
        'link' => (string) $item->link,
        'description' => (string) $item->description,
        'pubDate' => (string) $item->pubDate,
    ];
}

$data = [
    'source' => (string) $xml->channel->title,
    'fetched' => date('c'),
    'items' => $items,
];

// Sla op als JSON cache
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
file_put_contents($cacheFile, $json);

header('Content-Type: application/json');
echo $json;
