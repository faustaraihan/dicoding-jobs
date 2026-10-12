import Image from "next/image";
import Link from "@/components/layouts/NavigationLink";
import type { Vacancy } from "@/types/vacancy";

interface JobCardProps {
  vacancy: Vacancy;
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export default function JobCard({ vacancy }: JobCardProps) {
  return (
    <Link
      href={`/vacancies/${vacancy.id}`}
      aria-label={`Lihat detail ${vacancy.title}`}
      className="flex w-full gap-4 rounded border border-zinc-200 bg-white p-4 text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900"
    >
      <Image
        src={vacancy.company.logo_url}
        alt={`Logo ${vacancy.company.name}`}
        width={96}
        height={96}
        unoptimized
        className="h-24 w-24 shrink-0 rounded border border-zinc-200 object-cover"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base leading-5.5 font-semibold tracking-[-0.176px]">
            {vacancy.title}
          </h2>

          <div className="mt-4 space-y-2 text-xs leading-4.25">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-1">
                <Image src="/icons/building.svg" alt="" width={16} height={16} aria-hidden="true" />
                {vacancy.company.name}
              </span>

              <span>{vacancy.employment_type_label}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-1">
                <Image src="/icons/location.svg" alt="" width={16} height={16} aria-hidden="true" />
                {vacancy.location.name}
              </span>

              <span className="inline-flex items-center gap-1">
                <Image
                  src="/icons/experience.svg"
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden="true"
                />
                {vacancy.experience_level_label}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 space-y-2 text-xs leading-4.25 text-zinc-600 sm:text-right">
          <p>
            Dibuat pada{" "}
            <time dateTime={vacancy.created_at}>
              {dateFormatter.format(new Date(vacancy.created_at))}
            </time>
          </p>

          <p>
            Lamar sebelum{" "}
            <time dateTime={vacancy.expires_at}>
              {dateFormatter.format(new Date(vacancy.expires_at))}
            </time>
          </p>
        </div>
      </div>
    </Link>
  );
}
