"use client";

import { useQuery } from "@tanstack/react-query";
import { getVacancy, VacancyNotFoundError } from "@/lib/api/vacancies";

export function useVacancy(id: string) {
  return useQuery({
    queryKey: ["vacancy", id],
    queryFn: ({ signal }) => getVacancy(id, signal),
    retry: (failureCount, error) => !(error instanceof VacancyNotFoundError) && failureCount < 2,
  });
}
