"use client";

import { useRef, useState, useEffect } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
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
  Mail,
  Check,
  Star,
} from "lucide-react";
import { MONTHLY_PACKAGES } from "@/lib/monthly-packages";

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

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.6V3.9c-.3 0-1.3-.1-2.5-.1C11.7 3.8 10 5.3 10 8.1V10H7.3v3H10v8h3.5Z" />
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

function WhatsappIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 2a10 10 0 0 0-8.344 15.539L2.5 21.5l4.086-1.072A10 10 0 1 0 12 2z" />
    </svg>
  );
}
import { gsap, useGSAP } from "@/lib/gsap";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useProjectInquiryModal } from "@/components/ProjectInquiryContext";

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

function ServiceCardVisual({ number }: { number: string }) {
  const visualClass = `service-art service-art--${number}`;

  if (number === "01") {
    return (
      <div aria-hidden="true" className={visualClass}>
        <div className="service-art__scene service-art__website">
          <div className="service-art__website-back" />
          <div className="service-art__website-window">
            <div className="service-art__browser-bar">
              <span /><span /><span />
              <i />
              <b>A2 / STUDIO</b>
            </div>
            <div className="service-art__website-body">
              <div className="service-art__website-copy">
                <small>MADE TO STAND APART</small>
                <strong>Digital<br />experiences.</strong>
                <i />
                <span>Explore the studio <b>↗</b></span>
              </div>
              <div className="service-art__website-image">
                <div className="service-art__website-orb" />
                <div className="service-art__website-slab" />
                <b>01</b>
              </div>
            </div>
            <div className="service-art__website-foot"><span>STRATEGY</span><i /><span>DESIGN</span><i /><span>DEVELOPMENT</span></div>
          </div>
          <span className="service-art__website-glint" />
        </div>
      </div>
    );
  }

  if (number === "02") {
    return (
      <div aria-hidden="true" className={visualClass}>
        <div className="service-art__scene service-art__social">
          <svg className="service-art__orbit" viewBox="0 0 280 112" fill="none">
            <ellipse cx="140" cy="56" rx="91" ry="34" />
            <ellipse cx="140" cy="56" rx="62" ry="45" transform="rotate(-24 140 56)" />
            <path d="M58 69 111 50l54 20 57-32" />
          </svg>
          <div className="service-art__social-core">
            <span className="service-art__social-monogram">A</span>
            <small>SALES</small>
          </div>
          <div className="service-art__social-node service-art__social-node--one"><InstagramIcon /><i /></div>
          <div className="service-art__social-node service-art__social-node--two"><WhatsappIcon /><i /></div>
          <div className="service-art__social-node service-art__social-node--three"><FacebookIcon /><i /></div>
          <span className="service-art__social-satellite" />
          <span className="service-art__social-satellite service-art__social-satellite--two" />
        </div>
      </div>
    );
  }

  if (number === "03") {
    return (
      <div aria-hidden="true" className={visualClass}>
        <div className="service-art__scene service-art__brand">
          <div className="service-art__brand-sheet service-art__brand-sheet--back" />
          <div className="service-art__brand-sheet service-art__brand-sheet--front">
            <span className="service-art__brand-label">IDENTITY / 2025</span>
            <div className="service-art__brand-lockup">
              <svg viewBox="0 0 54 58" fill="none">
                <path d="M5 48 27 7l22 41M15 31h24M34 34l11 11-8 8-11-11" />
                <circle cx="27" cy="7" r="2" />
              </svg>
              <strong>A2</strong>
            </div>
            <div className="service-art__brand-baseline"><span>FORM / FUNCTION</span><i /><b>EST. 2025</b></div>
          </div>
          <div className="service-art__brand-swatches"><i /><i /><i /><i /></div>
          <span className="service-art__brand-index">VISUAL SYSTEM 03</span>
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={visualClass}>
      <div className="service-art__scene service-art__creative">
        <div className="service-art__creative-back">
          <span>CANVAS / 04</span>
          <div><i /><i /><i /></div>
        </div>
        <div className="service-art__creative-canvas">
          <div className="service-art__creative-sun" />
          <div className="service-art__creative-shape" />
          <div className="service-art__creative-cutout" />
          <span>FORM STUDY — A</span>
        </div>
        <div className="service-art__creative-tools"><i /><i /><i /><b /></div>
        <div className="service-art__creative-timeline"><span>00:04</span><i /><i /><i /><b /></div>
      </div>
    </div>
  );
}

interface TeamMember {
  name: string;
  role: string;
  image: string;
  socialType: "instagram" | "linkedin";
  socialUrl: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "AKASH",
    role: "Founder & Creative Director",
    image: "/images/team/akash.png",
    socialType: "instagram",
    socialUrl: "https://www.instagram.com/akash__singh__rajput_0/",
  },
  {
    name: "ABHISHEK",
    role: "Editor & Cinematographer",
    image: "/images/team/abhishek.jpg",
    socialType: "instagram",
    socialUrl: "https://www.instagram.com/abhishek_shaw_172/",
  },
  {
    name: "ADITYA",
    role: "Website Developer & UI/UX Designer",
    image: "/images/team/aditya.png",
    socialType: "instagram",
    socialUrl: "https://www.instagram.com/whyyyx_aadi/",
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

const swipeTrackState = new WeakMap<
  HTMLDivElement,
  { scrollLeft: number; timestamp: number; timeout: number }
>();

function updateSwipeCardEffects(track: HTMLDivElement) {
  if (window.innerWidth >= 768) return;

  const now = performance.now();
  const previous = swipeTrackState.get(track);
  const elapsed = previous ? Math.max(now - previous.timestamp, 1) : 1;
  const velocity = previous
    ? Math.min(Math.abs(track.scrollLeft - previous.scrollLeft) / elapsed, 2)
    : 0;

  if (previous) window.clearTimeout(previous.timeout);

  const applyEffects = (motionBlur: number) => {
    track.querySelectorAll<HTMLElement>("[data-swipe-card]").forEach((card) => {
      Array.from(card.children).forEach((content) => {
        if (!(content instanceof HTMLElement)) return;
        content.style.transition = "none";
        content.style.filter = motionBlur > 0 ? `blur(${motionBlur.toFixed(2)}px)` : "none";
      });
    });
  };

  applyEffects(velocity > 0.12 ? Math.min(velocity * 1.2, 1.4) : 0);

  const timeout = window.setTimeout(() => {
    applyEffects(0);
    track.querySelectorAll<HTMLElement>("[data-swipe-card] > *").forEach((content) => {
      content.style.transition = "";
    });
  }, 60);
  swipeTrackState.set(track, {
    scrollLeft: track.scrollLeft,
    timestamp: now,
    timeout,
  });
}

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
              04 — OUR PROCESS
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
        onScroll={(event) => updateSwipeCardEffects(event.currentTarget)}
        tabIndex={0}
        aria-label="Swipe horizontally to view all process steps"
        className="-mx-6 flex snap-x snap-proximity items-stretch gap-4 overflow-x-auto px-6 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:p-0 lg:grid-cols-5 lg:gap-5"
      >
        {PROCESS_STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              variants={processCardVariants}
              data-swipe-card
              className="group relative flex w-[78vw] max-w-[22rem] shrink-0 snap-center flex-col overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.02] p-7 backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform md:w-auto md:max-w-none md:p-8 md:hover:-translate-y-3 md:hover:scale-[1.035] md:hover:border-[#FF7A00]/40 md:hover:bg-white/[0.04] md:hover:shadow-[0_20px_60px_rgba(255,122,0,0.12),0_0_30px_rgba(255,122,0,0.06)]"
            >
              {/* Glass reflection highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/[0.04] via-transparent to-transparent opacity-40 transition-opacity duration-300 md:group-hover:opacity-100" />

              {/* Large ghost step number */}
              <span className="pointer-events-none absolute -top-2 -right-1 font-geist text-[7rem] md:text-[8rem] font-black leading-none text-white/[0.03] transition-colors duration-200 md:group-hover:text-[#FF7A00]/[0.08] select-none">
                {step.number}
              </span>

              {/* Step badge */}
              <div className="relative z-10 mb-6">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-[#FF7A00]/60 transition-colors duration-200 md:group-hover:text-[#FF7A00]">
                  STEP {step.number}
                </span>
              </div>

              {/* Icon */}
              <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FF7A00]/20 bg-[#FF7A00]/[0.06] text-[#FF7A00] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:rotate-6 md:group-hover:scale-110 md:group-hover:border-[#FF7A00]/50 md:group-hover:bg-[#FF7A00]/15 md:group-hover:text-white md:group-hover:shadow-[0_0_25px_rgba(255,122,0,0.4)]">
                <Icon className="h-6 w-6 stroke-[1.5]" />
              </div>

              {/* Title */}
              <h3 className="relative z-10 font-geist text-lg font-bold uppercase tracking-[0.08em] text-white transition-colors duration-200 md:group-hover:text-[#FF7A00] mb-4 md:text-xl">
                {step.title}
              </h3>

              {/* Description — fades in on hover */}
              <p className="relative z-10 font-inter text-sm font-light text-[#BDBDBD] leading-relaxed mt-auto transition-colors duration-200 md:group-hover:text-white/80">
                {step.description}
              </p>

              {/* Bottom accent bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF7A00] to-transparent opacity-0 transition-opacity duration-200 md:group-hover:opacity-100" />
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

const serviceCardVariants = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1,
    y: 0,
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

const contactContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const contactItemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  },
};

/* ────────────────────────────────────────────────────────────
    05 — CONTACT (PREMIUM CREATIVE AGENCY SECTION)
    ──────────────────────────────────────────────────────────── */
function ContactSection() {
  const { openModal } = useProjectInquiryModal();

  const contactItems = [
    {
      id: "instagram",
      title: "Instagram",
      value: "@a2_production1",
      caption: "See our latest films, edits & behind the scenes.",
      href: "https://www.instagram.com/a2_production1?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      icon: InstagramIcon,
      external: true,
    },
    {
      id: "whatsapp",
      title: "WhatsApp",
      value: "+91 93306 83966",
      caption: "Available for project discussions and quick responses.",
      href: "https://wa.me/919330683966",
      icon: WhatsappIcon,
      external: true,
    },
    {
      id: "email",
      title: "Business Email",
      value: "a2production440@gmail.com",
      caption: "Business inquiries, collaborations and partnerships.",
      href: "mailto:a2production440@gmail.com",
      icon: Mail,
      external: false,
    },
  ];

  return (
    <section
      id="contact"
      className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col justify-center border-t border-white/10 px-6 py-28 md:px-14 lg:px-20 overflow-hidden"
    >
      {/* Background ambient radial glow */}
      <div className="pointer-events-none absolute top-1/2 right-10 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.06)_0%,transparent_70%)] blur-3xl" />

      <motion.div
        variants={contactContainerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center"
      >
        {/* LEFT COLUMN */}
        <motion.div variants={contactItemVariants} className="flex flex-col gap-6 lg:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/25 bg-[#FF7A00]/[0.05] px-4 py-1.5 backdrop-blur-md w-fit">
            <span className="h-2 w-2 rounded-full bg-[#FF7A00] animate-pulse" />
            <span className="font-poppins text-xs font-medium uppercase tracking-[0.35em] text-[#FF7A00]">
              05 — CONTACT
            </span>
          </div>

          <h2 className="font-geist text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[1.05] tracking-tight text-white">
            Let&apos;s build something that refuses to blend in.
          </h2>

          <p className="max-w-xl font-inter text-base font-light text-[#a1a1aa] leading-relaxed md:text-lg">
            Whether you&apos;re launching a new brand, producing cinematic content, or building a modern digital presence, we&apos;d love to hear your vision. Reach out and let&apos;s create something exceptional together.
          </p>
        </motion.div>

        {/* RIGHT COLUMN - GLASSMORPHISM CONTACT CARD */}
        <motion.div variants={contactItemVariants} className="lg:col-span-6">
          <div className="relative w-full">
            {/* Soft backdrop glow */}
            <div className="pointer-events-none absolute -inset-1 rounded-[28px] bg-gradient-to-b from-[#FF7A00]/20 via-[#FF7A00]/5 to-transparent blur-xl opacity-60" />

            <div className="relative rounded-[24px] border border-[#FF7A00]/25 bg-[#0b0e17]/80 p-6 sm:p-8 md:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_35px_rgba(255,122,0,0.08)]">
              {/* Subtle top border gradient */}
              <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#FF7A00]/40 to-transparent" />

              <div
                tabIndex={0}
                aria-label="Swipe horizontally to view contact options"
                onScroll={(event) => updateSwipeCardEffects(event.currentTarget)}
                className="-mx-6 flex snap-x snap-proximity gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-col sm:gap-4 sm:overflow-visible sm:p-0"
              >
                {contactItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.a
                      key={item.id}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      data-swipe-card
                      whileHover={{ x: 6 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="group flex w-[70vw] max-w-[18rem] shrink-0 snap-center items-start gap-4 overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all duration-300 hover:border-[#FF7A00]/40 hover:bg-white/[0.05] hover:shadow-[0_8px_25px_rgba(255,122,0,0.12)] cursor-pointer sm:w-auto sm:max-w-none sm:gap-5"
                    >
                      {/* Icon inside circular glass container */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#FF7A00]/30 bg-[#FF7A00]/10 text-[#FF7A00] transition-all duration-300 group-hover:scale-110 group-hover:border-[#FF7A00] group-hover:bg-[#FF7A00] group-hover:text-black group-hover:shadow-[0_0_20px_rgba(255,122,0,0.6)]">
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Info Content */}
                      <div className="flex flex-col gap-0.5 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-poppins text-xs font-semibold uppercase tracking-wider text-[#FF7A00]/90">
                            {item.title}
                          </span>
                        </div>
                        <span className="font-geist text-base sm:text-lg font-medium text-white transition-colors duration-300 group-hover:text-[#FF7A00]">
                          {item.value}
                        </span>
                        <p className="font-inter text-xs font-light text-[#a1a1aa] leading-normal mt-0.5">
                          {item.caption}
                        </p>
                      </div>

                      {/* Arrow indicator on hover */}
                      <div className="ml-auto self-center text-[#a1a1aa] transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[#FF7A00]">
                        <ArrowUpRight className="h-5 w-5" />
                      </div>
                    </motion.a>
                  );
                })}
              </div>
              {/* Horizontal Divider */}
              <div className="my-6 h-[1px] w-full bg-gradient-to-r from-transparent via-white/15 to-transparent sm:my-8" />

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal()}
                className="group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#FF7A00] via-[#FF8C00] to-[#FFA000] py-4 px-8 font-geist text-base font-semibold text-black shadow-[0_0_25px_rgba(255,122,0,0.35)] transition-all duration-300 hover:shadow-[0_0_45px_rgba(255,122,0,0.65)]"
              >
                <span className="relative z-10 font-semibold tracking-wide">Start Your Project</span>
                <ArrowUpRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export function Sections() {
  const { openModal } = useProjectInquiryModal();
  const containerRef = useRef<HTMLDivElement>(null);
  const servicesViewportRef = useRef<HTMLDivElement>(null);
  const servicesTrackRef = useRef<HTMLDivElement>(null);
  const servicesIndexRef = useRef(0);
  const servicesX = useMotionValue(0);
  const servicesDragRef = useRef<{ pointerId: number; startX: number; startY: number; startOffset: number; horizontal: boolean } | null>(null);
  const servicesMotionTimeoutRef = useRef<number | null>(null);

  const getServicesOffset = (index: number) => {
    const viewport = servicesViewportRef.current;
    const track = servicesTrackRef.current;
    const card = track?.querySelector<HTMLElement>("[data-service-card]");
    if (!viewport || !track || !card) return 0;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;
    return -(index * (card.getBoundingClientRect().width + gap));
  };

  const settleServicesAt = (index: number, immediate = false) => {
    const boundedIndex = Math.max(0, Math.min(BUILD_SERVICES.length - 1, index));
    servicesIndexRef.current = boundedIndex;
    const target = window.innerWidth >= 768 ? 0 : getServicesOffset(boundedIndex);
    if (immediate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      servicesX.set(target);
    } else {
      animate(servicesX, target, { type: "spring", stiffness: 340, damping: 34, mass: 0.8 });
    }
  };

  useEffect(() => {
    const onResize = () => {
      const target = window.innerWidth >= 768 ? 0 : getServicesOffset(servicesIndexRef.current);
      servicesX.set(target);
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => {
      window.removeEventListener("resize", onResize);
      if (servicesMotionTimeoutRef.current !== null) {
        window.clearTimeout(servicesMotionTimeoutRef.current);
      }
    };
  }, [servicesX]);

  const onServicesPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (window.innerWidth >= 768 || !event.isPrimary || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    servicesX.stop();
    if (servicesMotionTimeoutRef.current !== null) {
      window.clearTimeout(servicesMotionTimeoutRef.current);
      servicesMotionTimeoutRef.current = null;
    }
    servicesTrackRef.current?.querySelectorAll<HTMLElement>("[data-service-elastic]").forEach((card) => {
      card.style.transition = "none";
      card.style.transform = "";
      card.style.filter = "";
      card.style.transition = "";
    });
    servicesDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: servicesX.get(),
      horizontal: false,
    };
  };

  const onServicesPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = servicesDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.horizontal && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
    if (!drag.horizontal && Math.abs(dy) > Math.abs(dx)) {
      servicesDragRef.current = null;
      return;
    }
    drag.horizontal = true;
    event.preventDefault();
    const atEdge = (servicesIndexRef.current === 0 && dx > 0) || (servicesIndexRef.current === BUILD_SERVICES.length - 1 && dx < 0);
    const resistedDx = atEdge ? dx * 0.24 : dx;
    servicesX.set(drag.startOffset + resistedDx * 0.62);
    servicesTrackRef.current?.querySelectorAll<HTMLElement>("[data-service-elastic]").forEach((card) => {
      card.style.filter = "none";
    });
    const activeCard = servicesTrackRef.current?.querySelector<HTMLElement>(`[data-service-card="${servicesIndexRef.current}"] [data-service-elastic]`);
    if (activeCard) {
      const stretch = Math.min(Math.abs(dx) / 900, 0.025);
      activeCard.style.transform = `scaleX(${1 + stretch}) skewX(${Math.sign(dx) * Math.min(Math.abs(dx) / 180, 1.1)}deg)`;
      if (!atEdge) {
        activeCard.style.filter = `blur(${Math.min(Math.abs(dx) / 90, 0.75)}px)`;
      }
    }
  };

  const finishServicesPointer = (event: React.PointerEvent<HTMLDivElement>, cancelled = false) => {
    const drag = servicesDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    servicesDragRef.current = null;
    const dx = event.clientX - drag.startX;
    const intentionalSwipe = drag.horizontal && Math.abs(dx) >= 8;
    const nextIndex = !cancelled && intentionalSwipe
      ? servicesIndexRef.current + (dx < 0 ? 1 : -1)
      : servicesIndexRef.current;
    const elasticCards = servicesTrackRef.current?.querySelectorAll<HTMLElement>("[data-service-elastic]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    elasticCards?.forEach((card) => {
      card.style.transition = prefersReducedMotion ? "none" : "transform 420ms cubic-bezier(.2,.8,.2,1), filter 320ms ease-out";
      card.style.transform = "";
      card.style.filter = "";
    });
    if (!prefersReducedMotion && elasticCards?.length) {
      servicesMotionTimeoutRef.current = window.setTimeout(() => {
        servicesTrackRef.current?.querySelectorAll<HTMLElement>("[data-service-elastic]").forEach((card) => {
          card.style.transition = "";
        });
        servicesMotionTimeoutRef.current = null;
      }, 450);
    } else {
      elasticCards?.forEach((card) => { card.style.transition = ""; });
    }
    settleServicesAt(nextIndex);
  };

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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
          className="flex flex-col gap-6 md:max-w-3xl"
        >
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
        </motion.div>

        {/* 4-Card Responsive Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          ref={servicesViewportRef}
          onPointerDown={onServicesPointerDown}
          onPointerMove={onServicesPointerMove}
          onPointerUp={(event) => finishServicesPointer(event)}
          onPointerCancel={(event) => finishServicesPointer(event, true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") settleServicesAt(servicesIndexRef.current + 1);
            if (event.key === "ArrowLeft") settleServicesAt(servicesIndexRef.current - 1);
          }}
          tabIndex={0}
          aria-label="Swipe horizontally to view all services"
          className="-mx-6 mt-16 touch-pan-y overflow-hidden px-0 pb-5 md:mx-0 md:overflow-visible md:p-0"
        >
          <motion.div
            ref={servicesTrackRef}
            style={{ x: servicesX }}
            className="services-carousel-track flex w-max items-stretch gap-4 md:grid md:w-full md:grid-cols-2 md:gap-6 lg:gap-8"
          >
          {BUILD_SERVICES.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.number}
                variants={serviceCardVariants}
                data-service-card={index}
                className="group relative flex h-[27rem] w-[78vw] max-w-[24rem] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition-[border-color,background-color,box-shadow] duration-300 md:h-auto md:min-h-[25rem] md:w-auto md:max-w-none md:p-10 md:backdrop-blur-xl md:hover:-translate-y-2 md:hover:border-[#C98A3D]/40 md:hover:bg-white/[0.04] md:hover:shadow-[0_20px_50px_rgba(201,138,61,0.12),0_0_20px_rgba(201,138,61,0.06)]"
              >
                <div data-service-elastic className="relative z-10 flex h-full flex-col justify-between will-change-transform">
                {/* Top Row: Icon + Number */}
                <div className="mb-8 flex items-start justify-between gap-4">
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

                <ServiceCardVisual number={service.number} />

                {/* Content */}
                <div className="mt-auto flex flex-col gap-3">
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
                </div>

                {/* Subtle bottom gradient accent bar on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C98A3D] to-transparent opacity-0 transition-opacity duration-500 md:group-hover:opacity-100" />
              </motion.div>
            );
          })}
          </motion.div>
        </motion.div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          02 — MONTHLY SOCIAL MEDIA PACKAGES
          ──────────────────────────────────────────────────────────── */}
      <section
        id="plans"
        className="relative mx-auto w-full max-w-[1600px] overflow-hidden border-t border-white/10 px-6 py-28 md:px-14 md:py-32 lg:px-20"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.07)_0%,transparent_70%)] blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
          className="relative flex flex-col gap-5 md:max-w-3xl"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#FF7A00]/25 bg-[#FF7A00]/[0.05] px-4 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF7A00]" />
            <span className="font-poppins text-xs font-medium uppercase tracking-[0.35em] text-[#FF7A00]">
              02 — MONTHLY PLANS
            </span>
          </div>
          <h2 className="font-geist text-[clamp(2.25rem,5.5vw,4rem)] font-medium leading-[1.05] tracking-tight text-white">
            Consistent content. Built-in momentum.
          </h2>
          <p className="max-w-2xl font-inter text-base font-light leading-relaxed text-muted md:text-lg">
            Choose the monthly social media plan that fits your brand, with content, production and page management in one place.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          onScroll={(event) => updateSwipeCardEffects(event.currentTarget)}
          tabIndex={0}
          aria-label="Swipe horizontally to compare monthly plans"
          className="relative -mx-6 mt-14 flex snap-x snap-proximity items-stretch gap-4 overflow-x-auto px-6 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:p-0 xl:grid-cols-3 xl:gap-7"
        >
          {MONTHLY_PACKAGES.map((pkg) => {
            const featured = pkg.id === "premium-growth";
            return (
              <motion.article
                key={pkg.id}
                variants={cardVariants}
                data-swipe-card
                className={`group relative flex h-full w-[78vw] max-w-[24rem] shrink-0 snap-center flex-col overflow-hidden rounded-3xl border p-7 backdrop-blur-xl transition-[border-color,background-color,box-shadow] duration-300 hover:-translate-y-2 md:w-auto md:max-w-none md:p-8 ${
                  featured
                    ? "border-[#FF7A00]/50 bg-gradient-to-b from-[#FF7A00]/[0.11] via-[#0b0b0d]/95 to-[#0b0b0d]/95 shadow-[0_20px_60px_rgba(255,122,0,0.09)]"
                    : "border-white/10 bg-white/[0.025] hover:border-white/25 hover:bg-white/[0.04]"
                }`}
              >
                <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#FF7A00]/[0.08] blur-3xl transition-opacity duration-500 group-hover:opacity-150" />
                {featured && (
                  <div className="relative mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#FF7A00]/30 bg-[#FF7A00]/10 px-3 py-1 font-poppins text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF7A00]">
                    <Star className="h-3 w-3 fill-current" /> Best Value
                  </div>
                )}
                <div className="relative">
                  <p className="font-poppins text-xs font-medium uppercase tracking-[0.2em] text-white/45">
                    {pkg.id === "starter" ? "Start strong" : pkg.id === "professional" ? "Stay consistent" : "Grow faster"}
                  </p>
                  <h3 className="mt-2 font-geist text-2xl font-semibold tracking-tight text-white md:text-3xl">
                    {pkg.name}
                  </h3>
                  <p className="mt-3 min-h-10 font-inter text-sm leading-relaxed text-white/55">
                    {pkg.description}
                  </p>
                </div>

                <div className="relative mt-6 border-b border-white/10 pb-6">
                  <span className="font-geist text-4xl font-semibold tracking-tight text-white md:text-5xl">{pkg.price}</span>
                  <span className="ml-2 font-inter text-sm text-white/45">/ month</span>
                </div>

                <div className="relative flex-1 py-6">
                  <p className="mb-4 font-poppins text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    What&apos;s included
                  </p>
                  <ul className="flex flex-col gap-3">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 font-inter text-sm leading-relaxed text-white/75">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#FF7A00]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => openModal(pkg.id)}
                  className={`group/choose relative mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3.5 font-poppins text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
                    featured
                      ? "border-[#FF7A00] bg-[#FF7A00] text-black hover:bg-[#ff9638]"
                      : "border-white/15 bg-white/[0.03] text-white/80 hover:border-[#FF7A00]/60 hover:bg-[#FF7A00]/10 hover:text-[#FF7A00]"
                  }`}
                >
                  Choose this plan
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/choose:translate-x-0.5 group-hover/choose:-translate-y-0.5" />
                </button>
              </motion.article>
            );
          })}
        </motion.div>
        <p className="relative mt-6 font-inter text-xs leading-relaxed text-white/40">
          Advertising budget for Meta Ads / Google Ads, if required, is separate.
        </p>
      </section>

      {/* ────────────────────────────────────────────────────────────
          03 — ABOUT OUR TEAM (OFFICIAL TEAM SHOWCASE WITH AVATARS)
          ──────────────────────────────────────────────────────────── */}
      <section
        id="about"
        className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col justify-center border-t border-white/10 px-6 py-28 md:px-14 lg:px-20"
      >
        {/* Ambient orange background glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.04)_0%,transparent_70%)] blur-3xl" />

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
          className="flex flex-col gap-6 md:max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/25 bg-[#FF7A00]/[0.05] px-4 py-1.5 backdrop-blur-md w-fit">
            <span className="h-2 w-2 rounded-full bg-[#FF7A00] animate-pulse" />
            <span className="font-poppins text-xs font-medium uppercase tracking-[0.35em] text-[#FF7A00]">
              03 — ABOUT OUR TEAM
            </span>
          </div>

          <h2 className="font-geist text-[clamp(2.25rem,5.5vw,4rem)] font-medium leading-[1.05] tracking-tight text-white">
            The Minds Behind A2 Production
          </h2>

          <p className="max-w-2xl font-inter text-base font-light text-[#a1a1aa] leading-relaxed md:text-lg">
            A passionate team of creators, filmmakers and developers dedicated to building cinematic experiences, powerful digital products and unforgettable visual stories.
          </p>
        </motion.div>

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
          04 — OUR PROCESS (PREMIUM CINEMATIC WORKFLOW)
          ──────────────────────────────────────────────────────────── */}
      <ProcessSection />

      {/* ────────────────────────────────────────────────────────────
          05 — CONTACT
          ──────────────────────────────────────────────────────────── */}
      <ContactSection />

      <footer className="relative border-t border-white/10 bg-[#06080e] px-6 py-16 md:px-14 lg:px-20 overflow-hidden">
        {/* Subtle orange accent glow at bottom right */}
        <div className="pointer-events-none absolute bottom-0 right-0 h-[250px] w-[250px] rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.03)_0%,transparent_70%)] blur-3xl" />
        
        <div className="mx-auto max-w-[1600px]">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 pb-12 md:gap-y-10 lg:grid-cols-12 lg:gap-8">
            
            {/* BRAND COLUMN */}
            <div className="col-span-2 flex flex-col gap-5 lg:col-span-5">
              <a
                href="#"
                className="group flex items-center gap-3.5 py-1 text-text transition-opacity duration-300 hover:opacity-90 w-fit"
                aria-label="A2 Production"
              >
                <img
                  src="/images/a2-symbol-only.png"
                  alt="A2 Logo"
                  className="h-8 md:h-[38px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <span className="font-geist text-xs md:text-[13px] font-medium tracking-[0.38em] uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent transition-all duration-300 group-hover:tracking-[0.42em]">
                  PRODUCTION
                </span>
              </a>
              <p className="max-w-xs font-inter text-sm font-light text-[#a1a1aa] leading-relaxed">
                Crafting premium cinematic visuals, brand identities, and high-performance digital products that refuse to blend in.
              </p>
            </div>

            {/* EXPLORE COLUMN */}
            <div className="flex flex-col gap-4 lg:col-span-2 lg:col-start-7">
              <span className="font-poppins text-xs font-bold uppercase tracking-wider text-[#FF7A00]/80">
                Explore
              </span>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <a href="#services" className="font-inter text-sm font-light text-[#a1a1aa] transition-colors duration-300 hover:text-white">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#plans" className="font-inter text-sm font-light text-[#a1a1aa] transition-colors duration-300 hover:text-white">
                    Monthly Plans
                  </a>
                </li>
                <li>
                  <a href="#about" className="font-inter text-sm font-light text-[#a1a1aa] transition-colors duration-300 hover:text-white">
                    About Team
                  </a>
                </li>
                <li>
                  <a href="#process" className="font-inter text-sm font-light text-[#a1a1aa] transition-colors duration-300 hover:text-white">
                    Our Process
                  </a>
                </li>
                <li>
                  <a href="#contact" className="font-inter text-sm font-light text-[#a1a1aa] transition-colors duration-300 hover:text-white">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* CONNECT COLUMN */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              <span className="font-poppins text-xs font-bold uppercase tracking-wider text-[#FF7A00]/80">
                Connect
              </span>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <a
                    href="https://www.instagram.com/a2_production1?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/social inline-flex items-center gap-2.5 font-inter text-sm font-light text-[#a1a1aa] transition-colors duration-200 hover:text-white"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-[#C98A3D]/75 transition-colors duration-200 group-hover/social:border-[#C98A3D]/30 group-hover/social:text-[#d7aa77]"><InstagramIcon className="h-3.5 w-3.5" /></span>
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/919330683966"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/social inline-flex items-center gap-2.5 font-inter text-sm font-light text-[#a1a1aa] transition-colors duration-200 hover:text-white"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-[#C98A3D]/75 transition-colors duration-200 group-hover/social:border-[#C98A3D]/30 group-hover/social:text-[#d7aa77]"><WhatsappIcon className="h-3.5 w-3.5" /></span>
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:a2production440@gmail.com"
                    className="group/social inline-flex items-center gap-2.5 font-inter text-sm font-light text-[#a1a1aa] transition-colors duration-200 hover:text-white"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-[#C98A3D]/75 transition-colors duration-200 group-hover/social:border-[#C98A3D]/30 group-hover/social:text-[#d7aa77]"><Mail className="h-3.5 w-3.5" /></span>
                    Email
                  </a>
                </li>
                <li>
                  <span title="Facebook page link will be added when available" className="inline-flex cursor-not-allowed items-center gap-2.5 font-inter text-sm font-light text-[#a1a1aa]/55">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.018] text-[#C98A3D]/45"><FacebookIcon className="h-3.5 w-3.5" /></span>
                    Facebook
                  </span>
                </li>
              </ul>
            </div>

            {/* LOCATION COLUMN */}
            <div className="col-span-2 flex flex-col gap-4 lg:col-span-3">
              <span className="font-poppins text-xs font-bold uppercase tracking-wider text-[#FF7A00]/80">
                Location
              </span>
              <p className="font-inter text-sm font-light text-[#a1a1aa] leading-relaxed">
                India <br />
                <span className="text-xs text-[#a1a1aa]/60">Serving clients worldwide</span>
              </p>
            </div>

          </div>

          {/* BOTTOM COPYRIGHT SECTION */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-inter text-xs text-[#a1a1aa]/60">
              © {new Date().getFullYear()} A2 Production. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="font-inter text-xs text-[#a1a1aa]/60 hover:text-[#FF7A00] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="font-inter text-xs text-[#a1a1aa]/60 hover:text-[#FF7A00] transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
