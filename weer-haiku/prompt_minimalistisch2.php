<?php
declare(strict_types=1);

function prompt(array $ctx): string {
    $parts = [
        'Haiku (5-7-5), minimalistisch.',
        'Plaats: '.$ctx['city'].'.',
        $ctx['context_line'],
        'Alleen de drie regels.'
    ];
    return implode("\n", array_values(array_filter($parts)));
}
