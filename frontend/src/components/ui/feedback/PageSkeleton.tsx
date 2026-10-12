type SkeletonVariant = "list" | "detail" | "form";

const block = "rounded bg-zinc-100";

export default function PageSkeleton({ variant }: { variant: SkeletonVariant }) {
  const label =
    variant === "form"
      ? "Memuat formulir lowongan"
      : variant === "detail"
        ? "Memuat detail lowongan"
        : "Memuat daftar lowongan";

  return (
    <div role="status" aria-label={label} className="motion-safe:animate-pulse">
      <span className="sr-only">{label}...</span>
      <div aria-hidden="true">
        {variant === "list" ? (
          <div className="space-y-6">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="flex min-h-36 gap-4 rounded-lg border border-zinc-200 bg-white p-4"
              >
                <div className={`${block} h-16 w-16 shrink-0 sm:h-24 sm:w-24`} />
                <div className="min-w-0 flex-1 space-y-4 py-1">
                  <div className={`${block} h-5 w-3/4 max-w-72`} />
                  <div className={`${block} h-4 w-1/2 max-w-52`} />
                  <div className={`${block} h-4 w-2/3 max-w-64`} />
                </div>
              </div>
            ))}
          </div>
        ) : variant === "form" ? (
          <div className="space-y-8">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="space-y-3">
                <div className={`${block} h-5 w-40`} />
                <div className={`${block} h-12 w-full`} />
              </div>
            ))}
            <div className={`${block} h-64 w-full`} />
          </div>
        ) : (
          <div className="space-y-10">
            <div className="flex gap-5">
              <div className={`${block} h-24 w-24 shrink-0`} />
              <div className="flex-1 space-y-4">
                <div className={`${block} h-8 w-3/4`} />
                <div className={`${block} h-5 w-1/2`} />
                <div className={`${block} h-4 w-2/3`} />
              </div>
            </div>
            {[0, 1].map((index) => (
              <div key={index} className="space-y-4">
                <div className={`${block} h-6 w-48`} />
                <div className={`${block} h-4 w-full`} />
                <div className={`${block} h-4 w-full`} />
                <div className={`${block} h-4 w-3/4`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
