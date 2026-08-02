"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import SplitType from "split-type";
import { ArrowDown } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useProjectInquiryModal } from "@/components/ProjectInquiryContext";

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE HERO — Fullscreen cinematic video with auto-cycling scenes
// ─────────────────────────────────────────────────────────────────────────────

interface MobileScene {
  id: number;
  lines: { text: string; style?: string }[];
  subtitle?: string;
  showCta?: boolean;
}

const MOBILE_SCENES: MobileScene[] = [
  {
    id: 0,
    lines: [
      { text: "WE DON'T BUILD" },
      { text: "WE CREATE" },
      { text: "DIGITAL EXPERIENCES", style: "gradient-text" },
    ],
    subtitle:
      "A2 Production is a creative digital agency crafting brands, products, and motion for companies who refuse to blend in.",
    showCta: true,
  },
  {
    id: 1,
    lines: [
      { text: "EVERY IDEA" },
      { text: "BEGINS" },
      { text: "IN SILENCE.", style: "text-white/40" },
    ],
  },
  {
    id: 2,
    lines: [
      { text: "WHERE OTHERS" },
      { text: "SEE DARKNESS,", style: "text-white/40" },
      { text: "WE SEE" },
      { text: "INFINITE POSSIBILITIES.", style: "gradient-text" },
    ],
  },
  {
    id: 3,
    lines: [{ text: "ANTI" }, { text: "GRAVITY" }],
    subtitle: "\u201CWhen gravity ends, creativity begins.\u201D",
  },
  {
    id: 4,
    lines: [
      { text: "EVERY PIXEL." },
      { text: "EVERY MOTION." },
      { text: "EVERY DETAIL." },
    ],
    subtitle: "CRAFTED WITH INTENTION.",
  },
  {
    id: 5,
    lines: [
      { text: "A2 PRODUCTION", style: "gradient-text" },
      { text: "BEYOND VISION.", style: "text-white/50" },
      { text: "BEYOND LIMITS.", style: "text-white/50" },
    ],
    showCta: true,
  },
];

const SCENE_DURATION = 4000; // ms per scene

const sceneVariants = {
  enter: { opacity: 0, y: 30, filter: "blur(6px)" },
  center: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94] as any,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: "blur(4px)",
    transition: {
      duration: 0.5,
      ease: [0.55, 0.085, 0.68, 0.53] as any,
    },
  },
};

const lineVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as any } },
  exit: { opacity: 0 },
};

