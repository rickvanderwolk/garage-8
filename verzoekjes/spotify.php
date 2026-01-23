<?php

require_once __DIR__ . '/config.php';

function getStoredToken(): ?array
{
    if (!file_exists(TOKEN_FILE)) {
        return null;
    }
    return json_decode(file_get_contents(TOKEN_FILE), true);
}

function saveToken(array $token): void
{
    $token['created_at'] = time();
    file_put_contents(TOKEN_FILE, json_encode($token, JSON_PRETTY_PRINT));
}

function isTokenExpired(array $token): bool
{
    $expiresAt = ($token['created_at'] ?? 0) + ($token['expires_in'] ?? 0) - 60;
    return time() >= $expiresAt;
}

function refreshAccessToken(string $refreshToken): ?array
{
    $ch = curl_init('https://accounts.spotify.com/api/token');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'grant_type' => 'refresh_token',
            'refresh_token' => $refreshToken,
        ]),
        CURLOPT_HTTPHEADER => [
            'Authorization: Basic ' . base64_encode(SPOTIFY_CLIENT_ID . ':' . SPOTIFY_CLIENT_SECRET),
            'Content-Type: application/x-www-form-urlencoded',
        ],
    ]);

    $response = curl_exec($ch);

    $data = json_decode($response, true);
    if (isset($data['access_token'])) {
        if (!isset($data['refresh_token'])) {
            $data['refresh_token'] = $refreshToken;
        }
        saveToken($data);
        return $data;
    }

    return null;
}

function getValidAccessToken(): ?string
{
    $token = getStoredToken();
    if (!$token) {
        return null;
    }

    if (isTokenExpired($token)) {
        $token = refreshAccessToken($token['refresh_token']);
        if (!$token) {
            return null;
        }
    }

    return $token['access_token'];
}

function extractTrackId(string $input): ?string
{
    // Handle various Spotify URL formats and URIs
    // https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh
    // https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh?si=...
    // spotify:track:4iV5W9uYEdYUVa79Axb7Rh

    if (preg_match('/track[\/:]([a-zA-Z0-9]{22})/', $input, $matches)) {
        return $matches[1];
    }

    return null;
}

function addTrackToPlaylist(string $trackId): array
{
    $accessToken = getValidAccessToken();
    if (!$accessToken) {
        return ['success' => false, 'error' => 'Niet ingelogd. Ga naar /auth.php'];
    }

    $uri = 'spotify:track:' . $trackId;

    $ch = curl_init('https://api.spotify.com/v1/playlists/' . SPOTIFY_PLAYLIST_ID . '/tracks');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['uris' => [$uri]]),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json',
        ],
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($httpCode === 201) {
        return ['success' => true];
    }

    $data = json_decode($response, true);
    return ['success' => false, 'error' => $data['error']['message'] ?? 'Onbekende fout'];
}

function getTrackInfo(string $trackId): ?array
{
    $accessToken = getValidAccessToken();
    if (!$accessToken) {
        return null;
    }

    $ch = curl_init('https://api.spotify.com/v1/tracks/' . $trackId);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $accessToken,
        ],
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($httpCode === 200) {
        return json_decode($response, true);
    }

    return null;
}
