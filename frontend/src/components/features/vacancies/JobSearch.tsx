"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { normalizeSearchKeyword } from "@/lib/utils/search";

interface JobSearchProps {
  value: string;
  onSearch: (search: string) => void;
}

export default function JobSearch({ value, onSearch }: JobSearchProps) {
  const inputId = useId();
  const [draft, setDraft] = useState({ source: value, input: value });
  const input =
    draft.source === value || normalizeSearchKeyword(draft.input) === normalizeSearchKeyword(value)
      ? draft.input
      : value;
  if (draft.source !== value) {
    setDraft({ source: value, input });
  }
  const searchInput = input;

  useEffect(() => {
    const keyword = normalizeSearchKeyword(searchInput);
    if (keyword === value) return;
    if (!keyword) {
      onSearch("");
      return;
    }
    const timeoutId = window.setTimeout(() => {
      onSearch(keyword);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput, value, onSearch]);

  return (
    <div
      role="search"
      className="flex w-full shrink-0 items-center gap-2.5 rounded border border-zinc-200 bg-white py-3 pr-3 pl-6 transition-shadow focus-within:shadow-[0_2px_10px_rgba(24,24,27,0.12)] md:w-86.5"
    >
      <label htmlFor={inputId} className="sr-only">
        Cari judul lowongan
      </label>

      <Image src="/icons/search.svg" alt="" width={20} height={20} className="shrink-0" />

      <input
        id={inputId}
        type="search"
        spellCheck={false}
        value={searchInput}
        onChange={(event) => setDraft({ source: value, input: event.target.value })}
        placeholder="Pekerjaan apa yang sedang kamu cari?"
        className="min-w-0 flex-1 appearance-none bg-transparent text-sm leading-5 tracking-[-0.084px] outline-none placeholder:text-zinc-600 [&::-webkit-search-cancel-button]:appearance-none"
      />
    </div>
  );
}
