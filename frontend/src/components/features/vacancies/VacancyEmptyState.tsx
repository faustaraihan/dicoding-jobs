import Image from "next/image";

interface VacancyEmptyStateProps {
  title?: string;
  description?: string;
}

export default function VacancyEmptyState({
  title = "Lowongan Tidak Ditemukan",
  description = "Lowongan pekerjaan yang Anda cari tidak ditemukan. Silakan cek kembali pencarian dan filter Anda.",
}: VacancyEmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center sm:py-12">
      <Image
        src="/images/empty-vacancies.svg"
        alt=""
        width={243}
        height={181}
        loading="eager"
        className="mb-6 h-auto w-60.75 max-w-full"
      />
      <h3 className="text-xl leading-7 font-semibold tracking-[-0.38px]">{title}</h3>
      <p className="mt-2 max-w-136 text-base leading-6 text-zinc-600">{description}</p>
    </div>
  );
}
