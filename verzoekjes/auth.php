<?php

require_once __DIR__ . '/config.php';

$scopes = 'playlist-modify-public playlist-modify-private';

$authUrl = 'https://accounts.spotify.com/authorize?' . http_build_query([
    'response_type' => 'code',
    'client_id' => SPOTIFY_CLIENT_ID,
    'scope' => $scopes,
    'redirect_uri' => SPOTIFY_REDIRECT_URI,
]);

header('Location: ' . $authUrl);
exit;
