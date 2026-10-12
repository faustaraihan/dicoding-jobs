import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import SearchableCombobox from "@/components/features/vacancies/SearchableCombobox";

const options = [
  { value: "bandung", label: "Kota Bandung" },
  { value: "bogor", label: "Kota Bogor" },
];

function LocationInput({ initial = "", disabled = false }) {
  const [value, setValue] = useState(initial);
  return (
    <SearchableCombobox
      id="location"
      value={value}
      options={options}
      placeholder="Pilih lokasi"
      onChange={setValue}
      disabled={disabled}
    />
  );
}

describe("combobox lokasi", () => {
  it("menyaring tanpa membedakan huruf besar dan menyimpan ID pilihan", async () => {
    const user = userEvent.setup();
    render(<LocationInput />);
    const input = screen.getByRole("combobox");
    await user.type(input, "BAND");
    expect(screen.getByRole("option", { name: "Kota Bandung" })).toBeVisible();
    expect(screen.queryByRole("option", { name: "Kota Bogor" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Kota Bandung" }));
    expect(input).toHaveValue("Kota Bandung");
    expect(input).toBeValid();
    expect(document.querySelector('input[type="hidden"][name="location"]')).toHaveValue("bandung");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("mendukung pilihan dengan keyboard dan Enter", () => {
    render(<LocationInput />);
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).toHaveValue("Kota Bogor");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("menolak teks bebas yang belum dipilih dari daftar", () => {
    render(<LocationInput initial="bandung" />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "bukan kota" } });
    expect(screen.getByText("Tidak ada pilihan yang cocok.")).toBeVisible();
    expect(input).toBeInvalid();
  });

  it("Escape menutup daftar tanpa mengganti pilihan", () => {
    render(<LocationInput initial="bandung" />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveValue("Kota Bandung");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("tidak membuka pilihan saat dinonaktifkan", () => {
    render(<LocationInput disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
