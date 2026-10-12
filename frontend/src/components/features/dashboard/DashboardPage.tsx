"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "@/components/layouts/NavigationLink";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardJobCard from "@/components/features/dashboard/DashboardJobCard";
import PageSkeleton from "@/components/ui/feedback/PageSkeleton";
import Pagination from "@/components/features/vacancies/Pagination";
import VacancyEmptyState from "@/components/features/vacancies/VacancyEmptyState";
import { useVacancies } from "@/hooks/useVacancies";
import { deleteVacancy } from "@/lib/api/vacancies";
import type { Vacancy } from "@/types/vacancy";
import { usePageReady } from "@/components/layouts/NavigationProgress";
import { useToast } from "@/components/ui/feedback/ToastProvider";

export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const notify = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLElement>(null);
  const queryClient = useQueryClient();
  const { data, isPending, isError, error, refetch, isPlaceholderData, isFetching } = useVacancies({
    page,
  });
  usePageReady(!isPending, "/dashboard");

  const deletion = useMutation({
    mutationFn: deleteVacancy,
    onSuccess: async (_, id) => {
      setSelectedVacancy(null);
      notify("Lowongan berhasil dihapus.");
      queryClient.removeQueries({ queryKey: ["vacancy", String(id)] });
      if (data?.data.length === 1 && page > 1) {
        setPage(page - 1);
      }
      await queryClient.invalidateQueries({ queryKey: ["vacancies"] });
    },
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selectedVacancy && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!selectedVacancy && dialog?.open) {
      dialog.close();
    }
  }, [selectedVacancy]);

  function askToDelete(vacancy: Vacancy) {
    deletion.reset();
    setSelectedVacancy(vacancy);
  }

  return (
    <main className="w-full flex-1 bg-white text-zinc-900">
      <div className="mx-auto grid min-h-206.75 max-w-289.5 px-6 md:grid-cols-[252px_1fr]">
        <aside
          className="border-b border-zinc-200 md:border-r md:border-b-0"
          aria-label="Menu Dashboard"
        >
          <div className="relative flex h-23 items-center overflow-hidden px-4">
            <p className="text-2xl leading-8 font-medium text-zinc-700">Jobs</p>
            <Image
              src="/images/dashboard-jobs.png"
              alt=""
              width={84}
              height={92}
              className="absolute top-0 right-14 h-23 w-21 object-cover"
            />
          </div>
          <Link
            href="/dashboard"
            aria-current="page"
            className="flex items-center gap-2 bg-zinc-100 p-4 text-base leading-5.5 tracking-[-0.176px]"
          >
            <Image src="/icons/job.svg" alt="" width={24} height={24} />
            Lowongan Saya
          </Link>
        </aside>

        <section
          ref={listRef}
          aria-busy={isFetching}
          className="min-w-0 scroll-mt-24 py-6 md:pl-6"
          aria-labelledby="my-vacancies-heading"
        >
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h1
              id="my-vacancies-heading"
              className="text-2xl leading-8.5 font-semibold tracking-[-0.456px]"
            >
              Lowongan Saya
            </h1>
            <Link
              href="/vacancies/new"
              className="inline-flex items-center gap-2 rounded-xs bg-[#2d3e50] px-3 py-1.5 text-base leading-6 tracking-[-0.176px] text-white"
            >
              <Image src="/icons/plus.svg" alt="" width={16} height={16} />
              Buat lowongan
            </Link>
          </div>

          {isPending ? (
            <PageSkeleton variant="list" />
          ) : isError ? (
            <div role="alert">
              <p>{error.message}</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-4 rounded border px-4 py-2"
              >
                Coba lagi
              </button>
            </div>
          ) : data.data.length === 0 ? (
            <VacancyEmptyState
              title="Belum Ada Lowongan"
              description="Anda belum memiliki lowongan pekerjaan. Klik Buat lowongan untuk membuat lowongan pertama Anda."
            />
          ) : (
            <>
              <ul
                className={`space-y-6 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
              >
                {data.data.map((vacancy) => (
                  <li key={vacancy.id}>
                    <DashboardJobCard
                      vacancy={vacancy}
                      onDelete={askToDelete}
                      isDeleting={deletion.isPending}
                    />
                  </li>
                ))}
              </ul>
              <Pagination
                page={data.meta.current_page}
                totalPages={data.meta.last_page}
                pending={isPlaceholderData || isFetching}
                onPageChange={(nextPage) => {
                  setPage(nextPage);
                  listRef.current?.scrollIntoView({ block: "start" });
                }}
              />
            </>
          )}
        </section>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-vacancy-heading"
        aria-describedby="delete-vacancy-description"
        onCancel={(event) => {
          if (deletion.isPending) event.preventDefault();
        }}
        onClose={() => setSelectedVacancy(null)}
        className="fixed inset-0 m-auto w-[calc(100%-32px)] max-w-md rounded-lg border border-zinc-200 bg-white p-6 text-zinc-900 shadow-xl backdrop:bg-black/40"
      >
        <h2 id="delete-vacancy-heading" className="text-xl font-semibold">
          Hapus lowongan?
        </h2>
        <p id="delete-vacancy-description" className="mt-3 text-sm leading-5">
          Lowongan “{selectedVacancy?.title}” akan dihapus. Tindakan ini tidak dapat dibatalkan.
        </p>
        {deletion.isError && (
          <p role="alert" className="mt-3 text-sm text-rose-700">
            {deletion.error.message}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            autoFocus
            disabled={deletion.isPending}
            onClick={() => setSelectedVacancy(null)}
            className="cursor-pointer rounded border border-zinc-300 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={deletion.isPending || !selectedVacancy}
            onClick={() => {
              if (selectedVacancy) deletion.mutate(selectedVacancy.id);
            }}
            className="cursor-pointer rounded bg-rose-700 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deletion.isPending ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </dialog>
    </main>
  );
}
