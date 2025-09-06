<?php
declare(strict_types=1);

function prompt(array $ctx): string {
    $parts = [
        'Schrijf een korte Nederlandstalige haiku (5-7-5).',
        'Stijl: poëtisch en '.$ctx['style'].'.',
        'Plaats: '.$ctx['city'].'.',
        $ctx['context_line'],
        $ctx['usage_hint'],
        $ctx['twist'],
        $ctx['anchor_line'],
        $ctx['ban_line'],
        'Noem nooit: dorp.',
        'Geen hashtags of emoji.',
        'Geef uitsluitend de drie regels van de haiku terug.'
    ];
    return implode("\n", array_values(array_filter($parts)));
}
