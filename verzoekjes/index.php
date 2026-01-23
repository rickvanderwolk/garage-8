<?php

session_start();
require_once __DIR__ . '/spotify.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['spotify_url'])) {
    $trackId = extractTrackId($_POST['spotify_url']);

    if (!$trackId) {
        $_SESSION['message'] = '<div class="error">Ongeldige Spotify link</div>';
    } else {
        $result = addTrackToPlaylist($trackId);

        if ($result['success']) {
            $trackInfo = getTrackInfo($trackId);
            $trackName = $trackInfo ? $trackInfo['name'] . ' - ' . $trackInfo['artists'][0]['name'] : 'Nummer';
            $_SESSION['message'] = '<div class="success">' . htmlspecialchars($trackName) . ' toegevoegd!</div>';
        } else {
            $_SESSION['message'] = '<div class="error">' . htmlspecialchars($result['error']) . '</div>';
        }
    }

    header('Location: /');
    exit;
}

$message = $_SESSION['message'] ?? '';
unset($_SESSION['message']);

?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verzoekjes</title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
            color: #1DB954;
            margin: 0 0 30px 0;
            font-size: 2.5rem;
            text-align: center;
        }
        form {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        input[type="text"] {
            padding: 15px 20px;
            font-size: 16px;
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.05);
            color: #fff;
            transition: border-color 0.3s;
        }
        input[type="text"]:focus {
            outline: none;
            border-color: #1DB954;
        }
        input[type="text"]::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }
        button {
            padding: 15px 30px;
            font-size: 16px;
            font-weight: 600;
            background: #1DB954;
            color: #000;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: transform 0.2s, background 0.2s;
        }
        button:hover {
            background: #1ed760;
            transform: scale(1.02);
        }
        button:active {
            transform: scale(0.98);
        }
        .message {
            margin-top: 20px;
            text-align: center;
        }
        .success {
            color: #1DB954;
            padding: 15px;
            background: rgba(29, 185, 84, 0.1);
            border-radius: 10px;
        }
        .error {
            color: #ff6b6b;
            padding: 15px;
            background: rgba(255, 107, 107, 0.1);
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Verzoekjes</h1>
        <form method="POST">
            <input type="text" name="spotify_url" placeholder="Plak Spotify link..." autofocus>
            <button type="submit">Toevoegen</button>
        </form>
        <?php if ($message): ?>
            <div class="message"><?= $message ?></div>
        <?php endif; ?>
    </div>
</body>
</html>
