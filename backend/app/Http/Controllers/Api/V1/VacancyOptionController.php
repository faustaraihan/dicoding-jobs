<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\EmploymentType;
use App\Enums\ExperienceLevel;
use App\Enums\Position;
use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;

class VacancyOptionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'positions' => array_map(
                    fn (Position $position): array => [
                        'value' => $position->value,
                        'label' => $position->label(),
                    ],
                    Position::cases(),
                ),

                'employment_types' => array_map(
                    fn (EmploymentType $employmentType): array => [
                        'value' => $employmentType->value,
                        'label' => $employmentType->label(),
                    ],
                    EmploymentType::cases(),
                ),

                'experience_levels' => array_map(
                    fn (ExperienceLevel $experienceLevel): array => [
                        'value' => $experienceLevel->value,
                        'label' => $experienceLevel->label(),
                    ],
                    ExperienceLevel::cases(),
                ),

                'locations' => Location::query()
                    ->orderBy('name')
                    ->orderBy('id')
                    ->get(['id', 'name', 'province'])
                    ->unique('name')
                    ->values(),
            ],
        ]);
    }
}
