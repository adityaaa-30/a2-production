"use client";

import { useRef } from "react";
import SplitType from "split-type";
import { ArrowDown } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function Hero() {
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

      // --- Entrance: Gravitational Pull (60 FPS GPU-accelerated) ---
      const chars = split.chars ?? [];

      // Promote character spans to dedicated GPU hardware layers
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
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
          },
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
              // Mobile: simple autoplay
              video.play().catch(() => {});
              return () => {
                video.pause();
              };
            }

            // --- DESKTOP HIGH-PERFORMANCE SCRUB ---
            video.pause();
            const targetObj = { time: 0 };
            let lastSeekTime = -1;

            // Ultra-lightweight video frame updater (no RAF loop contention)
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

            // Synchronize video timeline
            tl.to(
              targetObj,
              {
                time: videoDur,
                ease: "none",
                duration: 10,
                onUpdate: updateVideoFrame,
              },
              0
            );

            const scenes = scenesRef.current;

            // Scroll cue fades out early
            if (scrollCueRef.current) {
              tl.to(
                scrollCueRef.current,
                { opacity: 0, y: -15, duration: 0.4 },
                0.1
              );
            }

            // Scene 1: WE DON'T BUILD -> fades out
            if (scenes[0]) {
              tl.to(
                scenes[0],
                {
                  opacity: 0,
                  y: -25,
                  duration: 0.6,
                  ease: "power2.in",
                },
                1.2
              );
            }

            // Scene 2: EVERY IDEA BEGINS IN SILENCE
            if (scenes[1]) {
              tl.fromTo(
                scenes[1],
                { opacity: 0, y: 25 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  ease: "power2.out",
                },
                1.8
              ).to(
                scenes[1],
                {
                  opacity: 0,
                  y: -25,
                  duration: 0.6,
                  ease: "power2.in",
                },
                3.2
              );
            }

            // Scene 3: WHERE OTHERS SEE DARKNESS...
            if (scenes[2]) {
              tl.fromTo(
                scenes[2],
                { opacity: 0, y: 25 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  ease: "power2.out",
                },
                3.8
              ).to(
                scenes[2],
                {
                  opacity: 0,
                  y: -25,
                  duration: 0.6,
                  ease: "power2.in",
                },
                5.2
              );
            }

            // Scene 4: ANTI GRAVITY
            if (scenes[3]) {
              tl.fromTo(
                scenes[3],
                { opacity: 0, y: 25 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  ease: "power2.out",
                },
                5.8
              ).to(
                scenes[3],
                {
                  opacity: 0,
                  y: -25,
                  duration: 0.6,
                  ease: "power2.in",
                },
                7.2
              );
            }

            // Scene 5: EVERY PIXEL...
            if (scenes[4]) {
              tl.fromTo(
                scenes[4],
                { opacity: 0, y: 25 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  ease: "power2.out",
                },
                7.8
              ).to(
                scenes[4],
                {
                  opacity: 0,
                  y: -25,
                  duration: 0.6,
                  ease: "power2.in",
                },
                9.0
              );
            }

            // Scene 6: A2 PRODUCTION -> Final CTA scene
            if (scenes[5]) {
              tl.fromTo(
                scenes[5],
                { opacity: 0, y: 25 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  ease: "power2.out",
                },
                9.5
              );
            }

            return () => {
              tl.kill();
            };
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
        video.addEventListener("loadedmetadata", safeInitScrub, {
          once: true,
        });
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

  // ── Shared typography styles for seamless title sequence feel ──
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
      {/* ── Background Video (Razor sharp Full HD rendering) ── */}
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

      {/* ── Soft Cinematic Scrims (Lightened to preserve video clarity & detail) ── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,7,13,0.5)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-[#05070d] via-[#05070d]/60 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#05070d]/40 via-transparent to-transparent" />

      {/* ────────────────────────────────────────────────────────────
          SCENE 1 — WE DON'T BUILD / WE CREATE / DIGITAL EXPERIENCES
          ──────────────────────────────────────────────────────────── */}
      <div
        ref={(el) => {
          scenesRef.current[0] = el;
        }}
        className={`${sceneBase} pointer-events-auto`}
      >
        <h1
          ref={headingRef}
          aria-label="We don't build. We create digital experiences."
          className={`${headlineBase} opacity-0`}
        >
          <span aria-hidden className={line}>
            WE DON&apos;T BUILD
          </span>
          <span aria-hidden className={line}>
            WE CREATE
          </span>
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
          <MagneticButton>Start a Project</MagneticButton>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          SCENE 2 — EVERY IDEA / BEGINS / IN SILENCE.
          ──────────────────────────────────────────────────────────── */}
      <div
        ref={(el) => {
          scenesRef.current[1] = el;
        }}
        className={sceneBase}
        style={{ opacity: 0, willChange: "transform, opacity, filter" }}
      >
        <div className={headlineBase}>
          <span className={line}>EVERY IDEA</span>
          <span className={line}>BEGINS</span>
          <span className="block overflow-hidden text-white/50 text-shadow-premium">
            IN SILENCE.
          </span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          SCENE 3 — WHERE OTHERS SEE DARKNESS / INFINITE POSSIBILITIES
          ──────────────────────────────────────────────────────────── */}
      <div
        ref={(el) => {
          scenesRef.current[2] = el;
        }}
        className={sceneBase}
        style={{ opacity: 0, willChange: "transform, opacity, filter" }}
      >
        <div className={headlineBase}>
          <span className={line}>WHERE OTHERS</span>
          <span className="block overflow-hidden text-white/50 text-shadow-premium">
            SEE DARKNESS,
          </span>
          <span className={`${line} mt-4 md:mt-6`}>WE SEE</span>
          <span className="block overflow-hidden">
            <span className="gradient-text">INFINITE POSSIBILITIES.</span>
          </span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          SCENE 4 — ANTI / GRAVITY
          ──────────────────────────────────────────────────────────── */}
      <div
        ref={(el) => {
          scenesRef.current[3] = el;
        }}
        className={sceneBase}
        style={{ opacity: 0, willChange: "transform, opacity, filter" }}
      >
        <div className={headlineBase}>
          <span className={line}>ANTI</span>
          <span className={line}>GRAVITY</span>
        </div>
        <p className="mt-8 max-w-xl font-inter text-lg font-light tracking-wide text-slate-300/80 text-shadow-premium md:text-2xl">
          &ldquo;When gravity ends,{" "}
          <span className="italic font-normal text-white/90">
            creativity begins.
          </span>
          &rdquo;
        </p>
      </div>

      {/* ────────────────────────────────────────────────────────────
          SCENE 5 — EVERY PIXEL / EVERY MOTION / EVERY DETAIL
          ──────────────────────────────────────────────────────────── */}
      <div
        ref={(el) => {
          scenesRef.current[4] = el;
        }}
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

      {/* ────────────────────────────────────────────────────────────
          SCENE 6 — A2 PRODUCTION / BEYOND VISION / BEYOND LIMITS
          ──────────────────────────────────────────────────────────── */}
      <div
        ref={(el) => {
          scenesRef.current[5] = el;
        }}
        className={`${sceneBase} pointer-events-auto`}
        style={{ opacity: 0, willChange: "transform, opacity, filter" }}
      >
        <div className={headlineBase}>
          <span className="block overflow-hidden">
            <span className="gradient-text">A2 PRODUCTION</span>
          </span>
          <span className="block overflow-hidden text-white/50 text-shadow-premium">
            BEYOND VISION.
          </span>
          <span className="block overflow-hidden text-white/50 text-shadow-premium">
            BEYOND LIMITS.
          </span>
        </div>
        <div className="mt-10">
          <MagneticButton>Start a Project</MagneticButton>
        </div>
      </div>

      {/* ── Scroll Cue ── */}
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
