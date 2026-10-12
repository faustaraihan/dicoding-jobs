import { render, screen, within } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SiteHeader from "@/components/layouts/SiteHeader";
import SiteFooter from "@/components/layouts/SiteFooter";

const route = vi.hoisted(() => ({ pathname: "/list" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("@/components/layouts/NavigationLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
beforeEach(() => {
  route.pathname = "/list";
});

describe("header dan footer", () => {
  it("logo menuju daftar dan menu utama memiliki tujuan yang benar", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Dicoding Jobs, halaman utama" })).toHaveAttribute(
      "href",
      "/list",
    );
    const menu = within(screen.getByRole("navigation", { name: "Navigasi utama" }));
    expect(menu.getByRole("link", { name: "Lowongan Kerja" })).toHaveAttribute("href", "/list");
    expect(menu.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
  });

  it.each([
    ["/list", "Lowongan Kerja"],
    ["/list/saved", "Lowongan Kerja"],
    ["/dashboard", "Dashboard"],
    ["/dashboard/settings", "Dashboard"],
  ])("menu aktif untuk %s adalah %s", (pathname, label) => {
    route.pathname = pathname;
    render(<SiteHeader />);
    const links = within(screen.getByRole("navigation")).getAllByRole("link");
    expect(links.filter((link) => link.getAttribute("aria-current") === "page")).toHaveLength(1);
    expect(screen.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
  });

  it("prefix mirip tidak dianggap menu aktif", () => {
    route.pathname = "/dashboard-other";
    render(<SiteHeader />);
    expect(screen.getAllByRole("link").every((link) => !link.hasAttribute("aria-current"))).toBe(
      true,
    );
  });

  it("pindah dashboard lalu kembali memperbarui menu dan mempertahankan header putih sticky", () => {
    const view = render(<SiteHeader />);
    route.pathname = "/dashboard";
    view.rerender(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
    route.pathname = "/list";
    view.rerender(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("banner")).toHaveClass("sticky", "top-0", "bg-white");
  });

  it.each(["/list", "/vacancies/12", "/dashboard-other"])(
    "footer publik tampil di %s",
    (pathname) => {
      route.pathname = pathname;
      render(<SiteFooter />);
      const footer = within(screen.getByRole("contentinfo"));
      expect(footer.getByRole("img", { name: "Dicoding" })).toBeInTheDocument();
      expect(footer.getByText(/Dicoding Space/)).toHaveTextContent("Kota Bandung Jawa Barat 40123");
    },
  );

  it.each(["/dashboard", "/dashboard/settings"])("footer disembunyikan di %s", (pathname) => {
    route.pathname = pathname;
    render(<SiteFooter />);
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });
});
