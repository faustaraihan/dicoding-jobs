"use client";

import { useEffect, useRef } from "react";

interface CurrencyInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  minimum?: string;
  invalid: boolean;
}

function formatAmount(value: string) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function CurrencyInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  minimum = "0",
  invalid,
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.setCustomValidity(
      value !== "" && Number(value) < Number(minimum)
        ? "Gaji maksimum tidak boleh lebih kecil dari gaji minimum."
        : "",
    );
  }, [value, minimum]);

  return (
    <input
      ref={inputRef}
      id={id}
      name={id}
      aria-label={label}
      aria-invalid={invalid}
      aria-describedby={`${id}-error`}
      type="text"
      inputMode="numeric"
      required={required}
      value={formatAmount(value)}
      onChange={(event) => {
        const input = event.currentTarget;
        const digitsBeforeCaret = input.value
          .slice(0, input.selectionStart ?? input.value.length)
          .replace(/\D/g, "").length;
        const digits = input.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
        onChange(digits);
        requestAnimationFrame(() => {
          if (document.activeElement !== input) return;
          let position = 0;
          let count = 0;
          while (position < input.value.length && count < digitsBeforeCaret) {
            if (/\d/.test(input.value[position])) count++;
            position++;
          }
          input.setSelectionRange(position, position);
        });
      }}
      placeholder={placeholder}
      className="h-12 w-full min-w-0 px-2 outline-none focus:ring-1 focus:ring-zinc-500"
    />
  );
}
