<?php
declare(strict_types=1);

require_once __DIR__.'/util.php';
require_once __DIR__.'/weather.php';

$opts = getopt('', ['prompt::','city::','runs::','force','model::','out_txt::','out_json::','log::']);
$env = env_load(__DIR__.'/.env');

$key = $env['OPENAI_API_KEY'] ?? '';
if (!$key && !empty($env['OPENAI_API_KEY_FILE']) && is_file($env['OPENAI_API_KEY_FILE'])) $key = trim(file_get_contents($env['OPENAI_API_KEY_FILE']));
if ($key === '') { fwrite(STDERR, "OPENAI_API_KEY ontbreekt\n"); exit(1); }

$model = $opts['model'] ?? ($env['OPENAI_MODEL'] ?? 'gpt-4.1-mini');
$city  = $opts['city']  ?? ($env['CITY'] ?? 'Ravenstein');
$outTxt  = $opts['out_txt']  ?? ($env['OUTPUT_TODAY_TXT']  ?? (__DIR__.'/today.txt'));
$outJson = $opts['out_json'] ?? ($env['OUTPUT_TODAY_JSON'] ?? (__DIR__.'/today.json'));
$logJ   = $opts['log']   ?? ($env['OUTPUT_LOG_JSONL']  ?? (__DIR__.'/haiku_log.jsonl'));
$runs = max(1, (int)($opts['runs'] ?? 1));
$force = array_key_exists('force', $opts);

$promptFile = $opts['prompt'] ?? (__DIR__.'/prompt_default.php');
if (!str_contains($promptFile, '/')) $promptFile = __DIR__.'/'.$promptFile;
if (!is_file($promptFile)) { fwrite(STDERR, "Promptbestand niet gevonden: $promptFile\n"); exit(1); }
require_once $promptFile;
if (!function_exists('prompt')) { fwrite(STDERR, "Prompt() niet gevonden in $promptFile\n"); exit(1); }

if (!$force && $runs === 1 && is_file($outJson)) {
    $existing = json_decode(@file_get_contents($outJson), true);
    if (!empty($existing['date']) && $existing['date'] === ymd() && !empty($existing['haiku'])) {
        echo $existing['haiku'].PHP_EOL;
        exit(0);
    }
}

$styles = ['klein','diep','emotioneel','zwaar','diepzinnig','luchtig','zintuiglijk','mystiek en dromerig','muzikaal en vloeiend'];
$twists = [
    'Kies een onverwachte invalshoek.',
    'Focus op geluid.',
    'Focus op geur.',
    'Focus op licht en schaduw.',
    'Focus op aanraking en textuur.',
    'Werk met één verrassende metafoor.',
    'Gebruik een stilstaand moment.',
    'Zoom in op een klein detail.',
    'Speel met stilte en pauze.',
    'Laat tijd traag aanvoelen.',
    'Hint naar geschiedenis zonder het te noemen.',
    'Gebruik beweging heel spaarzaam.',
    'Kies een zeldzaam perspectief.',
    'Gebruik een subtiele tegenstelling.',
    'Laat één kleur overheersen.',
    'Verstop de mens, toon het spoor.',
    'Laat een object ‘spreken’.',
    'Schuif dag en nacht over elkaar.',
    'Maak het bijna hoorbaar.',
    'Maak het bijna tastbaar.',
    'Kies een onverwachte associatie.',
    'Gebruik één klank die terugkeert.',
    'Vermijd eigennamen.',
    'Wees minimalistisch.',
    'Kies een onverwacht modern detail.',
];

$ban_pool_soft = ['fluisteren (of variant hierop)','oude verhalen','schaduw','onder de maan','stenen (of variant hierop)','verstilde stad'];
$ban_pool_geo  = ['Maas','dijk','molen','kerk','stadspoort','kasseien','trein','A50','autobrug','polder','weide'];
$anchors = [
    'een onverwacht modern detail',
    'een geluid dat terugkeert',
    'één dominante kleur',
    'een tastbare textuur',
    'een stilstaand moment',
    'een object dat ‘spreekt’'
];

ensure_dir($outTxt);
ensure_dir($outJson);
ensure_dir($logJ);

