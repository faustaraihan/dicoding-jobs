import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Editor } from "@tiptap/react";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import DescriptionEditor from "@/components/features/vacancies/DescriptionEditor";

const mocks = vi.hoisted(() => ({ upload: vi.fn(), notify: vi.fn() }));
vi.mock("@/lib/api/vacancies", () => ({ uploadVacancyImage: mocks.upload }));
vi.mock("@/components/ui/feedback/ToastProvider", () => ({ useToast: () => mocks.notify }));

// jsdom has no layout engine; ProseMirror needs range geometry when restoring focus.
const originalRects = Object.getOwnPropertyDescriptor(Range.prototype, "getClientRects");
const originalBounds = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");
beforeAll(() => {
  Object.defineProperty(Range.prototype, "getClientRects", { configurable: true, value: () => [] });
  Object.defineProperty(Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => new DOMRect(),
  });
});
afterAll(() => {
  for (const [key, descriptor] of [
    ["getClientRects", originalRects],
    ["getBoundingClientRect", originalBounds],
  ] as const) {
    if (descriptor) Object.defineProperty(Range.prototype, key, descriptor);
    else Reflect.deleteProperty(Range.prototype, key);
  }
});
beforeEach(() => {
  mocks.upload.mockReset();
  mocks.notify.mockReset();
});

async function renderEditor(content = "<p>Belajar React bersama tim.</p>", disabled = false) {
  const onChange = vi.fn();
  const onUploadingChange = vi.fn();
  const result = render(
    <DescriptionEditor
      initialContent={content}
      onChange={onChange}
      invalid={false}
      disabled={disabled}
      onUploadingChange={onUploadingChange}
    />,
  );
  const element = await screen.findByRole("textbox", { name: "Deskripsi" });
  await waitFor(() => expect((element as HTMLElement & { editor?: Editor }).editor).toBeDefined());
  const editor = (element as HTMLElement & { editor: Editor }).editor;
  const fileInput = screen.getByLabelText("Pilih gambar deskripsi") as HTMLInputElement;
  return { ...result, editor, element, fileInput, onChange, onUploadingChange };
}

async function openLink(editor: Editor) {
  act(() => editor.commands.setTextSelection({ from: 1, to: 8 }));
  await userEvent.setup().click(screen.getByRole("button", { name: "Tautan" }));
  return screen.getByRole("textbox", { name: "Alamat tautan" });
}

