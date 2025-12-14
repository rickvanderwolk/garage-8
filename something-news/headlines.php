<?php

$cacheFile = __DIR__ . '/cache.json';

if (!file_exists($cacheFile)) {
    echo "Geen cache. Draai eerst: php rss.php\n";
    exit;
}

$data = json_decode(file_get_contents($cacheFile), true);

if (!$data || empty($data['items'])) {
    echo "Geen nieuws beschikbaar.\n";
    exit;
}

$items = array_slice($data['items'], 0, 15);

foreach ($items as $i => $item) {
    echo ($i + 1) . ". " . $item['title'] . "\n";
}
