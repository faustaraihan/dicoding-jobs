"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useNavigationProgress } from "@/components/layouts/NavigationProgress";

type NavigationLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onNavigate"> & {
  href: string;
};

export default function NavigationLink({ href, scroll, ...props }: NavigationLinkProps) {
  const { navigate } = useNavigationProgress();

  return (
    <Link
      {...props}
      href={href}
      scroll={scroll}
      onNavigate={(event) => {
        event.preventDefault();
        navigate(href, scroll);
      }}
    />
  );
}
