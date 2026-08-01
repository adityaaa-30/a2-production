"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Sparkles, Orbit, Atom, Compass, Layers, ArrowDown } from "lucide-react";

interface MilestoneCard {
  id: string;
  number: string;
  quote: string;
  sub: string;
  tag: string;
  icon: typeof Orbit;
}

const CARDS: MilestoneCard[] = [
  {
    id: "card-1",
    number: "01",
    quote: "Before light...",
    sub: "there was imagination.",
    tag: "DIMENSION ZERO",
    icon: Sparkles,
  },
  {
    id: "card-2",
    number: "02",
    quote: "Every masterpiece",
    sub: "starts with a single idea.",
    tag: "GENESIS",
    icon: Atom,
  },
  {
    id: "card-3",
    number: "03",
    quote: "The universe expands.",
    sub: "So should your brand.",
    tag: "EXPANSION",
    icon: Orbit,
  },
  {
    id: "card-4",
    number: "04",
    quote: "The future isn't designed.",
    sub: "It's engineered.",
    tag: "ARCHITECTURE",
    icon: Compass,
  },
  {
    id: "card-5",
    number: "05",
    quote: "A2 Production",
    sub: "Crafting Tomorrow.",
    tag: "THE DESTINATION",
    icon: Layers,
  },
];

