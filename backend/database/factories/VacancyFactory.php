<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\Vacancy;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vacancy>
 */
class VacancyFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->jobTitle(),
            'position' => 'it_and_software',
            'employment_type' => 'internship',
            'candidate_count' => 2,
            'expires_at' => now()->addMonth(),
            'location_id' => Location::factory(),
            'is_remote' => false,
            'description' => 'Mengembangkan produk Dicoding.',
            'salary_min' => 3000000,
            'salary_max' => 5000000,
            'show_salary' => true,
            'experience_level' => 'less_than_one_year',
        ];
    }
}
