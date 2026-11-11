"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Signal to CSS that JS is running — enables .reveal-up hidden state
    // so content is never permanently invisible if GSAP fires late/fails
    document.body.classList.add("js-ready");

    // Keep admin tools on native scrolling. Lenis' frame-by-frame wheel
    // interpolation makes long, form-heavy admin pages feel delayed.
    if (pathname === "/admin" || pathname.startsWith("/admin/")) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    let lenis: Lenis | null = null;
    let firstHashFrame = 0;
    let secondHashFrame = 0;

    const jumpToHash = () => {
      const rawId = window.location.hash.slice(1);
      if (!rawId) return;

      let id = rawId;
      try {
        id = decodeURIComponent(rawId);
      } catch {
        // Keep the raw fragment when it is not valid URI encoding.
      }

      const target = document.getElementById(id);
      if (!target) return;

      if (lenis) {
        lenis.scrollTo(target, { offset: -96, immediate: true, force: true });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo(0, top);
      }
    };

    const scheduleHashJump = () => {
      if (!window.location.hash) return;
      // Wait for hydration and the smooth-scroll instance before resolving a cross-page fragment.
      firstHashFrame = window.requestAnimationFrame(() => {
        secondHashFrame = window.requestAnimationFrame(jumpToHash);
      });
    };

    const cancelHashJump = () => {
      window.cancelAnimationFrame(firstHashFrame);
      window.cancelAnimationFrame(secondHashFrame);
    };

    // Keep native scrolling for reduced-motion users; otherwise use Lenis across the full page.
    if (prefersReducedMotion) {
      scheduleHashJump();
      return cancelHashJump;
    }

    const smoothScroller = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: isMobile,
    });
    lenis = smoothScroller;

    // Keep ScrollTrigger's internal scroll position in sync with Lenis on every frame.
    smoothScroller.on("scroll", ScrollTrigger.update);

    function raf(time: number) {
      smoothScroller.raf(time * 1000);
    }

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    scheduleHashJump();

    return () => {
      cancelHashJump();
      gsap.ticker.remove(raf);
      smoothScroller.destroy();
    };
  }, [pathname]);

  return <>{children}</>;
}
