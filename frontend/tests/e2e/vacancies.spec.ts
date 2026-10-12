import { test, expect, apiUrl } from "./fixtures";

test("list → pencarian otomatis → detail melalui card", async ({ page, vacancyApi }) => {
  const id = await vacancyApi.create("Android Engineer E2E");
  await vacancyApi.create("Data Analyst E2E");
  await page.goto("/");
  await expect(page).toHaveURL("/list");
  await expect(
    page.getByRole("link", { name: "Lihat detail Android Engineer E2E", exact: true }),
  ).toBeVisible();
  const search = page.getByRole("searchbox", { name: "Cari judul lowongan" });
  await search.fill("Android Engineer");
  await expect(page).toHaveURL("/list?keyword=Android+Engineer");
  await expect(page.getByRole("status").filter({ hasText: "Menampilkan" })).toHaveText(
    "Menampilkan 1–1 dari 1 lowongan.",
  );
  await expect(
    page.getByRole("link", { name: "Lihat detail Data Analyst E2E", exact: true }),
  ).toHaveCount(0);
  await expect(search).toBeFocused();
  await page
    .getByRole("link", { name: "Lihat detail Android Engineer E2E", exact: true })
    .click({ position: { x: 12, y: 12 } });
  await expect(page).toHaveURL(`/vacancies/${id}`);
  await expect(
    page.getByRole("heading", { name: "Android Engineer E2E", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Membangun aplikasi untuk pengujian E2E.")).toBeVisible();
  await expect(page.getByText(/Gaji:.*5\.000\.000.*8\.000\.000/)).toBeVisible();
});

test("pencarian mulai dari tiga karakter dan kembali ke daftar saat kurang", async ({
  page,
  vacancyApi,
}) => {
  await vacancyApi.create("Android Engineer E2E");
  await vacancyApi.create("Data Analyst E2E");
  await page.goto("/list");
  const search = page.getByRole("searchbox", { name: "Cari judul lowongan" });
  await search.fill("An");
  await page.waitForTimeout(450);
  await expect(page).toHaveURL("/list");
  await expect(search).toHaveValue("An");
  await expect(page.getByRole("heading", { name: "Daftar Pekerjaan Terbaru" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Menampilkan" })).toHaveText(
    "Menampilkan 1–2 dari 2 lowongan.",
  );
  await search.fill("And");
  await expect(page).toHaveURL("/list?keyword=And");
  await expect(page.getByRole("status").filter({ hasText: "Menampilkan" })).toHaveText(
    "Menampilkan 1–1 dari 1 lowongan.",
  );
  await search.fill("An");
  await expect(page).toHaveURL("/list");
  await expect(search).toHaveValue("An");
  await expect(page.getByRole("status").filter({ hasText: "Menampilkan" })).toHaveText(
    "Menampilkan 1–2 dari 2 lowongan.",
  );
  await page.goto("/list?keyword=An");
  await expect(page.getByRole("heading", { name: "Daftar Pekerjaan Terbaru" })).toBeVisible();
});

test("hasil pencarian kosong dan reset pencarian", async ({ page, vacancyApi }) => {
  await vacancyApi.create("Frontend Engineer E2E");
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Cari judul lowongan" });
  await search.fill("tidak-ada-hasil-e2e");
  await expect(page.getByRole("heading", { name: "Lowongan Tidak Ditemukan" })).toBeVisible();
  await search.fill("");
  await expect(
    page.getByRole("link", { name: "Lihat detail Frontend Engineer E2E", exact: true }),
  ).toBeVisible();
});

test("pagination dan pencarian kembali ke halaman pertama", async ({ page, vacancyApi }) => {
  for (let index = 1; index <= 11; index++) await vacancyApi.create(`Pagination E2E ${index}`);
  await page.goto("/");
  const pagination = page.getByRole("navigation", { name: "Halaman daftar lowongan" });
  await expect(pagination.getByRole("button", { name: "Halaman 1", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(pagination.getByRole("button", { name: "Sebelumnya" })).toBeDisabled();
  await pagination.getByRole("button", { name: "Berikutnya" }).click();
  await expect(pagination.getByRole("button", { name: "Halaman 2", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(pagination.getByRole("button", { name: "Berikutnya" })).toBeDisabled();
  await expect(page).toHaveURL("/list?page=2");
  await page.getByRole("searchbox", { name: "Cari judul lowongan" }).fill("Pagination E2E 11");
  await expect(page.getByRole("status").filter({ hasText: "Menampilkan" })).toHaveText(
    "Menampilkan 1–1 dari 1 lowongan.",
  );
  await expect(
    page.getByRole("link", { name: "Lihat detail Pagination E2E 11", exact: true }),
  ).toBeVisible();
  await expect(pagination).toHaveCount(0);
  await expect(page).toHaveURL("/list?keyword=Pagination+E2E+11");
});

test("URL daftar mempertahankan pencarian saat refresh dan Back/Forward", async ({
  page,
  vacancyApi,
}) => {
  for (let index = 1; index <= 11; index++) await vacancyApi.create(`URL Engineer E2E ${index}`);
  await page.goto("/list?keyword=URL+Engineer&page=2");
  const search = page.getByRole("searchbox", { name: "Cari judul lowongan" });
  const pagination = page.getByRole("navigation", { name: "Halaman daftar lowongan" });
  await expect(search).toHaveValue("URL Engineer");
  await expect(pagination.getByRole("button", { name: "Halaman 2", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.reload();
  await expect(search).toHaveValue("URL Engineer");
  await expect(pagination.getByRole("button", { name: "Halaman 2", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await pagination.getByRole("button", { name: "Sebelumnya" }).click();
  await expect(page).toHaveURL("/list?keyword=URL+Engineer");
  await page.goBack();
  await expect(page).toHaveURL("/list?keyword=URL+Engineer&page=2");
  await expect(pagination.getByRole("button", { name: "Halaman 2", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.goForward();
  await expect(pagination.getByRole("button", { name: "Halaman 1", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("Dashboard memakai pagination yang sama dan card tetap rapi di ponsel", async ({
  page,
  vacancyApi,
}) => {
  for (let index = 1; index <= 11; index++) {
    await vacancyApi.create(
      `Senior Full Stack Engineer untuk Platform Pembelajaran Digital E2E ${index}`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  const pagination = page.getByRole("navigation", { name: "Halaman daftar lowongan" });
  await expect(pagination.getByRole("button", { name: "Halaman 1", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByText(/Halaman \d+ dari/)).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Edit Senior Full Stack/ }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await pagination.getByRole("button", { name: "Halaman 2", exact: true }).click();
  await expect(pagination.getByRole("button", { name: "Halaman 2", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("article")).toHaveCount(1);
});

test("Dashboard kosong menampilkan ilustrasi dan tombol buat", async ({ page, vacancyApi }) => {
  expect(vacancyApi.options.locations.length).toBeGreaterThan(0);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Belum Ada Lowongan" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Buat lowongan", exact: true })).toBeVisible();
});

test("buat → edit → batal hapus → hapus dengan toast", async ({ page, request, vacancyApi }) => {
  const { options } = vacancyApi;
  await page.goto("/vacancies/new");
  await page.getByRole("textbox", { name: /Judul lowongan/ }).fill("Lowongan CRUD E2E");
  await page.getByRole("combobox", { name: /Posisi/ }).fill(options.positions[0].label);
  await page.getByRole("button", { name: options.positions[0].label, exact: true }).click();
  await page
    .getByRole("group", { name: /Tipe pekerjaan/ })
    .getByText(options.employment_types[0].label, { exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: options.employment_types[0].label, exact: true }),
  ).toBeChecked();
  await page.getByRole("spinbutton", { name: /Kandidat yang dibutuhkan/ }).fill("2");
  await page.getByLabel(/Aktif hingga/).fill("2099-12-31");
  await page.getByRole("combobox", { name: /Lokasi/ }).fill(options.locations[0].name);
  await page.getByRole("button", { name: options.locations[0].name, exact: true }).click();
  await page.getByRole("textbox", { name: "Gaji minimum", exact: true }).fill("5000000");
  await expect(page.getByRole("textbox", { name: "Gaji minimum", exact: true })).toHaveValue(
    "5.000.000",
  );
  await page
    .getByRole("group", { name: /Minimum pengalaman bekerja/ })
    .getByText(options.experience_levels[0].label, { exact: true })
    .click();
  await page.getByRole("textbox", { name: /Judul lowongan/ }).press("Enter");
  await expect(page).toHaveURL("/vacancies/new");
  await expect(page.getByRole("button", { name: "Buat lowongan", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Buat lowongan", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Lowongan berhasil dibuat." }),
  ).toBeVisible();
  await expect(page).toHaveURL("/dashboard");
  await page.getByRole("link", { name: "Edit Lowongan CRUD E2E", exact: true }).click();
  await page
    .getByRole("textbox", { name: /Judul lowongan/ })
    .filter({ visible: true })
    .fill("Lowongan CRUD E2E Updated");
  await page.getByRole("button", { name: "Simpan perubahan", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Perubahan lowongan berhasil disimpan." }),
  ).toBeVisible();
  await expect(page).toHaveURL("/dashboard");
  const remove = page.getByRole("button", { name: "Hapus Lowongan CRUD E2E Updated", exact: true });
  await remove.click();
  const dialog = page.getByRole("dialog", { name: "Hapus lowongan?" });
  await dialog.getByRole("button", { name: "Batal", exact: true }).click();
  await expect(remove).toBeVisible();
  await remove.click();
  await dialog.getByRole("button", { name: "Hapus", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Lowongan berhasil dihapus." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Belum Ada Lowongan" })).toBeVisible();
  expect((await (await request.get(`${apiUrl}/vacancies`)).json()).data).toHaveLength(0);
});

test("URL tidak tersedia menampilkan halaman 404", async ({ page }) => {
  await page.goto("/halaman-tidak-ada-e2e");
  await expect(page.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeVisible();
  await page.getByRole("link", { name: "Lowongan Kerja", exact: true }).click();
  await expect(page).toHaveURL("/list");
});
