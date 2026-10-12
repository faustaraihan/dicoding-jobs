<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VacancyImageController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:max_width=4096,max_height=4096'],
        ], [
            'image.required' => 'Pilih gambar terlebih dahulu.',
            'image.image' => 'File harus berupa gambar JPG, PNG, atau WebP.',
            'image.mimes' => 'File harus berupa gambar JPG, PNG, atau WebP.',
            'image.max' => 'Ukuran gambar maksimal 2 MB.',
            'image.dimensions' => 'Dimensi gambar maksimal 4096 × 4096 piksel.',
        ]);

        $path = $request->file('image')->store('vacancy-images', 'public');

        if ($path === false) {
            return response()->json(['message' => 'Gambar gagal disimpan. Coba lagi.'], 500);
        }

        return response()->json(['data' => [
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
        ]], 201);
    }
}
