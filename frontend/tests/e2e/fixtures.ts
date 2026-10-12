import { test as base, expect, type APIRequestContext } from "@playwright/test";
import type { VacancyOptionsResponse, VacancyPayload } from "../../src/types/vacancy";

export const apiUrl = "http://127.0.0.1:8010/api/v1";

type VacancyApi = {
  options: VacancyOptionsResponse["data"];
  create: (title: string, overrides?: Partial<VacancyPayload>) => Promise<number>;
};

async function clearVacancies(request: APIRequestContext) {
  const response = await request.get(`${apiUrl}/vacancies?per_page=50`);
  expect(response.ok()).toBeTruthy();
  const { data } = await response.json();
  for (const vacancy of data) {
    const deletion = await request.delete(`${apiUrl}/vacancies/${vacancy.id}`);
    expect(deletion.status()).toBe(204);
  }
}

export const test = base.extend<{ vacancyApi: VacancyApi }>({
  vacancyApi: async ({ request }, runTest) => {
    await clearVacancies(request);
    const response = await request.get(`${apiUrl}/vacancy-options`);
    expect(response.ok()).toBeTruthy();
    const { data: options }: VacancyOptionsResponse = await response.json();
    const create = async (title: string, overrides: Partial<VacancyPayload> = {}) => {
      const result = await request.post(`${apiUrl}/vacancies`, {
        data: {
          title,
          position: options.positions[0].value,
          employment_type: options.employment_types[0].value,
          candidate_count: 2,
          expires_at: "2099-12-31",
          location_id: options.locations[0].id,
          is_remote: false,
          description: "<h2>Deskripsi Pekerjaan</h2><p>Membangun aplikasi untuk pengujian E2E.</p>",
          salary_min: 5_000_000,
          salary_max: 8_000_000,
          show_salary: true,
          experience_level: options.experience_levels[0].value,
          ...overrides,
        },
      });
      expect(result.status()).toBe(201);
      return (await result.json()).data.id as number;
    };
    try {
      await runTest({ options, create });
    } finally {
      await clearVacancies(request);
    }
  },
});

export { expect };
