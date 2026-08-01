"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MagneticButton } from "@/components/ui/MagneticButton";

interface SectionData {
  id: string;
  kicker: string;
  title: string;
  copy: string;
}

const SECTIONS: SectionData[] = [
  {
    id: "work",
    kicker: "Selected Work",
    title: "Case studies, coming into focus.",
    copy: "A curated set of brand, product, and motion work is being prepared for this space — built with the same restraint and craft as everything above the fold.",
  },
  {
    id: "services",
    kicker: "What We Do",
    title: "Brand. Product. Motion.",
    copy: "From identity systems to interactive launches, A2 Production designs and builds the digital experiences that make companies impossible to ignore.",
  },
  {
    id: "about",
    kicker: "The Studio",
    title: "A small team, obsessed with detail.",
    copy: "We're a close-knit collective of designers, engineers, and directors who believe the difference between good and unforgettable lives in the details.",
  },
  {
    id: "process",
    kicker: "How We Work",
    title: "Discovery. Design. Delivery.",
    copy: "Every engagement moves through the same disciplined arc — deep discovery, considered design, and a delivery process built for premium production quality.",
  },
];

export function Sections() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const targets = gsap.utils.toArray<HTMLElement>(".reveal-up");

      if (prefersReducedMotion) {
        gsap.set(targets, { opacity: 1, y: 0 });
        return;
      }

      targets.forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative bg-background">
      {SECTIONS.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className="relative mx-auto flex min-h-[70vh] w-full max-w-[1600px] flex-col justify-center border-t border-white/10 px-6 py-24 md:px-14 lg:px-20"
        >
          <div className="reveal-up flex flex-col gap-6 md:max-w-2xl">
            <span className="font-poppins text-xs uppercase tracking-[0.3em] text-accent">
              {String(index + 1).padStart(2, "0")} — {section.kicker}
            </span>
            <h2 className="font-geist text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.05] tracking-tight text-text">
              {section.title}
            </h2>
            <p className="max-w-lg text-base text-muted md:text-lg">
              {section.copy}
            </p>
          </div>
        </section>
      ))}

      <section
        id="contact"
        className="relative mx-auto flex min-h-[60vh] w-full max-w-[1600px] flex-col items-start justify-center gap-8 border-t border-white/10 px-6 py-24 md:px-14 lg:px-20"
      >
        <div className="reveal-up flex flex-col gap-6">
          <span className="font-poppins text-xs uppercase tracking-[0.3em] text-accent">
            05 — Contact
          </span>
          <h2 className="max-w-2xl font-geist text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.05] tracking-tight text-text">
            Let&apos;s build something that refuses to blend in.
          </h2>
          <MagneticButton>Start a Project</MagneticButton>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 md:px-14 lg:px-20">
        <p className="font-inter text-xs text-muted">
          © {new Date().getFullYear()} A2 Production. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
