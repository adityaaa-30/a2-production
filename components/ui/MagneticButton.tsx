"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}

export function MagneticButton({
  children,
  variant = "primary",
  className,
  onClick,
  type = "button",
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const centerRef = useRef<{ x: number; y: number } | null>(null);
  const quickRef = useRef<{
    x: ReturnType<typeof gsap.quickTo>;
    y: ReturnType<typeof gsap.quickTo>;
  } | null>(null);

  const ensureQuick = () => {
    if (!quickRef.current && btnRef.current) {
      quickRef.current = {
        x: gsap.quickTo(btnRef.current, "x", { duration: 0.18, ease: "power2.out" }),
        y: gsap.quickTo(btnRef.current, "y", { duration: 0.18, ease: "power2.out" }),
      };
    }
  };

  const handleMouseEnter = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    ensureQuick();
  };

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const center = centerRef.current;
    if (!center) return;
    ensureQuick();
    quickRef.current?.x((e.clientX - center.x) * 0.18);
    quickRef.current?.y((e.clientY - center.y) * 0.18);
  };

  const handleMouseLeave = () => {
    centerRef.current = null;
    ensureQuick();
    quickRef.current?.x(0);
    quickRef.current?.y(0);
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.6;
      const ripple = document.createElement("span");
      ripple.className = "btn-ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    }
    onClick?.();
  };

  return (
    <button
      ref={btnRef}
      type={type}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={cn(
        "group relative isolate inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-4 text-sm font-medium tracking-wide will-change-transform",
        variant === "primary"
          ? "bg-text text-text"
          : "animated-border border border-white/15 text-text",
        className
      )}
    >
      {variant === "primary" && (
        <span
          className="absolute inset-0 -z-10 origin-left scale-x-0 bg-gradient-to-r from-accent to-accent-secondary transition-transform duration-500 ease-out group-hover:scale-x-100"
          aria-hidden
        />
      )}
      <span
        className="pointer-events-none absolute inset-0 -z-20 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent-secondary), transparent 70%)",
        }}
        aria-hidden
      />
      <span className="relative z-10 mix-blend-difference transition-colors duration-300">
        {children}
      </span>
    </button>
  );
}
