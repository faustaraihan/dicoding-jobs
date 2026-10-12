"use client";

import { useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useVacancies } from "@/hooks/useVacancies";
import JobCard from "@/components/features/vacancies/JobCard";
import JobSearch from "@/components/features/vacancies/JobSearch";
import JobsHero from "@/components/features/vacancies/JobsHero";
import PageSkeleton from "@/components/ui/feedback/PageSkeleton";
import VacancyEmptyState from "@/components/features/vacancies/VacancyEmptyState";
import Pagination from "@/components/features/vacancies/Pagination";
import { usePageReady } from "@/components/layouts/NavigationProgress";
import { normalizeSearchKeyword } from "@/lib/utils/search";

export default function VacancyList() {
  const searchParams = useSearchParams();
  const keyword = (searchParams.get("keyword") ?? "").trim();
  const search = normalizeSearchKeyword(keyword);
  const requestedPage = Number(searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const listRef = useRef<HTMLElement>(null);
  const handleSearch = useCallback((value: string) => {
    const url = new URL(window.location.href);
    if ((url.searchParams.get("keyword") ?? "").trim() === value) return;
    const params = new URLSearchParams();
    if (value) params.set("keyword", value);
    window.history.replaceState(null, "", `/list${params.size ? `?${params}` : ""}`);
  }, []);

  const { data, isPending, isError, error, refetch, isPlaceholderData, isFetching } = useVacancies({
    search,
    page,
  });
  usePageReady(!isPending, "/list");

  return (
    <main className="w-full">
      <JobsHero />

      <section
        ref={listRef}
        aria-labelledby="vacancy-list-heading"
        aria-busy={isFetching}
        className="mx-auto min-h-120 w-full max-w-194.5 scroll-mt-24 px-6 py-12 md:min-h-185"
      >
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2
            id="vacancy-list-heading"
            className="text-2xl leading-8.5 font-semibold tracking-[-0.456px]"
          >
            {search ? `Hasil Pencarian: ${search}` : "Daftar Pekerjaan Terbaru"}
          </h2>

          <JobSearch value={keyword} onSearch={handleSearch} />
        </div>

        {isPending ? (
          <PageSkeleton variant="list" />
        ) : isError ? (
          <div role="alert">
            <p>{error.message}</p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 rounded border px-4 py-2"
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <>
            <p className="sr-only" role="status">
              Menampilkan {data.meta.from ?? 0}–{data.meta.to ?? 0} dari {data.meta.total} lowongan.
            </p>

            {data.data.length === 0 ? (
              <VacancyEmptyState />
            ) : (
              <ul
                className={`space-y-6 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
              >
                {data.data.map((vacancy) => (
                  <li key={vacancy.id}>
                    <JobCard vacancy={vacancy} />
                  </li>
                ))}
              </ul>
            )}
            <Pagination
              page={data.meta.current_page}
              totalPages={data.meta.last_page}
              pending={isPlaceholderData || isFetching}
              onPageChange={(nextPage) => {
                const params = new URLSearchParams();
                if (search) params.set("keyword", search);
                if (nextPage > 1) params.set("page", String(nextPage));
                window.history.pushState(null, "", `/list${params.size ? `?${params}` : ""}`);
                listRef.current?.scrollIntoView({ block: "start" });
              }}
            />
          </>
        )}
      </section>
    </main>
  );
}
