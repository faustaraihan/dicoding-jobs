"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return null;
  }

  return (
    <footer className="mt-auto bg-white">
      <div className="mx-auto max-w-289.5 px-6">
        <Image
          src="/images/footer-divider.svg"
          alt=""
          width={1110}
          height={2}
          className="max-w-full"
        />

        <div className="py-16 md:min-h-81.5">
          <Image
            src="/images/dicoding-wordmark.png"
            alt="Dicoding"
            width={794}
            height={201}
            className="h-auto w-34.5"
            style={{ height: "auto" }}
          />

          <address className="mt-8 max-w-94.5 text-lg leading-6.5 font-normal text-zinc-500 not-italic">
            Dicoding Space
            <br />
            Jl. Batik Kumeli No.50, Sukaluyu,
            <br />
            Kec. Cibeunying Kaler, Kota Bandung Jawa Barat 40123
          </address>
        </div>
      </div>
    </footer>
  );
}
