<?php
declare(strict_types=1);

date_default_timezone_set('Europe/Amsterdam');

function env_load(string $path): array {
    $cfg = [];
    if (!is_file($path)) return $cfg;
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        $pos = strpos($line, '=');
        if ($pos === false) continue;
        $cfg[trim(substr($line,0,$pos))] = trim(substr($line,$pos+1));
    }
    return $cfg;
}

function http_get_json(string $url, array $query): array {
    $ch = curl_init($url.'?'.http_build_query($query));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER=>true,
        CURLOPT_TIMEOUT=>30,
        CURLOPT_HTTPHEADER=>['Accept: application/json'],
    ]);
    $res = curl_exec($ch);
    if ($res === false) throw new RuntimeException('GET error: '.curl_error($ch));
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($code < 200 || $code >= 300) throw new RuntimeException('GET '.$code.': '.$res);
    $json = json_decode($res, true);
    if (!is_array($json)) throw new RuntimeException('GET invalid JSON');
    return $json;
}

function http_post_json(string $url, array $payload, array $headers = [], int $timeout = 90): array {
    $ch = curl_init($url);
    $headers = array_merge(['Content-Type: application/json','Accept: application/json'], $headers);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER=>true,
        CURLOPT_TIMEOUT=>$timeout,
        CURLOPT_POST=>true,
        CURLOPT_HTTPHEADER=>$headers,
        CURLOPT_POSTFIELDS=>json_encode($payload, JSON_UNESCAPED_UNICODE),
    ]);
    $res = curl_exec($ch);
    if ($res === false) throw new RuntimeException('POST error: '.curl_error($ch));
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($code < 200 || $code >= 300) throw new RuntimeException('POST '.$code.': '.$res);
    $json = json_decode($res, true);
    if (!is_array($json)) throw new RuntimeException('POST invalid JSON');
    return $json;
}

function ensure_dir(string $path): void {
    $dir = is_dir($path) ? $path : dirname($path);
    if (!is_dir($dir)) mkdir($dir, 0775, true);
}

function ymd(): string { return date('Y-m-d'); }

function season(int $m): string {
    if ($m >= 3 && $m <= 5) return 'lente';
    if ($m >= 6 && $m <= 8) return 'zomer';
    if ($m >= 9 && $m <= 11) return 'herfst';
    return 'winter';
}

function day_rand(string $key, int $min, int $max): int {
    $h = crc32(date('Y-m-d').$key);
    return $min + ($h % ($max - $min + 1));
}