function MobileHero({ openModal }: { openModal: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  // Robust video autoplay for iOS Safari & Android Chrome
  const attemptPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setVideoReady(true))
        .catch(() => {
          // Autoplay blocked — poster image shows as fallback
          setVideoReady(false);
        });
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Try playing on multiple lifecycle events for maximum compatibility
    if (video.readyState >= 3) {
      attemptPlay();
    } else {
      video.addEventListener("canplay", attemptPlay, { once: true });
      video.addEventListener("loadeddata", attemptPlay, { once: true });
    }

    // iOS sometimes needs a user-gesture nudge on first load —
    // we also try on first touchstart as a safety net
    const touchHandler = () => {
      attemptPlay();
      document.removeEventListener("touchstart", touchHandler);
    };
    document.addEventListener("touchstart", touchHandler, { once: true, passive: true });

    return () => {
      video.removeEventListener("canplay", attemptPlay);
      video.removeEventListener("loadeddata", attemptPlay);
      document.removeEventListener("touchstart", touchHandler);
    };
  }, [attemptPlay]);

  // Auto-cycle scenes
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScene((prev) => (prev + 1) % MOBILE_SCENES.length);
    }, SCENE_DURATION);
    return () => clearInterval(timer);
  }, []);

  const scene = MOBILE_SCENES[activeScene];

  return (
    <section
      className="relative w-full overflow-hidden bg-background"
      style={{ height: "100svh", minHeight: "100dvh" }}
      aria-label="A2 Production — Crafting Digital Experiences That Inspire"
    >
      {/* ── Background Video with poster fallback ── */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: videoReady ? 1 : 0, transition: "opacity 0.8s ease" }}
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

      {/* Static poster fallback (visible when video hasn't loaded) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{
          backgroundImage: "url('/images/hero-poster.jpg')",
          opacity: videoReady ? 0 : 1,
        }}
        aria-hidden
      />

      {/* ── Cinematic overlays ── */}
      <div className="pointer-events-none absolute inset-0 bg-[#05070d]/60" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#05070d]/50 via-transparent to-[#05070d]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,7,13,0.7)_100%)]" aria-hidden />

      {/* ── Scene content ── */}
      <div
        className="relative z-10 flex h-full flex-col justify-end"
        style={{ padding: "env(safe-area-inset-top, 0px) 1.5rem calc(env(safe-area-inset-bottom, 0px) + 2.5rem) 1.5rem" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            variants={sceneVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col gap-5"
          >
            {/* Headline lines */}
            <h1 className="font-geist text-[clamp(2.4rem,11vw,4.5rem)] font-medium leading-[0.92] tracking-tight text-text">
              {scene.lines.map((line, i) => (
                <motion.span
                  key={i}
                  variants={lineVariants}
                  className={`block overflow-hidden ${line.style || ""}`}
                >
                  {line.text}
                </motion.span>
              ))}
            </h1>

            {/* Subtitle */}
            {scene.subtitle && (
              <motion.p
                variants={lineVariants}
                className="max-w-xs font-inter text-sm font-light leading-relaxed text-muted"
              >
                {scene.subtitle}
              </motion.p>
            )}

            {/* CTA */}
            {scene.showCta && (
              <motion.div variants={lineVariants} className="pt-2">
                <button
                  onClick={openModal}
                  className="w-full rounded-full bg-text py-4 px-8 text-sm font-medium tracking-wide text-background transition-all duration-300 active:scale-[0.97]"
                >
                  Start a Project
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Scene progress dots ── */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {MOBILE_SCENES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveScene(i)}
              aria-label={`Go to scene ${i + 1}`}
              className="group relative h-2 rounded-full transition-all duration-500"
              style={{ width: i === activeScene ? 24 : 8 }}
            >
              <span
                className="absolute inset-0 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: i === activeScene ? "#FF7A00" : "rgba(255,255,255,0.2)",
                }}
              />
              {i === activeScene && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-[#FF7A00]"
                  layoutId="scene-indicator"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
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
              tl.to(scenes[0], { opacity: 0, y: -25, pointerEvents: "none", duration: 0.6, ease: "power2.in" }, 1.2);
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
              tl.fromTo(scenes[5], { opacity: 0, y: 25 }, { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.6, ease: "power2.out" }, 9.5);
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
    "absolute inset-0 z-10 flex flex-col justify-end px-6 pb-20 md:px-14 md:pb-24 lg:px-20";
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
        className={`${sceneBase} pointer-events-none`}
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
        className={`${sceneBase} pointer-events-none`}
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
        className={`${sceneBase} pointer-events-none`}
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
        className={`${sceneBase} pointer-events-none`}
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
        className={`${sceneBase} pointer-events-none`}
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

  // Avoid SSR mismatch — render a minimal poster shell until JS confirms device type
  // Using a real visible placeholder (not aria-hidden) prevents blank screen on real mobile
  if (isMobile === null) {
    return (
      <div
        className="relative w-full bg-background"
        style={{
          height: "100svh",
          minHeight: "100dvh",
          backgroundImage: "url('/images/hero-poster.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#05070d]/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05070d]/50 via-transparent to-[#05070d]" />
      </div>
    );
  }

  return isMobile ? (
    <MobileHero openModal={openModal} />
  ) : (
    <DesktopHero openModal={openModal} />
  );
}
