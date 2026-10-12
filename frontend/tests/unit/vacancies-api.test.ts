import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteVacancy,
  getVacancies,
  getVacancy,
  saveVacancy,
  uploadVacancyImage,
  VacancyNotFoundError,
  VacancyValidationError,
} from "@/lib/api/vacancies";
import type { VacancyPayload } from "@/types/vacancy";

const fetchMock = vi.fn<typeof fetch>();
const payload: VacancyPayload = {
  title: "Frontend Engineer",
  position: "front_end_web_developer",
  employment_type: "full_time",
  candidate_count: 2,
  expires_at: "2099-12-31",
  location_id: 1,
  is_remote: true,
  description: "<p>Mengembangkan aplikasi.</p>",
  salary_min: 5000000,
  salary_max: null,
  show_salary: true,
  experience_level: "one_to_three_years",
};

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test/api/v1/");
  vi.stubGlobal("fetch", fetchMock);
});

describe("client API lowongan", () => {
  it("mengirim keyword yang sudah dipangkas, pagination, dan AbortSignal", async () => {
    const response = { data: [], meta: { total: 0 } };
    fetchMock.mockResolvedValueOnce(Response.json(response));
    const signal = new AbortController().signal;
    await expect(
      getVacancies({ search: "  Engineer & Designer  ", page: 2, signal }),
    ).resolves.toEqual(response);
    const [address, init] = fetchMock.mock.calls[0];
    const url = new URL(String(address));
    expect(url.pathname).toBe("/api/v1/vacancies");
    expect(url.searchParams.get("search")).toBe("Engineer & Designer");
    expect(url.searchParams.get("page")).toBe("2");
    expect(init?.signal).toBe(signal);
  });

  it("tidak mengirim filter untuk keyword kosong", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ data: [] }));
    await getVacancies({ search: "  " });
    expect(new URL(String(fetchMock.mock.calls[0][0])).searchParams.has("search")).toBe(false);
  });

  it("memberikan error yang jelas jika alamat API belum diatur", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    await expect(getVacancies()).rejects.toThrow("Alamat API belum dikonfigurasi.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("membedakan lowongan 404 dari kegagalan server", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    await expect(getVacancy("99")).rejects.toBeInstanceOf(VacancyNotFoundError);
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
    await expect(getVacancy("99")).rejects.toThrow("Status: 500");
  });

  it("meneruskan error jaringan dan pembatalan permintaan", async () => {
    const aborted = new DOMException("Dibatalkan", "AbortError");
    fetchMock.mockRejectedValueOnce(aborted);
    await expect(getVacancies()).rejects.toBe(aborted);
  });

  it("mempertahankan pesan validasi setiap field dari respons 422", async () => {
    const errors = { title: ["Judul wajib diisi."], salary_min: ["Gaji tidak valid."] };
    fetchMock.mockResolvedValueOnce(Response.json({ errors }, { status: 422 }));
    await expect(saveVacancy(payload)).rejects.toMatchObject({
      errors,
      name: "VacancyValidationError",
    });
    expect(new VacancyValidationError(errors)).toBeInstanceOf(Error);
  });

  it.each([
    [undefined, "POST"],
    ["12", "PUT"],
  ])("menyimpan lowongan dengan metode %s/%s", async (id, method) => {
    fetchMock.mockResolvedValueOnce(Response.json({ data: { id: 12 } }));
    await saveVacancy(payload, id);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`https://api.example.test/api/v1/vacancies${id ? `/${id}` : ""}`);
    expect(init?.method).toBe(method);
    expect(JSON.parse(String(init?.body))).toEqual(payload);
  });

  it("menerima penghapusan 204 tanpa mencoba membaca JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(deleteVacancy(12)).resolves.toBeUndefined();
  });

  it("mengirim gambar sebagai multipart dan membaca URL hasil upload", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ data: { url: "https://api.example.test/storage/image.png" } }),
    );
    const file = new File(["gambar"], "image.png", { type: "image/png" });
    await expect(uploadVacancyImage(file)).resolves.toContain("/storage/image.png");
    const init = fetchMock.mock.calls[0][1];
    expect((init?.body as FormData).get("image")).toBe(file);
    expect(new Headers(init?.headers).has("Content-Type")).toBe(false);
  });

  it("menampilkan pesan validasi upload dari backend", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ errors: { image: ["Ukuran gambar terlalu besar."] } }, { status: 422 }),
    );
    await expect(uploadVacancyImage(new File(["x"], "image.png"))).rejects.toThrow(
      "Ukuran gambar terlalu besar.",
    );
  });

  it("memberi pesan fallback ketika respons upload bukan JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response("Bad gateway", { status: 502 }));
    await expect(uploadVacancyImage(new File(["x"], "image.png"))).rejects.toThrow(
      "Gagal mengunggah gambar. Coba lagi.",
    );
  });
});
