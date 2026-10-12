<?php

namespace App\Http\Requests;

use App\Models\Vacancy;

class UpdateVacancyRequest extends StoreVacancyRequest
{
    public function rules(): array
    {
        $rules = parent::rules();

        $vacancy = $this->route('vacancy');

        if ($vacancy instanceof Vacancy) {
            $existingDeadline = $vacancy->expires_at
                ->copy()
                ->setTimezone('Asia/Jakarta')
                ->toDateString();

            if ($this->input('expires_at') === $existingDeadline) {
                $rules['expires_at'] = [
                    'required',
                    'date_format:Y-m-d',
                ];
            }
        }

        return $rules;
    }
}
