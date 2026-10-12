<?php

use App\Models\Vacancy;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->travelTo(
        CarbonImmutable::parse('2026-10-11 12:00:00', 'Asia/Jakarta'),
    );
});

test('allows editing an expired vacancy while retaining its deadline', function (): void {
    $vacancy = Vacancy::factory()->create([
        'title' => 'Judul Awal',
        'expires_at' => CarbonImmutable::parse(
            '2026-10-10 23:59:59',
            'Asia/Jakarta',
        )->utc(),
    ]);

    $payload = $vacancy->attributesToArray();
    $payload['title'] = 'Judul Diperbaiki';
    $payload['expires_at'] = '2026-10-10';

    $response = $this->putJson(
        '/api/v1/vacancies/'.$vacancy->id,
        $payload,
    );

    $response
        ->assertOk()
        ->assertJsonPath('data.title', 'Judul Diperbaiki')
        ->assertJsonPath(
            'data.expires_at',
            '2026-10-10T16:59:59+00:00',
        );

    $this->assertDatabaseHas('vacancies', [
        'id' => $vacancy->id,
        'title' => 'Judul Diperbaiki',
        'expires_at' => '2026-10-10 16:59:59',
    ]);

    $this->assertDatabaseCount('vacancies', 1);
});

test('rejects changing an expired deadline to another past date', function (): void {
    $vacancy = Vacancy::factory()->create([
        'title' => 'Judul Awal',
        'expires_at' => CarbonImmutable::parse(
            '2026-10-10 23:59:59',
            'Asia/Jakarta',
        )->utc(),
    ]);

    $payload = $vacancy->attributesToArray();
    $payload['title'] = 'Judul Diperbaiki';
    $payload['expires_at'] = '2026-10-09';

    $response = $this->putJson(
        '/api/v1/vacancies/'.$vacancy->id,
        $payload,
    );

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['expires_at']);

    $this->assertDatabaseHas('vacancies', [
        'id' => $vacancy->id,
        'title' => 'Judul Awal',
        'expires_at' => '2026-10-10 16:59:59',
    ]);

    $this->assertDatabaseCount('vacancies', 1);
});

test('allows changing an expired deadline to today or a future date', function (
    string $newDate,
    string $expectedUtc,
): void {
    $vacancy = Vacancy::factory()->create([
        'expires_at' => CarbonImmutable::parse(
            '2026-10-10 23:59:59',
            'Asia/Jakarta',
        )->utc(),
    ]);

    $payload = $vacancy->attributesToArray();
    $payload['expires_at'] = $newDate;

    $response = $this->putJson(
        '/api/v1/vacancies/'.$vacancy->id,
        $payload,
    );

    $response
        ->assertOk()
        ->assertJsonPath('data.id', $vacancy->id)
        ->assertJsonPath(
            'data.expires_at',
            $expectedUtc.'+00:00',
        );

    $this->assertDatabaseHas('vacancies', [
        'id' => $vacancy->id,
        'expires_at' => str_replace('T', ' ', $expectedUtc),
    ]);

    $this->assertDatabaseCount('vacancies', 1);
})->with([
    'today' => [
        '2026-10-11',
        '2026-10-11T16:59:59',
    ],
    'future date' => [
        '2026-10-12',
        '2026-10-12T16:59:59',
    ],
]);
