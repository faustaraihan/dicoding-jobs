import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import CurrencyInput from "@/components/features/vacancies/CurrencyInput";

const defaults = { id: "salary", label: "Gaji", placeholder: "Minimum", invalid: false };

function ControlledAmount() {
  const [value, setValue] = useState("5000000");
  return <CurrencyInput {...defaults} value={value} onChange={setValue} />;
}

describe("input nominal gaji", () => {
  it.each([
    ["5000000", "5.000.000"],
    ["0", "0"],
    ["", ""],
  ])("menampilkan %s sebagai %s", (value, expected) => {
    render(<CurrencyInput {...defaults} value={value} onChange={vi.fn()} />);
    expect(screen.getByRole("textbox", { name: "Gaji" })).toHaveValue(expected);
  });

  it("mengirim digit mentah tanpa titik, huruf, atau nol berlebih", () => {
    const onChange = vi.fn();
    render(<CurrencyInput {...defaults} value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Rp 005.000.000" } });
    expect(onChange).toHaveBeenCalledExactlyOnceWith("5000000");
  });

  it("menolak maksimum di bawah minimum dan pulih saat diperbaiki", () => {
    const { rerender } = render(
      <CurrencyInput {...defaults} value="4000000" minimum="5000000" onChange={vi.fn()} />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.validity.customError).toBe(true);
    rerender(<CurrencyInput {...defaults} value="5000000" minimum="5000000" onChange={vi.fn()} />);
    expect(input.validity.customError).toBe(false);
  });

  it("menerima maksimum kosong sebagai nilai opsional", () => {
    render(<CurrencyInput {...defaults} value="" minimum="5000000" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toBeValid();
  });

  it("menyisipkan digit di tengah nominal mempertahankan posisi caret setelah format", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      frames.push(callback),
    );
    render(<ControlledAmount />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.focus();
    fireEvent.change(input, { target: { value: "5.2000.000", selectionStart: 3 } });
    act(() => frames.splice(0).forEach((callback) => callback(0)));
    expect(input).toHaveValue("52.000.000");
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(2);
  });

  it("caret di awal tetap di awal dan callback tidak mengambil fokus kembali", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      frames.push(callback),
    );
    render(
      <>
        <ControlledAmount />
        <button>Berikutnya</button>
      </>,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.focus();
    fireEvent.change(input, { target: { value: "6.000.000", selectionStart: 0 } });
    act(() => frames.splice(0).forEach((callback) => callback(0)));
    expect(input.selectionStart).toBe(0);
    fireEvent.change(input, { target: { value: "7.000.000", selectionStart: 2 } });
    const button = screen.getByRole("button");
    button.focus();
    const selection = vi.spyOn(input, "setSelectionRange");
    act(() => frames.splice(0).forEach((callback) => callback(0)));
    expect(selection).not.toHaveBeenCalled();
    expect(button).toHaveFocus();
  });

  it("required dan error dapat diakses tanpa menerima nominal kosong", () => {
    render(<CurrencyInput {...defaults} value="" onChange={vi.fn()} required invalid />);
    const input = screen.getByRole("textbox");
    expect(input).toBeRequired();
    expect(input).toBeInvalid();
    expect(input).toHaveAttribute("aria-describedby", "salary-error");
    expect(input).toHaveAttribute("inputmode", "numeric");
  });
});
