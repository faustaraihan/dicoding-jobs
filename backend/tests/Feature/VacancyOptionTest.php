<?php

use App\Enums\EmploymentType;
use App\Enums\ExperienceLevel;
use App\Enums\Position;
use App\Models\Location;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('returns all enum options with values and labels', function (): void {
    $response = $this->getJson('/api/v1/vacancy-options');

    $response
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                'positions' => [
                    '*' => ['value', 'label'],
                ],
                'employment_types' => [
                    '*' => ['value', 'label'],
                ],
                'experience_levels' => [
                    '*' => ['value', 'label'],
                ],
                'locations',
            ],
        ])
        ->assertJsonCount(
            count(Position::cases()),
            'data.positions',
        )
        ->assertJsonCount(
            count(EmploymentType::cases()),
            'data.employment_types',
        )
        ->assertJsonCount(
            count(ExperienceLevel::cases()),
            'data.experience_levels',
        );

    $groups = [
        'positions' => Position::cases(),
        'employment_types' => EmploymentType::cases(),
        'experience_levels' => ExperienceLevel::cases(),
    ];

    foreach ($groups as $key => $cases) {
        $actualValues = array_column(
            $response->json('data.'.$key),
            'value',
        );

        $expectedValues = array_column($cases, 'value');

        expect($actualValues)->toEqualCanonicalizing($expectedValues);
    }

    expect($response->json('data.positions'))->toContain([
        'value' => 'it_and_software',
        'label' => 'IT and Software',
    ]);

    expect($response->json('data.employment_types'))->toContain([
        'value' => 'internship',
        'label' => 'Intern',
    ]);

    expect($response->json('data.experience_levels'))->toContain([
        'value' => 'less_than_one_year',
        'label' => 'Kurang dari 1 tahun',
    ]);
});

test('returns locations ordered by name including a location without a province', function (): void {
    Location::factory()->create([
        'id' => 11,
        'name' => 'Kota Tangerang Selatan',
        'province' => 'Banten',
    ]);

    Location::factory()->create([
        'id' => 677,
        'name' => 'Luar Negeri',
        'province' => null,
    ]);

    Location::factory()->create([
        'id' => 22,
        'name' => 'Kota Bandung',
        'province' => 'Jawa Barat',
    ]);

    $response = $this->getJson('/api/v1/vacancy-options');

    $response
        ->assertOk()
        ->assertJsonCount(3, 'data.locations')
        ->assertJsonPath('data.locations', [
            [
                'id' => 22,
                'name' => 'Kota Bandung',
                'province' => 'Jawa Barat',
            ],
            [
                'id' => 11,
                'name' => 'Kota Tangerang Selatan',
                'province' => 'Banten',
            ],
            [
                'id' => 677,
                'name' => 'Luar Negeri',
                'province' => null,
            ],
        ]);
});

test('returns an empty location array when no locations exist', function (): void {
    $response = $this->getJson('/api/v1/vacancy-options');

    $response
        ->assertOk()
        ->assertJsonPath('data.locations', [])
        ->assertJsonCount(4, 'data.employment_types');
});

test('returns one option per location while retaining legacy location records', function (): void {
    $first = Location::factory()->create([
        'id' => 478,
        'name' => 'Kabupaten Kotawaringin Barat',
        'province' => 'Kalimantan Tengah',
    ]);
    $legacy = Location::factory()->create([
        'id' => 529,
        'name' => 'Kabupaten Kotawaringin Barat',
        'province' => 'Kalimantan Tengah',
    ]);

    $this->getJson('/api/v1/vacancy-options')
        ->assertOk()
        ->assertJsonCount(1, 'data.locations')
        ->assertJsonPath('data.locations.0.id', 478)
        ->assertJsonPath('data.locations.0.province', 'Kalimantan Tengah');

    $this->assertModelExists($first);
    $this->assertModelExists($legacy);
});
