<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>color log</title>
    <style>
        body {
            background-color: white;
            color: black;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin: 0;
            font-family: Verdana, serif;
        }
        h2 {
            margin-bottom: 20px;
        }
        button {
            margin-bottom: 5px;
        }
        form {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }
        .color-picker {
            margin-top: 15vh;
            width: 250px;
            height: 250px;
            border: none;
        }
        button {
            margin-top: 10px;
            padding: 10px 20px;
            font-size: 1.2em;
            cursor: pointer;
            margin-bottom: 15vh;
        }
        .color-list {
            list-style: none;
            padding: 0;
            margin-bottom: 75px;
        }
        .date-header {
            margin-top: 20px;
            margin-bottom: 15px;
            font-size: 1.2em;
            color: #333;
        }
        .color-item {
            display: inline-block;
            margin: 5px;
            cursor: pointer;
        }
        .color-circle {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: inline-block;
        }
    </style>
    <script>
        function confirmDelete(id) {
            if (confirm("Weet je zeker dat je deze kleur wilt verwijderen?")) {
                window.location.href = `?delete=${id}`;
            }
        }
    </script>
</head>
<body>

<h2>Kies een kleur</h2>

<form method="post">
    <input type="color" name="color" class="color-picker" value="#ffffff" required>
    <button type="submit">Add</button>
</form>

<div class="color-list">
    <?php
    $filename = 'colors.json';

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['color'])) {
        $color = $_POST['color'];
        $timestamp = date('Y-m-d H:i:s');
        $id = uniqid();

        $data = file_exists($filename) ? json_decode(file_get_contents($filename), true) : [];
        $data[] = ['id' => $id, 'color' => $color, 'timestamp' => $timestamp];
        file_put_contents($filename, json_encode($data));
    }

    if (isset($_GET['delete'])) {
        $idToDelete = $_GET['delete'];

        $data = file_exists($filename) ? json_decode(file_get_contents($filename), true) : [];
        $data = array_filter($data, function($entry) use ($idToDelete) {
            return $entry['id'] !== $idToDelete;
        });

        file_put_contents($filename, json_encode(array_values($data)));
    }

    if (file_exists($filename)) {
        $colors = json_decode(file_get_contents($filename), true);

        $currentDate = null;

        foreach ($colors as $entry) {
            $entryDate = date('Y-m-d', strtotime($entry['timestamp']));

            if ($entryDate !== $currentDate) {
                if ($currentDate !== null) {
                    echo '</div>';
                }
                $currentDate = $entryDate;
                echo "<div class='date-header'>" . date('d-m-Y', strtotime($entry['timestamp'])) . "</div>";
                echo '<div class="color-item-group">';
            }

            echo "<div class='color-item' onclick=\"confirmDelete('{$entry['id']}')\">
                    <div class='color-circle' style='background-color: {$entry['color']}'></div>
                  </div>";
        }

        if ($currentDate !== null) {
            echo '</div>';
        }
    }
    ?>
</div>

</body>
</html>
