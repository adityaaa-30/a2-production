"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  ChevronDown,
  Check,
  Search,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { useMonthlyPackages } from "@/hooks/useMonthlyPackages";
import { formatMonthlyPrice } from "@/lib/monthly-packages";
import { BUSINESS_TYPES, PHONE_COUNTRIES as COUNTRY_CODES, PROJECT_TIMELINES as TIMELINES } from "@/lib/project-inquiry-options";


/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   SCHEMA
   ═══════════════════════════════════════════════════════════════ */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const capitalizeWords = (v: string) =>
  v.trim().replace(/\b[a-z]/g, (c) => c.toUpperCase());

const formSchema = z.object({
  fullName: z
    .string()
    .transform(capitalizeWords)
    .refine((v) => v.length >= 2, "Full name must be at least 2 characters")
    .refine((v) => v.length <= 100, "Full name must not exceed 100 characters"),
  businessName: z
    .string()
    .transform(capitalizeWords)
    .refine((v) => v.length >= 2, "Business name must be at least 2 characters")
    .refine((v) => v.length <= 150, "Business name must not exceed 150 characters"),
  businessType: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length >= 1, "Please select a business type")
    .refine((v) => v.length <= 100, "Invalid business type"),
  phoneCode: z.string(),
  phoneNumber: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, "Phone number is required")
    .refine((v) => /^[0-9]{10}$/.test(v), "Phone number must be exactly 10 digits"),
  email: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, "Email is required")
    .refine((v) => v.length <= 100, "Email must not exceed 100 characters")
    .refine((v) => EMAIL_REGEX.test(v), "Enter a valid email address"),
  timeline: z.string().optional(),
  monthlyPackage: z.string().optional(),
  description: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length === 0 || v.length <= 3000, "Project description must not exceed 3000 characters")
    .optional(),
  websiteUrl: z.string().optional(),
  consent: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

/* ═══════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════ */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3, delay: 0.1 } },
};

const modalVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] as const },
  },
  exit: {
    opacity: 0,
    y: 30,
    scale: 0.97,
    transition: { duration: 0.3, ease: [0.55, 0, 1, 0.45] as const },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15 + i * 0.06,
      duration: 0.6,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  }),
};

const successVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] as const },
  },
};