describe("editor deskripsi dengan Tiptap asli", () => {
  it.each([
    ["Tebal", "strong"],
    ["Miring", "em"],
    ["Garis bawah", "u"],
    ["Judul", "h2"],
    ["Daftar", "ul li"],
  ])("toolbar %s menerapkan format %s dan dapat dibatalkan", async (label, selector) => {
    const { editor, element, onChange } = await renderEditor();
    act(() => editor.commands.setTextSelection({ from: 1, to: 8 }));
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(element.querySelector(selector)).toHaveTextContent("Belajar");
    expect(onChange).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(element.querySelector(selector)).toBeNull();
    expect(element).toHaveTextContent("Belajar React bersama tim.");
  });

  it("mode HTML menutup input tautan, mengunci format visual, dan kembali dengan isi baru", async () => {
    const { editor, onChange } = await renderEditor();
    await openLink(editor);
    fireEvent.click(screen.getByRole("button", { name: "Edit HTML" }));
    expect(screen.queryByRole("textbox", { name: "Alamat tautan" })).not.toBeInTheDocument();
    const source = screen.getByRole("textbox", { name: "HTML deskripsi" });
    expect(source).toHaveValue("<p>Belajar React bersama tim.</p>");
    expect(screen.getByRole("button", { name: "Tebal" })).toBeDisabled();
    fireEvent.change(source, {
      target: { value: "<h2>Kualifikasi</h2><p>React dan TypeScript.</p>" },
    });
    expect(onChange).toHaveBeenLastCalledWith("<h2>Kualifikasi</h2><p>React dan TypeScript.</p>");
    fireEvent.click(screen.getByRole("button", { name: "Edit HTML" }));
    expect(screen.queryByRole("textbox", { name: "HTML deskripsi" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kualifikasi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tebal" })).toBeEnabled();
  });

  it("menutup panel tautan membuang highlight tanpa mengubah deskripsi", async () => {
    const { editor, element, onChange } = await renderEditor();
    await openLink(editor);
    fireEvent.click(screen.getByRole("button", { name: "Tautan" }));
    expect(screen.queryByRole("textbox", { name: "Alamat tautan" })).not.toBeInTheDocument();
    expect(element.querySelector(".editor-link-selection")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("membatalkan pemilihan gambar tidak memulai upload", async () => {
    const { fileInput, onUploadingChange } = await renderEditor();
    const picker = vi.spyOn(fileInput, "click");
    fireEvent.click(screen.getByRole("button", { name: "Sisipkan gambar" }));
    expect(picker).toHaveBeenCalledOnce();
    fireEvent.change(fileInput, { target: { files: [] } });
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(onUploadingChange).not.toHaveBeenCalled();
  });

  it("kegagalan upload tanpa Error menyediakan pesan fallback", async () => {
    mocks.upload.mockRejectedValueOnce(null);
    const { fileInput } = await renderEditor();
    fireEvent.change(fileInput, {
      target: { files: [new File(["x"], "a.png", { type: "image/png" })] },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Gagal mengunggah gambar. Coba lagi.",
    );
    expect(fileInput).toBeEnabled();
  });

  it("upload selesai setelah unmount tidak menyisipkan gambar atau menampilkan toast", async () => {
    let resolve!: (url: string) => void;
    mocks.upload.mockReturnValueOnce(
      new Promise<string>((done) => {
        resolve = done;
      }),
    );
    const { fileInput, editor, unmount, onUploadingChange, onChange } = await renderEditor();
    fireEvent.change(fileInput, {
      target: { files: [new File(["x"], "a.png", { type: "image/png" })] },
    });
    unmount();
    await waitFor(() => expect(editor.isDestroyed).toBe(true));
    await act(async () => resolve("https://api.example.test/storage/a.png"));
    expect(mocks.notify).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(onUploadingChange).toHaveBeenLastCalledWith(false);
  });

  it("mempertahankan teks terpilih saat mengetik URL dan menerapkan link hanya pada teks itu", async () => {
    const { editor, element, onChange } = await renderEditor();
    const input = await openLink(editor);
    expect(element.querySelector(".editor-link-selection")).toHaveTextContent("Belajar");
    await userEvent.setup().type(input, "https://contoh.test/belajar");
    expect(element.querySelector(".editor-link-selection")).toHaveTextContent("Belajar");
    await userEvent.setup().click(screen.getByRole("button", { name: "Terapkan" }));
    const link = element.querySelector("a");
    expect(link).toHaveTextContent("Belajar");
    expect(link).toHaveAttribute("href", "https://contoh.test/belajar");
    expect(element).toHaveTextContent("Belajar React bersama tim.");
    expect(element.querySelector(".editor-link-selection")).toBeNull();
    expect(onChange).toHaveBeenCalledWith(
      expect.stringContaining('href="https://contoh.test/belajar"'),
    );
  });

  it("URL kosong menghapus link yang sudah ada tanpa menghapus teks", async () => {
    const { editor, element } = await renderEditor(
      '<p><a href="https://contoh.test">Belajar</a> React.</p>',
    );
    const input = await openLink(editor);
    expect(input).toHaveValue("https://contoh.test");
    await userEvent.setup().clear(input);
    await userEvent.setup().click(screen.getByRole("button", { name: "Terapkan" }));
    expect(element.querySelector("a")).toBeNull();
    expect(element).toHaveTextContent("Belajar React.");
  });

  it("menolak protokol link yang tidak diizinkan", async () => {
    const { editor, element, onChange } = await renderEditor();
    const input = await openLink(editor);
    fireEvent.change(input, { target: { value: "javascript:alert(1)" } });
    fireEvent.click(screen.getByRole("button", { name: "Terapkan" }));
    expect(element.querySelector("a")).toBeNull();
    expect(input).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("unggah berhasil menyisipkan URL server dan mengirim status mulai/selesai", async () => {
    mocks.upload.mockResolvedValueOnce("https://api.example.test/storage/demo.png");
    const { element, fileInput, onChange, onUploadingChange } = await renderEditor();
    const file = new File(["demo"], "demo.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() =>
      expect(element.querySelector("img")).toHaveAttribute(
        "src",
        "https://api.example.test/storage/demo.png",
      ),
    );
    expect(element.querySelector("img")).toHaveAttribute("alt", "demo.png");
    expect(mocks.upload).toHaveBeenCalledExactlyOnceWith(file);
    expect(onUploadingChange.mock.calls).toEqual([[true], [false]]);
    expect(onChange).toHaveBeenCalledWith(expect.stringContaining("/storage/demo.png"));
    expect(mocks.notify).toHaveBeenCalledWith("Gambar berhasil diunggah.");
    expect(fileInput).toHaveValue("");
  });

  it.each(["image/gif", "image/svg+xml", "application/pdf"])(
    "menolak tipe %s sebelum memanggil API",
    async (type) => {
      const { fileInput, onUploadingChange } = await renderEditor();
      fireEvent.change(fileInput, { target: { files: [new File(["x"], "file", { type })] } });
      expect(screen.getByRole("alert")).toHaveTextContent(
        "File harus berupa gambar JPG, PNG, atau WebP.",
      );
      expect(mocks.upload).not.toHaveBeenCalled();
      expect(onUploadingChange).not.toHaveBeenCalled();
    },
  );

  it("menolak gambar di atas 2 MB", async () => {
    const { fileInput } = await renderEditor();
    const file = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "besar.png", {
      type: "image/png",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByRole("alert")).toHaveTextContent("Ukuran gambar maksimal 2 MB.");
    expect(mocks.upload).not.toHaveBeenCalled();
  });

  it("kegagalan upload menampilkan pesan, membuka kembali kontrol, dan bisa dicoba ulang", async () => {
    mocks.upload.mockRejectedValueOnce(new Error("Upload gagal dari server."));
    mocks.upload.mockResolvedValueOnce("https://api.example.test/storage/ulang.webp");
    const { element, fileInput, onUploadingChange } = await renderEditor();
    const file = new File(["demo"], "ulang.webp", { type: "image/webp" });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(await screen.findByRole("alert")).toHaveTextContent("Upload gagal dari server.");
    expect(element.querySelector("img")).toBeNull();
    expect(fileInput).toBeEnabled();
    expect(onUploadingChange.mock.calls).toEqual([[true], [false]]);
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() =>
      expect(element.querySelector("img")).toHaveAttribute(
        "src",
        "https://api.example.test/storage/ulang.webp",
      ),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(mocks.upload).toHaveBeenCalledTimes(2);
  });

  it("selama upload, menampilkan status dan mencegah upload kedua", async () => {
    let finish!: (url: string) => void;
    mocks.upload.mockReturnValueOnce(
      new Promise<string>((resolve) => {
        finish = resolve;
      }),
    );
    const { fileInput, onUploadingChange } = await renderEditor();
    const file = new File(["x"], "demo.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByRole("status")).toHaveTextContent("Mengunggah gambar...");
    expect(fileInput).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sisipkan gambar" })).toBeDisabled();
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(mocks.upload).toHaveBeenCalledTimes(1);
    await act(async () => finish("https://api.example.test/storage/demo.jpg"));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(onUploadingChange).toHaveBeenLastCalledWith(false);
  });

  it("editor yang dinonaktifkan tidak menerima perubahan maupun upload", async () => {
    const { editor, fileInput } = await renderEditor(undefined, true);
    expect(editor.isEditable).toBe(false);
    expect(screen.getByRole("button", { name: "Tautan" })).toBeDisabled();
    fireEvent.change(fileInput, {
      target: { files: [new File(["x"], "a.png", { type: "image/png" })] },
    });
    expect(mocks.upload).not.toHaveBeenCalled();
  });
});
