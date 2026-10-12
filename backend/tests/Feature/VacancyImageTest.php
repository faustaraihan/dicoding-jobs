<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('uploads an image and returns a public URL', function (): void {
    Storage::fake('public');
    $image = UploadedFile::fake()->createWithContent('photo.png', file_get_contents(public_path('images/dicoding-indonesia.png')));

    $response = $this->post('/api/v1/vacancy-images', ['image' => $image], ['Accept' => 'application/json']);

    $response->assertCreated();
    $path = $response->json('data.path');
    expect($path)->toStartWith('vacancy-images/')->toEndWith('.png');
    $response->assertJsonPath('data.url', Storage::disk('public')->url($path));
    Storage::disk('public')->assertExists($path);
});

test('rejects invalid image uploads without storing files', function (string $kind): void {
    Storage::fake('public');
    $image = match ($kind) {
        'missing' => null,
        'disguised' => UploadedFile::fake()->createWithContent('photo.png', '<?php echo "unsafe";'),
        'svg' => UploadedFile::fake()->createWithContent('photo.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
        'oversized' => UploadedFile::fake()->createWithContent('photo.png', file_get_contents(public_path('images/dicoding-indonesia.png')))->size(2049),
    };

    $response = $this->post('/api/v1/vacancy-images', $image ? ['image' => $image] : [], ['Accept' => 'application/json']);

    $response->assertUnprocessable()->assertJsonValidationErrors('image');
    expect(Storage::disk('public')->allFiles())->toBe([]);
})->with(['missing', 'disguised', 'svg', 'oversized']);