/* ═══════════════════════════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ── Input Field Wrapper ── */
function FieldWrapper({
  label,
  required,
  error,
  children,
  index,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div custom={index} variants={fieldVariants} className="flex flex-col gap-2">
      <label className="font-poppins text-xs font-medium uppercase tracking-[0.2em] text-white/60">
        {label}
        {required && <span className="text-[#FF7A00] ml-1">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="font-inter text-xs text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Styled Text Input ── */
const inputClasses =
  "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 font-inter text-sm text-white placeholder:text-white/25 outline-none transition-all duration-300 focus:border-[#FF7A00]/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(255,122,0,0.1)] backdrop-blur-md";

/* ── Searchable Select ── */
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: readonly string[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${inputClasses} flex items-center justify-between text-left`}
      >
        <span className={value ? "text-white" : "text-white/25"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-white/30 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0f]/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <Search className="h-4 w-4 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent font-inter text-sm text-white outline-none placeholder:text-white/25"
                autoFocus
              />
            </div>
            <div
              className="max-h-52 overflow-y-auto custom-scrollbar overscroll-contain"
              data-lenis-prevent
            >
              {filtered.length === 0 ? (
                <p className="px-4 py-3 font-inter text-sm text-white/30">
                  No results found
                </p>
              ) : (
                filtered.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`block w-full px-4 py-3 text-left font-inter text-sm transition-colors duration-200 ${
                      value === option
                        ? "bg-[#FF7A00]/10 text-[#FF7A00]"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {option}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Simple Select Dropdown ── */
function SimpleSelect({
  options,
  value,
  onChange,
  placeholder,
  optionDetails,
}: {
  options: readonly string[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  optionDetails?: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${inputClasses} group flex items-center justify-between text-left hover:border-[#FF7A00]/45 hover:shadow-[0_0_22px_rgba(255,122,0,0.08)] active:scale-[0.995]`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className={value ? "truncate text-white" : "text-white/35"}>
            {value || placeholder}
          </span>
          {value && optionDetails?.[value] && (
            <span className="shrink-0 rounded-full border border-[#FF7A00]/20 bg-[#FF7A00]/[0.08] px-2.5 py-1 font-poppins text-xs font-medium text-[#FF7A00]">
              {optionDetails[value]}<span className="ml-1 text-[10px] text-[#FF7A00]/65">/ mo</span>
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/40 transition-all duration-300 ${open ? "rotate-180 text-[#FF7A00]" : "group-hover:text-[#FF7A00]"}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-[#FF7A00]/20 bg-[#0b0b0d]/[0.98] shadow-[0_18px_55px_rgba(0,0,0,0.6),0_0_25px_rgba(255,122,0,0.07)] backdrop-blur-2xl"
          >
            {optionDetails ? (
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3">
                <span className="font-poppins text-[10px] font-medium uppercase tracking-[0.22em] text-white/35">Monthly plan</span>
                <span className="font-poppins text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">Price</span>
              </div>
            ) : (
              <div className="h-px bg-white/[0.07]" />
            )}
            <div
              className="max-h-52 overflow-y-auto custom-scrollbar overscroll-contain"
              data-lenis-prevent
            >
              {options.map((option) => (
                <motion.button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.995 }}
                  transition={{ duration: 0.16 }}
                  className={`group/option flex w-full items-center justify-between gap-4 border-l-2 px-5 py-3.5 text-left font-inter text-sm transition-all duration-200 ${
                    value === option
                      ? "border-[#FF7A00] bg-[#FF7A00]/[0.09] text-white"
                      : "border-transparent text-white/70 hover:border-[#FF7A00]/50 hover:bg-white/[0.045] hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg border text-[10px] font-semibold transition-all duration-200 ${value === option ? "border-[#FF7A00]/35 bg-[#FF7A00]/10 text-[#FF7A00]" : "border-white/10 bg-white/[0.025] text-white/35 group-hover/option:border-[#FF7A00]/25 group-hover/option:text-[#FF7A00]"}`}>
                      {String(options.indexOf(option) + 1).padStart(2, "0")}
                    </span>
                    <span className="font-medium">{option}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {optionDetails?.[option] && (
                      <span className={`font-poppins text-sm font-semibold transition-colors ${value === option ? "text-[#FF7A00]" : "text-white/60 group-hover/option:text-[#FF7A00]"}`}>
                        {optionDetails[option]}<span className="ml-1 text-[10px] font-normal text-white/35">/ mo</span>
                      </span>
                    )}
                    {value === option && <Check className="h-4 w-4 text-[#FF7A00]" />}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Animated Checkmark for Success ── */
function AnimatedCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] as const, delay: 0.2 }}
      className="relative mx-auto flex h-24 w-24 items-center justify-center"
    >
      <div className="absolute inset-0 rounded-full bg-[#FF7A00]/10 animate-ping" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#FF7A00] bg-[#FF7A00]/10 shadow-[0_0_40px_rgba(255,122,0,0.3)]">
        <motion.svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        >
          <motion.path
            d="M8 18L15 25L28 11"
            stroke="#FF7A00"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          />
        </motion.svg>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN MODAL COMPONENT
   ═══════════════════════════════════════════════════════════════ */

interface ProjectInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPackage?: string;
}

export function ProjectInquiryModal({
  isOpen,
  onClose,
  initialPackage,
}: ProjectInquiryModalProps) {
  const monthlyPackages = useMonthlyPackages();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const glassReflectionRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);

  // Auto-hide toast notification after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      businessName: "",
      businessType: "",
      phoneCode: "+91",
      phoneNumber: "",
      email: "",
      timeline: "",
      monthlyPackage: "",
      description: "",
      consent: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      setValue("monthlyPackage", initialPackage || "");
    }
  }, [initialPackage, isOpen, setValue]);

  // Lock body and html scroll while the inquiry form is open.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  // Reset on close
  const handleClose = useCallback(() => {
    if (status === "submitting") return;
    onClose();
    // Delay reset to after exit animation
    setTimeout(() => {
      setStatus("idle");
      reset();
    }, 400);
  }, [onClose, reset, status]);
  const handleCloseRef = useRef(handleClose);
  useEffect(() => {
    handleCloseRef.current = handleClose;
  }, [handleClose]);

  // Keep keyboard focus inside the modal and restore it to the opener on close.
  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      (firstFocusable || dialogRef.current)?.focus({ preventScroll: true });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ) || [],
      ).filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [isOpen]);



  const onSubmit = async (data: FormData) => {
    // Prevent duplicate submissions while loading
    if (status === "submitting") return;

    // 1. Honeypot Check (Anti-Bot Protection)
    if (data.websiteUrl && data.websiteUrl.trim() !== "") {
      console.warn("Spam submission intercepted by honeypot.");
      setStatus("success");
      reset();
      return;
    }

    // 2. Strict Input Sanitization & Boundary Validation
    const clientName = data.fullName.trim();
    const businessName = data.businessName.trim();
    const businessType = data.businessType.trim();
    const email = data.email.trim();
    const phoneNumber = data.phoneNumber.trim();
    const description = data.description?.trim() ?? "";

    if (
      !clientName || clientName.length < 2 || clientName.length > 100 ||
      !businessName || businessName.length < 2 || businessName.length > 150 ||
      !businessType || businessType.length < 1 || businessType.length > 100 ||
      !email || email.length > 100 || !EMAIL_REGEX.test(email) ||
      !phoneNumber || !/^[0-9]{10}$/.test(phoneNumber) ||
      description.length > 3000
    ) {
      setToast({
        message: "Invalid submission data. Please check all fields and try again.",
        type: "error",
      });
      return;
    }

    setStatus("submitting");
    setToast(null);

    try {
      // Send submission request to server API route
      const emailRes = await fetch("/api/project-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseBody = await emailRes.json().catch(() => null);

      if (!emailRes.ok) {
        const errorMsg =
          responseBody?.error || `Submission failed with status code ${emailRes.status}`;
        throw new Error(errorMsg);
      }

      // Show success toast
      setToast({
        message: "Project request submitted successfully!",
        type: "success",
      });

      // Reset the form after success
      reset();

      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");

      let errorMessage = "Failed to submit project request. Please try again.";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
      ) {
        errorMessage = (err as { message: string }).message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("Submission failed:", err);
      }

      // Show error toast
      setToast({
        message: errorMessage,
        type: "error",
      });

      // Recover status after 4s
      setTimeout(() => setStatus("idle"), 4000);
    }

  };

  const handleSubmitAnother = () => {
    setStatus("idle");
    reset();
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="inquiry-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/55 backdrop-blur-md"
          data-lenis-prevent
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          {/* ── Toast Notification ── */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`fixed top-6 left-1/2 -translate-x-1/2 z-[130] flex items-center gap-3 rounded-2xl px-6 py-4 border shadow-2xl backdrop-blur-2xl font-inter text-sm max-w-md w-[90%] sm:w-auto ${
                  toast.type === "success"
                    ? "border-[#FF7A00]/40 bg-[#0a0a0c]/95 text-white shadow-[0_0_30px_rgba(255,122,0,0.25)]"
                    : "border-red-500/40 bg-[#0a0a0c]/95 text-white shadow-[0_0_30px_rgba(239,68,68,0.25)]"
                }`}
              >
                {toast.type === "success" ? (
                  <Check className="h-5 w-5 text-[#FF7A00] shrink-0" />
                ) : (
                  <X className="h-5 w-5 text-red-400 shrink-0" />
                )}
                <span className="flex-1">{toast.message}</span>
                <button
                  type="button"
                  onClick={() => setToast(null)}
                  className="ml-2 text-white/40 hover:text-white transition-colors"
                  aria-label="Close toast"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
                ref={dialogRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-3xl mx-4 my-8 md:my-12"
                role="dialog"
                aria-modal="true"
                aria-labelledby="project-inquiry-title"
                tabIndex={-1}
          >
            {/* ── Glassmorphism Container ── */}
            <div className="relative isolate overflow-hidden rounded-[30px] border border-white/[0.16] bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.055)_24%,rgba(10,12,18,0.82)_65%,rgba(255,122,0,0.045)_100%)] shadow-[0_35px_110px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-[40px] backdrop-saturate-150">
              {/* Soft glass reflections */}
              <div
                ref={glassReflectionRef}
                className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(120deg,rgba(255,255,255,0.09)_0%,transparent_28%,transparent_70%,rgba(255,122,0,0.035)_100%)]"
                style={{ willChange: "transform" }}
              />
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              <div
                ref={ambientGlowRef}
                className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.11)_0%,transparent_70%)] blur-3xl"
                style={{ willChange: "transform", transform: "translate3d(-50%, 0, 0)" }}
              />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-all duration-300 hover:border-[#FF7A00]/40 hover:bg-[#FF7A00]/10 hover:text-white"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>

              <div
                ref={scrollContainerRef}
                className="relative z-10 max-h-[85vh] overflow-y-auto custom-scrollbar overscroll-contain"
                data-lenis-prevent
                onScroll={(event) => {
                  const scrollTop = event.currentTarget.scrollTop;
                  const parallax = Math.min(scrollTop, 1200);
                  const driftX = Math.sin(scrollTop / 220) * 7;
                  if (glassReflectionRef.current) {
                    glassReflectionRef.current.style.transform = `translate3d(${driftX}px, ${parallax * 0.018}px, 0) scale(1.025)`;
                  }
                  if (ambientGlowRef.current) {
                    ambientGlowRef.current.style.transform = `translate3d(calc(-50% + ${driftX * -1.5}px), ${parallax * 0.055}px, 0)`;
                  }
                }}
              >
                <div className="px-8 py-12 md:px-14 md:py-16">
                  <AnimatePresence mode="wait">
                    {status === "success" ? (
                      /* ── SUCCESS STATE ── */
                      <motion.div
                        key="success"
                        variants={successVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="flex flex-col items-center justify-center gap-8 py-16 text-center"
                      >
                        <AnimatedCheckmark />

                        <div className="flex flex-col gap-4">
                          <h2 id="project-inquiry-title" className="font-geist text-3xl font-bold tracking-tight text-white md:text-4xl">
                            Project Submitted Successfully
                          </h2>
                          <p className="mx-auto max-w-md font-inter text-base font-light text-white/50 leading-relaxed">
                            Thank you for contacting A2 Production.
                            <br />
                            Our team will review your project and reach out
                            within 24 hours.
                          </p>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          <button
                            onClick={handleClose}
                            className="rounded-full border border-white/10 bg-white/5 px-8 py-3.5 font-poppins text-xs font-medium uppercase tracking-[0.2em] text-white/70 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                          >
                            Back to Home
                          </button>
                          <button
                            onClick={handleSubmitAnother}
                            className="group/s relative rounded-full border border-[#FF7A00]/50 bg-[#FF7A00]/10 px-8 py-3.5 font-poppins text-xs font-medium uppercase tracking-[0.2em] text-[#FF7A00] transition-all duration-500 hover:bg-[#FF7A00] hover:text-black hover:shadow-[0_0_30px_rgba(255,122,0,0.3)]"
                          >
                            Submit Another Project
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      /* ── FORM STATE ── */
                      <motion.div key="form" initial="hidden" animate="visible">
                        {/* Header */}
                        <motion.div
                          custom={0}
                          variants={fieldVariants}
                          className="mb-12"
                        >
                          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/25 bg-[#FF7A00]/[0.05] px-4 py-1.5 backdrop-blur-md">
                            <span className="h-2 w-2 rounded-full bg-[#FF7A00] animate-pulse" />
                            <span className="font-poppins text-[10px] font-medium uppercase tracking-[0.35em] text-[#FF7A00]">
                              PROJECT INQUIRY
                            </span>
                          </div>

                          <h2 id="project-inquiry-title" className="font-geist text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.1] tracking-tight text-white mb-4">
                            Let&apos;s Build Something
                            <br />
                            <span className="bg-gradient-to-r from-[#FF7A00] to-[#FF9A40] bg-clip-text text-transparent">
                              Extraordinary
                            </span>
                          </h2>

                          <p className="max-w-lg font-inter text-sm font-light text-white/40 leading-relaxed md:text-base">
                            Tell us about your business and project. Our team
                            will review your requirements and get back to you
                            within 24 hours.
                          </p>
                        </motion.div>

                        {/* Form */}
                        <form
                          onSubmit={handleSubmit(onSubmit)}
                          className="flex flex-col gap-7"
                          noValidate
                        >
                          {/* Honeypot hidden input field for anti-bot protection */}
                          <div
                            className="absolute opacity-0 pointer-events-none -z-10 h-0 w-0 overflow-hidden"
                            aria-hidden="true"
                          >
                            <input
                              type="text"
                              {...register("websiteUrl")}
                              tabIndex={-1}
                              autoComplete="off"
                              placeholder="Do not fill this out"
                            />
                          </div>
                          {/* Row: Name + Business */}
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FieldWrapper
                              label="Full Name"
                              required
                              error={errors.fullName?.message}
                              index={1}
                            >
                              <input
                                {...register("fullName")}
                                placeholder="Your full name"
                                className={`${inputClasses} capitalize`}
                                onInput={(e) => {
                                  e.currentTarget.value = e.currentTarget.value.replace(
                                    /\b[a-z]/g,
                                    (c) => c.toUpperCase()
                                  );
                                }}
                              />
                            </FieldWrapper>

                            <FieldWrapper
                              label="Business Name"
                              required
                              error={errors.businessName?.message}
                              index={2}
                            >
                              <input
                                {...register("businessName")}
                                placeholder="Your business name"
                                className={`${inputClasses} capitalize`}
                                onInput={(e) => {
                                  e.currentTarget.value = e.currentTarget.value.replace(
                                    /\b[a-z]/g,
                                    (c) => c.toUpperCase()
                                  );
                                }}
                              />
                            </FieldWrapper>
                          </div>

                          {/* Business Type */}
                          <FieldWrapper
                            label="Business Type"
                            required
                            error={errors.businessType?.message}
                            index={3}
                          >
                            <Controller
                              name="businessType"
                              control={control}
                              render={({ field }) => (
                                <SearchableSelect
                                  options={BUSINESS_TYPES}
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Select your business type"
                                />
                              )}
                            />
                          </FieldWrapper>

                          {/* Row: Phone + Email */}
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FieldWrapper
                              label="Phone Number"
                              required
                              error={errors.phoneNumber?.message}
                              index={4}
                            >
                              <div className="flex gap-2">
                                <Controller
                                  name="phoneCode"
                                  control={control}
                                  render={({ field }) => (
                                    <SimpleSelect
                                      options={COUNTRY_CODES.map(
                                        (c) => `${c.flag} ${c.code}`
                                      )}
                                      value={
                                        COUNTRY_CODES.find(
                                          (c) => c.code === field.value
                                        )
                                          ? `${COUNTRY_CODES.find((c) => c.code === field.value)!.flag} ${field.value}`
                                          : `🇮🇳 +91`
                                      }
                                      onChange={(val) => {
                                        const code = val.split(" ").pop() || "+91";
                                        field.onChange(code);
                                      }}
                                      placeholder="+91"
                                    />
                                  )}
                                />
                                <input
                                  {...register("phoneNumber")}
                                  placeholder="10-digit phone number"
                                  className={`${inputClasses} flex-1`}
                                  type="tel"
                                  maxLength={10}
                                  onInput={(e) => {
                                    e.currentTarget.value = e.currentTarget.value
                                      .replace(/[^0-9]/g, "")
                                      .slice(0, 10);
                                  }}
                                />
                              </div>
                            </FieldWrapper>

                            <FieldWrapper
                              label="Business Email"
                              required
                              error={errors.email?.message}
                              index={5}
                            >
                              <input
                                {...register("email")}
                                placeholder="email@business.com"
                                className={inputClasses}
                                type="email"
                              />
                            </FieldWrapper>
                          </div>

                          {/* Timeline */}
                          <FieldWrapper label="Project Timeline" index={6}>
                            <Controller
                              name="timeline"
                              control={control}
                              render={({ field }) => (
                                <SimpleSelect
                                  options={TIMELINES}
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  placeholder="Select a timeline"
                                />
                              )}
                            />
                          </FieldWrapper>

                          {/* Monthly Package */}
                          <FieldWrapper label="Monthly Package" index={7}>
                            <Controller
                              name="monthlyPackage"
                              control={control}
                              render={({ field }) => (
                                <div className="relative">
                                  <SimpleSelect
                                    options={monthlyPackages.map((pkg) => pkg.name)}
                                    value={monthlyPackages.find((pkg) => pkg.id === field.value)?.name || ""}
                                    optionDetails={Object.fromEntries(
                                      monthlyPackages.map((pkg) => [
                                        pkg.name,
                                        pkg.offerPriceInr
                                          ? `${formatMonthlyPrice(pkg.offerPriceInr)} offer (was ${pkg.price})`
                                          : pkg.price,
                                      ])
                                    )}
                                    onChange={(name) => {
                                      const selected = monthlyPackages.find((pkg) => pkg.name === name);
                                      field.onChange(selected?.id || "");
                                    }}
                                    placeholder="Select a monthly plan"
                                  />
                                </div>
                              )}
                            />
                          </FieldWrapper>

                          {/* Description */}
                          <FieldWrapper
                            label="Project Description"
                            error={errors.description?.message}
                            index={8}
                          >
                            <textarea
                              {...register("description")}
                              rows={5}
                              placeholder={`Describe your project in detail.\nExplain what you want A2 Production to create, your goals, target audience, references, expectations and any important information.`}
                              className={`${inputClasses} resize-none`}
                            />
                          </FieldWrapper>



                          {/* Consent */}
                          <motion.div
                            custom={10}
                            variants={fieldVariants}
                            className="flex flex-col gap-1"
                          >
                            <label className="flex items-start gap-3 cursor-pointer group/consent">
                              <input
                                type="checkbox"
                                {...register("consent")}
                                className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-[#FF7A00] cursor-pointer"
                              />
                              <span className="font-inter text-sm text-white/40 leading-relaxed transition-colors duration-300 group-hover/consent:text-white/60">
                                I agree to be contacted by A2 Production
                                regarding this project.{" "}
                                <span className="text-[#FF7A00]">*</span>
                              </span>
                            </label>
                            {errors.consent && (
                              <p className="font-inter text-xs text-red-400 ml-7">
                                {errors.consent.message}
                              </p>
                            )}
                          </motion.div>

                          {/* Error Banner */}
                          <AnimatePresence>
                            {status === "error" && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 font-inter text-sm text-red-400"
                              >
                                Something went wrong. Please try again.
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Buttons */}
                          <motion.div
                            custom={11}
                            variants={fieldVariants}
                            className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
                          >
                            <button
                              type="button"
                              onClick={handleClose}
                              className="rounded-full border border-white/10 bg-transparent px-8 py-3.5 font-poppins text-xs font-medium uppercase tracking-[0.2em] text-white/50 transition-all duration-300 hover:border-white/20 hover:text-white/70"
                            >
                              Cancel
                            </button>

                            <button
                              type="submit"
                              disabled={!isValid || status === "submitting"}
                              className="group/btn relative inline-flex items-center justify-center gap-2 rounded-full border border-[#FF7A00]/50 bg-[#FF7A00]/10 px-8 py-3.5 font-poppins text-xs font-semibold uppercase tracking-[0.2em] text-[#FF7A00] transition-all duration-500 hover:bg-[#FF7A00] hover:text-black hover:shadow-[0_0_40px_rgba(255,122,0,0.4),0_0_80px_rgba(255,122,0,0.15)] hover:border-[#FF7A00] disabled:opacity-30 disabled:pointer-events-none disabled:hover:bg-[#FF7A00]/10 disabled:hover:text-[#FF7A00] disabled:hover:shadow-none"
                            >
                              {status === "submitting" ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Submitting…</span>
                                </>
                              ) : (
                                <>
                                  <span>Start My Project</span>
                                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                </>
                              )}
                            </button>
                          </motion.div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
