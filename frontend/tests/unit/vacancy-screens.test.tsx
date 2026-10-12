import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import JobCard from "@/components/features/vacancies/JobCard";
import DashboardJobCard from "@/components/features/dashboard/DashboardJobCard";
import VacancyList from "@/components/features/vacancies/VacancyList";
import VacancyDetail from "@/components/features/vacancies/VacancyDetail";
import VacancyEmptyState from "@/components/features/vacancies/VacancyEmptyState";
import { VacancyNotFoundError } from "@/lib/api/vacancies";
import type { Vacancy, VacancyListResponse } from "@/types/vacancy";

const mocks = vi.hoisted(() => ({ list: vi.fn(), detail: vi.fn(), ready: vi.fn() }));
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
vi.mock("@/hooks/useVacancies", () => ({ useVacancies: mocks.list }));
vi.mock("@/hooks/useVacancy", () => ({ useVacancy: mocks.detail }));
vi.mock("@/components/layouts/NavigationProgress", () => ({ usePageReady: mocks.ready }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));
vi.mock("@/components/layouts/NavigationLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

const vacancy: Vacancy = {
  id: 12,
  title: "Frontend Engineer",
  position: "front_end_web_developer",
  position_label: "Front-End Web Developer",
  employment_type: "full_time",
  employment_type_label: "Full-Time",
  candidate_count: 2,
  expires_at: "2026-10-31T16:59:59Z",
  location_id: 4,
  location: { id: 4, name: "Kota Bandung", province: "Jawa Barat" },
  is_remote: true,
  description: "<h2>Tanggung Jawab</h2><p>Membangun <strong>aplikasi web</strong>.</p>",
  salary_min: 5000000,
  salary_max: 8000000,
  show_salary: true,
  experience_level: "one_to_three_years",
  experience_level_label: "1-3 tahun",
  created_at: "2026-10-10T18:00:00Z",
  updated_at: "2026-10-11T00:00:00Z",
  company: {
    name: "Dicoding Indonesia",
    logo_url: "/logo.png",
    employee_count: "50-100",
    business_sector: "Teknologi",
  },
};

function response(data: Vacancy[] = [vacancy], page = 1): VacancyListResponse {
  return {
    data,
    links: { first: "", last: "", prev: null, next: null },
    meta: {
      current_page: page,
      last_page: data.length ? 2 : 1,
      per_page: 10,
      total: data.length ? 16 : 0,
      from: data.length ? 1 : null,
      to: data.length ? data.length : null,
    },
  };
}

function listState(overrides = {}) {
  return {
    data: response(),
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isPlaceholderData: false,
    isFetching: false,
    ...overrides,
  };
}

function detailState(data: Vacancy = vacancy, overrides = {}) {
  return {
    data: { data },
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  window.history.replaceState(null, "", "/list");
  mocks.list.mockReset().mockReturnValue(listState());
  mocks.detail.mockReset().mockReturnValue(detailState());
  mocks.ready.mockReset();
});

afterEach(() => {
  if (originalScroll) {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  } else {
    Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  }
});

describe("kartu lowongan", () => {
  it("seluruh kartu publik adalah satu tautan detail dengan informasi pekerjaan", () => {
    render(<JobCard vacancy={vacancy} />);
    const link = screen.getByRole("link", { name: "Lihat detail Frontend Engineer" });
    expect(link).toHaveAttribute("href", "/vacancies/12");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    const card = within(link);
    expect(card.getByRole("heading", { name: vacancy.title })).toBeInTheDocument();
    expect(card.getByRole("img", { name: "Logo Dicoding Indonesia" })).toHaveAttribute(
      "src",
      vacancy.company.logo_url,
    );
    for (const value of ["Dicoding Indonesia", "Kota Bandung", "Full-Time", "1-3 tahun"]) {
      expect(card.getByText(value)).toBeInTheDocument();
    }
    expect(card.queryByText(/Jawa Barat|Gaji:/)).not.toBeInTheDocument();
  });

  it("tanggal kartu memakai kalender Jakarta dan tetap menyimpan datetime asli", () => {
    render(<JobCard vacancy={vacancy} />);
    expect(screen.getByText("11 Oktober 2026")).toHaveAttribute("datetime", vacancy.created_at);
    expect(screen.getByText("31 Oktober 2026")).toHaveAttribute("datetime", vacancy.expires_at);
  });

  it("kartu dashboard memiliki tujuan detail/edit dan mengirim lowongan yang tepat ke hapus", () => {
    const onDelete = vi.fn();
    render(<DashboardJobCard vacancy={vacancy} onDelete={onDelete} isDeleting={false} />);
    expect(screen.getByRole("link", { name: vacancy.title })).toHaveAttribute(
      "href",
      "/vacancies/12",
    );
    expect(screen.getByRole("link", { name: `Edit ${vacancy.title}` })).toHaveAttribute(
      "href",
      "/vacancies/12/edit",
    );
    fireEvent.click(screen.getByRole("button", { name: `Hapus ${vacancy.title}` }));
    expect(onDelete).toHaveBeenCalledExactlyOnceWith(vacancy);
  });

  it("tombol hapus terkunci selama penghapusan berjalan", () => {
    const onDelete = vi.fn();
    render(<DashboardJobCard vacancy={vacancy} onDelete={onDelete} isDeleting />);
    const button = screen.getByRole("button", { name: `Hapus ${vacancy.title}` });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Menghapus...");
    fireEvent.click(button);
    expect(onDelete).not.toHaveBeenCalled();
  });
});

describe("daftar lowongan", () => {
  it("loading awal menampilkan skeleton dan belum melaporkan halaman siap", () => {
    mocks.list.mockReturnValue(listState({ data: undefined, isPending: true, isFetching: true }));
    render(<VacancyList />);
    expect(screen.getByRole("status", { name: "Memuat daftar lowongan" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Daftar Pekerjaan Terbaru" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(mocks.ready).toHaveBeenCalledWith(false, "/list");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("menampilkan daftar, jumlah hasil, dan melaporkan halaman siap", () => {
    render(<VacancyList />);
    expect(screen.getByRole("link", { name: `Lihat detail ${vacancy.title}` })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Menampilkan 1–1 dari 16 lowongan.");
    expect(mocks.ready).toHaveBeenCalledWith(true, "/list");
    expect(mocks.list).toHaveBeenCalledWith({ search: "", page: 1 });
  });

  it("pencarian dari URL diteruskan ke hook dan ditampilkan pada judul/input", () => {
    window.history.replaceState(null, "", "/list?keyword=%20engineer%20&page=2");
    render(<VacancyList />);
    expect(mocks.list).toHaveBeenCalledWith({ search: "engineer", page: 2 });
    expect(screen.getByRole("heading", { name: "Hasil Pencarian: engineer" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("engineer");
  });

  it.each(["0", "-1", "abc", "1.5", "9007199254740992"])(
    "parameter halaman tidak valid %s memakai halaman pertama",
    (page) => {
      window.history.replaceState(null, "", `/list?page=${page}`);
      render(<VacancyList />);
      expect(mocks.list).toHaveBeenCalledWith({ search: "", page: 1 });
    },
  );

  it("keyword kurang dari tiga karakter tetap memakai daftar utama", () => {
    window.history.replaceState(null, "", "/list?keyword=ab");
    render(<VacancyList />);
    expect(mocks.list).toHaveBeenCalledWith({ search: "", page: 1 });
    expect(screen.getByRole("searchbox")).toHaveValue("ab");
    expect(screen.getByRole("heading", { name: "Daftar Pekerjaan Terbaru" })).toBeInTheDocument();
  });

  it("hasil kosong menampilkan ilustrasi/pesan dan jumlah nol tanpa pagination", () => {
    mocks.list.mockReturnValue(listState({ data: response([]) }));
    render(<VacancyList />);
    expect(screen.getByRole("heading", { name: "Lowongan Tidak Ditemukan" })).toBeInTheDocument();
    expect(screen.getByText(/Silakan cek kembali pencarian dan filter Anda/)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Menampilkan 0–0 dari 0 lowongan.");
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("error menampilkan pesan dan tombol mencoba ulang", () => {
    const refetch = vi.fn();
    mocks.list.mockReturnValue(
      listState({ data: undefined, isError: true, error: new Error("API gagal diakses"), refetch }),
    );
    render(<VacancyList />);
    expect(screen.getByRole("alert")).toHaveTextContent("API gagal diakses");
    fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(refetch).toHaveBeenCalledOnce();
    expect(mocks.ready).toHaveBeenCalledWith(true, "/list");
  });

  it("hasil sebelumnya tetap terlihat saat fetch baru dan pagination dikunci", () => {
    mocks.list.mockReturnValue(listState({ isPlaceholderData: true, isFetching: true }));
    render(<VacancyList />);
    expect(screen.getByRole("link", { name: `Lihat detail ${vacancy.title}` })).toBeInTheDocument();
    expect(
      screen.queryByRole("status", { name: "Memuat daftar lowongan" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("list")).toHaveClass("opacity-60");
    expect(screen.getByRole("button", { name: "Halaman 2" })).toBeDisabled();
  });

  it.each(["", "engineer"])(
    "pagination menjaga keyword '%s' dan menggulir ke daftar",
    (keyword) => {
      const scroll = vi.fn();
      Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
        configurable: true,
        value: scroll,
      });
      const firstPage = keyword ? "/list?keyword=engineer" : "/list";
      const secondPage = keyword ? "/list?keyword=engineer&page=2" : "/list?page=2";
      window.history.replaceState(null, "", firstPage);
      const view = render(<VacancyList />);
      fireEvent.click(screen.getByRole("button", { name: "Halaman 2" }));
      expect(window.location.pathname + window.location.search).toBe(secondPage);
      mocks.list.mockReturnValue(listState({ data: response([vacancy], 2) }));
      view.rerender(<VacancyList />);
      fireEvent.click(screen.getByRole("button", { name: "Halaman 1" }));
      expect(window.location.pathname + window.location.search).toBe(firstPage);
      expect(scroll).toHaveBeenCalledTimes(2);
      expect(scroll).toHaveBeenCalledWith({ block: "start" });
    },
  );

  it("pencarian debounced mereset halaman dan memakai replaceState tanpa submit", () => {
    vi.useFakeTimers();
    window.history.replaceState(null, "", "/list?page=2");
    const replace = vi.spyOn(window.history, "replaceState");
    render(<VacancyList />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "engineer" } });
    act(() => vi.advanceTimersByTime(299));
    expect(window.location.search).toBe("?page=2");
    act(() => vi.advanceTimersByTime(1));
    expect(replace).toHaveBeenCalledWith(null, "", "/list?keyword=engineer");
    expect(window.location.search).toBe("?keyword=engineer");
  });

  it("menghapus keyword mereset filter dan halaman langsung ke /list", () => {
    window.history.replaceState(null, "", "/list?keyword=engineer&page=2");
    render(<VacancyList />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "" } });
    expect(window.location.pathname + window.location.search).toBe("/list");
  });
});

describe("detail lowongan", () => {
  it("loading detail menampilkan skeleton dan menunggu data sebelum siap", () => {
    mocks.detail.mockReturnValue(detailState(vacancy, { data: undefined, isPending: true }));
    render(<VacancyDetail id="12" />);
    expect(screen.getByRole("status", { name: "Memuat detail lowongan" })).toBeInTheDocument();
    expect(mocks.detail).toHaveBeenCalledWith("12");
    expect(mocks.ready).toHaveBeenCalledWith(false, "/vacancies/12");
  });

  it("menampilkan informasi pekerjaan dan mempertahankan format deskripsi API", () => {
    render(<VacancyDetail id="12" />);
    expect(screen.getByRole("heading", { name: vacancy.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Sektor Bisnis: Teknologi")).toBeInTheDocument();
    expect(screen.getByText("50-100 Karyawan")).toBeInTheDocument();
    expect(screen.getByText("2 kandidat")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
    expect(screen.getByText("Kota Bandung")).toBeInTheDocument();
    const description = screen.getByRole("region", { name: "Deskripsi lowongan" });
    expect(
      within(description).getByRole("heading", { name: "Tanggung Jawab" }),
    ).toBeInTheDocument();
    expect(within(description).getByText("aplikasi web").tagName).toBe("STRONG");
    expect(screen.queryByText("Job Description")).not.toBeInTheDocument();
    expect(mocks.ready).toHaveBeenCalledWith(true, "/vacancies/12");
  });

  it("gaji rentang diformat rupiah di header", () => {
    render(<VacancyDetail id="12" />);
    expect(screen.getByText(/Gaji:/)).toHaveTextContent(
      "Gaji: Rp 5.000.000 – Rp 8.000.000 per bulan",
    );
    expect(screen.getByText(/Gaji:/).closest("header")).toBeInTheDocument();
  });

  it("gaji pokok tanpa maksimum tidak menampilkan rentang kosong", () => {
    mocks.detail.mockReturnValue(detailState({ ...vacancy, salary_max: null }));
    render(<VacancyDetail id="12" />);
    expect(screen.getByText(/Gaji:/)).toHaveTextContent("Gaji: Rp 5.000.000 per bulan");
    expect(screen.getByText(/Gaji:/)).not.toHaveTextContent("–");
  });

  it.each([{ show_salary: false }, { salary_min: undefined }])(
    "gaji disembunyikan bila tidak publik atau tidak tersedia: %j",
    (overrides) => {
      mocks.detail.mockReturnValue(detailState({ ...vacancy, ...overrides }));
      render(<VacancyDetail id="12" />);
      expect(screen.queryByText(/Gaji:/)).not.toBeInTheDocument();
    },
  );

  it("pekerjaan di kantor tidak menampilkan label Remote", () => {
    mocks.detail.mockReturnValue(detailState({ ...vacancy, is_remote: false }));
    render(<VacancyDetail id="12" />);
    expect(screen.queryByText("Sistem kerja")).not.toBeInTheDocument();
    expect(screen.queryByText("Remote")).not.toBeInTheDocument();
  });

  it("404 menampilkan pesan dan tautan kembali tanpa retry yang sia-sia", () => {
    mocks.detail.mockReturnValue(
      detailState(vacancy, { data: undefined, isError: true, error: new VacancyNotFoundError() }),
    );
    render(<VacancyDetail id="12" />);
    expect(screen.getByRole("heading", { name: "Lowongan tidak ditemukan" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Coba lagi" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali ke daftar lowongan" })).toHaveAttribute(
      "href",
      "/list",
    );
  });

  it("error jaringan menyediakan retry dan tetap melaporkan halaman error siap", () => {
    const refetch = vi.fn();
    mocks.detail.mockReturnValue(
      detailState(vacancy, { isError: true, error: new Error("Koneksi terputus"), refetch }),
    );
    render(<VacancyDetail id="12" />);
    expect(
      screen.getByRole("heading", { name: "Detail lowongan gagal dimuat" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Koneksi terputus");
    fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(refetch).toHaveBeenCalledOnce();
    expect(mocks.ready).toHaveBeenCalledWith(true, "/vacancies/12");
  });
});

it("empty state menerima pesan dashboard tanpa teks pencarian publik", () => {
  render(
    <VacancyEmptyState title="Belum ada lowongan" description="Buat lowongan pertama Anda." />,
  );
  expect(screen.getByRole("heading", { name: "Belum ada lowongan" })).toBeInTheDocument();
  expect(screen.getByText("Buat lowongan pertama Anda.")).toBeInTheDocument();
  expect(screen.queryByText(/filter Anda/)).not.toBeInTheDocument();
});
