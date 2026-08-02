"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Share2,
  Sparkles,
  PenTool,
  ArrowUpRight,
  Lightbulb,
  ClipboardList,
  Clapperboard,
  SlidersHorizontal,
  Rocket,
} from "lucide-react";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
import { gsap, useGSAP } from "@/lib/gsap";
import { MagneticButton } from "@/components/ui/MagneticButton";

interface BuildCard {
  number: string;
  title: string;
  tag: string;
  description: string;
  icon: typeof Globe;
}

const BUILD_SERVICES: BuildCard[] = [
  {
    number: "01",
    title: "Business Websites",
    tag: "WEB DEVELOPMENT",
    description:
      "Custom, responsive websites designed to build trust and convert visitors into customers.",
    icon: Globe,
  },
  {
    number: "02",
    title: "Social Media Presence",
    tag: "DIGITAL GROWTH",
    description:
      "Professional social media setup, branding, and content strategy that helps businesses grow online.",
    icon: Share2,
  },
  {
    number: "03",
    title: "Brand Identity",
    tag: "VISUAL SYSTEMS",
    description:
      "Logos, visual identity, typography, and branding systems that make businesses memorable.",
    icon: Sparkles,
  },
  {
    number: "04",
    title: "Creative Design",
    tag: "UI/UX & MOTION",
    description:
      "Modern UI/UX design, graphics, motion visuals, and digital assets tailored for your brand.",
    icon: PenTool,
  },
];

interface TeamMember {
  name: string;
  role: string;
  image: string;
  socialType: "instagram" | "linkedin";
  socialUrl: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "AKASH SINGH RAJPUT",
    role: "Founder & Creative Director",
    image: "/images/team/akash.png",
    socialType: "instagram",
    socialUrl: "https://instagram.com",
  },
  {
    name: "ABHISHEK",
    role: "Editor & Cinematographer",
    image: "/images/team/abhishek.jpg",
    socialType: "instagram",
    socialUrl: "https://instagram.com",
  },
  {
    name: "ADITYA",
    role: "Website Developer & UI/UX Designer",
    image: "/images/team/aditya.png",
    socialType: "linkedin",
    socialUrl: "https://linkedin.com",
  },
];

/* ── Process Steps Data ── */
interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon: typeof Lightbulb;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    number: "01",
    title: "DISCOVERY",
    description:
      "We understand your brand, audience, goals and vision before creating the perfect strategy.",
    icon: Lightbulb,
  },
  {
    number: "02",
    title: "PRE-PRODUCTION",
    description:
      "Concept development, scripting, shot planning, storyboarding and production scheduling.",
    icon: ClipboardList,
  },
  {
    number: "03",
    title: "PRODUCTION",
    description:
      "Professional filming with cinematic camera work, lighting and creative direction.",
    icon: Clapperboard,
  },
  {
    number: "04",
    title: "POST PRODUCTION",
    description:
      "Editing, color grading, motion graphics, sound design and final visual refinement.",
    icon: SlidersHorizontal,
  },
  {
    number: "05",
    title: "DELIVERY",
    description:
      "Final exports optimized for every platform with revisions and quality assurance.",
    icon: Rocket,
  },
];

const processContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const processCardVariants = {
  hidden: { opacity: 0, y: 60, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.9,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  },
};

