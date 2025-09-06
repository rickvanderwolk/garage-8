<?php
declare(strict_types=1);

require_once __DIR__.'/util.php';

function weather_today(string $city): array {
    $geo = http_get_json('https://geocoding-api.open-meteo.com/v1/search', ['name'=>$city,'count'=>1,'language'=>'nl']);
    if (empty($geo['results'][0])) throw new RuntimeException('Geen coords voor '.$city);
    $lat = (float)$geo['results'][0]['latitude'];
    $lon = (float)$geo['results'][0]['longitude'];
    $fc = http_get_json('https://api.open-meteo.com/v1/forecast', [
        'latitude'=>$lat,'longitude'=>$lon,
        'daily'=>['weathercode','temperature_2m_max','temperature_2m_min','precipitation_sum'],
        'timezone'=>'Europe/Amsterdam',
    ]);
    $W = [
        0=>'heldere lucht',1=>'overwegend helder',2=>'gedeeltelijk bewolkt',3=>'bewolkt',
        45=>'mist',48=>'rijpvormende mist',51=>'lichte motregen',53=>'matige motregen',
        55=>'zware motregen',56=>'lichte ijzel',57=>'zware ijzel',61=>'lichte regen',
        63=>'matige regen',65=>'zware regen',66=>'lichte ijzelregen',67=>'zware ijzelregen',
        71=>'lichte sneeuw',73=>'matige sneeuw',75=>'zware sneeuw',77=>'hagel',
        80=>'lichte buien',81=>'matige buien',82=>'hevige buien',
        85=>'lichte sneeuwbuien',86=>'hevige sneeuwbuien',
        95=>'onweer',96=>'onweer met lichte hagel',99=>'onweer met zware hagel',
    ];
    $times = $fc['daily']['time'] ?? [];
    $idx = array_search(ymd(), $times, true);
    if ($idx === false) $idx = 0;
    $code = (int)($fc['daily']['weathercode'][$idx] ?? 0);
    return [
        'date'=>ymd(),
        'desc_nl'=>$W[$code] ?? ('weer (code '.$code.')'),
        'tmax'=>(float)($fc['daily']['temperature_2m_max'][$idx] ?? 0),
        'tmin'=>(float)($fc['daily']['temperature_2m_min'][$idx] ?? 0),
        'precip_mm'=>(float)($fc['daily']['precipitation_sum'][$idx] ?? 0),
    ];
}
