import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Pagination from "@/components/features/vacancies/Pagination";

describe("pagination", () => {
  it.each([0, 1])("disembunyikan saat total halaman %i", (totalPages) => {
    render(<Pagination page={1} totalPages={totalPages} onPageChange={vi.fn()} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("menandai halaman aktif dan menonaktifkan sebelumnya di halaman pertama", () => {
    render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Halaman 1" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("button", { name: "Sebelumnya" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Berikutnya" })).toBeEnabled();
  });

  it("mengarahkan tombol angka dan panah ke halaman yang benar", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={4} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Sebelumnya" }));
    fireEvent.click(screen.getByRole("button", { name: "Berikutnya" }));
    fireEvent.click(screen.getByRole("button", { name: "Halaman 4" }));
    expect(onPageChange.mock.calls).toEqual([[1], [3], [4]]);
  });

  it("tidak bisa mengubah halaman selama permintaan berlangsung", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={3} pending onPageChange={onPageChange} />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("menonaktifkan berikutnya di halaman terakhir", () => {
    render(<Pagination page={3} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Berikutnya" })).toBeDisabled();
  });

  it("memadatkan halaman panjang dengan elipsis tanpa menghilangkan halaman pertama/terakhir", () => {
    render(<Pagination page={5} totalPages={20} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Halaman 1" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Halaman 20" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Halaman 2" })).not.toBeInTheDocument();
    expect(screen.getAllByText("…")).toHaveLength(2);
  });
});
