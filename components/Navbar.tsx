"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useProjectInquiryModal } from "@/components/ProjectInquiryContext";

const LINKS = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { openModal } = useProjectInquiryModal();

  useEffect(() => {
    const onScroll = () => {
      const servicesSection = document.getElementById("services");
      if (servicesSection) {
        // Navbar stays transparent throughout video playback until #services section is reached
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

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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

          <button
            className="text-text md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
              className="overflow-hidden border-t border-white/10 bg-background/95 backdrop-blur-xl md:hidden"
            >
              <ul className="flex flex-col gap-1 px-6 py-6">
                {LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block py-3 font-geist text-lg text-text"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => {
                      setOpen(false);
                      openModal();
                    }}
                    className="mt-2 w-full rounded-full border border-[#FF7A00]/50 bg-[#FF7A00]/10 px-6 py-3.5 font-poppins text-sm font-semibold uppercase tracking-[0.15em] text-[#FF7A00] transition-all duration-300 hover:bg-[#FF7A00] hover:text-black"
                  >
                    Start a Project
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

