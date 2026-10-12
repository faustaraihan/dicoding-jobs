<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VacancyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,

            'company' => [
                'name' => config('company.name'),
                'business_sector' => config('company.business_sector'),
                'employee_count' => config('company.employee_count'),
                'logo_url' => asset(config('company.logo_path')),
            ],

            'position' => $this->position->value,
            'position_label' => $this->position->label(),

            'employment_type' => $this->employment_type->value,
            'employment_type_label' => $this->employment_type->label(),

            'candidate_count' => $this->candidate_count,
            'expires_at' => $this->expires_at->toIso8601String(),

            'location_id' => $this->location_id,
            'location' => $this->whenLoaded('location', function (): array {
                return [
                    'id' => $this->location->id,
                    'name' => $this->location->name,
                    'province' => $this->location->province,
                ];
            }),

            'is_remote' => $this->is_remote,
            'description' => $this->description,

            'show_salary' => $this->show_salary,
            'salary_min' => $this->when(
                $this->show_salary,
                $this->salary_min,
            ),
            'salary_max' => $this->when(
                $this->show_salary,
                $this->salary_max,
            ),

            'experience_level' => $this->experience_level->value,
            'experience_level_label' => $this->experience_level->label(),

            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
