<?php

use App\Models\Vacancy;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('returns stored salary values for the edit form regardless of visibility', function (
    bool $showSalary,
    ?int $salaryMax,
): void {
    $vacancy = Vacancy::factory()->create([
        'title' => 'Product Engineer Intern',
        'salary_min' => 3000000,
        'salary_max' => $salaryMax,
        'show_salary' => $showSalary,
    ]);

    $response = $this->getJson(
        '/api/v1/vacancies/'.$vacancy->id.'/edit',
    );

    $response
        ->assertOk()
        ->assertJsonPath('data.id', $vacancy->id)
        ->assertJsonPath('data.title', 'Product Engineer Intern')
        ->assertJsonPath('data.location.id', $vacancy->location_id)
        ->assertJsonPath('data.show_salary', $showSalary)
        ->assertJsonPath('data.salary_min', 3000000)
        ->assertJsonPath('data.salary_max', $salaryMax);

    $this->assertDatabaseHas('vacancies', [
        'id' => $vacancy->id,
        'salary_min' => 3000000,
        'salary_max' => $salaryMax,
        'show_salary' => $showSalary,
    ]);
})->with([
    'salary is visible' => [true, 5000000],
    'salary is hidden' => [false, 5000000],
    'hidden salary has no maximum' => [false, null],
]);
