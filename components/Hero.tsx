"use client";

import { useRef, useEffect, useState } from "react";
import SplitType from "split-type";
import { ArrowDown } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useProjectInquiryModal } from "@/components/ProjectInquiryContext";

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE HERO — Static scene with background poster, no video scrub
// ─────────────────────────────────────────────────────────────────────────────
function MobileHero({ openModal }: { openModal: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered entrance for all mobile scene blocks
      gsap.fromTo(
        ".m-scene",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.15,
          delay: 0.2,
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-background overflow-hidden flex flex-col"
    >
      {/* Background: poster image with gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-poster.jpg')" }}
        aria-hidden
      />
      {/* Dark overlays */}
      <div className="absolute inset-0 bg-[#050507]/70" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/60 via-transparent to-[#050507]" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,5,7,0.7)_100%)]" aria-hidden />

      {/* ─── Main hero content ─── */}
      <div className="relative z-10 flex flex-col flex-1 justify-end px-6 pb-16 pt-32">

        {/* Primary headline */}
        <div className="m-scene mb-8">
          <h1 className="font-geist text-[clamp(2.6rem,13vw,5rem)] font-medium leading-[0.92] tracking-tight text-text">
            <span className="block overflow-hidden">WE DON&apos;T BUILD</span>
            <span className="block overflow-hidden">WE CREATE</span>
            <span className="block overflow-hidden">
              <span className="gradient-text">DIGITAL EXPERIENCES</span>
            </span>
          </h1>
        </div>

        {/* Description + CTA */}
        <div className="m-scene mb-12">
          <p className="text-sm text-muted leading-relaxed mb-6 max-w-xs">
            A2 Production is a creative digital agency crafting brands, products,
            and motion for companies who refuse to blend in.
          </p>
          <MagneticButton onClick={openModal}>Start a Project</MagneticButton>
        </div>
      </div>

      {/* ─── Scene cards below hero fold ─── */}
      <div className="relative z-10 bg-background px-6 py-14 flex flex-col gap-16">

        {/* Scene 2 */}
        <div className="m-scene">
          <h2 className="font-geist text-[clamp(2rem,10vw,3.5rem)] font-medium leading-[0.95] tracking-tight text-text">
            <span className="block">EVERY IDEA</span>
            <span className="block">BEGINS</span>
            <span className="block text-white/40">IN SILENCE.</span>
          </h2>
        </div>

        {/* Scene 3 */}
        <div className="m-scene border-t border-white/5 pt-12">
          <h2 className="font-geist text-[clamp(2rem,10vw,3.5rem)] font-medium leading-[0.95] tracking-tight text-text">
            <span className="block">WHERE OTHERS</span>
            <span className="block text-white/40">SEE DARKNESS,</span>
            <span className="block mt-3">WE SEE</span>
            <span className="block">
              <span className="gradient-text">INFINITE POSSIBILITIES.</span>
            </span>
          </h2>
        </div>

        {/* Scene 4 — Quote */}
        <div className="m-scene border-t border-white/5 pt-12">
          <h2 className="font-geist text-[clamp(2rem,10vw,3.5rem)] font-medium leading-[0.95] tracking-tight text-text">
            <span className="block">ANTI</span>
            <span className="block">GRAVITY</span>
          </h2>
          <p className="mt-5 font-inter text-base font-light tracking-wide text-slate-300/70 leading-relaxed">
            &ldquo;When gravity ends,{" "}
            <span className="italic font-normal text-white/90">creativity begins.</span>
            &rdquo;
          </p>
        </div>

        {/* Scene 5 */}
        <div className="m-scene border-t border-white/5 pt-12">
          <h2 className="font-geist text-[clamp(2rem,10vw,3.5rem)] font-medium leading-[0.95] tracking-tight text-text">
            <span className="block">EVERY PIXEL.</span>
            <span className="block">EVERY MOTION.</span>
            <span className="block">EVERY DETAIL.</span>
          </h2>
          <p className="mt-4 font-inter text-xs font-light tracking-[0.2em] uppercase text-white/30">
            Crafted With Intention.
          </p>
        </div>

        {/* Scene 6 — Final CTA */}
        <div className="m-scene border-t border-white/5 pt-12 pb-4">
          <h2 className="font-geist text-[clamp(2rem,10vw,3.5rem)] font-medium leading-[0.95] tracking-tight text-text">
            <span className="block">
              <span className="gradient-text">A2 PRODUCTION</span>
            </span>
            <span className="block text-white/40">BEYOND VISION.</span>
            <span className="block text-white/40">BEYOND LIMITS.</span>
          </h2>
          <div className="mt-8">
            <MagneticButton onClick={openModal}>Start a Project</MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP HERO — Full scroll-scrubbed video experience (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
function DesktopHero({ openModal }: { openModal: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const scenesRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const video = videoRef.current;
      const section = sectionRef.current;
      const heading = headingRef.current;
      if (!video || !section || !heading) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const split = new SplitType(heading, {
        types: "words,chars",
        tagName: "span",
      });

      // --- Reduced motion fallback ---
      if (prefersReducedMotion) {
        gsap.set(heading, { opacity: 1 });
        gsap.set(split.chars ?? [], {
          opacity: 1,
          yPercent: 0,
          rotateZ: 0,
          filter: "blur(0px)",
        });
        gsap.set([introRef.current, scrollCueRef.current], {
          opacity: 1,
          y: 0,
        });
        return () => split.revert();
      }

      // --- Entrance: Gravitational Pull ---
      const chars = split.chars ?? [];
      gsap.set(chars, {
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
        display: "inline-block",
      });

      const entrance = gsap.timeline({ delay: 0.15 });
      entrance
        .set(heading, { opacity: 1 })
        .fromTo(
          chars,
          {
            opacity: 0,
            scale: 1.8,
            yPercent: -100,
            rotateZ: (i: number) => (i % 2 === 0 ? -12 : 12),
            transformOrigin: "50% 50%",
          },
          {
            opacity: 1,
            scale: 1,
            yPercent: 0,
            rotateZ: 0,
            duration: 1.1,
            ease: "power4.out",
            stagger: { each: 0.014, from: "center" },
            clearProps: "willChange,backfaceVisibility",
          }
        )
        .fromTo(
          introRef.current,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
          "-=0.5"
        )
        .fromTo(
          scrollCueRef.current,
          { y: -10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        );

      // --- Scroll-scrubbed video & scenes timeline ---
      video.pause();

      const mm = gsap.matchMedia();
      const initScrub = () => {
        mm.add(
          { desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" },
          (context) => {
            const { desktop } = context.conditions as { desktop: boolean };
            if (!desktop) {
              video.play().catch(() => {});
              return () => { video.pause(); };
            }

            video.pause();
            const targetObj = { time: 0 };
            let lastSeekTime = -1;

            const updateVideoFrame = () => {
              if (
                video &&
                video.readyState >= 1 &&
                !isNaN(video.duration) &&
                video.duration > 0
              ) {
                const targetTime = targetObj.time;
                if (
                  Math.abs(targetTime - lastSeekTime) > 0.015 &&
                  !video.seeking
                ) {
                  lastSeekTime = targetTime;
                  video.currentTime = targetTime;
                }
              }
            };

            const videoDur = video.duration
              ? Math.max(video.duration - 0.05, 0)
              : 20;

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "+=400%",
                scrub: 0.4,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: updateVideoFrame,
              },
            });

            tl.to(
              targetObj,
              { time: videoDur, ease: "none", duration: 10, onUpdate: updateVideoFrame },
              0
            );

            const scenes = scenesRef.current;

            if (scrollCueRef.current) {
              tl.to(scrollCueRef.current, { opacity: 0, y: -15, duration: 0.4 }, 0.1);
            }
            if (scenes[0]) {
              tl.to(scenes[0], { opacity: 0, y: -25, duration: 0.6, ease: "power2.in" }, 1.2);
            }
            if (scenes[1]) {
              tl.fromTo(scenes[1], { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 1.8)
                .to(scenes[1], { opacity: 0, y: -25, duration: 0.6, ease: "power2.in" }, 3.2);
            }
            if (scenes[2]) {
              tl.fromTo(scenes[2], { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 3.8)
                .to(scenes[2], { opacity: 0, y: -25, duration: 0.6, ease: "power2.in" }, 5.2);
            }
            if (scenes[3]) {
              tl.fromTo(scenes[3], { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 5.8)
                .to(scenes[3], { opacity: 0, y: -25, duration: 0.6, ease: "power2.in" }, 7.2);
            }
            if (scenes[4]) {
              tl.fromTo(scenes[4], { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 7.8)
                .to(scenes[4], { opacity: 0, y: -25, duration: 0.6, ease: "power2.in" }, 9.0);
            }
            if (scenes[5]) {
              tl.fromTo(scenes[5], { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 9.5);
            }

            return () => { tl.kill(); };
          }
        );
      };

      let scrubInitialized = false;
      const safeInitScrub = () => {
        if (scrubInitialized) return;
        scrubInitialized = true;
        initScrub();
      };

      if (video.readyState >= 1) {
        safeInitScrub();
      } else {
        video.addEventListener("loadedmetadata", safeInitScrub, { once: true });
        video.addEventListener("loadeddata", safeInitScrub, { once: true });
        video.addEventListener("canplay", safeInitScrub, { once: true });
      }

      return () => {
        video.removeEventListener("loadedmetadata", safeInitScrub);
        video.removeEventListener("loadeddata", safeInitScrub);
        video.removeEventListener("canplay", safeInitScrub);
        mm.revert();
        split.revert();
      };
    },
    { scope: sectionRef }
  );

  const sceneBase =
    "absolute inset-0 z-10 flex flex-col justify-end px-6 pb-20 md:px-14 md:pb-24 lg:px-20 pointer-events-none";
  const headlineBase =
    "max-w-5xl font-geist text-[clamp(2.75rem,10vw,7rem)] font-medium leading-[0.95] tracking-tight text-text";
  const line = "block overflow-hidden text-shadow-premium";

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-background"
      aria-label="A2 Production — Crafting Digital Experiences That Inspire"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover transform-gpu filter-[brightness(0.88)_contrast(1.05)] translate-z-0"
        muted
        playsInline
        autoPlay
        loop
        preload="auto"
        poster="/images/hero-poster.jpg"
        aria-hidden
      >
        <source src="/videos/gargantua-scrub.mp4" type="video/mp4" />
        <source src="/videos/gargantua-scrub.webm" type="video/webm" />
      </video>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,7,13,0.5)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-[#05070d] via-[#05070d]/60 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#05070d]/40 via-transparent to-transparent" />

      {/* Scene 1 */}
      <div
        ref={(el) => { scenesRef.current[0] = el; }}
        className={`${sceneBase} pointer-events-auto`}
      >
        <h1
          ref={headingRef}
          aria-label="We don't build. We create digital experiences."
          className={`${headlineBase} opacity-0`}
        >
          <span aria-hidden className={line}>WE DON&apos;T BUILD</span>
          <span aria-hidden className={line}>WE CREATE</span>
          <span aria-hidden className="block overflow-hidden">
            <span className="gradient-text">DIGITAL EXPERIENCES</span>
          </span>
        </h1>
        <div
          ref={introRef}
          className="mt-8 flex flex-col gap-8 opacity-0 md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-md text-base text-muted text-shadow-premium md:text-lg">
            A2 Production is a creative digital agency crafting brands,
            products, and motion for companies who refuse to blend in.
          </p>
          <MagneticButton onClick={openModal}>Start a Project</MagneticButton>
        </div>
      </div>

      {/* Scene 2 */}
      <div
        ref={(el) => { scenesRef.current[1] = el; }}
        className={sceneBase}
        style={{ opacity: 0, willChange: "transform, opacity, filter" }}
      >
        <div className={headlineBase}>
          <span className={line}>EVERY IDEA</span>
          <span className={line}>BEGINS</span>
          <span className="block overflow-hidden text-white/50 text-shadow-premium">IN SILENCE.</span>
        </div>
      </div>

      {/* Scene 3 */}
      <div
        ref={(el) => { scenesRef.current[2] = el; }}
        className={sceneBase}
        style={{ opacity: 0, willChange: "transform, opacity, filter" }}
      >
        <div className={headlineBase}>
          <span className={line}>WHERE OTHERS</span>
          <span className="block overflow-hidden text-white/50 text-shadow-premium">SEE DARKNESS,</span>
          <span className={`${line} mt-4 md:mt-6`}>WE SEE</span>
          <span className="block overflow-hidden">
            <span className="gradient-text">INFINITE POSSIBILITIES.</span>
          </span>
        </div>
      </div>

      {/* Scene 4 */}
      <div
        ref={(el) => { scenesRef.current[3] = el; }}
        className={sceneBase}
        style={{ opacity: 0, willChange: "transform, opacity, filter" }}
      >
        <div className={headlineBase}>
          <span className={line}>ANTI</span>
          <span className={line}>GRAVITY</span>
        </div>
        <p className="mt-8 max-w-xl font-inter text-lg font-light tracking-wide text-slate-300/80 text-shadow-premium md:text-2xl">
          &ldquo;When gravity ends,{" "}
          <span className="italic font-normal text-white/90">creativity begins.</span>
          &rdquo;
        </p>
      </div>

      {/* Scene 5 */}
      <div
        ref={(el) => { scenesRef.current[4] = el; }}
        className={sceneBase}
        style={{ opacity: 0, willChange: "transform, opacity, filter" }}
      >
        <div className={headlineBase}>
          <span className={line}>EVERY PIXEL.</span>
          <span className={line}>EVERY MOTION.</span>
          <span className={line}>EVERY DETAIL.</span>
        </div>
        <p className="mt-8 font-inter text-lg font-light tracking-[0.15em] uppercase text-white/40 text-shadow-premium md:text-2xl">
          Crafted With Intention.
        </p>
      </div>

      {/* Scene 6 */}
      <div
        ref={(el) => { scenesRef.current[5] = el; }}
        className={`${sceneBase} pointer-events-auto`}
        style={{ opacity: 0, willChange: "transform, opacity, filter" }}
      >
        <div className={headlineBase}>
          <span className="block overflow-hidden">
            <span className="gradient-text">A2 PRODUCTION</span>
          </span>
          <span className="block overflow-hidden text-white/50 text-shadow-premium">BEYOND VISION.</span>
          <span className="block overflow-hidden text-white/50 text-shadow-premium">BEYOND LIMITS.</span>
        </div>
        <div className="mt-10">
          <MagneticButton onClick={openModal}>Start a Project</MagneticButton>
        </div>
      </div>

      {/* Scroll Cue */}
      <div
        ref={scrollCueRef}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 font-poppins text-xs uppercase tracking-[0.3em] text-muted opacity-0"
      >
        <span>Scroll</span>
        <ArrowDown className="h-4 w-4 animate-bounce" strokeWidth={1.5} />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO — Renders mobile or desktop version based on screen size
// ─────────────────────────────────────────────────────────────────────────────
export function Hero() {
  const { openModal } = useProjectInquiryModal();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Avoid SSR mismatch — render nothing until we know device
  if (isMobile === null) {
    return (
      <div className="relative h-screen w-full bg-background" aria-hidden />
    );
  }

  return isMobile ? (
    <MobileHero openModal={openModal} />
  ) : (
    <DesktopHero openModal={openModal} />
  );
}
