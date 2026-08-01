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

      // --- Reduced motion: show everything instantly, no pin, no scrub ---
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

      // --- Entrance: mask-reveal the headline, then the supporting copy ---
      const entrance = gsap.timeline({ delay: 0.35 });

      entrance
        .set(heading, { opacity: 1 })
        .fromTo(
          split.chars ?? [],
          { yPercent: 130, rotateZ: 6, filter: "blur(14px)", opacity: 0 },
          {
            yPercent: 0,
            rotateZ: 0,
            filter: "blur(0px)",
            opacity: 1,
            duration: 1.1,
            ease: "power4.out",
            stagger: { each: 0.014, from: "start" },
          }
        )
        .fromTo(
          introRef.current,
          { y: 24, opacity: 0, filter: "blur(6px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
          },
          "-=0.6"
        )
        .fromTo(
          scrollCueRef.current,
          { y: -12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
          "-=0.4"
        );

      // --- Scroll-scrubbed cinematic playback ---
      video.pause();

      const mm = gsap.matchMedia();

      const initScrub = () => {
        mm.add(
          { desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" },
          (context) => {
            const { desktop } = context.conditions as { desktop: boolean };

            if (!desktop) {
              // --- MOBILE ONLY: smooth native scrolling, zero pin lag, background autoplay ---
              video.play().catch(() => {});
              return () => {
                video.pause();
              };
            }

            // --- DESKTOP ONLY: PC stays 100% same to same ---
            video.pause();
            const targetObj = { time: 0 };
            let reqId: number;

            const updateVideoFrame = () => {
              if (video && !isNaN(video.duration) && video.duration > 0) {
                const targetTime = targetObj.time;
                if (!video.seeking && Math.abs(video.currentTime - targetTime) > 0.01) {
                  video.currentTime = targetTime;
                }
              }
            };

            const trigger = gsap.to(targetObj, {
              time: () => (video.duration ? Math.max(video.duration - 0.05, 0) : 20),
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "+=400%",
                scrub: 0.5,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: () => {
                  updateVideoFrame();
                },
              },
            });

            const rafLoop = () => {
              updateVideoFrame();
              reqId = requestAnimationFrame(rafLoop);
            };
            reqId = requestAnimationFrame(rafLoop);

            const onSeeked = () => {
              if (video && !isNaN(targetObj.time)) {
                if (Math.abs(video.currentTime - targetObj.time) > 0.02) {
                  video.currentTime = targetObj.time;
                }
              }
            };
            video.addEventListener("seeked", onSeeked);

            return () => {
              trigger.kill();
              if (reqId) cancelAnimationFrame(reqId);
              video.removeEventListener("seeked", onSeeked);
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
        video.addEventListener("loadedmetadata", safeInitScrub, { once: true });
        video.addEventListener("loadeddata", safeInitScrub, { once: true });
        video.addEventListener("canplay", safeInitScrub, { once: true });
      }

      // --- Subtle mouse parallax on the headline ---
      const quickX = gsap.quickTo(heading, "x", {
        duration: 0.8,
        ease: "power3.out",
      });
      const quickY = gsap.quickTo(heading, "y", {
        duration: 0.8,
        ease: "power3.out",
      });

      const handleMouseMove = (e: MouseEvent) => {
        const relX = (e.clientX / window.innerWidth - 0.5) * 18;
        const relY = (e.clientY / window.innerHeight - 0.5) * 12;
        quickX(relX);
        quickY(relY);
      };

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        video.removeEventListener("loadedmetadata", safeInitScrub);
        video.removeEventListener("loadeddata", safeInitScrub);
        video.removeEventListener("canplay", safeInitScrub);
        mm.revert();
        split.revert();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-background"
      aria-label="A2 Production — Crafting Digital Experiences That Inspire"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover md:[filter:brightness(0.55)_contrast(1.15)_saturate(1.05)]"
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

      {/* Layered scrim: vignette so the frame reads cinematic at any point
          in the scrub, plus a dedicated dark pool behind the copy block so
          legibility never depends on how bright a given video frame is. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(5,7,13,0.75)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#05070d] via-[#05070d]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#05070d]/70 via-transparent to-transparent" />
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.05]" />

      <div className="relative z-10 flex h-full w-full flex-col justify-end px-6 pb-20 md:px-14 md:pb-24 lg:px-20">
        <h1
          ref={headingRef}
          aria-label="We don't build. We create digital experiences."
          className="max-w-5xl font-geist text-[clamp(2.75rem,10vw,7rem)] font-medium leading-[0.95] tracking-tight text-text opacity-0"
        >
          <span
            aria-hidden
            className="block overflow-hidden text-shadow-premium"
          >
            WE DON&apos;T BUILD
          </span>
          <span
            aria-hidden
            className="block overflow-hidden text-shadow-premium"
          >
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
