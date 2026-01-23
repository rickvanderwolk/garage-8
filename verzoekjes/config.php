<?php

$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            putenv(trim($line));
        }
    }
}

define('SPOTIFY_CLIENT_ID', getenv('SPOTIFY_CLIENT_ID'));
define('SPOTIFY_CLIENT_SECRET', getenv('SPOTIFY_CLIENT_SECRET'));
define('SPOTIFY_REDIRECT_URI', getenv('SPOTIFY_REDIRECT_URI'));
define('SPOTIFY_PLAYLIST_ID', getenv('SPOTIFY_PLAYLIST_ID'));
define('TOKEN_FILE', __DIR__ . '/token.json');
