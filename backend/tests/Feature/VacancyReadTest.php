<?php

use App\Models\Location;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->freezeTime();
});

test('lists newest vacancies first with their locations', function (): void {
    $location = Location::factory()->create([
        'name' => 'Kota Bandung',
        'province' => 'Jawa Barat',
    ]);

    $older = Vacancy::factory()->for($location)->create();
    $newer = Vacancy::factory()->for($location)->create();

    $response = $this->getJson('/api/v1/vacancies');

    $response
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $newer->id)
        ->assertJsonPath('data.1.id', $older->id)
        ->assertJsonPath('data.0.location.name', 'Kota Bandung')
        ->assertJsonPath('meta.total', 2);
});

test('searches vacancies by title only', function (): void {
    $matching = Vacancy::factory()->create([
        'title' => 'Product Engineer Intern',
    ]);

    Vacancy::factory()->create([
        'title' => 'Product Designer',
        'description' => 'Bekerja bersama engineer.',
    ]);

    $response = $this->getJson('/api/v1/vacancies?search=engineer');

    $response
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $matching->id)
        ->assertJsonPath('meta.total', 1);
});

test('returns an empty list when no title matches', function (): void {
    Vacancy::factory()->create([
        'title' => 'Product Engineer Intern',
    ]);

    $response = $this->getJson('/api/v1/vacancies?search=accountant');

    $response
        ->assertOk()
        ->assertJsonCount(0, 'data')
        ->assertJsonPath('meta.total', 0);
});

test('returns the requested page and page size', function (): void {
    $vacancies = Vacancy::factory()->count(3)->create();

    $response = $this->getJson(
        '/api/v1/vacancies?per_page=1&page=2',
    );

    $response
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $vacancies->get(1)->id)
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.per_page', 1)
        ->assertJsonPath('meta.total', 3)
        ->assertJsonPath('meta.last_page', 3);
});

test('returns the requested vacancy detail with its location', function (): void {
    $location = Location::factory()->create([
        'name' => 'Kota Tangerang Selatan',
        'province' => 'Banten',
    ]);

    $vacancy = Vacancy::factory()->for($location)->create([
        'title' => 'Product Engineer Intern',
    ]);

    $response = $this->getJson('/api/v1/vacancies/'.$vacancy->id);

    $response
        ->assertOk()
        ->assertJsonPath('data.id', $vacancy->id)
        ->assertJsonPath('data.title', 'Product Engineer Intern')
        ->assertJsonPath('data.location.name', 'Kota Tangerang Selatan')
        ->assertJsonPath('data.location.province', 'Banten')
        ->assertJsonPath('data.employment_type_label', 'Intern');
});

test('returns 404 when the vacancy does not exist', function (): void {
    $response = $this->getJson('/api/v1/vacancies/999999');

    $response->assertNotFound();
});

test('does not expose hidden salary in vacancy detail', function (): void {
    $vacancy = Vacancy::factory()->create([
        'show_salary' => false,
        'salary_min' => 3000000,
        'salary_max' => 5000000,
    ]);

    $response = $this->getJson('/api/v1/vacancies/'.$vacancy->id);

    $response
        ->assertOk()
        ->assertJsonPath('data.show_salary', false)
        ->assertJsonMissingPath('data.salary_min')
        ->assertJsonMissingPath('data.salary_max');
});

test('searches special characters as literal title text', function (
    string $search,
    string $matchingTitle,
    string $otherTitle,
): void {
    $location = Location::factory()->create();

    $matching = Vacancy::factory()->for($location)->create([
        'title' => $matchingTitle,
    ]);

    Vacancy::factory()->for($location)->create([
        'title' => $otherTitle,
    ]);

    $query = http_build_query([
        'search' => $search,
    ]);

    $response = $this->getJson('/api/v1/vacancies?'.$query);

    $response
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $matching->id)
        ->assertJsonPath('meta.total', 1);
})->with([
    'literal percent sign' => [
        '%',
        'Engineer 100% Remote',
        'Engineer Remote',
    ],
    'literal underscore' => [
        '_',
        'Engineer_Backend',
        'Engineer Backend',
    ],
    'literal exclamation mark' => [
        '!',
        'Engineer! Backend',
        'Engineer Backend',
    ],
]);
