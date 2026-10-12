import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVacancies } from "@/hooks/useVacancies";
import { useVacancy } from "@/hooks/useVacancy";
import { VacancyNotFoundError } from "@/lib/api/vacancies";
import type { Vacancy, VacancyDetailResponse, VacancyListResponse } from "@/types/vacancy";

const mocks = vi.hoisted(() => ({ list: vi.fn(), detail: vi.fn() }));
vi.mock("@/lib/api/vacancies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/vacancies")>()),
  getVacancies: mocks.list,
  getVacancy: mocks.detail,
}));

const vacancy: Vacancy = {
  id: 1,
  title: "Frontend Engineer",
  position: "front_end_web_developer",
  position_label: "Front-End Web Developer",
  employment_type: "full_time",
  employment_type_label: "Full-Time",
  candidate_count: 2,
  expires_at: "2099-12-31T16:59:59Z",
  location_id: 4,
  location: { id: 4, name: "Kota Bandung", province: "Jawa Barat" },
  is_remote: true,
  description: "<p>Deskripsi pekerjaan.</p>",
  salary_min: 5000000,
  salary_max: 8000000,
  show_salary: true,
  experience_level: "one_to_three_years",
  experience_level_label: "1-3 tahun",
  created_at: "2026-10-11T00:00:00Z",
  updated_at: "2026-10-11T00:00:00Z",
  company: {
    name: "Dicoding",
    logo_url: "/logo.png",
    employee_count: "50-100",
    business_sector: "Technology",
  },
};
function listResponse(page = 1, title = vacancy.title): VacancyListResponse {
  return {
    data: [{ ...vacancy, id: page, title }],
    links: {
      first: "/api/vacancies?page=1",
      last: "/api/vacancies?page=2",
      prev: null,
      next: null,
    },
    meta: { current_page: page, last_page: 2, per_page: 1, total: 2, from: page, to: page },
  };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const clients: QueryClient[] = [];
function queryWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0, staleTime: 60_000, gcTime: Infinity },
    },
  });
  clients.push(client);
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}
beforeEach(() => {
  mocks.list.mockReset();
  mocks.detail.mockReset();
});
afterEach(() => {
  clients.splice(0).forEach((client) => client.clear());
});

