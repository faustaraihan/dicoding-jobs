import { act, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  NavigationProgressProvider,
  PageReady,
  useNavigationProgress,
  usePageReady,
} from "@/components/layouts/NavigationProgress";

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

let navigation: ReturnType<typeof useNavigationProgress>;
let frames: Map<number, FrameRequestCallback>;
let frameId: number;

function Screen({ ready = false, path }: { ready?: boolean; path?: string }) {
  const context = useNavigationProgress();
  useEffect(() => {
    navigation = context;
  }, [context]);
  usePageReady(ready, path);
  return <p>Isi halaman</p>;
}

function app(ready = false, path?: string) {
  return (
    <NavigationProgressProvider>
      <Screen ready={ready} path={path} />
    </NavigationProgressProvider>
  );
}

function advance(ms: number) {
  act(() => vi.advanceTimersByTime(ms));
}

function frame() {
  act(() => {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(performance.now()));
  });
}

function progress() {
  const bar = screen.getByRole("status", { name: "Memuat halaman" }).firstElementChild;
  return Number((bar as HTMLElement).style.transform.match(/scaleX\((.+)\)/)?.[1]);
}

describe("navigasi dan loading bar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    router.push.mockReset();
    window.history.replaceState(null, "", "/list");
    frames = new Map();
    frameId = 0;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.set(++frameId, callback);
      return frameId;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  });

  it("halaman awal tetap terlihat tanpa loading bar", () => {
    render(app());
    expect(screen.getByText("Isi halaman")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(navigation.pending).toBe(false);
  });

  it("navigasi memulai progress tanpa menyembunyikan isi halaman", () => {
    render(app());
    act(() => navigation.navigate("/dashboard"));
    expect(router.push).toHaveBeenCalledWith("/dashboard", { scroll: true });
    expect(navigation.pending).toBe(true);
    expect(navigation.generation).toBe(1);
    expect(progress()).toBe(0.08);
    expect(screen.getByText("Isi halaman")).toBeInTheDocument();
  });

  it("estimasi maju tetapi tidak selesai sebelum halaman tujuan siap", () => {
    render(app());
    act(() => navigation.navigate("/dashboard"));
    advance(250);
    expect(progress()).toBeGreaterThan(0.08);
    advance(60_000);
    expect(progress()).toBeLessThanOrEqual(0.9);
    expect(navigation.pending).toBe(true);
  });

  it("sinyal siap dari halaman lama diabaikan", () => {
    render(app());
    act(() => navigation.navigate("/dashboard"));
    act(() => navigation.reportReady("/list"));
    expect(progress()).toBe(0.08);
    expect(navigation.pending).toBe(true);
  });

  it("halaman siap menyelesaikan progress lalu menghilangkannya setelah transisi", () => {
    render(app());
    act(() => navigation.navigate("/dashboard"));
    act(() => navigation.reportReady("/dashboard"));
    expect(progress()).toBe(1);
    advance(199);
    expect(navigation.pending).toBe(true);
    advance(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(navigation.pending).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("sinyal siap berulang tidak memperpanjang animasi selesai", () => {
    render(app());
    act(() => navigation.navigate("/dashboard"));
    act(() => navigation.reportReady("/dashboard"));
    advance(100);
    act(() => navigation.reportReady("/dashboard"));
    advance(100);
    expect(navigation.pending).toBe(false);
  });

  it("navigasi baru membatalkan timer selesai milik navigasi sebelumnya", () => {
    render(app());
    act(() => navigation.navigate("/dashboard"));
    act(() => navigation.reportReady("/dashboard"));
    advance(100);
    act(() => navigation.navigate("/vacancies/new", false));
    advance(100);
    expect(navigation.pending).toBe(true);
    expect(progress()).toBe(0.08);
    expect(navigation.generation).toBe(2);
    expect(router.push).toHaveBeenLastCalledWith("/vacancies/new", { scroll: false });
    act(() => navigation.reportReady("/dashboard"));
    expect(progress()).toBe(0.08);
  });

  it("URL yang sama dan URL eksternal tidak memicu navigasi internal", () => {
    render(app());
    act(() => {
      navigation.navigate(window.location.href);
      navigation.navigate("https://example.com/list");
    });
    expect(router.push).not.toHaveBeenCalled();
    expect(navigation.pending).toBe(false);
  });

  it("perubahan query pada halaman yang sama tidak menampilkan loading bar halaman", () => {
    render(app());
    act(() => navigation.navigate("/list?page=2", false));
    expect(router.push).toHaveBeenCalledWith("/list?page=2", { scroll: false });
    expect(navigation.pending).toBe(false);
  });

  it("Back/Forward antar halaman memulai progress, perubahan query saja tidak", () => {
    render(app());
    act(() => {
      window.history.replaceState(null, "", "/list?page=2");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(navigation.pending).toBe(false);
    act(() => {
      window.history.replaceState(null, "", "/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(navigation.pending).toBe(true);
    expect(router.push).not.toHaveBeenCalled();
  });

  it("kesiapan menunggu dua frame render dan tidak selesai selama data belum siap", () => {
    const view = render(app(false, "/dashboard"));
    act(() => navigation.navigate("/dashboard"));
    frame();
    frame();
    expect(progress()).toBe(0.08);
    view.rerender(app(true, "/dashboard"));
    frame();
    expect(progress()).toBe(0.08);
    frame();
    expect(progress()).toBe(1);
  });

  it("frame kesiapan dibatalkan jika data kembali belum siap", () => {
    const view = render(app(false, "/dashboard"));
    act(() => navigation.navigate("/dashboard"));
    view.rerender(app(true, "/dashboard"));
    frame();
    view.rerender(app(false, "/dashboard"));
    frame();
    expect(progress()).toBe(0.08);
    expect(frames.size).toBe(0);
  });

  it("PageReady memakai pathname browser ketika path tidak diberikan", () => {
    const view = render(app());
    act(() => navigation.navigate("/dashboard"));
    window.history.replaceState(null, "", "/dashboard");
    view.rerender(
      <NavigationProgressProvider>
        <Screen />
        <PageReady />
      </NavigationProgressProvider>,
    );
    frame();
    frame();
    expect(progress()).toBe(1);
  });

  it("unmount membersihkan interval, frame, dan listener Back/Forward", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const view = render(app(true, "/dashboard"));
    act(() => navigation.navigate("/dashboard"));
    frame();
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(frames.size).toBe(0);
    expect(remove).toHaveBeenCalledWith("popstate", expect.any(Function));
  });

  it("hook tanpa provider memberikan error yang jelas", () => {
    expect(() => render(<Screen />)).toThrow("NavigationProgressProvider is required.");
  });
});
