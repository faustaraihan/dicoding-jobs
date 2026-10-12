"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface NavigationProgressContextValue {
  pending: boolean;
  generation: number;
  navigate: (href: string, scroll?: boolean) => void;
  reportReady: (pathname: string) => void;
}

const NavigationProgressContext = createContext<NavigationProgressContextValue | null>(null);

export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const currentPath = useRef("");
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generation, setGeneration] = useState(0);
  const navigation = useRef<{ pathname: string; finishing: boolean } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    currentPath.current = window.location.pathname;
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const begin = useCallback(
    (destination: string) => {
      clearTimers();
      currentPath.current = destination;
      navigation.current = { pathname: destination, finishing: false };
      setGeneration((previous) => previous + 1);
      setProgress(8);
      setVisible(true);
      // Estimated progress approaches 90%; only the destination can finish it.
      timers.current.push(
        setInterval(() => {
          setProgress((previous) => Math.min(90, previous + (90 - previous) * 0.12));
        }, 250),
      );
    },
    [clearTimers],
  );

  const reportReady = useCallback(
    (destination: string) => {
      const current = navigation.current;
      if (!current || current.pathname !== destination || current.finishing) return;
      current.finishing = true;
      clearTimers();
      setProgress(100);
      timers.current.push(
        setTimeout(() => {
          navigation.current = null;
          setVisible(false);
          timers.current = [];
        }, 200),
      );
    },
    [clearTimers],
  );

  const navigate = useCallback(
    (href: string, scroll = true) => {
      const destination = new URL(href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        destination.href === window.location.href
      )
        return;
      if (destination.pathname !== window.location.pathname) begin(destination.pathname);
      router.push(href, { scroll });
    },
    [router, begin],
  );

  useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname !== currentPath.current) begin(window.location.pathname);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [begin]);

  const context = useMemo(
    () => ({ pending: visible, generation, navigate, reportReady }),
    [visible, generation, navigate, reportReady],
  );

  return (
    <NavigationProgressContext.Provider value={context}>
      {children}
      {visible && (
        <div
          role="status"
          aria-label="Memuat halaman"
          className="pointer-events-none fixed top-0 right-0 left-0 z-60 h-0.75 overflow-hidden"
        >
          <div
            className="navigation-progress-bar h-full w-full origin-left bg-[#3b82f6]"
            style={{ animation: "none", transform: `scaleX(${progress / 100})` }}
          />
          <span className="sr-only">Memuat halaman...</span>
        </div>
      )}
    </NavigationProgressContext.Provider>
  );
}

export function useNavigationProgress() {
  const context = useContext(NavigationProgressContext);
  if (!context) throw new Error("NavigationProgressProvider is required.");
  return context;
}

export function usePageReady(ready: boolean, screenPath?: string) {
  const { reportReady, generation } = useNavigationProgress();
  useEffect(() => {
    if (!ready) return;
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() =>
        reportReady(screenPath ?? window.location.pathname),
      );
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [ready, screenPath, reportReady, generation]);
}

export function PageReady() {
  usePageReady(true);
  return null;
}
