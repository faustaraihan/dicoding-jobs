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

test('rejects unknown vacancy options without saving a vacancy', function (
    string $field,
    string|int $invalidValue,
    string $message,
): void {
    $location = Location::factory()->create();

    $payload = Vacancy::factory()
        ->for($location)
        ->make()
        ->attributesToArray();

    $payload['expires_at'] = '2026-10-31';
    $payload[$field] = $invalidValue;

    $response = $this->postJson('/api/v1/vacancies', $payload);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            $field => $message,
        ]);

    $this->assertDatabaseCount('vacancies', 0);
})->with([
    'unknown position' => [
        'position',
        'unknown_position',
        'The selected position is invalid.',
    ],
    'unknown employment type' => [
        'employment_type',
        'unknown_employment_type',
        'The selected employment type is invalid.',
    ],
    'unknown experience level' => [
        'experience_level',
        'unknown_experience_level',
        'The selected experience level is invalid.',
    ],
    'location does not exist' => [
        'location_id',
        -1,
        'The selected location id is invalid.',
    ],
]);

test('rejects invalid deadlines and candidate counts without saving a vacancy', function (
    string $field,
    string|int $invalidValue,
    string $message,
): void {
    $location = Location::factory()->create();

    $payload = Vacancy::factory()
        ->for($location)
        ->make()
        ->attributesToArray();

    $payload['expires_at'] = '2026-10-31';
    $payload[$field] = $invalidValue;

    $response = $this->postJson('/api/v1/vacancies', $payload);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            $field => $message,
        ]);

    $this->assertDatabaseCount('vacancies', 0);
})->with([
    'deadline is yesterday' => [
        'expires_at',
        '2026-10-09',
        'The expires at field must be a date after or equal to 2026-10-10.',
    ],
    'deadline uses the wrong format' => [
        'expires_at',
        '31-10-2026',
        'The expires at field must match the format Y-m-d.',
    ],
    'candidate count is below the minimum' => [
        'candidate_count',
        0,
        'The candidate count field must be at least 1.',
    ],
    'candidate count exceeds the maximum' => [
        'candidate_count',
        100,
        'The candidate count field must not be greater than 99.',
    ],
]);

test('accepts a deadline today and candidate counts at the allowed boundaries', function (
    int $candidateCount,
): void {
    $location = Location::factory()->create();

    $payload = Vacancy::factory()
        ->for($location)
        ->make()
        ->attributesToArray();

    $payload['expires_at'] = '2026-10-10';
    $payload['candidate_count'] = $candidateCount;

    $response = $this->postJson('/api/v1/vacancies', $payload);

    $response
        ->assertCreated()
        ->assertJsonPath('data.candidate_count', $candidateCount)
        ->assertJsonPath(
            'data.expires_at',
            '2026-10-10T16:59:59+00:00',
        );

    $this->assertDatabaseCount('vacancies', 1);

    $this->assertDatabaseHas('vacancies', [
        'id' => $response->json('data.id'),
        'candidate_count' => $candidateCount,
        'expires_at' => '2026-10-10 16:59:59',
    ]);
})->with([
    'minimum candidate count' => [1],
    'maximum candidate count' => [99],
]);
