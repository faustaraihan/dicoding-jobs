<?php

use App\Models\Location;
use App\Models\Vacancy;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(LazilyRefreshDatabase::class);

test('rejects a rich text description without meaningful text', function (
    string $description,
): void {
    $location = Location::factory()->create();

    $payload = Vacancy::factory()
        ->for($location)
        ->make()
        ->attributesToArray();

    $payload['expires_at'] = now('Asia/Jakarta')
        ->addMonth()
        ->toDateString();

    $payload['description'] = $description;

    $response = $this->postJson('/api/v1/vacancies', $payload);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'description' => 'Deskripsi lowongan wajib berisi teks.',
        ]);

    $this->assertDatabaseCount('vacancies', 0);
})->with([
    'empty editor paragraph' => ['<p><br></p>'],
    'paragraph containing only spaces' => ['<p>&nbsp; &nbsp;</p>'],
]);

test('stores a sanitized description while preserving allowed formatting', function (
    string $inputHtml,
    string $expectedHtml,
): void {
    $location = Location::factory()->create();

    $payload = Vacancy::factory()
        ->for($location)
        ->make()
        ->attributesToArray();

    $payload['expires_at'] = now('Asia/Jakarta')
        ->addMonth()
        ->toDateString();

    $payload['description'] = $inputHtml;

    $response = $this->postJson('/api/v1/vacancies', $payload);

    $response
        ->assertCreated()
        ->assertJsonPath('data.description', $expectedHtml);

    $this->assertDatabaseHas('vacancies', [
        'id' => $response->json('data.id'),
        'description' => $expectedHtml,
    ]);
})->with([
    'script is removed' => [
        '<p>Lowongan tersedia.</p><script>alert("xss")</script>',
        '<p>Lowongan tersedia.</p>',
    ],
    'event handler is removed' => [
        '<p onclick="alert(1)">Lowongan tersedia.</p>',
        '<p>Lowongan tersedia.</p>',
    ],
    'javascript link is removed' => [
        '<p><a href="javascript:alert(1)">Daftar</a></p>',
        '<p><a>Daftar</a></p>',
    ],
    'allowed formatting is preserved' => [
        '<p>Dicari <strong>Product Engineer</strong>.</p>',
        '<p>Dicari <strong>Product Engineer</strong>.</p>',
    ],
]);

test('sanitizes the description when updating a vacancy', function (): void {
    $vacancy = Vacancy::factory()->create([
        'description' => '<p>Deskripsi awal.</p>',
    ]);

    $payload = $vacancy->attributesToArray();

    $payload['expires_at'] = now('Asia/Jakarta')
        ->addMonth()
        ->toDateString();

    $payload['description'] =
        '<p onclick="alert(1)">Deskripsi baru.</p>';

    $response = $this->putJson(
        '/api/v1/vacancies/'.$vacancy->id,
        $payload,
    );

    $response
        ->assertOk()
        ->assertJsonPath(
            'data.description',
            '<p>Deskripsi baru.</p>',
        );

    $this->assertDatabaseHas('vacancies', [
        'id' => $vacancy->id,
        'description' => '<p>Deskripsi baru.</p>',
    ]);
});

test('preserves uploaded images while removing unsafe image attributes and sources', function (): void {
    $vacancy = Vacancy::factory()->create();
    /** @var FilesystemAdapter $publicDisk */
    $publicDisk = Storage::disk('public');
    $url = $publicDisk->url('vacancy-images/photo.png');
    $payload = $vacancy->attributesToArray();
    $payload['expires_at'] = now('Asia/Jakarta')->addMonth()->toDateString();
    $payload['description'] = '<p>Deskripsi pekerjaan.</p><img src="'.$url.'" alt="Tim" onerror="alert(1)"><img src="javascript:alert(1)"><img src="data:image/svg+xml;base64,PHN2Zz4="><img src="https://other.example/photo.png">';

    $response = $this->putJson('/api/v1/vacancies/'.$vacancy->id, $payload);

    $response->assertOk();
    $description = $response->json('data.description');
    expect($description)->toContain('src="'.$url.'"')->toContain('alt="Tim"')
        ->not->toContain('onerror')->not->toContain('javascript:')->not->toContain('data:')->not->toContain('other.example');
    $this->assertDatabaseHas('vacancies', ['id' => $vacancy->id, 'description' => $description]);
});
