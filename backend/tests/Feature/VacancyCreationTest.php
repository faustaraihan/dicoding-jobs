<?php

use App\Models\Location;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->freezeTime();
});

/**
 * @return array<string, mixed>
 */
function validVacancyPayload(int $locationId): array
{
    return [
        'title' => 'Product Engineer Intern',
        'position' => 'it_and_software',
        'employment_type' => 'internship',
        'candidate_count' => 2,
        'expires_at' => now('Asia/Jakarta')->addMonth()->toDateString(),
        'location_id' => $locationId,
        'is_remote' => true,
        'description' => 'Mengembangkan produk Dicoding.',
        'salary_min' => 3000000,
        'salary_max' => 5000000,
        'show_salary' => true,
        'experience_level' => 'less_than_one_year',
    ];
}

test('valid vacancy data is saved with the correct deadline', function (): void {
    $this->travelTo(
        CarbonImmutable::parse('2026-10-10 12:00:00', 'Asia/Jakarta'),
    );

    $location = Location::factory()->create([
        'id' => 22,
        'name' => 'Kota Bandung',
        'province' => 'Jawa Barat',
    ]);

    $payload = [
        'title' => 'Product Engineer Intern',
        'position' => 'it_and_software',
        'employment_type' => 'internship',
        'candidate_count' => 2,
        'expires_at' => '2026-10-31',
        'location_id' => $location->id,
        'is_remote' => true,
        'description' => 'Mengembangkan produk Dicoding.',
        'salary_min' => 3000000,
        'salary_max' => 5000000,
        'show_salary' => true,
        'experience_level' => 'less_than_one_year',
    ];

    $response = $this->postJson('/api/v1/vacancies', $payload);

    $response
        ->assertCreated()
        ->assertJsonPath('data.title', 'Product Engineer Intern')
        ->assertJsonPath('data.location.name', 'Kota Bandung')
        ->assertJsonPath('data.is_remote', true)
        ->assertJsonPath('data.salary_min', 3000000)
        ->assertJsonPath('data.salary_max', 5000000)
        ->assertJsonPath(
            'data.expires_at',
            '2026-10-31T16:59:59+00:00',
        );

    $this->assertDatabaseCount('vacancies', 1);

    $this->assertDatabaseHas('vacancies', [
        'id' => $response->json('data.id'),
        'title' => 'Product Engineer Intern',
        'location_id' => $location->id,
        'candidate_count' => 2,
        'is_remote' => 1,
        'salary_min' => 3000000,
        'salary_max' => 5000000,
        'show_salary' => 1,
        'expires_at' => '2026-10-31 16:59:59',
    ]);
});

test('missing required fields do not create a vacancy', function (): void {
    $response = $this->postJson('/api/v1/vacancies', []);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'title',
            'position',
            'employment_type',
            'candidate_count',
            'expires_at',
            'location_id',
            'description',
            'salary_min',
            'experience_level',
        ]);

    $this->assertDatabaseCount('vacancies', 0);
});

test('returns 422 when maximum salary is below minimum salary', function (): void {
    $location = Location::factory()->create();

    $payload = validVacancyPayload($location->id);
    $payload['salary_max'] = 2000000;

    $response = $this->postJson('/api/v1/vacancies', $payload);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['salary_max'])
        ->assertJsonPath(
            'errors.salary_max.0',
            'The salary max field must be greater than or equal to 3000000.',
        );

    $this->assertDatabaseCount('vacancies', 0);
});

test('creates a vacancy when maximum salary is null', function (): void {
    $location = Location::factory()->create();

    $payload = validVacancyPayload($location->id);
    $payload['salary_max'] = null;

    $response = $this->postJson('/api/v1/vacancies', $payload);

    $response
        ->assertCreated()
        ->assertJsonPath('data.salary_min', 3000000)
        ->assertJsonPath('data.salary_max', null);

    $this->assertDatabaseHas('vacancies', [
        'id' => $response->json('data.id'),
        'salary_min' => 3000000,
        'salary_max' => null,
    ]);
});

test('hides salary in the response while retaining it in the database', function (): void {
    $location = Location::factory()->create();

    $payload = validVacancyPayload($location->id);
    $payload['show_salary'] = false;

    $response = $this->postJson('/api/v1/vacancies', $payload);

    $response
        ->assertCreated()
        ->assertJsonPath('data.show_salary', false)
        ->assertJsonMissingPath('data.salary_min')
        ->assertJsonMissingPath('data.salary_max');

    $this->assertDatabaseHas('vacancies', [
        'id' => $response->json('data.id'),
        'show_salary' => 0,
        'salary_min' => 3000000,
        'salary_max' => 5000000,
    ]);
});
