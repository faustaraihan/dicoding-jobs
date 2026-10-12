<?php

use App\Models\Location;
use App\Models\Vacancy;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->travelTo(
        CarbonImmutable::parse('2026-10-10 12:00:00', 'Asia/Jakarta'),
    );
});

/**
 * @return array<string, mixed>
 */
function vacancyUpdatePayload(int $locationId): array
{
    return [
        'title' => 'Updated Product Engineer Intern',
        'position' => 'it_and_software',
        'employment_type' => 'internship',
        'candidate_count' => 3,
        'expires_at' => '2026-11-30',
        'location_id' => $locationId,
        'is_remote' => true,
        'description' => 'Deskripsi lowongan yang diperbarui.',
        'salary_min' => 4000000,
        'salary_max' => 6000000,
        'show_salary' => false,
        'experience_level' => 'one_to_three_years',
    ];
}

test('updates the requested vacancy without creating a new record', function (): void {
    $vacancy = Vacancy::factory()->create([
        'title' => 'Original Vacancy',
    ]);

    $other = Vacancy::factory()->create([
        'title' => 'Other Vacancy',
    ]);

    $newLocation = Location::factory()->create([
        'name' => 'Kota Tangerang Selatan',
        'province' => 'Banten',
    ]);

    $payload = vacancyUpdatePayload($newLocation->id);

    $response = $this->putJson(
        '/api/v1/vacancies/'.$vacancy->id,
        $payload,
    );

    $response
        ->assertOk()
        ->assertJsonPath('data.id', $vacancy->id)
        ->assertJsonPath('data.title', 'Updated Product Engineer Intern')
        ->assertJsonPath('data.candidate_count', 3)
        ->assertJsonPath('data.location.name', 'Kota Tangerang Selatan')
        ->assertJsonPath('data.show_salary', false)
        ->assertJsonMissingPath('data.salary_min')
        ->assertJsonMissingPath('data.salary_max')
        ->assertJsonPath(
            'data.expires_at',
            '2026-11-30T16:59:59+00:00',
        );

    $this->assertDatabaseCount('vacancies', 2);

    $this->assertDatabaseHas('vacancies', [
        'id' => $vacancy->id,
        'title' => 'Updated Product Engineer Intern',
        'candidate_count' => 3,
        'location_id' => $newLocation->id,
        'is_remote' => 1,
        'salary_min' => 4000000,
        'salary_max' => 6000000,
        'show_salary' => 0,
        'experience_level' => 'one_to_three_years',
        'expires_at' => '2026-11-30 16:59:59',
    ]);

    $this->assertDatabaseHas('vacancies', [
        'id' => $other->id,
        'title' => 'Other Vacancy',
    ]);
});

test('returns 422 for invalid salary without changing the vacancy', function (): void {
    $vacancy = Vacancy::factory()->create([
        'title' => 'Original Vacancy',
        'salary_min' => 3000000,
        'salary_max' => 5000000,
    ]);

    $payload = vacancyUpdatePayload($vacancy->location_id);
    $payload['salary_max'] = 2000000;

    $response = $this->putJson(
        '/api/v1/vacancies/'.$vacancy->id,
        $payload,
    );

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['salary_max'])
        ->assertJsonPath(
            'errors.salary_max.0',
            'The salary max field must be greater than or equal to 4000000.',
        );

    $this->assertDatabaseCount('vacancies', 1);

    $this->assertDatabaseHas('vacancies', [
        'id' => $vacancy->id,
        'title' => 'Original Vacancy',
        'candidate_count' => 2,
        'salary_min' => 3000000,
        'salary_max' => 5000000,
    ]);
});

test('returns 422 when PUT does not include required fields', function (): void {
    $vacancy = Vacancy::factory()->create([
        'title' => 'Original Vacancy',
    ]);

    $response = $this->putJson(
        '/api/v1/vacancies/'.$vacancy->id,
        ['title' => 'Changed Title'],
    );

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'position',
            'employment_type',
            'candidate_count',
            'expires_at',
            'location_id',
            'description',
            'salary_min',
            'experience_level',
        ]);

    $this->assertDatabaseHas('vacancies', [
        'id' => $vacancy->id,
        'title' => 'Original Vacancy',
    ]);
});

test('returns 404 when updating a missing vacancy', function (): void {
    $location = Location::factory()->create();

    $response = $this->putJson(
        '/api/v1/vacancies/999999',
        vacancyUpdatePayload($location->id),
    );

    $response->assertNotFound();

    $this->assertDatabaseCount('vacancies', 0);
});

test('deletes only the requested vacancy and retains its location', function (): void {
    $location = Location::factory()->create();

    $vacancy = Vacancy::factory()->for($location)->create();
    $other = Vacancy::factory()->for($location)->create();

    $response = $this->deleteJson(
        '/api/v1/vacancies/'.$vacancy->id,
    );

    $response->assertNoContent();

    $this->assertModelMissing($vacancy);
    $this->assertModelExists($other);
    $this->assertModelExists($location);
    $this->assertDatabaseCount('vacancies', 1);
});

test('returns 404 when deleting a missing vacancy', function (): void {
    $existing = Vacancy::factory()->create();

    $response = $this->deleteJson('/api/v1/vacancies/999999');

    $response->assertNotFound();

    $this->assertModelExists($existing);
    $this->assertDatabaseCount('vacancies', 1);
});
