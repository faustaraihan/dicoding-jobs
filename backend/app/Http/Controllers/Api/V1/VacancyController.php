<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVacancyRequest;
use App\Http\Requests\UpdateVacancyRequest;
use App\Http\Resources\VacancyEditResource;
use App\Http\Resources\VacancyResource;
use App\Models\Vacancy;
use App\Support\VacancyDeadline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class VacancyController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $search = trim($validated['search'] ?? '');

        $query = Vacancy::query()
            ->with('location')
            ->orderByDesc('id');

        if ($search !== '') {
            $escapedSearch = str_replace(
                ['!', '%', '_'],
                ['!!', '!%', '!_'],
                $search,
            );

            $query->whereRaw(
                "title LIKE ? ESCAPE '!'",
                ['%'.$escapedSearch.'%'],
            );
        }

        $vacancies = $query
            ->paginate($validated['per_page'] ?? 10)
            ->withQueryString();

        return VacancyResource::collection($vacancies);
    }

    public function store(StoreVacancyRequest $request): JsonResponse
    {
        $data = $request->validated();

        $data['expires_at'] = VacancyDeadline::toUtc($data['expires_at']);

        $data['is_remote'] = $data['is_remote'] ?? false;
        $data['show_salary'] = $data['show_salary'] ?? false;
        $data['salary_max'] = $data['salary_max'] ?? null;

        $vacancy = Vacancy::create($data);

        $vacancy->load('location');

        return (new VacancyResource($vacancy))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Vacancy $vacancy): VacancyResource
    {
        $vacancy->load('location');

        return new VacancyResource($vacancy);
    }

    public function update(
        UpdateVacancyRequest $request,
        Vacancy $vacancy,
    ): VacancyResource {
        $data = $request->validated();

        $data['expires_at'] = VacancyDeadline::toUtc($data['expires_at']);

        $data['is_remote'] = $data['is_remote'] ?? false;
        $data['show_salary'] = $data['show_salary'] ?? false;
        $data['salary_max'] = $data['salary_max'] ?? null;

        $vacancy->update($data);

        $vacancy->load('location');

        return new VacancyResource($vacancy);
    }

    public function edit(Vacancy $vacancy): VacancyEditResource
    {
        $vacancy->load('location');

        return new VacancyEditResource($vacancy);
    }

    public function destroy(Vacancy $vacancy): Response
    {
        $vacancy->delete();

        return response()->noContent();
    }
}
