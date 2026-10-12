import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "@/components/ui/feedback/ToastProvider";

function ToastControls() {
  const notify = useToast();
  return (
    <>
      <button onClick={() => notify("Lowongan berhasil dibuat.")}>Sukses</button>
      <button onClick={() => notify("Gagal menyimpan lowongan.", "error")}>Error</button>
      <button
        onClick={() => {
          for (let index = 1; index <= 4; index++) notify(`Pesan ${index}`);
        }}
      >
        Empat notifikasi
      </button>
    </>
  );
}

function renderToasts() {
  return render(
    <ToastProvider>
      <ToastControls />
    </ToastProvider>,
  );
}

function advance(milliseconds: number) {
  act(() => vi.advanceTimersByTime(milliseconds));
}

describe("toast/notifikasi", () => {
  beforeEach(() => vi.useFakeTimers());

  it("sukses diumumkan sebagai status dan error sebagai alert", () => {
    renderToasts();
    fireEvent.click(screen.getByRole("button", { name: "Sukses" }));
    fireEvent.click(screen.getByRole("button", { name: "Error" }));
    expect(screen.getByRole("status")).toHaveTextContent("Lowongan berhasil dibuat.");
    expect(screen.getByRole("alert")).toHaveTextContent("Gagal menyimpan lowongan.");
  });

  it("sukses hilang setelah 5 detik, error setelah 8 detik", () => {
    renderToasts();
    fireEvent.click(screen.getByRole("button", { name: "Sukses" }));
    fireEvent.click(screen.getByRole("button", { name: "Error" }));
    advance(4999);
    expect(screen.getByRole("status")).toBeInTheDocument();
    advance(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    advance(2999);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    advance(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("tombol tutup hanya menghapus notifikasi yang dipilih", () => {
    renderToasts();
    fireEvent.click(screen.getByRole("button", { name: "Sukses" }));
    fireEvent.click(screen.getByRole("button", { name: "Error" }));
    const success = screen.getByRole("status").parentElement!;
    fireEvent.click(within(success).getByRole("button", { name: "Tutup pemberitahuan" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("hover menahan timer dan memberi waktu baca lagi setelah pointer keluar", () => {
    renderToasts();
    fireEvent.click(screen.getByRole("button", { name: "Sukses" }));
    const toast = screen.getByRole("status").parentElement!;
    advance(4000);
    fireEvent.mouseEnter(toast);
    advance(10000);
    expect(screen.getByRole("status")).toBeInTheDocument();
    fireEvent.mouseLeave(toast);
    advance(4999);
    expect(screen.getByRole("status")).toBeInTheDocument();
    advance(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("fokus keyboard menahan timer sampai fokus keluar dari notifikasi", () => {
    renderToasts();
    fireEvent.click(screen.getByRole("button", { name: "Sukses" }));
    const close = screen.getByRole("button", { name: "Tutup pemberitahuan" });
    act(() => close.focus());
    advance(10000);
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "Sukses" }).focus());
    advance(5000);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keluar dari hover tidak memulai timer jika toast masih memiliki fokus", () => {
    renderToasts();
    fireEvent.click(screen.getByRole("button", { name: "Error" }));
    const toast = screen.getByRole("alert").parentElement!;
    fireEvent.mouseEnter(toast);
    act(() => within(toast).getByRole("button").focus());
    fireEvent.mouseLeave(toast);
    advance(10000);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "Error" }).focus());
    advance(8000);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("hanya menampilkan tiga notifikasi terbaru", () => {
    renderToasts();
    fireEvent.click(screen.getByRole("button", { name: "Empat notifikasi" }));
    expect(screen.queryByText("Pesan 1")).not.toBeInTheDocument();
    expect(screen.getAllByRole("status").map((element) => element.textContent)).toEqual([
      "Pesan 2",
      "Pesan 3",
      "Pesan 4",
    ]);
  });

  it("notifikasi baru tidak memperpanjang timer notifikasi sebelumnya", () => {
    renderToasts();
    fireEvent.click(screen.getByRole("button", { name: "Sukses" }));
    advance(4000);
    fireEvent.click(screen.getByRole("button", { name: "Error" }));
    advance(1000);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("tetap tampil saat isi halaman diganti dalam provider yang sama", () => {
    const { rerender } = renderToasts();
    fireEvent.click(screen.getByRole("button", { name: "Sukses" }));
    advance(2000);
    rerender(
      <ToastProvider>
        <main>Halaman Dashboard</main>
      </ToastProvider>,
    );
    expect(screen.getByRole("main")).toHaveTextContent("Halaman Dashboard");
    expect(screen.getByRole("status")).toHaveTextContent("Lowongan berhasil dibuat.");
    advance(3000);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("membersihkan timer ketika provider dilepas", () => {
    const { unmount } = renderToasts();
    fireEvent.click(screen.getByRole("button", { name: "Sukses" }));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("memberikan error yang jelas saat hook digunakan tanpa provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ToastControls />)).toThrow("useToast must be used within ToastProvider");
  });
});
