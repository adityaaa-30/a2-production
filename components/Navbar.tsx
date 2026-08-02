"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Menu, X } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useProjectInquiryModal } from "@/components/ProjectInquiryContext";

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
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

const LINKS = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/a2_production1?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    icon: InstagramIcon,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/919330683966",
    icon: WhatsappIcon,
  },
  {
    label: "Email",
    href: "mailto:a2production440@gmail.com",
    icon: Mail,
  },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const { openModal } = useProjectInquiryModal();

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const servicesSection = document.getElementById("services");
      if (servicesSection) {
        const triggerPoint =
          servicesSection.getBoundingClientRect().top + window.scrollY - 100;
        setScrolled(window.scrollY >= triggerPoint);
      } else {
        setScrolled(window.scrollY > window.innerHeight * 3.8);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Lock body scroll while the mobile menu is open & handle Escape key
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") handleClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [open, handleClose]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled
            ? "border-b border-white/10 bg-background/70 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 md:px-14">
          <a
            href="#"
            className="group flex items-center gap-3.5 py-1 text-text transition-opacity duration-300 hover:opacity-90"
            aria-label="A2 Production"
          >
            <img
              src="/images/a2-brand-logo.png"
              alt="A2 Logo"
              className="h-8 md:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_12px_rgba(217,119,6,0.35)]"
            />
            <span className="font-geist text-xs md:text-[13px] font-medium tracking-[0.38em] uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent transition-all duration-300 group-hover:tracking-[0.42em]">
              PRODUCTION
            </span>
          </a>

          <ul className="hidden items-center gap-10 md:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="nav-link font-inter text-sm text-muted transition-colors duration-300 hover:text-text"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <MagneticButton
              variant="ghost"
              className="px-6 py-3 text-xs"
              onClick={openModal}
            >
              Start a Project
            </MagneticButton>
          </div>

          {/* Mobile Hamburger Trigger (44px circular glass button) */}
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] backdrop-blur-md text-text transition-all duration-300 hover:border-[#FF7A00]/50 hover:bg-[#FF7A00]/10 hover:text-[#FF7A00] active:scale-95 md:hidden shadow-md"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu size={20} />
          </button>
        </nav>
      </header>

      {/* ── Minimalist Luxury Mobile Navigation Overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[100] h-[100svh] w-screen bg-[#050505] md:hidden overflow-y-auto"
          >
            {/* Subtle Ambient Background Gradient */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,122,0,0.05)_0%,transparent_60%)]" />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex min-h-full w-full flex-col justify-between max-w-md mx-auto"
              style={{
                paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)",
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
              }}
            >
              {/* Header Bar */}
              <div className="flex h-14 items-center justify-between">
                <a
                  href="#"
                  onClick={handleClose}
                  className="flex items-center gap-2.5"
                  aria-label="A2 Production"
                >
                  <img
                    src="/images/a2-brand-logo.png"
                    alt="A2 Logo"
                    className="h-6 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(217,119,6,0.3)]"
                  />
                  <span className="font-geist text-[11px] font-medium tracking-[0.3em] uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    PRODUCTION
                  </span>
                </a>

                {/* 44px Circular Close Button */}
                <button
                  onClick={handleClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl text-white/80 transition-colors duration-200 hover:border-[#FF7A00]/40 hover:text-white active:scale-95"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Card (Centered & Compact) */}
              <div className="my-auto py-6">
                <ul className="flex flex-col">
                  {LINKS.map((link, idx) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.05 + idx * 0.04,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      className="border-b border-white/[0.08] first:border-t first:border-white/[0.08]"
                    >
                      <motion.a
                        href={link.href}
                        onClick={() => {
                          setActiveItem(link.href);
                          handleClose();
                        }}
                        onMouseEnter={() => setActiveItem(link.href)}
                        onMouseLeave={() => setActiveItem(null)}
                        whileHover={{ x: 6 }}
                        whileTap={{ x: 6 }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        className={`flex items-center justify-between py-3.5 font-geist text-[21px] font-semibold tracking-tight transition-colors duration-200 ${
                          activeItem === link.href
                            ? "text-[#FF7A00]"
                            : "text-white/85 hover:text-[#FF7A00]"
                        }`}
                      >
                        <span>{link.label}</span>
                        {activeItem === link.href && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF7A00] shadow-[0_0_10px_#FF7A00]" />
                        )}
                      </motion.a>
                    </motion.li>
                  ))}
                </ul>

                {/* 85% Width 52px CTA Button */}
                <div className="mt-8">
                  <button
                    onClick={() => {
                      handleClose();
                      openModal();
                    }}
                    className="w-[85%] max-w-sm mx-auto h-[52px] flex items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A00] via-[#FF8C00] to-[#FFA000] font-poppins text-sm font-semibold tracking-wide text-black shadow-[0_0_25px_rgba(255,122,0,0.3)] transition-transform duration-200 active:scale-[0.98]"
                  >
                    Start Your Project
                  </button>
                </div>
              </div>

              {/* Minimalist Social Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="flex items-center justify-center gap-7 pt-2"
              >
                {SOCIAL_LINKS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 font-inter text-[14px] font-medium text-white/40 transition-colors duration-200 hover:text-[#FF7A00]"
                    >
                      <Icon size={15} className="transition-opacity duration-200 group-hover:opacity-100" />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

