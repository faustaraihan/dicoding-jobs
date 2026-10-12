"use client";

import Image from "next/image";
import Link from "@/components/layouts/NavigationLink";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/list", label: "Lowongan Kerja" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex min-h-17.5 max-w-360 items-center gap-6 px-4 sm:gap-8 sm:px-15">
        <Link
          href="/list"
          aria-label="Dicoding Jobs, halaman utama"
          className="flex shrink-0 items-center gap-1 text-[#2d3e50]"
        >
          <Image src="/images/dicoding-symbol.svg" alt="" width={28} height={28} />
          <span className="text-[20.5px] font-medium tracking-[-0.39px]">Jobs</span>
        </Link>

        <nav aria-label="Navigasi utama">
          <ul className="flex items-center gap-4 sm:gap-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className="relative flex min-h-17.5 items-center px-2 text-sm tracking-[-0.176px] sm:text-base"
                  >
                    {item.label}

                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-3.5 left-1/2 h-1 w-5 -translate-x-1/2 rounded-[1px] bg-zinc-900"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
