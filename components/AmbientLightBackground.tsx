"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const AMBIENT_COLORS = [
  "#F8FAFC",
  "#22D3EE",
  "#3B82F6",
  "#6366F1",
  "#A855F7",
  "#EC4899",
];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function AmbientLightBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const rawLightX = useMotionValue(0);
  const rawLightY = useMotionValue(0);
  const lightX = useSpring(rawLightX, { stiffness: 46, damping: 28, mass: 1 });
  const lightY = useSpring(rawLightY, { stiffness: 46, damping: 28, mass: 1 });
  const [lightColor, setLightColor] = useState(AMBIENT_COLORS[2]);
  const [lightOpacity, setLightOpacity] = useState(0.42);
  const [lightScale, setLightScale] = useState(1);

  useEffect(() => {
    const background = backgroundRef.current;
    if (!background) return;

    let idleTimer = 0;
    let wanderTimer = 0;
    let lastColorChange = 0;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = motionPreference.matches;

    const setStaticLight = () => {
      const bounds = background.getBoundingClientRect();
      lightX.jump(bounds.width * 0.5);
      lightY.jump(bounds.height * 0.35);
      setLightOpacity(0.32);
      setLightScale(1);
    };

    const wanderToRandomPoint = () => {
      if (prefersReducedMotion) return;
      const bounds = background.getBoundingClientRect();
      rawLightX.set(randomBetween(0, Math.max(bounds.width, 1)));
      rawLightY.set(randomBetween(0, Math.max(bounds.height, 1)));
      setLightColor(AMBIENT_COLORS[Math.floor(Math.random() * AMBIENT_COLORS.length)]);
      setLightOpacity(randomBetween(0.34, 0.5));
      setLightScale(randomBetween(0.9, 1.16));
      wanderTimer = window.setTimeout(
        wanderToRandomPoint,
        randomBetween(4.5, 7) * 1000,
      );
    };

    const onPointerMove = (event: PointerEvent) => {
      if (prefersReducedMotion) return;
      window.clearTimeout(wanderTimer);
      const bounds = background.getBoundingClientRect();
      rawLightX.set(event.clientX - bounds.left);
      rawLightY.set(event.clientY - bounds.top);
      setLightOpacity(0.46);
      setLightScale(1.08);

      const now = Date.now();
      if (now - lastColorChange > 800) {
        setLightColor(AMBIENT_COLORS[Math.floor(Math.random() * AMBIENT_COLORS.length)]);
        lastColorChange = now;
      }

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        wanderToRandomPoint();
      }, 650);
    };

    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches;
      window.clearTimeout(idleTimer);
      window.clearTimeout(wanderTimer);
      if (prefersReducedMotion) setStaticLight();
      else wanderToRandomPoint();
    };

    const onWindowBlur = () => {
      window.clearTimeout(idleTimer);
      window.clearTimeout(wanderTimer);
      wanderToRandomPoint();
    };

    if (prefersReducedMotion) setStaticLight();
    else wanderToRandomPoint();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onWindowBlur);
    motionPreference.addEventListener("change", onMotionPreferenceChange);

    return () => {
      window.clearTimeout(idleTimer);
      window.clearTimeout(wanderTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onWindowBlur);
      motionPreference.removeEventListener("change", onMotionPreferenceChange);
    };
  }, [lightX, lightY, rawLightX, rawLightY]);

  return (
    <div
      ref={backgroundRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 76% 54% at 8% 0%, rgba(56,189,248,0.16), transparent 72%), radial-gradient(ellipse 60% 48% at 100% 48%, rgba(99,102,241,0.14), transparent 72%), linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "auto, auto, 72px 72px, 72px 72px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 88%)",
        }}
      />
      <motion.div
        className="absolute -left-60 -top-60 h-[30rem] w-[30rem] rounded-full blur-[78px] sm:-left-80 sm:-top-80 sm:h-[40rem] sm:w-[40rem] sm:blur-[105px]"
        style={{ x: lightX, y: lightY }}
        animate={{ backgroundColor: lightColor, opacity: lightOpacity, scale: lightScale }}
        transition={{
          backgroundColor: { duration: 1.2, ease: "easeInOut" },
          opacity: { duration: 1.2, ease: "easeInOut" },
          scale: { duration: 1.5, ease: "easeInOut" },
        }}
      />
    </div>
  );
}
