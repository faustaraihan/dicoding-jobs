"use client";

import Link from "@/components/layouts/NavigationLink";
import { usePageReady } from "@/components/layouts/NavigationProgress";

export default function ErrorPage({ reset }: { reset: () => void }) {
  usePageReady(true);
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Halaman gagal dimuat</h1>
      <p role="alert" className="mt-4 text-zinc-600">
        Terjadi kesalahan saat membuka halaman. Silakan coba lagi.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded border border-zinc-300 px-4 py-2"
        >
          Coba lagi
        </button>
        <Link href="/list" className="rounded border border-zinc-300 px-4 py-2">
          Kembali ke lowongan
        </Link>
      </div>
    </main>
  );
}
