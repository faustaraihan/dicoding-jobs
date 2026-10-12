import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VacancyFormScreen from "@/components/features/vacancies/VacancyForm";
import { VacancyValidationError } from "@/lib/api/vacancies";
import type { Vacancy, VacancyDetailResponse, VacancyOptionsResponse } from "@/types/vacancy";

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  options: vi.fn(),
  edit: vi.fn(),
  navigate: vi.fn(),
  notify: vi.fn(),
}));

vi.mock("@/lib/api/vacancies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/vacancies")>()),
  saveVacancy: mocks.save,
  getVacancyOptions: mocks.options,
  getVacancyForEdit: mocks.edit,
}));
vi.mock("@/components/layouts/NavigationProgress", () => ({
  useNavigationProgress: () => ({ navigate: mocks.navigate, pending: false }),
  usePageReady: () => {},
}));
vi.mock("@/components/ui/feedback/ToastProvider", () => ({ useToast: () => mocks.notify }));
vi.mock("@/components/features/vacancies/DescriptionEditor", () => ({
  default: ({
    initialContent,
    onChange,
    disabled,
    onUploadingChange,
  }: {
    initialContent: string;
    onChange: (value: string) => void;
    disabled: boolean;
    onUploadingChange: (value: boolean) => void;
  }) => (
    <div>
      <textarea
        aria-label="Deskripsi editor"
        defaultValue={initialContent}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      <button type="button" onClick={() => onUploadingChange(true)}>
        Mulai upload mock
      </button>
      <button type="button" onClick={() => onUploadingChange(false)}>
        Selesai upload mock
      </button>
    </div>
  ),
}));

const options: VacancyOptionsResponse = {
  data: {
    positions: [{ value: "front_end_web_developer", label: "Front-End Web Developer" }],
    employment_types: [{ value: "full_time", label: "Full-Time" }],
    experience_levels: [{ value: "one_to_three_years", label: "1-3 tahun" }],
    locations: [{ id: 4, name: "Kota Bandung", province: "Jawa Barat" }],
  },
};
const vacancy: Vacancy = {
  id: 12,
  title: "Frontend Engineer",
  position: "front_end_web_developer",
  position_label: "Front-End Web Developer",
  employment_type: "full_time",
  employment_type_label: "Full-Time",
  candidate_count: 2,
  expires_at: "2020-01-01T16:59:59Z",
  location_id: 4,
  location: options.data.locations[0],
  is_remote: false,
  description: "<p>Deskripsi sebelumnya.</p>",
  salary_min: 5000000,
  salary_max: 8000000,
  show_salary: false,
  experience_level: "one_to_three_years",
  experience_level_label: "1-3 tahun",
  created_at: "2020-01-01T00:00:00Z",
  updated_at: "2020-01-01T00:00:00Z",
  company: {
    name: "Dicoding",
    logo_url: "/logo.png",
    employee_count: "50-100",
    business_sector: "Technology",
  },
};

beforeEach(() => {
  Object.values(mocks).forEach((mock) => mock.mockReset());
  mocks.options.mockResolvedValue(options);
  mocks.edit.mockResolvedValue({ data: vacancy });
  mocks.save.mockResolvedValue({ data: vacancy });
});

function renderForm(editing = false) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } },
  });
  client.setQueryData(["vacancy-options"], options);
  if (editing) client.setQueryData(["vacancy-edit", "12"], { data: vacancy });
  return render(
    <QueryClientProvider client={client}>
      <VacancyFormScreen id={editing ? "12" : undefined} />
    </QueryClientProvider>,
  );
}

