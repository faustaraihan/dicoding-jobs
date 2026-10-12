import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "@/components/features/dashboard/DashboardPage";

const mocks = vi.hoisted(() => ({ vacancies: vi.fn(), notify: vi.fn() }));

vi.mock("@/hooks/useVacancies", () => ({ useVacancies: mocks.vacancies }));
vi.mock("@/components/layouts/NavigationProgress", () => ({ usePageReady: vi.fn() }));
vi.mock("@/components/layouts/NavigationLink", () => ({
  default: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock("@/components/ui/feedback/ToastProvider", () => ({ useToast: () => mocks.notify }));

describe("halaman dashboard", () => {
  beforeEach(() => {
    mocks.vacancies.mockReturnValue({
      data: { data: [] },
      isPending: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isPlaceholderData: false,
      isFetching: false,
    });
  });

  it("menampilkan empty state dan tautan untuk membuat lowongan saat daftar kosong", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: "Lowongan Saya" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Belum Ada Lowongan" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Buat lowongan" })).toHaveAttribute(
      "href",
      "/vacancies/new",
    );
  });
});
