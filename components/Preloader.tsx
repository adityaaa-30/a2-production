"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_MESSAGES = [
  "Initializing Gravity",
  "Bending Light",
  "Calibrating Space-Time",
  "Entering Event Horizon",
  "Preparing Visual Experience",
];

const CRITICAL_ASSETS = [
  "/images/a2-brand-logo.png",
  "/images/hero-poster.jpg",
  "/images/team/akash.png",
  "/images/team/abhishek.jpg",
  "/images/team/aditya.png",
];

const CRITICAL_VIDEO = "/videos/gargantua-scrub.mp4";

export function Preloader() {
  const [phase, setPhase] = useState<"singularity" | "blackhole" | "falling" | "complete">("singularity");
  const [statusIndex, setStatusIndex] = useState(0);
  const [statusText, setStatusText] = useState(STATUS_MESSAGES[0]);
  const [showOptimizing, setShowOptimizing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const isLoadedRef = useRef(false);

  // 1. Asset loading tracking
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    document.body.style.overflow = "hidden";

    // Session cache check
    const hasLoaded = sessionStorage.getItem("a2_gargantua_preloader_seen");
    if (hasLoaded) {
      document.body.style.overflow = "";
      setPhase("complete");
      return;
    }

    let loadedCount = 0;
    const totalItems = CRITICAL_ASSETS.length + 2 + 1; // assets + fonts + video + load event

    const onItemLoaded = () => {
      loadedCount++;
      const pct = Math.min(loadedCount / totalItems, 1);
      progressRef.current = Math.max(progressRef.current, pct);

      if (progressRef.current >= 1 && !isLoadedRef.current) {
        isLoadedRef.current = true;
        // Move to falling warp sequence after slight hold
        setTimeout(() => {
          setPhase("falling");
        }, 400);
      }
    };

    // Preload images
    CRITICAL_ASSETS.forEach((src) => {
      const img = new Image();
      img.src = src;
      if (img.complete) onItemLoaded();
      else {
        img.onload = onItemLoaded;
        img.onerror = onItemLoaded;
      }
    });

    // Fonts
    if (document.fonts) {
      document.fonts.ready.then(onItemLoaded).catch(onItemLoaded);
    } else {
      onItemLoaded();
    }

    // Window load
    if (document.readyState === "complete") onItemLoaded();
    else window.addEventListener("load", onItemLoaded, { once: true });

    // Video metadata / first frame
    const video = document.createElement("video");
    video.src = CRITICAL_VIDEO;
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    if (video.readyState >= 1) onItemLoaded();
    else {
      video.onloadeddata = onItemLoaded;
      video.onerror = onItemLoaded;
    }

    // 8-Second timeout safety
    const safetyTimer = setTimeout(() => {
      setShowOptimizing(true);
      progressRef.current = 1;
      if (!isLoadedRef.current) {
        isLoadedRef.current = true;
        setPhase("falling");
      }
    }, 8000);

    return () => clearTimeout(safetyTimer);
  }, []);

  // 2. Status message switcher
  useEffect(() => {
    if (phase === "complete" || phase === "falling") return;

    const interval = setInterval(() => {
      setStatusIndex((prev) => {
        const next = (prev + 1) % STATUS_MESSAGES.length;
        setStatusText(STATUS_MESSAGES[next]);
        return next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [phase]);

  // 3. Phase 1 -> Phase 2 timing transition
  useEffect(() => {
    if (phase === "singularity") {
      const timer = setTimeout(() => {
        setPhase("blackhole");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // 4. Phase 3 (falling) complete callback
  useEffect(() => {
    if (phase === "falling") {
      const timer = setTimeout(() => {
        setPhase("complete");
        document.body.style.overflow = "";
        sessionStorage.setItem("a2_gargantua_preloader_seen", "true");
      }, 900); // 900ms smooth camera dive into singularity
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // 5. 60FPS Canvas Animation (Realistic Gargantua Black Hole & Accretion Disk)
  useEffect(() => {
    if (phase === "complete") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle Swarm converging into the Singularity
    const numParticles = width < 768 ? 40 : 80;
    const particles = Array.from({ length: numParticles }, () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.max(width, height) * 0.6 + 100;
      return {
        angle,
        dist,
        speed: Math.random() * 1.5 + 0.8,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
      };
    });

    let diskRotation = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;

      const currentProgress = progressRef.current;
      const intensity = 0.5 + currentProgress * 0.5;

      // ── Space Particles Falling Inward ──
      particles.forEach((p) => {
        p.dist -= p.speed * (phase === "falling" ? 8 : intensity * 1.8);
        p.angle += (0.005 + intensity * 0.01) * (phase === "falling" ? 3 : 1);

        if (p.dist < 15) {
          p.dist = Math.random() * Math.max(width, height) * 0.5 + 150;
          p.angle = Math.random() * Math.PI * 2;
        }

        const px = centerX + Math.cos(p.angle) * p.dist;
        const py = centerY + Math.sin(p.angle) * p.dist * 0.45; // Elliptical inclination

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 180, 100, ${p.alpha * intensity})`;
        ctx.fill();
      });

      // ── Realistic Accretion Disk (Gargantua Lensing Rings) ──
      diskRotation += 0.015 * intensity;

      if (phase !== "singularity") {
        // Outer Gravitational Lensing Halo
        const haloRadius = Math.min(width, height) * 0.22 * (phase === "falling" ? 4 : 1);
        const haloGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          haloRadius * 0.4,
          centerX,
          centerY,
          haloRadius * 1.4
        );
        haloGrad.addColorStop(0, "rgba(0, 0, 0, 1)");
        haloGrad.addColorStop(0.45, `rgba(255, 122, 0, ${0.45 * intensity})`);
        haloGrad.addColorStop(0.7, `rgba(255, 70, 0, ${0.2 * intensity})`);
        haloGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.arc(centerX, centerY, haloRadius * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = haloGrad;
        ctx.fill();

        // Gravitational Lensing Upper Arc
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(diskRotation * 0.3);
        ctx.scale(1, 0.35);

        const arcGrad = ctx.createRadialGradient(0, 0, haloRadius * 0.6, 0, 0, haloRadius * 1.1);
        arcGrad.addColorStop(0, `rgba(255, 200, 120, ${0.8 * intensity})`);
        arcGrad.addColorStop(0.5, `rgba(255, 110, 0, ${0.6 * intensity})`);
        arcGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.arc(0, 0, haloRadius * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = arcGrad;
        ctx.fill();
        ctx.restore();
      }

      // ── Black Hole Event Horizon (Pure Black Singularity Sphere) ──
      const bhRadius = (phase === "singularity" ? 8 : Math.min(width, height) * 0.1) * (phase === "falling" ? 8 : 1);

      ctx.beginPath();
      ctx.arc(centerX, centerY, bhRadius + 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 150, 50, ${0.8 * intensity})`;
      ctx.fill();

      // Absolute Black Event Horizon Center
      ctx.beginPath();
      ctx.arc(centerX, centerY, bhRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#000000";
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [phase]);

  if (phase === "complete") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="gargantua-preloader"
        initial={{ opacity: 1 }}
        animate={{
          scale: phase === "falling" ? 2.5 : 1,
          opacity: phase === "falling" ? 0 : 1,
          filter: phase === "falling" ? "blur(16px)" : "blur(0px)",
        }}
        exit={{ opacity: 0 }}
        transition={{
          duration: phase === "falling" ? 0.9 : 0.4,
          ease: [0.7, 0, 0.35, 1], // Deep camera dive easing
        }}
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-[#050505] text-white select-none overflow-hidden"
        style={{ height: "100vh" }}
        aria-live="polite"
        aria-label="Entering A2 Production Cinematic Experience"
      >
          {/* Canvas Rendering Gravitational Lensing & Accretion Disk */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full pointer-events-none"
          />

          {/* Top Subtle Brand Identity */}
          <div className="relative z-10 pt-12 flex items-center gap-3 opacity-80">
            <img
              src="/images/a2-brand-logo.png"
              alt="A2 Logo"
              className="h-7 w-auto object-contain filter drop-shadow-[0_0_12px_rgba(255,122,0,0.5)]"
            />
            <span className="font-geist text-xs font-medium tracking-[0.35em] text-white/70 uppercase">
              PRODUCTION
            </span>
          </div>

          {/* Center Singularity Glow Container */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center pointer-events-none">
            {/* Soft Ambient Core Glow */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-32 w-32 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,122,0,0.35)_0%,transparent_70%)] blur-2xl pointer-events-none"
            />
          </div>

          {/* Bottom Rotating Cinematic Status Message */}
          <div className="relative z-10 pb-16 flex flex-col items-center gap-3 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.p
                key={statusText}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 0.75, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.5 }}
                className="font-poppins text-xs font-light tracking-[0.4em] uppercase text-white/80"
              >
                {showOptimizing ? "Optimizing space-time..." : statusText}
              </motion.p>
            </AnimatePresence>

            {/* Single subtle warm line below text */}
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#FF7A00]/60 to-transparent" />
          </div>
        </motion.div>
    </AnimatePresence>
  );
}