export function AntiGravity() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const antiRef = useRef<HTMLHeadingElement>(null);
  const gravityRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // 1. Particle Canvas Engine (Lightweight, 60 FPS Zero-G Ambient Dust)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const numParticles = window.innerWidth < 768 ? 25 : 55;
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.6,
      opacity: Math.random() * 0.5 + 0.15,
      speedY: -(Math.random() * 0.4 + 0.15),
      speedX: (Math.random() - 0.5) * 0.3,
      pulse: Math.random() * Math.PI,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulse += 0.02;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentOpacity = p.opacity + Math.sin(p.pulse) * 0.15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        // Soft ice-blue glow
        ctx.fillStyle = `rgba(186, 218, 255, ${Math.max(0.05, currentOpacity)})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. GSAP Animations & Interactive Scroll / Mouse Mechanics
  useGSAP(
    () => {
      const container = containerRef.current;
      const anti = antiRef.current;
      const gravity = gravityRef.current;
      const subtitle = subtitleRef.current;
      if (!container || !anti || !gravity) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // --- Title Letter Separation Scroll Scrub ---
      if (!prefersReducedMotion) {
        gsap.timeline({
          scrollTrigger: {
            trigger: titleContainerRef.current,
            start: "top 70%",
            end: "bottom 20%",
            scrub: 0.8,
          },
        })
          .to(anti, {
            letterSpacing: "0.22em",
            y: -30,
            opacity: 1,
            ease: "power2.out",
          })
          .to(
            gravity,
            {
              letterSpacing: "0.22em",
              y: 30,
              opacity: 1,
              ease: "power2.out",
            },
            "<"
          );

        // Subtitle reveal
        if (subtitle) {
          gsap.fromTo(
            subtitle,
            { opacity: 0, y: 30, filter: "blur(8px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: subtitle,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        // --- Continuous Weightless Floating Animations for Cards ---
        cardsRef.current.forEach((card, i) => {
          if (!card) return;

          // Scroll Entrance
          gsap.fromTo(
            card,
            {
              opacity: 0,
              y: 80 + i * 20,
              scale: 0.92,
              rotateX: 12,
              filter: "blur(12px)",
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotateX: 0,
              filter: "blur(0px)",
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );

          // Weightless Levitation (Sine Wave Bobbing)
          gsap.to(card, {
            y: i % 2 === 0 ? -16 : 16,
            rotateZ: i % 2 === 0 ? -1.5 : 1.5,
            duration: 4 + (i % 3) * 0.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.easeInOut",
            delay: i * 0.3,
          });
        });

        // --- Desktop Mouse 3D Parallax ---
        if (window.innerWidth >= 768) {
          const quickX = gsap.quickTo(titleContainerRef.current, "x", {
            duration: 1,
            ease: "power3.out",
          });
          const quickY = gsap.quickTo(titleContainerRef.current, "y", {
            duration: 1,
            ease: "power3.out",
          });

          const handleMouseMove = (e: MouseEvent) => {
            const relX = (e.clientX / window.innerWidth - 0.5) * 30;
            const relY = (e.clientY / window.innerHeight - 0.5) * 20;
            quickX(relX);
            quickY(relY);
          };

          window.addEventListener("mousemove", handleMouseMove);
          return () => window.removeEventListener("mousemove", handleMouseMove);
        }
      }
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-[#030509] py-32 text-white selection:bg-blue-500/30 selection:text-white"
      aria-label="Anti Gravity Experience — Entering Another Dimension"
    >
      {/* Background ambient particle canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
      />

      {/* Soft cinematic ambient radial lights (Deep void luxury, no neon) */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,rgba(14,165,233,0.03)_40%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.05)_0%,transparent_70%)] blur-3xl" />

      {/* Subtly floating ambient geometric glass rings */}
      <div className="pointer-events-none absolute top-1/4 left-10 h-72 w-72 rounded-full border border-white/[0.04] bg-white/[0.01] blur-sm md:left-24" />
      <div className="pointer-events-none absolute top-2/3 right-8 h-96 w-96 rounded-full border border-blue-400/[0.05] bg-blue-500/[0.01] blur-md md:right-28" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 md:px-14 lg:px-20">
        
        {/* --- Main Anti-Gravity Hero Header --- */}
        <div
          ref={titleContainerRef}
          className="flex flex-col items-center justify-center text-center pt-12 pb-24"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 backdrop-blur-md mb-8">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="font-poppins text-xs font-medium uppercase tracking-[0.35em] text-blue-200/80">
              ZERO-G DIMENSION
            </span>
          </div>

          <h2 className="font-geist font-bold leading-[0.88] tracking-normal text-white uppercase select-none">
            <span
              ref={antiRef}
              className="block text-[clamp(4.5rem,16vw,14rem)] bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent filter drop-shadow-[0_10px_30px_rgba(255,255,255,0.15)]"
            >
              ANTI
            </span>
            <span
              ref={gravityRef}
              className="block text-[clamp(4.5rem,16vw,14rem)] bg-gradient-to-b from-white/95 via-slate-200/70 to-slate-500/20 bg-clip-text text-transparent"
            >
              GRAVITY
            </span>
          </h2>

          <p
            ref={subtitleRef}
            className="mt-10 max-w-xl font-inter text-lg font-light tracking-wide text-slate-300/90 md:text-2xl"
          >
            &ldquo;When gravity ends, <br className="hidden sm:inline" />
            <span className="italic font-normal text-white">creativity begins.</span>&rdquo;
          </p>

          <div className="mt-12 flex flex-col items-center gap-2 text-slate-500 font-poppins text-xs uppercase tracking-[0.3em]">
            <span>Explore Dimension</span>
            <ArrowDown className="h-4 w-4 text-blue-400/80 animate-bounce" strokeWidth={1.5} />
          </div>
        </div>

        {/* --- Floating Glassmorphism Cards & Poetic Milestones --- */}
        <div className="mt-20 flex flex-col items-center gap-24 md:gap-32">
          {CARDS.map((card, index) => {
            const Icon = card.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={card.id}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className={`relative w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-shadow duration-500 hover:border-white/20 hover:shadow-[0_30px_70px_rgba(59,130,246,0.12)] ${
                  isEven ? "md:self-start md:ml-12 lg:ml-20" : "md:self-end md:mr-12 lg:mr-20"
                }`}
              >
                {/* Subtle glass reflection highlight */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-60" />

                <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <span className="font-poppins text-xs uppercase tracking-[0.3em] text-blue-400/90">
                      {card.tag}
                    </span>
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-geist text-xs text-slate-400">
                      <Icon className="h-3.5 w-3.5 text-blue-400" />
                      <span>{card.number}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-geist text-2xl font-medium tracking-tight text-white md:text-4xl">
                      {card.quote}
                    </h3>
                    <p className="font-inter text-lg font-light text-slate-300 md:text-2xl">
                      {card.sub}
                    </p>
                  </div>

                  {/* Aesthetic subtle bottom bar */}
                  <div className="mt-4 h-[1px] w-full bg-gradient-to-r from-blue-500/30 via-white/10 to-transparent" />
                </div>
              </div>
            );
          })}
        </div>

        {/* --- Closing Cinematic Badge --- */}
        <div className="mt-32 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-[1px] bg-gradient-to-b from-blue-400/60 to-transparent mb-8 animate-pulse" />
          <p className="font-poppins text-xs uppercase tracking-[0.4em] text-slate-400">
            A2 PRODUCTION &bull; BEYOND THE HORIZON
          </p>
        </div>

      </div>
    </section>
  );
}
