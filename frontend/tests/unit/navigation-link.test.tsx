import { fireEvent, render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NavigationLink from "@/components/layouts/NavigationLink";
import { NavigationProgressProvider } from "@/components/layouts/NavigationProgress";

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

// Next owns browser click handling; this adapter exposes its onNavigate callback.
// Real modified-click and route behavior are covered by browser tests.
vi.mock("next/link", () => ({
  default: ({
    onNavigate,
    scroll,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    scroll?: boolean;
    onNavigate: (event: { preventDefault: () => void }) => void;
  }) => {
    void scroll;
    return <a {...props} onClick={(event) => onNavigate(event)} />;
  },
}));

describe("NavigationLink", () => {
  beforeEach(() => {
    router.push.mockReset();
    window.history.replaceState(null, "", "/list");
  });

  it("klik menuju halaman tujuan melalui provider dan memulai loading bar", () => {
    render(
      <NavigationProgressProvider>
        <NavigationLink href="/dashboard" className="menu" aria-label="Buka dashboard">
          Dashboard
        </NavigationLink>
      </NavigationProgressProvider>,
    );
    const link = screen.getByRole("link", { name: "Buka dashboard" });
    expect(link).toHaveAttribute("href", "/dashboard");
    expect(link).toHaveClass("menu");
    expect(fireEvent.click(link)).toBe(false);
    expect(router.push).toHaveBeenCalledWith("/dashboard", { scroll: true });
    expect(screen.getByRole("status", { name: "Memuat halaman" })).toBeInTheDocument();
  });

  it("scroll=false diteruskan dan pergantian query tidak memulai loading bar halaman", () => {
    render(
      <NavigationProgressProvider>
        <NavigationLink href="/list?page=2" scroll={false}>
          Halaman 2
        </NavigationLink>
      </NavigationProgressProvider>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Halaman 2" }));
    expect(router.push).toHaveBeenCalledWith("/list?page=2", { scroll: false });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
