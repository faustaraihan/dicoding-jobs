"use client";

import Image from "next/image";
import Link from "@/components/layouts/NavigationLink";
import { useVacancy } from "@/hooks/useVacancy";
import PageSkeleton from "@/components/ui/feedback/PageSkeleton";
import { VacancyNotFoundError } from "@/lib/api/vacancies";
import { usePageReady } from "@/components/layouts/NavigationProgress";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function VacancyDetail({ id }: { id: string }) {
  const { data, isPending, isError, error, refetch } = useVacancy(id);
  usePageReady(!isPending, `/vacancies/${id}`);

  if (isPending) {
    return (
      <main className="mx-auto w-full max-w-194.5 px-6 py-12">
        <PageSkeleton variant="detail" />
      </main>
    );
  }

  if (isError) {
    const isMissing = error instanceof VacancyNotFoundError;

    return (
      <main className="mx-auto w-full max-w-194.5 px-6 py-12">
        <h1 className="text-2xl font-semibold">
          {isMissing ? "Lowongan tidak ditemukan" : "Detail lowongan gagal dimuat"}
        </h1>
        <p className="mt-4" role="alert">
          {error.message}
        </p>
        {!isMissing && (
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 rounded border border-zinc-300 px-4 py-2"
          >
            Coba lagi
          </button>
        )}
        <Link href="/list" className="mt-4 block text-blue-500 underline">
          Kembali ke daftar lowongan
        </Link>
      </main>
    );
  }

  const vacancy = data.data;

  return (
    <main className="w-full bg-white text-zinc-900">
      <header className="relative overflow-hidden">
        <div className="mx-auto flex max-w-289.5 items-start gap-4 px-6 pt-8 pb-9">
          <Image
            src={vacancy.company.logo_url}
            alt={`Logo ${vacancy.company.name}`}
            width={96}
            height={96}
            unoptimized
            className="h-24 w-24 shrink-0 rounded border border-zinc-200 object-cover"
          />
          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl leading-8.5 font-semibold tracking-[-0.456px]">
              {vacancy.title}
            </h1>
            {vacancy.show_salary && vacancy.salary_min != null && (
              <p className="text-sm leading-5 tracking-[-0.084px] text-zinc-600">
                Gaji: {currencyFormatter.format(vacancy.salary_min)}
                {vacancy.salary_max != null &&
                  ` – ${currencyFormatter.format(vacancy.salary_max)}`}{" "}
                per bulan
              </p>
            )}
            <p className="text-sm leading-5 tracking-[-0.084px] text-zinc-600">
              Sektor Bisnis: {vacancy.company.business_sector}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs leading-4.25">
              <span className="inline-flex items-center gap-1 text-blue-500 underline">
                <Image src="/icons/building.svg" alt="" width={16} height={16} />
                {vacancy.company.name}
              </span>
              <span className="inline-flex items-center gap-1">
                <Image src="/icons/location.svg" alt="" width={16} height={16} />
                {vacancy.location.name}
              </span>
              <span className="inline-flex items-center gap-1">
                <Image src="/icons/users.svg" alt="" width={16} height={16} />
                {vacancy.company.employee_count} Karyawan
              </span>
            </div>
          </div>
        </div>
        {/* Preserve the SVG's fractional intrinsic width without Next Image's integer width conversion. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/detail-divider.svg"
          alt=""
          width={1441.5}
          height={1}
          className="absolute bottom-0 left-1/2 max-w-none -translate-x-1/2"
        />
      </header>

      <div className="mx-auto w-full max-w-194.5 px-6 pt-8 pb-16">
        <span className="inline-block rounded-full border border-blue-400 bg-blue-50 px-4 py-2 text-sm leading-3.5 font-semibold tracking-[-0.084px] text-blue-500">
          {vacancy.employment_type_label}
        </span>

        <section aria-label="Deskripsi lowongan" className="mt-8">
          {/* The Laravel API sanitizes description HTML before saving it. */}
          <div
            className="vacancy-description text-base leading-5.5 tracking-[-0.176px]"
            dangerouslySetInnerHTML={{ __html: vacancy.description }}
          />
        </section>

        <section aria-labelledby="additional-information-heading" className="mt-8">
          <h2
            id="additional-information-heading"
            className="text-xl leading-7 font-semibold tracking-[-0.34px]"
          >
            Informasi Tambahan
          </h2>
          <dl className="mt-2 grid gap-x-8 gap-y-6 text-base leading-5.5 tracking-[-0.176px] sm:grid-cols-[297px_1fr]">
            <div>
              <dt className="font-semibold">Pengalaman bekerja</dt>
              <dd className="mt-2">{vacancy.experience_level_label}</dd>
            </div>
            <div>
              <dt className="font-semibold">Kandidat yang dibutuhkan</dt>
              <dd className="mt-2">{vacancy.candidate_count} kandidat</dd>
            </div>
            {vacancy.is_remote && (
              <div>
                <dt className="font-semibold">Sistem kerja</dt>
                <dd className="mt-2">Remote</dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    </main>
  );
}
