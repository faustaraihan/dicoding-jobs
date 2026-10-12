"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";

interface ComboboxOption {
  value: string;
  label: string;
}

interface SearchableComboboxProps {
  id: string;
  value: string;
  options: ComboboxOption[];
  placeholder: string;
  onChange: (value: string) => void;
  icon?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

export default function SearchableCombobox({
  id,
  value,
  options,
  placeholder,
  onChange,
  icon = "/icons/form-chevron.svg",
  disabled = false,
  invalid = false,
  describedBy,
}: SearchableComboboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = options.find((option) => option.value === value);
  const filtered = options.filter((option) =>
    option.label.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")),
  );
  const listId = `${id}-options`;
  const activeId = open && filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined;

  useEffect(() => {
    inputRef.current?.setCustomValidity(value ? "" : "Pilih salah satu pilihan dari daftar.");
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const item = list?.children[activeIndex] as HTMLElement | undefined;
    if (!list || !item) return;
    if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop;
    else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
    }
  }, [activeIndex, open, query]);

  function choose(option: ComboboxOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        open
          ? Math.max(0, Math.min(filtered.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)))
          : event.key === "ArrowDown"
            ? 0
            : Math.max(0, filtered.length - 1),
      );
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      if (filtered[activeIndex]) choose(filtered[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setQuery("");
        }
      }}
    >
      <input
        ref={inputRef}
        id={id}
        role="combobox"
        required
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={activeId}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        value={open && query ? query : (selected?.label ?? "")}
        placeholder={selected?.label ?? placeholder}
        onFocus={() => {
          setOpen(true);
          setActiveIndex(0);
        }}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setOpen(true);
          onChange("");
        }}
        onKeyDown={handleKeyDown}
        className="h-12 w-full rounded-xs border border-zinc-200 bg-white pr-12 pl-4 text-base leading-5.5 tracking-[-0.176px] placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-50"
      />
      <input type="hidden" name={id} value={value} disabled={disabled} />
      <Image
        src={icon}
        alt=""
        width={24}
        height={24}
        className="pointer-events-none absolute top-3 right-4"
      />
      {open && !disabled && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={placeholder}
          className="absolute top-full z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xs border border-zinc-200 bg-white py-1 shadow-lg"
        >
          {filtered.length ? (
            filtered.map((option, index) => (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(option)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full cursor-pointer px-4 py-2.5 text-left text-base leading-5.5 ${index === activeIndex ? "bg-zinc-100 text-zinc-900" : "text-zinc-700"}`}
                >
                  {option.label}
                </button>
              </li>
            ))
          ) : (
            <li role="presentation" className="px-4 py-3 text-sm text-zinc-500">
              Tidak ada pilihan yang cocok.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