/* ── Floating Particles Background ── */
function FloatingParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    }))
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#FF7A00]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 15, -15, 0],
            opacity: [0, 0.25, 0.15, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Premium Process Section ── */
function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [lineVisible, setLineVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLineVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative mx-auto w-full max-w-[1600px] border-t border-white/10 px-6 py-32 md:px-14 lg:px-20 overflow-hidden"
    >
      {/* Ambient orange gradient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[1000px] rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.04)_0%,transparent_65%)] blur-3xl" />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1] }}
        className="flex flex-col gap-6 md:max-w-3xl mb-20 lg:mb-28"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/25 bg-[#FF7A00]/[0.05] px-4 py-1.5 backdrop-blur-md w-fit">
          <span className="h-2 w-2 rounded-full bg-[#FF7A00] animate-pulse" />
          <span className="font-poppins text-xs font-medium uppercase tracking-[0.35em] text-[#FF7A00]">
            03 — OUR PROCESS
          </span>
        </div>

        <h2 className="font-geist text-[clamp(2.25rem,5.5vw,4rem)] font-bold leading-[1.05] tracking-tight text-white">
          How We Turn Ideas
          <br />
          Into Cinematic Reality
        </h2>

        <p className="max-w-2xl font-inter text-base font-light text-[#BDBDBD] leading-relaxed md:text-lg">
          Every successful project follows a refined creative workflow. From
          understanding your vision to delivering the final masterpiece, every
          step is carefully planned to achieve exceptional results.
        </p>
      </motion.div>

      {/* Animated Connecting Line (Desktop Only) */}
      <div className="hidden lg:block relative mb-4">
        <div
          ref={lineRef}
          className="absolute top-0 left-[10%] right-[10%] h-[2px] overflow-hidden"
          style={{ top: "0" }}
        >
          <div
            className="h-full bg-gradient-to-r from-[#FF7A00]/0 via-[#FF7A00]/60 to-[#FF7A00]/0 transition-transform duration-[2000ms] ease-out"
            style={{
              transform: lineVisible ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: "left",
            }}
          />
        </div>
      </div>

      {/* 5 Process Cards Grid */}
      <motion.div
        variants={processContainerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5 lg:gap-5"
      >
        {PROCESS_STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              variants={processCardVariants}
              className="group relative flex flex-col overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl p-7 md:p-8 transition-all duration-500 hover:-translate-y-3 hover:border-[#FF7A00]/40 hover:bg-white/[0.04] hover:shadow-[0_20px_60px_rgba(255,122,0,0.12),0_0_30px_rgba(255,122,0,0.06)]"
            >
              {/* Glass reflection highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/[0.04] via-transparent to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Large ghost step number */}
              <span className="pointer-events-none absolute -top-2 -right-1 font-geist text-[7rem] md:text-[8rem] font-black leading-none text-white/[0.03] transition-all duration-700 group-hover:text-[#FF7A00]/[0.08] select-none">
                {step.number}
              </span>

              {/* Step badge */}
              <div className="relative z-10 mb-6">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-[#FF7A00]/60 transition-colors duration-300 group-hover:text-[#FF7A00]">
                  STEP {step.number}
                </span>
              </div>

              {/* Icon */}
              <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FF7A00]/20 bg-[#FF7A00]/[0.06] text-[#FF7A00] transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:border-[#FF7A00]/50 group-hover:bg-[#FF7A00]/15 group-hover:text-white group-hover:shadow-[0_0_25px_rgba(255,122,0,0.4)]">
                <Icon className="h-6 w-6 stroke-[1.5]" />
              </div>

              {/* Title */}
              <h3 className="relative z-10 font-geist text-lg font-bold uppercase tracking-[0.08em] text-white transition-colors duration-300 group-hover:text-[#FF7A00] mb-4 md:text-xl">
                {step.title}
              </h3>

              {/* Description — fades in on hover */}
              <p className="relative z-10 font-inter text-sm font-light text-[#BDBDBD] leading-relaxed mt-auto transition-all duration-500 group-hover:text-white/80">
                {step.description}
              </p>

              {/* Bottom accent bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF7A00] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
        className="mt-24 flex flex-col items-center text-center gap-8"
      >
        <p className="font-geist text-[clamp(1.25rem,3vw,2rem)] font-medium tracking-tight text-white/90">
          Ready to bring your vision to life?
        </p>

        <a
          href="#contact"
          className="group/btn relative inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/50 bg-[#FF7A00]/10 px-8 py-4 font-poppins text-sm font-semibold uppercase tracking-[0.2em] text-[#FF7A00] backdrop-blur-md transition-all duration-500 hover:bg-[#FF7A00] hover:text-black hover:shadow-[0_0_40px_rgba(255,122,0,0.4),0_0_80px_rgba(255,122,0,0.15)] hover:border-[#FF7A00]"
        >
          <span>Start Your Project</span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />

          {/* Glow ring */}
          <div className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover/btn:opacity-100 shadow-[inset_0_0_20px_rgba(255,122,0,0.3)]" />
        </a>
      </motion.div>
    </section>
  );
}


const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.85,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  },
};

/* ── 3D Tilt Interactive Team Card ── */
function TeamCard({ member }: { member: TeamMember }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -y / 25,
      y: x / 25,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const SocialIcon = member.socialType === "instagram" ? InstagramIcon : LinkedinIcon;

  return (
    <motion.div
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[30px] border border-white/10 bg-[#08080a]/90 backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-2 hover:border-[#FF7A00]/50 hover:shadow-[0_20px_50px_rgba(255,122,0,0.15),0_0_30px_rgba(255,122,0,0.08)]"
    >
      {/* Subtle top ambient glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-60 rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.15)_0%,transparent_70%)] blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Avatar Image Frame */}
      <div className="relative w-full aspect-[4/4.5] overflow-hidden bg-black/60">
        <img
          src={member.image}
          alt={member.name}
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />

        {/* Gradient scrim for text contrast */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/40 to-transparent" />

        {/* Social Icon Badge */}
        <a
          href={member.socialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/50 backdrop-blur-md transition-all duration-300 group-hover:border-[#FF7A00]/50 group-hover:bg-[#FF7A00]/10 group-hover:text-[#FF7A00] group-hover:drop-shadow-[0_0_12px_rgba(255,122,0,0.8)]"
          aria-label={`${member.name} ${member.socialType}`}
        >
          <SocialIcon className="h-4 w-4 stroke-[1.75]" />
        </a>
      </div>

      {/* Card Body */}
      <div className="relative z-10 flex flex-col justify-between flex-1 p-8 md:p-9 pt-2">
        {/* Role & Name */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-[11px] font-poppins font-medium uppercase tracking-[3px] text-slate-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF7A00] mr-2 animate-pulse" />
            <span>{member.role}</span>
          </div>

          <h3 className="font-geist text-2xl font-bold tracking-tight text-white uppercase transition-colors duration-300 group-hover:text-[#FF7A00] md:text-3xl">
            {member.name}
          </h3>
        </div>


      </div>

      {/* Subtle bottom gradient accent bar on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF7A00] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </motion.div>
  );
}

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
    <div ref={containerRef} className="relative bg-background text-text selection:bg-[#FF7A00]/30">
      {/* ────────────────────────────────────────────────────────────
          01 — SERVICES (4 PREMIUM SERVICE CARDS)
          ──────────────────────────────────────────────────────────── */}
      <section
        id="services"
        className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col justify-center border-t border-white/10 px-6 py-28 md:px-14 lg:px-20"
      >
        {/* Ambient gold background glow */}
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(201,138,61,0.04)_0%,transparent_70%)] blur-3xl" />

        {/* Section Header */}
        <div className="reveal-up flex flex-col gap-6 md:max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C98A3D]/20 bg-[#C98A3D]/[0.04] px-4 py-1.5 backdrop-blur-md w-fit">
            <span className="h-2 w-2 rounded-full bg-[#C98A3D] animate-pulse" />
            <span className="font-poppins text-xs font-medium uppercase tracking-[0.35em] text-[#C98A3D]">
              01 — SERVICES
            </span>
          </div>

          <h2 className="font-geist text-[clamp(2.25rem,5.5vw,4rem)] font-medium leading-[1.05] tracking-tight text-white">
            Digital solutions built to help businesses grow.
          </h2>

          <p className="max-w-2xl font-inter text-base font-light text-muted leading-relaxed md:text-lg">
            Whether you&apos;re a local business, startup, creator, or established company, we create premium digital experiences that strengthen your online presence and help your business stand out.
          </p>
        </div>

        {/* 4-Card Responsive Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8"
        >
          {BUILD_SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.number}
                variants={cardVariants}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-10 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#C98A3D]/40 hover:bg-white/[0.04] hover:shadow-[0_20px_50px_rgba(201,138,61,0.12),0_0_20px_rgba(201,138,61,0.06)]"
              >
                {/* Subtle glass reflection highlight */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.04] via-transparent to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Top Row: Icon + Number */}
                <div className="relative z-10 flex items-start justify-between gap-4 mb-8">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-[#C98A3D]/25 bg-[#C98A3D]/[0.08] text-[#C98A3D] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:border-[#C98A3D]/60 group-hover:bg-[#C98A3D]/20 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(201,138,61,0.4)]">
                    <Icon className="h-6 w-6 stroke-[1.75]" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold tracking-[0.25em] text-[#C98A3D]">
                      {service.number}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#C98A3D]" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col gap-3 mt-auto">
                  <span className="font-poppins text-[10px] font-medium uppercase tracking-[0.3em] text-[#C98A3D]/80">
                    {service.tag}
                  </span>
                  <h3 className="font-geist text-2xl font-medium tracking-tight text-white transition-colors duration-300 group-hover:text-[#C98A3D] md:text-3xl">
                    {service.title}
                  </h3>
                  <p className="font-inter text-sm md:text-base font-light text-muted leading-relaxed mt-1">
                    {service.description}
                  </p>
                </div>

                {/* Subtle bottom gradient accent bar on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C98A3D] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          02 — ABOUT OUR TEAM (OFFICIAL TEAM SHOWCASE WITH AVATARS)
          ──────────────────────────────────────────────────────────── */}
      <section
        id="about"
        className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col justify-center border-t border-white/10 px-6 py-28 md:px-14 lg:px-20"
      >
        {/* Ambient orange background glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.04)_0%,transparent_70%)] blur-3xl" />

        {/* Section Header */}
        <div className="reveal-up flex flex-col gap-6 md:max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/25 bg-[#FF7A00]/[0.05] px-4 py-1.5 backdrop-blur-md w-fit">
            <span className="h-2 w-2 rounded-full bg-[#FF7A00] animate-pulse" />
            <span className="font-poppins text-xs font-medium uppercase tracking-[0.35em] text-[#FF7A00]">
              02 — ABOUT OUR TEAM
            </span>
          </div>

          <h2 className="font-geist text-[clamp(2.25rem,5.5vw,4rem)] font-medium leading-[1.05] tracking-tight text-white">
            The Minds Behind A2 Production
          </h2>

          <p className="max-w-2xl font-inter text-base font-light text-[#a1a1aa] leading-relaxed md:text-lg">
            A passionate team of creators, filmmakers and developers dedicated to building cinematic experiences, powerful digital products and unforgettable visual stories.
          </p>
        </div>

        {/* 3 Team Member Cards (Desktop: 3 in 1 row, Tablet: 2 + 1, Mobile: 1 col) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {TEAM_MEMBERS.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </motion.div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          03 — OUR PROCESS (PREMIUM CINEMATIC WORKFLOW)
          ──────────────────────────────────────────────────────────── */}
      <ProcessSection />

      {/* ────────────────────────────────────────────────────────────
          04 — CONTACT
          ──────────────────────────────────────────────────────────── */}
      <section
        id="contact"
        className="relative mx-auto flex min-h-[60vh] w-full max-w-[1600px] flex-col items-start justify-center gap-8 border-t border-white/10 px-6 py-24 md:px-14 lg:px-20"
      >
        <div className="reveal-up flex flex-col gap-6">
          <span className="font-poppins text-xs uppercase tracking-[0.3em] text-accent">
            04 — Contact
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
