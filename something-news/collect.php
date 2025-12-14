<?php

$feedUrl = 'https://feeds.nos.nl/nosnieuwsalgemeen';
$dataDir = __DIR__ . '/data';

// Maak data directory als die niet bestaat
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Bepaal bestandsnaam voor vandaag
$today = date('Y-m-d');
$file = $dataDir . '/' . $today . '.jsonl';

// Laad bestaande links om duplicaten te voorkomen
$existingLinks = [];
if (file_exists($file)) {
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $item = json_decode($line, true);
        if ($item && isset($item['link'])) {
            $existingLinks[$item['link']] = true;
        }
    }
}

// Haal RSS feed op
$xml = @simplexml_load_file($feedUrl);

if ($xml === false) {
    echo "Fout: kan RSS feed niet ophalen\n";
    exit(1);
}

// Verwerk nieuwe artikelen
$newCount = 0;
$handle = fopen($file, 'a');

foreach ($xml->channel->item as $item) {
    $link = (string) $item->link;

    // Skip als we dit artikel al hebben
    if (isset($existingLinks[$link])) {
        continue;
    }

    $article = [
        'title' => (string) $item->title,
        'link' => $link,
        'description' => (string) $item->description,
        'pubDate' => (string) $item->pubDate,
        'collected' => date('c'),
    ];

    fwrite($handle, json_encode($article, JSON_UNESCAPED_UNICODE) . "\n");
    $newCount++;
}

fclose($handle);

echo date('Y-m-d H:i:s') . " - {$newCount} nieuwe artikelen toegevoegd\n";