describe("hook daftar lowongan", () => {
  it("loading awal kemudian menampilkan respons API", async () => {
    const request = deferred<VacancyListResponse>();
    mocks.list.mockReturnValueOnce(request.promise);
    const { result } = renderHook(() => useVacancies(), { wrapper: queryWrapper() });
    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();
    await act(async () => request.resolve(listResponse()));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data[0].title).toBe("Frontend Engineer");
    expect(mocks.list).toHaveBeenCalledWith({
      search: "",
      page: 1,
      perPage: 10,
      signal: expect.any(AbortSignal),
    });
  });

  it("keyword dengan spasi tepi memakai cache yang sama", async () => {
    mocks.list.mockResolvedValue(listResponse());
    const { result, rerender } = renderHook(({ search }) => useVacancies({ search }), {
      wrapper: queryWrapper(),
      initialProps: { search: "  engineer  " },
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.list.mock.calls[0][0].search).toBe("engineer");
    rerender({ search: "engineer" });
    expect(mocks.list).toHaveBeenCalledTimes(1);
    expect(result.current.isFetching).toBe(false);
  });

  it("mempertahankan hasil sebelumnya selama filter baru dimuat", async () => {
    const request = deferred<VacancyListResponse>();
    mocks.list.mockResolvedValueOnce(listResponse(1, "Frontend Engineer"));
    mocks.list.mockReturnValueOnce(request.promise);
    const { result, rerender } = renderHook(({ search }) => useVacancies({ search }), {
      wrapper: queryWrapper(),
      initialProps: { search: "engineer" },
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    rerender({ search: "designer" });
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.data?.data[0].title).toBe("Frontend Engineer");
    await act(async () => request.resolve(listResponse(1, "Product Designer")));
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false));
    expect(result.current.data?.data[0].title).toBe("Product Designer");
  });

  it("pergantian halaman memakai parameter yang benar dan kembali memakai cache", async () => {
    mocks.list.mockImplementation(({ page }) => Promise.resolve(listResponse(page)));
    const { result, rerender } = renderHook(({ page }) => useVacancies({ page, perPage: 1 }), {
      wrapper: queryWrapper(),
      initialProps: { page: 1 },
    });
    await waitFor(() => expect(result.current.data?.meta.current_page).toBe(1));
    rerender({ page: 2 });
    await waitFor(() => expect(result.current.data?.meta.current_page).toBe(2));
    expect(mocks.list.mock.calls[1][0]).toMatchObject({ page: 2, perPage: 1 });
    rerender({ page: 1 });
    expect(result.current.data?.meta.current_page).toBe(1);
    expect(mocks.list).toHaveBeenCalledTimes(2);
  });

  it("request filter lama dibatalkan dan respons terlambat tidak menimpa filter baru", async () => {
    const oldRequest = deferred<VacancyListResponse>();
    mocks.list.mockReturnValueOnce(oldRequest.promise);
    mocks.list.mockResolvedValueOnce(listResponse(1, "Product Designer"));
    const { result, rerender } = renderHook(({ search }) => useVacancies({ search }), {
      wrapper: queryWrapper(),
      initialProps: { search: "engineer" },
    });
    const oldSignal = mocks.list.mock.calls[0][0].signal as AbortSignal;
    rerender({ search: "designer" });
    expect(oldSignal.aborted).toBe(true);
    await waitFor(() => expect(result.current.data?.data[0].title).toBe("Product Designer"));
    await act(async () => oldRequest.resolve(listResponse(1, "Frontend Engineer")));
    expect(result.current.data?.data[0].title).toBe("Product Designer");
  });

  it("membatalkan request ketika komponen dilepas", () => {
    mocks.list.mockReturnValueOnce(deferred<VacancyListResponse>().promise);
    const { unmount } = renderHook(() => useVacancies(), { wrapper: queryWrapper() });
    const signal = mocks.list.mock.calls[0][0].signal as AbortSignal;
    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it("menampilkan error dan dapat pulih melalui refetch", async () => {
    const failure = new Error("Server tidak tersedia.");
    mocks.list.mockRejectedValueOnce(failure);
    mocks.list.mockResolvedValueOnce(listResponse());
    const { result } = renderHook(() => useVacancies(), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(failure);
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.error).toBeNull();
  });
});

describe("hook detail lowongan", () => {
  it("loading awal lalu menyimpan detail dengan ID yang diminta", async () => {
    const request = deferred<VacancyDetailResponse>();
    mocks.detail.mockReturnValueOnce(request.promise);
    const { result } = renderHook(() => useVacancy("1"), { wrapper: queryWrapper() });
    expect(result.current.isPending).toBe(true);
    expect(mocks.detail).toHaveBeenCalledWith("1", expect.any(AbortSignal));
    await act(async () => request.resolve({ data: vacancy }));
    await waitFor(() => expect(result.current.data?.data.id).toBe(1));
  });

  it("404 langsung menjadi error tanpa retry", async () => {
    mocks.detail.mockRejectedValue(new VacancyNotFoundError());
    const { result } = renderHook(() => useVacancy("99"), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(VacancyNotFoundError);
    expect(mocks.detail).toHaveBeenCalledTimes(1);
  });

  it("mencoba ulang kegagalan sementara dan pulih", async () => {
    mocks.detail.mockRejectedValueOnce(new Error("Koneksi terputus."));
    mocks.detail.mockResolvedValueOnce({ data: vacancy });
    const { result } = renderHook(() => useVacancy("1"), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.detail).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
  });

  it("berhenti setelah maksimal dua retry jika server tetap gagal", async () => {
    mocks.detail.mockRejectedValue(new Error("Status: 500"));
    const { result } = renderHook(() => useVacancy("1"), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mocks.detail).toHaveBeenCalledTimes(3);
    expect(result.current.error?.message).toBe("Status: 500");
  });

  it("cache detail dipisahkan berdasarkan ID", async () => {
    mocks.detail.mockImplementation((id: string) =>
      Promise.resolve({ data: { ...vacancy, id: Number(id) } }),
    );
    const { result, rerender } = renderHook(({ id }) => useVacancy(id), {
      wrapper: queryWrapper(),
      initialProps: { id: "1" },
    });
    await waitFor(() => expect(result.current.data?.data.id).toBe(1));
    rerender({ id: "2" });
    await waitFor(() => expect(result.current.data?.data.id).toBe(2));
    rerender({ id: "1" });
    expect(result.current.data?.data.id).toBe(1);
    expect(mocks.detail).toHaveBeenCalledTimes(2);
  });

  it("membatalkan permintaan detail ketika komponen dilepas", () => {
    mocks.detail.mockReturnValueOnce(deferred<VacancyDetailResponse>().promise);
    const { unmount } = renderHook(() => useVacancy("1"), { wrapper: queryWrapper() });
    const signal = mocks.detail.mock.calls[0][1] as AbortSignal;
    unmount();
    expect(signal.aborted).toBe(true);
  });
});
