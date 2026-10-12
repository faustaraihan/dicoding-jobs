<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class VacancyEditResource extends VacancyResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        $data['salary_min'] = $this->salary_min;
        $data['salary_max'] = $this->salary_max;

        return $data;
    }
}
