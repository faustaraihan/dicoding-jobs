<?php

use App\Support\VacancyDeadline;

test('converts the end of a Jakarta deadline date to UTC', function (
    string $date,
    string $expectedUtc,
): void {
    $deadline = VacancyDeadline::toUtc($date);

    expect($deadline->toIso8601String())->toBe($expectedUtc);
})->with([
    'ordinary date' => [
        '2026-10-11',
        '2026-10-11T16:59:59+00:00',
    ],
    'last day of the year' => [
        '2026-12-31',
        '2026-12-31T16:59:59+00:00',
    ],
    'leap day' => [
        '2028-02-29',
        '2028-02-29T16:59:59+00:00',
    ],
]);
