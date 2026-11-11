"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Menu, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useProjectInquiryModal } from "@/components/ProjectInquiryContext";
import { supabase } from "@/lib/supabase";

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
  { label: "Monthly Plans", href: "#plans" },
  { label: "About", href: "#about" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
  { label: "Admin", href: "/admin" },
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
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isHomeRoute = pathname === "/";
  const resolveLinkHref = (href: string) =>
    !isHomeRoute && href.startsWith("#") ? `/${href}` : href;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [hasAdminSession, setHasAdminSession] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const closeMenuRef = useRef<HTMLButtonElement>(null);
  const { openModal } = useProjectInquiryModal();

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    let active = true;
    const updateAdminSession = (session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) => {
      if (active) setHasAdminSession(session?.user.app_metadata?.role === "admin");
    };

    void supabase.auth.getSession().then(({ data }) => updateAdminSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateAdminSession(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const guardAdminNavigation = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isAdminRoute || !hasAdminSession || href.startsWith("/admin")) return;
    event.preventDefault();
    window.dispatchEvent(new CustomEvent("a2:admin-exit-request", { detail: { href } }));
  };

  useEffect(() => {
    let frame = 0;
    const updateScrolledState = () => {
      frame = 0;
      const heroSection = document.getElementById("hero-section");
      const servicesSection = document.getElementById("services");
      const nextScrolled = heroSection
        ? heroSection.getBoundingClientRect().bottom <= 0
        : servicesSection
          ? servicesSection.getBoundingClientRect().top <= 0
          : window.scrollY >= window.innerHeight * 3.8;
      setScrolled((current) => current === nextScrolled ? current : nextScrolled);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateScrolledState);
    };

    const onResize = () => {
      onScroll();
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Lock body scroll while the mobile menu is open & handle Escape key
  useEffect(() => {
    if (open) {
      window.dispatchEvent(new CustomEvent("a2:mobile-menu-open"));
      document.body.style.overflow = "hidden";
      const previousFocus = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      const focusFrame = window.requestAnimationFrame(() => {
        closeMenuRef.current?.focus({ preventScroll: true });
      });
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleClose();
          return;
        }
        if (e.key !== "Tab") return;
        const focusable = Array.from(
          mobileMenuRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ) || [],
        ).filter((element) => element.getClientRects().length > 0);
        if (focusable.length === 0) {
          e.preventDefault();
          mobileMenuRef.current?.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.cancelAnimationFrame(focusFrame);
        window.removeEventListener("keydown", handleKeyDown);
        previousFocus?.focus({ preventScroll: true });
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [open, handleClose]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/35 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md"
            : "bg-transparent shadow-none backdrop-blur-0"
        }`}
      >
        <nav className="mx-auto flex h-[70px] max-w-[1600px] items-center justify-between px-6 md:px-14">
          <a
            href={isHomeRoute ? "#" : "/"}
            onClick={(event) => guardAdminNavigation(event, isHomeRoute ? "#" : "/")}
            className="group flex items-center gap-3.5 py-1 text-text transition-opacity duration-300 hover:opacity-90"
            aria-label="A2 Production"
          >
            <Image
              src="/images/a2-symbol-only.png"
              alt=""
              width={60}
              height={45}
              className="h-8 md:h-[38px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-geist text-xs md:text-[13px] font-medium tracking-[0.38em] uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent transition-all duration-300 group-hover:tracking-[0.42em]">
              PRODUCTION
            </span>
          </a>

          <ul className="hidden items-center gap-10 md:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={resolveLinkHref(link.href)}
                  onClick={(event) => guardAdminNavigation(event, resolveLinkHref(link.href))}
                  className="nav-link font-inter text-sm text-muted transition-colors duration-300 hover:text-text"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {!isAdminRoute && (
            <div className="hidden md:block">
              <MagneticButton
                variant="ghost"
                className="px-6 py-3 text-xs"
                onClick={openModal}
              >
                Start a Project
              </MagneticButton>
            </div>
          )}

          {/* Mobile Hamburger Trigger (44px circular glass button) */}
          <button
            ref={menuTriggerRef}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] backdrop-blur-md text-text transition-all duration-300 hover:border-[#FF7A00]/50 hover:bg-[#FF7A00]/10 hover:text-[#FF7A00] active:scale-95 md:hidden shadow-md"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-controls="mobile-navigation-dialog"
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
            ref={mobileMenuRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[100] h-[100svh] w-screen bg-[#050505] md:hidden overflow-y-auto"
            id="mobile-navigation-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            tabIndex={-1}
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
                  href={isHomeRoute ? "#" : "/"}
                  onClick={(event) => {
                    guardAdminNavigation(event, isHomeRoute ? "#" : "/");
                    handleClose();
                  }}
                  className="flex items-center gap-2.5"
                  aria-label="A2 Production"
                >
                  <Image
                    src="/images/a2-symbol-only.png"
                    alt=""
                    width={60}
                    height={45}
                    className="h-7 w-auto object-contain"
                  />
                  <span className="font-geist text-[11px] font-medium tracking-[0.3em] uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    PRODUCTION
                  </span>
                </a>

                {/* 44px Circular Close Button */}
                <button
                  ref={closeMenuRef}
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
                        href={resolveLinkHref(link.href)}
                        onClick={(event) => {
                          guardAdminNavigation(event, resolveLinkHref(link.href));
                          // The navigation guard prevents leaving an authenticated admin page
                          // until the user chooses to stay or sign out.
                          // Keep the mobile menu closed while the confirmation is shown.
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

                {!isAdminRoute && (
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
                )}
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

