<?php

namespace App\Http\Requests;

use App\Enums\EmploymentType;
use App\Enums\ExperienceLevel;
use App\Enums\Position;
use App\Rules\NonEmptyRichText;
use App\Support\VacancyDescription;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVacancyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $description = $this->input('description');

        if (
            ! is_string($description)
            || mb_strlen($description, 'UTF-8') > 50000
        ) {
            return;
        }

        $this->merge([
            'description' => VacancyDescription::sanitize($description),
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'description.required' => 'Deskripsi lowongan wajib berisi teks.',
        ];
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],

            'position' => [
                'required',
                'string',
                Rule::enum(Position::class),
            ],

            'employment_type' => [
                'required',
                'string',
                Rule::enum(EmploymentType::class),
            ],

            'candidate_count' => ['required', 'integer', 'min:1', 'max:99'],

            'expires_at' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:'.now('Asia/Jakarta')->toDateString(),
            ],

            'location_id' => [
                'required',
                'integer',
                Rule::exists('locations', 'id'),
            ],

            'is_remote' => ['sometimes', 'boolean'],

            'description' => [
                'bail',
                'required',
                'string',
                'max:50000',
                new NonEmptyRichText,
            ],

            'salary_min' => ['required', 'integer', 'min:0'],

            'salary_max' => [
                'nullable',
                'integer',
                'min:0',
                'gte:salary_min',
            ],

            'show_salary' => ['sometimes', 'boolean'],

            'experience_level' => [
                'required',
                'string',
                Rule::enum(ExperienceLevel::class),
            ],
        ];
    }
}
