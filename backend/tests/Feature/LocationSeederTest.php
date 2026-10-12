<?php

use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('seeds the location catalogue through the main database seeder', function (): void {
    $this->seed();

    $this->assertDatabaseCount('locations', 529);

    $this->assertDatabaseHas('locations', [
        'id' => 22,
        'name' => 'Kota Bandung',
        'province' => 'Jawa Barat',
    ]);

    $this->assertDatabaseHas('locations', [
        'id' => 11,
        'name' => 'Kota Tangerang Selatan',
        'province' => 'Banten',
    ]);

    $this->assertDatabaseHas('locations', [
        'id' => 677,
        'name' => 'Luar Negeri',
        'province' => null,
    ]);

    $this->getJson('/api/v1/vacancy-options')
        ->assertOk()
        ->assertJsonCount(516, 'data.locations');

    $this->assertDatabaseHas('locations', [
        'id' => 150,
        'name' => 'Kabupaten Kotabaru',
        'province' => 'Kalimantan Selatan',
    ]);

    $this->assertDatabaseHas('locations', [
        'id' => 505,
        'name' => 'Kabupaten Pesisir Barat',
        'province' => 'Lampung',
    ]);
});
