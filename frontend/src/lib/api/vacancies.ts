import type {
  VacancyDetailResponse,
  VacancyListResponse,
  VacancyOptionsResponse,
  VacancyPayload,
} from "@/types/vacancy";

interface GetVacanciesParams {
  search?: string;
  page?: number;
  perPage?: number;
  signal?: AbortSignal;
}

export async function getVacancies({
  search = "",
  page = 1,
  perPage = 10,
  signal,
}: GetVacanciesParams = {}): Promise<VacancyListResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("Alamat API belum dikonfigurasi.");
  }

  const url = new URL(`${baseUrl.replace(/\/+$/, "")}/vacancies`);

  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));

  if (search.trim()) {
    url.searchParams.set("search", search.trim());
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil daftar lowongan. Status: ${response.status}.`);
  }

  return response.json();
}

export class VacancyNotFoundError extends Error {
  constructor() {
    super("Lowongan tidak ditemukan.");
    this.name = "VacancyNotFoundError";
  }
}

export async function getVacancy(id: string, signal?: AbortSignal): Promise<VacancyDetailResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("Alamat API belum dikonfigurasi.");
  }

  const response = await fetch(
    `${baseUrl.replace(/\/+$/, "")}/vacancies/${encodeURIComponent(id)}`,
    { headers: { Accept: "application/json" }, signal },
  );

  if (response.status === 404) {
    throw new VacancyNotFoundError();
  }

  if (!response.ok) {
    throw new Error(`Gagal memuat lowongan. Status: ${response.status}.`);
  }

  return response.json();
}

export async function deleteVacancy(id: number): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("Alamat API belum dikonfigurasi.");
  }

  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/vacancies/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Gagal menghapus lowongan. Status: ${response.status}.`);
  }
}

export class VacancyValidationError extends Error {
  constructor(public errors: Record<string, string[]>) {
    super("Periksa kembali kolom yang ditandai.");
    this.name = "VacancyValidationError";
  }
}

async function requestFormApi<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) throw new Error("Alamat API belum dikonfigurasi.");

  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/${path}`, {
    ...init,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
  });

  if (response.status === 404) throw new VacancyNotFoundError();
  if (response.status === 422) {
    const body: { errors: Record<string, string[]> } = await response.json();
    throw new VacancyValidationError(body.errors);
  }
  if (!response.ok) throw new Error(`Permintaan gagal. Status: ${response.status}.`);
  return response.json();
}

export function getVacancyOptions(signal?: AbortSignal) {
  return requestFormApi<VacancyOptionsResponse>("vacancy-options", { signal });
}

export function getVacancyForEdit(id: string, signal?: AbortSignal) {
  return requestFormApi<VacancyDetailResponse>(`vacancies/${encodeURIComponent(id)}/edit`, {
    signal,
  });
}

export function saveVacancy(payload: VacancyPayload, id?: string) {
  return requestFormApi<VacancyDetailResponse>(
    id ? `vacancies/${encodeURIComponent(id)}` : "vacancies",
    {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function uploadVacancyImage(image: File): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) throw new Error("Alamat API belum dikonfigurasi.");

  const body = new FormData();
  body.append("image", image);
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/vacancy-images`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.errors?.image?.[0] ?? error?.message ?? "Gagal mengunggah gambar. Coba lagi.",
    );
  }
  const result: { data: { url: string } } = await response.json();
  return result.data.url;
}
