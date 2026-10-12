<?php

namespace App\Support;

use Carbon\CarbonImmutable;

class VacancyDeadline
{
    public static function toUtc(string $date): CarbonImmutable
    {
        return CarbonImmutable::createFromFormat(
            '!Y-m-d',
            $date,
            'Asia/Jakarta',
        )->setTime(23, 59, 59)->utc();
    }
}
