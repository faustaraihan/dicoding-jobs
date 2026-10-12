import Image from "next/image";
import Link from "@/components/layouts/NavigationLink";
import type { Vacancy } from "@/types/vacancy";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

interface DashboardJobCardProps {
  vacancy: Vacancy;
  onDelete: (vacancy: Vacancy) => void;
  isDeleting: boolean;
}

export default function DashboardJobCard({ vacancy, onDelete, isDeleting }: DashboardJobCardProps) {
  return (
    <article className="overflow-hidden rounded border border-zinc-200 bg-white p-4 text-zinc-900">
      <div className="flex items-start gap-4">
        <Image
          src={vacancy.company.logo_url}
          alt={`Logo ${vacancy.company.name}`}
          width={64}
          height={64}
          unoptimized
          className="h-16 w-16 shrink-0 rounded border border-zinc-200 object-cover"
        />

        <div className="min-w-0 flex-1">
          <h2 className="text-base leading-5.5 font-semibold tracking-[-0.176px] wrap-break-word">
            <Link href={`/vacancies/${vacancy.id}`} className="hover:underline">
              {vacancy.title}
            </Link>
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            {vacancy.location.name} · {vacancy.employment_type_label}
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-xs leading-5 text-zinc-600 sm:grid-cols-2">
        <p className="flex items-start gap-2">
          <Image src="/icons/created.svg" alt="" width={16} height={16} />
          <span>
            Dibuat:{" "}
            <time dateTime={vacancy.created_at}>
              {dateFormatter.format(new Date(vacancy.created_at))}
            </time>
          </span>
        </p>
        <p className="flex items-start gap-2">
          <Image src="/icons/time.svg" alt="" width={16} height={16} />
          <span>
            Aktif hingga:{" "}
            <time dateTime={vacancy.expires_at}>
              {dateFormatter.format(new Date(vacancy.expires_at))}
            </time>
          </span>
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 border-t border-zinc-100 pt-4 text-sm leading-6">
        <Link
          href={`/vacancies/${vacancy.id}/edit`}
          aria-label={`Edit ${vacancy.title}`}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xs border border-zinc-200 bg-white px-3 py-1.5 hover:bg-zinc-50"
        >
          <Image src="/icons/edit.svg" alt="" width={16} height={16} />
          Edit
        </Link>
        <button
          type="button"
          onClick={() => onDelete(vacancy)}
          disabled={isDeleting}
          aria-label={`Hapus ${vacancy.title}`}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xs bg-rose-100 px-3 py-1.5 text-rose-700 hover:bg-rose-200 disabled:cursor-wait disabled:opacity-60"
        >
          <Image src="/icons/delete.svg" alt="" width={16} height={16} />
          {isDeleting ? "Menghapus..." : "Hapus"}
        </button>
      </div>
    </article>
  );
}
