import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import SiteHeader from "@/components/layouts/SiteHeader";
import SiteFooter from "@/components/layouts/SiteFooter";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dicoding Jobs",
  description: "Temukan peluang karier di Dicoding Indonesia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <Suspense
            fallback={
              <div className="min-h-17.5 border-b border-zinc-200 bg-white" aria-hidden="true" />
            }
          >
            <SiteHeader />
          </Suspense>
          {children}
          <Suspense fallback={null}>
            <SiteFooter />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
