import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import JobSearch from "@/components/features/vacancies/JobSearch";

describe("input pencarian otomatis", () => {
  beforeEach(() => vi.useFakeTimers());

  it("tidak memanggil pencarian untuk satu atau dua karakter", () => {
    const onSearch = vi.fn();
    render(<JobSearch value="" onSearch={onSearch} />);
    const input = screen.getByRole("searchbox");
    for (const value of ["a", "ab"]) {
      fireEvent.change(input, { target: { value } });
      act(() => vi.advanceTimersByTime(500));
    }
    expect(input).toHaveValue("ab");
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("menunggu 300 ms dan hanya mencari keyword terakhir tanpa Enter", () => {
    const onSearch = vi.fn();
    render(<JobSearch value="" onSearch={onSearch} />);
    const input = screen.getByRole("searchbox");
    input.focus();
    fireEvent.change(input, { target: { value: "eng" } });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.change(input, { target: { value: "engineer" } });
    act(() => vi.advanceTimersByTime(299));
    expect(onSearch).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith("engineer");
    expect(input).toHaveFocus();
  });

  it("menghapus filter segera dan mempertahankan teks pendek saat URL berubah", () => {
    const onSearch = vi.fn();
    const { rerender } = render(<JobSearch value="engineer" onSearch={onSearch} />);
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "en" } });
    expect(onSearch).toHaveBeenCalledExactlyOnceWith("");
    rerender(<JobSearch value="" onSearch={onSearch} />);
    expect(input).toHaveValue("en");
    act(() => vi.advanceTimersByTime(500));
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it("mengikuti keyword dari URL tanpa pencarian ulang", () => {
    const onSearch = vi.fn();
    const { rerender } = render(<JobSearch value="engineer" onSearch={onSearch} />);
    rerender(<JobSearch value="designer" onSearch={onSearch} />);
    expect(screen.getByRole("searchbox")).toHaveValue("designer");
    act(() => vi.advanceTimersByTime(500));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("membatalkan debounce ketika komponen dilepas", () => {
    const onSearch = vi.fn();
    const { unmount } = render(<JobSearch value="" onSearch={onSearch} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "engineer" } });
    unmount();
    act(() => vi.advanceTimersByTime(500));
    expect(onSearch).not.toHaveBeenCalled();
  });
});
