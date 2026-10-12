<?php

namespace App\Enums;

enum ExperienceLevel: string
{
    case LessThanOneYear = 'less_than_one_year';
    case OneToThreeYears = 'one_to_three_years';
    case FourToFiveYears = 'four_to_five_years';
    case SixToTenYears = 'six_to_ten_years';
    case MoreThanTenYears = 'more_than_ten_years';

    public function label(): string
    {
        return match ($this) {
            self::LessThanOneYear => 'Kurang dari 1 tahun',
            self::OneToThreeYears => '1-3 tahun',
            self::FourToFiveYears => '4-5 tahun',
            self::SixToTenYears => '6-10 tahun',
            self::MoreThanTenYears => 'Lebih dari 10 tahun',
        };
    }
}
