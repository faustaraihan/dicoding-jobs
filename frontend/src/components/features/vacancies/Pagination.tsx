"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  pending?: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  pending = false,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (number) =>
      totalPages <= 7 || number === 1 || number === totalPages || Math.abs(number - page) <= 1,
  );
  const buttonClass =
    "relative -ml-px flex h-10 min-w-10 cursor-pointer items-center justify-center border border-zinc-200 px-3 text-base transition-colors first:ml-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d3e50] disabled:cursor-not-allowed";

  return (
    <nav aria-label="Halaman daftar lowongan" className="mt-8 flex items-center justify-center">
      <button
        type="button"
        aria-label="Sebelumnya"
        disabled={page <= 1 || pending}
        onClick={() => onPageChange(page - 1)}
        className={`${buttonClass} bg-white text-zinc-900 hover:bg-zinc-50 disabled:text-zinc-300 disabled:hover:bg-white`}
      >
        <span aria-hidden="true">&lt;</span>
      </button>
      {pages.map((number, index) => (
        <span key={number} className="flex">
          {index > 0 && number - pages[index - 1] > 1 && (
            <span
              aria-hidden="true"
              className="-ml-px flex h-10 min-w-10 items-center justify-center border border-zinc-200 text-zinc-500"
            >
              …
            </span>
          )}
          <button
            type="button"
            aria-label={`Halaman ${number}`}
            aria-current={number === page ? "page" : undefined}
            disabled={pending || number === page}
            onClick={() => onPageChange(number)}
            className={`${buttonClass} -ml-px first:-ml-px ${number === page ? "z-10 border-[#2d3e50] bg-[#2d3e50] text-white disabled:cursor-default" : "bg-white text-zinc-900 hover:bg-zinc-50 disabled:opacity-50"}`}
          >
            {number}
          </button>
        </span>
      ))}
      <button
        type="button"
        aria-label="Berikutnya"
        disabled={page >= totalPages || pending}
        onClick={() => onPageChange(page + 1)}
        className={`${buttonClass} bg-white text-zinc-900 hover:bg-zinc-50 disabled:text-zinc-300 disabled:hover:bg-white`}
      >
        <span aria-hidden="true">&gt;</span>
      </button>
    </nav>
  );
}
