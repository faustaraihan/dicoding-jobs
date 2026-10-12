<?php

namespace App\Models;

use App\Enums\EmploymentType;
use App\Enums\ExperienceLevel;
use App\Enums\Position;
use Database\Factories\VacancyFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'title',
    'position',
    'employment_type',
    'candidate_count',
    'expires_at',
    'location_id',
    'is_remote',
    'description',
    'salary_min',
    'salary_max',
    'show_salary',
    'experience_level',
])]

class Vacancy extends Model
{
    /** @use HasFactory<VacancyFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'position' => Position::class,
            'employment_type' => EmploymentType::class,
            'candidate_count' => 'integer',
            'expires_at' => 'datetime',
            'is_remote' => 'boolean',
            'salary_min' => 'integer',
            'salary_max' => 'integer',
            'show_salary' => 'boolean',
            'experience_level' => ExperienceLevel::class,
        ];
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}
