<?php

use App\Http\Controllers\Api\V1\VacancyController;
use App\Http\Controllers\Api\V1\VacancyImageController;
use App\Http\Controllers\Api\V1\VacancyOptionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/vacancy-images', [VacancyImageController::class, 'store'])
        ->middleware('throttle:20,1')
        ->name('vacancy-images.store');

    Route::get('/vacancies', [VacancyController::class, 'index'])
        ->name('vacancies.index');

    Route::post('/vacancies', [VacancyController::class, 'store'])
        ->name('vacancies.store');

    Route::get('/vacancies/{vacancy}', [VacancyController::class, 'show'])
        ->whereNumber('vacancy')
        ->name('vacancies.show');

    Route::put('/vacancies/{vacancy}', [VacancyController::class, 'update'])
        ->whereNumber('vacancy')
        ->name('vacancies.update');

    Route::delete('/vacancies/{vacancy}', [VacancyController::class, 'destroy'])
        ->whereNumber('vacancy')
        ->name('vacancies.destroy');

    Route::get('/vacancy-options', [VacancyOptionController::class, 'index'])
        ->name('vacancy-options.index');

    Route::get('/vacancies/{vacancy}/edit', [VacancyController::class, 'edit'])
        ->whereNumber('vacancy')
        ->name('vacancies.edit');
});
