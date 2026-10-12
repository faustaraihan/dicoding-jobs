<?php

use App\Models\Vacancy;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('returns the Dicoding company profile for every listed vacancy', function (): void {
    Vacancy::factory()->count(2)->create();

    $response = $this->getJson('/api/v1/vacancies');

    $expectedCompany = [
        'name' => 'Dicoding Indonesia',
        'business_sector' => 'Technology',
        'employee_count' => '50-100',
        'logo_url' => asset('images/dicoding-indonesia.png'),
    ];

    $response
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.company', $expectedCompany)
        ->assertJsonPath('data.1.company', $expectedCompany);
});

test('returns the Dicoding company profile in vacancy details', function (): void {
    $vacancy = Vacancy::factory()->create();

    $response = $this->getJson(
        '/api/v1/vacancies/'.$vacancy->id,
    );

    $response
        ->assertOk()
        ->assertJsonPath('data.id', $vacancy->id)
        ->assertJsonPath('data.company', [
            'name' => 'Dicoding Indonesia',
            'business_sector' => 'Technology',
            'employee_count' => '50-100',
            'logo_url' => asset('images/dicoding-indonesia.png'),
        ]);
});