for ($i=0; $i<$runs; $i++) {
    $w = weather_today($city);

    $style = $styles[day_rand('style',0,count($styles)-1)];
    $r = day_rand('mode',1,100);
    if ($r <= 50) $mode = 'weer'; elseif ($r <= 75) $mode = 'seizoen'; elseif ($r <= 90) $mode = 'beide'; else $mode = 'geen';

    if ($mode === 'weer') {
        $context_line = sprintf('Weer vandaag: %s, max %.0f°C, min %.0f°C, neerslag %.1f mm.', $w['desc_nl'],$w['tmax'],$w['tmin'],$w['precip_mm']);
        $usage_hint = 'Noem precies één concreet weersdetail, de rest impliciet.';
    } elseif ($mode === 'seizoen') {
        $context_line = 'Seizoen: '.season((int)date('n')).' (dag '.date('z').').';
        $usage_hint = 'Laat het seizoen voelbaar zijn zonder het woord te noemen.';
    } elseif ($mode === 'beide') {
        $context_line = sprintf('Seizoen: %s. Weer: %s, max %.0f°C, min %.0f°C, neerslag %.1f mm.',
            season((int)date('n')),$w['desc_nl'],$w['tmax'],$w['tmin'],$w['precip_mm']);
        $usage_hint = 'Kies één element expliciet (weer of seizoen), de rest impliciet.';
    } else {
        $context_line = 'Gebruik de sfeer van vandaag zonder expliciete weer- of seizoenswoorden.';
        $usage_hint = 'Werk met beelden die weer of seizoen doen vermoeden.';
    }

    $use_ban = day_rand('ban',1,100) <= 55;
    if ($use_ban) {
        $ban_today = (in_array($usage_hint, ['Wees dromerig.','Wees minimalistisch.']) ? $ban_pool_soft[day_rand('b1',0,count($ban_pool_soft)-1)] : $ban_pool_geo[day_rand('b2',0,count($ban_pool_geo)-1)]);
    } else {
        $ban_today = null;
    }
    $ban_line = $ban_today ? 'Vermijd het woord: '.$ban_today.'.' : '';

    $ank_count = day_rand('ankc',0,2);
    $picked = [];
    for ($k=0;$k<$ank_count;$k++) $picked[] = $anchors[day_rand('ank'.$k,0,count($anchors)-1)];
    $anchor_line = $picked ? ('Laat subtiel terugkomen: '.implode(', ', array_unique($picked)).'.') : '';

    $ctx = [
        'city'=>$city,
        'style'=>$style,
        'context_line'=>$context_line,
        'usage_hint'=>$usage_hint,
        'twist'=>$twists[day_rand('tw',0,count($twists)-1)],
        'anchor_line'=>$anchor_line,
        'ban_line'=>$ban_line,
    ];

    $temperature = 0.85 + (day_rand('t',0,3) * 0.05);
    $prompt = prompt($ctx);

    $resp = http_post_json('https://api.openai.com/v1/responses', [
        'model'=>$model,
        'input'=>$prompt,
        'max_output_tokens'=>60,
        'temperature'=>$temperature,
        'top_p'=>1
    ], ['Authorization: Bearer '.$key], 90);

    $haiku = trim($resp['output_text'] ?? '');
    if (!$haiku && !empty($resp['output'][0]['content'][0]['text'])) $haiku = trim($resp['output'][0]['content'][0]['text']);
    $haiku = trim($haiku, "`\" \n\r\t");

    if ($runs === 1) {
        file_put_contents($outTxt, $haiku.PHP_EOL);
        $todayJson = [
            'date'=>$w['date'],
            'city'=>$city,
            'weather'=>[
                'desc'=>$w['desc_nl'],
                'tmax'=>(int)round($w['tmax']),
                'tmin'=>(int)round($w['tmin']),
                'precip_mm'=>(float)round($w['precip_mm'],1),
            ],
            'haiku'=>$haiku,
            'prompt_src'=>basename($promptFile),
        ];
        file_put_contents($outJson, json_encode($todayJson, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT).PHP_EOL);
    }

    $logRow = [
        'ts'=>date('c'),
        'date'=>$w['date'],
        'city'=>$city,
        'weather'=>[
            'desc'=>$w['desc_nl'],
            'tmax'=>(int)round($w['tmax']),
            'tmin'=>(int)round($w['tmin']),
            'precip_mm'=>(float)round($w['precip_mm'],1),
        ],
        'prompt_src'=>basename($promptFile),
        'prompt'=>$prompt,
        'haiku'=>$haiku,
        'model'=>$model,
        'temperature'=>$temperature,
        'run'=>$i+1,
        'runs'=>$runs
    ];
    file_put_contents($logJ, json_encode($logRow, JSON_UNESCAPED_UNICODE).PHP_EOL, FILE_APPEND);

    echo $haiku.PHP_EOL;
}
