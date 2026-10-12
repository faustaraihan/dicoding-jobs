"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getVacancies } from "@/lib/api/vacancies";

interface UseVacanciesParams {
  search?: string;
  page?: number;
  perPage?: number;
}

export function useVacancies({ search = "", page = 1, perPage = 10 }: UseVacanciesParams = {}) {
  const normalizedSearch = search.trim();

  return useQuery({
    queryKey: [
      "vacancies",
      {
        search: normalizedSearch,
        page,
        perPage,
      },
    ],
    queryFn: ({ signal }) =>
      getVacancies({
        search: normalizedSearch,
        page,
        perPage,
        signal,
      }),
    placeholderData: keepPreviousData,
  });
}
