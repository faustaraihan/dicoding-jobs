import Image from "next/image";
import { PageReady } from "@/components/layouts/NavigationProgress";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-70px)] w-full flex-col items-center justify-center px-6 py-16 text-center">
      <PageReady />
      <Image
        src="/images/not-found.svg"
        alt=""
        width={215}
        height={215}
        className="h-auto w-53.75 max-w-full"
      />
      <h1 className="mt-7.5 text-xl leading-7 font-semibold tracking-[-0.38px]">
        Halaman tidak ditemukan
      </h1>

      <p className="mt-2 max-w-124 text-base leading-6 text-zinc-600">
        Maaf, halaman yang anda cari tidak ditemukan, silakan kembali ke halaman sebelumnya.
      </p>
    </main>
  );
}