async function fillRequiredFields() {
  const user = userEvent.setup();
  await user.type(screen.getByRole("textbox", { name: /Judul lowongan/ }), "  Frontend Engineer  ");
  await user.click(screen.getByRole("combobox", { name: /Posisi/ }));
  await user.click(screen.getByRole("button", { name: "Front-End Web Developer" }));
  await user.click(screen.getByRole("radio", { name: "Full-Time" }));
  fireEvent.change(screen.getByRole("spinbutton", { name: /Kandidat/ }), {
    target: { value: "3" },
  });
  fireEvent.change(screen.getByLabelText(/Aktif hingga/), { target: { value: "2099-12-31" } });
  await user.click(screen.getByRole("combobox", { name: /Lokasi/ }));
  await user.click(screen.getByRole("button", { name: "Kota Bandung" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Gaji minimum" }), {
    target: { value: "5.000.000" },
  });
  await user.click(screen.getByRole("radio", { name: "1-3 tahun" }));
  return user;
}

describe("form lowongan", () => {
  it("tidak menyimpan form dengan field wajib kosong", async () => {
    renderForm();
    await userEvent.setup().click(screen.getByRole("button", { name: "Buat lowongan" }));
    expect(screen.getByRole("textbox", { name: /Judul lowongan/ })).toBeInvalid();
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("Enter di input atau submit tanpa tombol Simpan tidak menyimpan", async () => {
    renderForm();
    const user = await fillRequiredFields();
    const input = screen.getByRole("textbox", { name: /Judul lowongan/ });
    await user.click(input);
    await user.keyboard("{Enter}");
    fireEvent.submit(input.closest("form")!);
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("mengirim angka mentah, maksimum null, judul dipangkas, dan boolean saat membuat", async () => {
    renderForm();
    const user = await fillRequiredFields();
    await user.click(screen.getByRole("checkbox", { name: "Bisa remote" }));
    await user.click(screen.getByRole("switch", { name: "Tampilkan gaji" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Deskripsi editor" }), {
      target: { value: "<p>Membangun frontend.</p>" },
    });
    await user.click(screen.getByRole("button", { name: "Buat lowongan" }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/dashboard"));
    expect(mocks.save).toHaveBeenCalledExactlyOnceWith(
      {
        title: "Frontend Engineer",
        position: "front_end_web_developer",
        employment_type: "full_time",
        candidate_count: 3,
        expires_at: "2099-12-31",
        location_id: 4,
        is_remote: true,
        description: "<p>Membangun frontend.</p>",
        salary_min: 5000000,
        salary_max: null,
        show_salary: true,
        experience_level: "one_to_three_years",
      },
      undefined,
    );
    expect(mocks.notify).toHaveBeenCalledWith("Lowongan berhasil dibuat.");
  });

  it("menolak maksimum yang lebih rendah dari minimum sebelum memanggil API", async () => {
    renderForm();
    const user = await fillRequiredFields();
    fireEvent.change(screen.getByRole("textbox", { name: "Gaji maksimum" }), {
      target: { value: "4.000.000" },
    });
    await user.click(screen.getByRole("button", { name: "Buat lowongan" }));
    expect(screen.getByRole("textbox", { name: "Gaji maksimum" })).toBeInvalid();
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("memuat data edit dan membolehkan deadline lama yang tidak diubah", async () => {
    renderForm(true);
    expect(screen.getByRole("textbox", { name: "Gaji maksimum" })).toHaveValue("8.000.000");
    const deadline = screen.getByLabelText(/Aktif hingga/);
    expect(deadline).toHaveValue("2020-01-01");
    expect(deadline).not.toHaveAttribute("min");
    await userEvent.setup().click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/dashboard"));
    expect(mocks.save).toHaveBeenCalledWith(
      expect.objectContaining({
        salary_min: 5000000,
        salary_max: 8000000,
        expires_at: "2020-01-01",
      }),
      "12",
    );
    expect(mocks.notify).toHaveBeenCalledWith("Perubahan lowongan berhasil disimpan.");
  });

  it("menampilkan validasi 422 di field dan menghapus pesan field setelah diperbaiki", async () => {
    mocks.save.mockRejectedValueOnce(
      new VacancyValidationError({ title: ["Judul sudah digunakan."] }),
    );
    renderForm(true);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await screen.findByText("Judul sudah digunakan.");
    const title = screen.getByRole("textbox", { name: /Judul lowongan/ });
    expect(title).toHaveAttribute("aria-invalid", "true");
    expect(mocks.navigate).not.toHaveBeenCalled();
    fireEvent.change(title, { target: { value: "Judul baru" } });
    expect(title).toHaveAttribute("aria-invalid", "false");
    expect(screen.queryByText("Judul sudah digunakan.")).not.toBeInTheDocument();
  });

  it("kegagalan jaringan mempertahankan isi form dan pengguna bisa mencoba lagi", async () => {
    mocks.save.mockRejectedValueOnce(new Error("Koneksi terputus."));
    renderForm(true);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(mocks.notify).toHaveBeenCalledWith("Koneksi terputus.", "error"));
    expect(screen.getByRole("textbox", { name: /Judul lowongan/ })).toHaveValue(
      "Frontend Engineer",
    );
    expect(mocks.navigate).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/dashboard"));
    expect(mocks.save).toHaveBeenCalledTimes(2);
  });

  it("menonaktifkan field dan mencegah submit kedua selama menyimpan", async () => {
    let resolveSave!: (value: VacancyDetailResponse) => void;
    mocks.save.mockReturnValueOnce(
      new Promise<VacancyDetailResponse>((resolve) => {
        resolveSave = resolve;
      }),
    );
    renderForm(true);
    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: "Simpan perubahan" });
    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    expect(screen.getByRole("textbox", { name: /Judul lowongan/ })).toBeDisabled();
    await user.click(button);
    fireEvent.submit(button.closest("form")!, { submitter: button });
    expect(mocks.save).toHaveBeenCalledTimes(1);
    await act(async () => resolveSave({ data: vacancy }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/dashboard"));
  });

  it("menahan penyimpanan selama editor mengunggah gambar", async () => {
    renderForm(true);
    fireEvent.click(screen.getByRole("button", { name: "Mulai upload mock" }));
    const button = screen.getByRole("button", { name: "Mengunggah gambar..." });
    expect(button).toBeDisabled();
    fireEvent.submit(button.closest("form")!, { submitter: button });
    expect(mocks.save).not.toHaveBeenCalled();
    // The editor upload callback can finish even while the form is disabled.
    fireEvent.click(screen.getByRole("button", { name: "Selesai upload mock" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Simpan perubahan" })).toBeEnabled(),
    );
  });
});
