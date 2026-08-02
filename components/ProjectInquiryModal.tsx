"use client";

import { useState, useRef, useCallback, useEffect, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  ChevronDown,
  Upload,
  Check,
  Search,
  ArrowUpRight,
  Loader2,
  FileText,
} from "lucide-react";


/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const BUSINESS_TYPES = [
  "Gym", "Restaurant", "Cafe", "Hotel", "Clothing Brand", "Fitness Brand",
  "Healthcare", "Medical Clinic", "Real Estate", "Construction",
  "Photography", "Videography", "Salon", "Barbershop", "Jewellery",
  "Education", "Coaching Institute", "School", "College",
  "YouTube Channel", "Influencer", "Personal Brand", "Event Management",
  "Wedding", "Automobile", "E-Commerce", "Technology", "Startup",
  "Finance", "Interior Design", "Travel", "NGO", "Other",
];

const TIMELINES = [
  "Urgent",
  "Within 1 Week",
  "Within 2 Weeks",
  "Within 1 Month",
  "Flexible",
];

const SERVICES = [
  "Commercial Shoot", "Brand Film", "Product Shoot", "Advertisement",
  "Instagram Reels", "YouTube Video", "Photography", "Video Editing",
  "Color Grading", "Website Design", "Website Development",
  "UI/UX Design", "Social Media Content", "Logo Design",
  "Brand Identity", "Other",
];

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", country: "India" },
  { code: "+1", flag: "🇺🇸", country: "US" },
  { code: "+44", flag: "🇬🇧", country: "UK" },
  { code: "+971", flag: "🇦🇪", country: "UAE" },
  { code: "+61", flag: "🇦🇺", country: "Australia" },
  { code: "+49", flag: "🇩🇪", country: "Germany" },
  { code: "+33", flag: "🇫🇷", country: "France" },
  { code: "+81", flag: "🇯🇵", country: "Japan" },
  { code: "+86", flag: "🇨🇳", country: "China" },
  { code: "+966", flag: "🇸🇦", country: "Saudi Arabia" },
  { code: "+65", flag: "🇸🇬", country: "Singapore" },
  { code: "+60", flag: "🇲🇾", country: "Malaysia" },
  { code: "+977", flag: "🇳🇵", country: "Nepal" },
  { code: "+880", flag: "🇧🇩", country: "Bangladesh" },
  { code: "+94", flag: "🇱🇰", country: "Sri Lanka" },
  { code: "+92", flag: "🇵🇰", country: "Pakistan" },
];

const ACCEPTED_FILE_TYPES = [
  "image/jpeg", "image/png", "application/pdf", "application/zip",
  "application/x-zip-compressed",
];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

/* ═══════════════════════════════════════════════════════════════
   SCHEMA
   ═══════════════════════════════════════════════════════════════ */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const formSchema = z.object({
  fullName: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length >= 2, "Full name must be at least 2 characters")
    .refine((v) => v.length <= 100, "Full name must not exceed 100 characters"),
  businessName: z
    .string()
    .transform((v) => v.trim())
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
    .refine((v) => v.length >= 1, "Phone number is required")
    .refine((v) => /^[0-9]{10,15}$/.test(v), "Phone number must contain 10-15 digits"),
  email: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, "Email is required")
    .refine((v) => v.length <= 100, "Email must not exceed 100 characters")
    .refine((v) => EMAIL_REGEX.test(v), "Enter a valid email address"),
  timeline: z.string().optional(),
  services: z.array(z.string()).optional(),
  description: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length >= 20, "Project description must be at least 20 characters")
    .refine((v) => v.length <= 3000, "Project description must not exceed 3000 characters"),
  websiteUrl: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to be contacted" }),
  }),
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
  options: string[];
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
}: {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
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
            <div
              className="max-h-52 overflow-y-auto custom-scrollbar overscroll-contain"
              data-lenis-prevent
            >
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`block w-full px-4 py-3 text-left font-inter text-sm transition-colors duration-200 ${
                    value === option
                      ? "bg-[#FF7A00]/10 text-[#FF7A00]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Multi-Select Chips ── */
function MultiSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
}) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`rounded-full border px-4 py-2 font-inter text-xs transition-all duration-300 ${
              selected
                ? "border-[#FF7A00]/50 bg-[#FF7A00]/15 text-[#FF7A00] shadow-[0_0_12px_rgba(255,122,0,0.15)]"
                : "border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/70"
            }`}
          >
            {selected && <Check className="mr-1.5 inline h-3 w-3" />}
            {option}
          </button>
        );
      })}
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
}

export function ProjectInquiryModal({
  isOpen,
  onClose,
}: ProjectInquiryModalProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      services: [],
      description: "",
      consent: undefined,
    },
  });

  const [formStartTime, setFormStartTime] = useState<number>(0);

  // Lock body and html scroll when modal is open and track form start time
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      setFormStartTime(Date.now());
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
      setUploadedFile(null);
      setFileError("");
      reset();
    }, 400);
  }, [onClose, reset, status]);

  // Handle ESC key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setFileError("Only JPG, PNG, PDF, and ZIP files are accepted.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size must be under 20MB.");
      return;
    }
    setUploadedFile(file);
  };

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

    // 2. Client-Side Rate Limiting Check (15s minimum gap between requests)
    const RATE_LIMIT_KEY = "a2_project_inquiry_last_submission";
    const MIN_INTERVAL_MS = 15000;
    const lastSubmission = typeof window !== "undefined" ? localStorage.getItem(RATE_LIMIT_KEY) : null;
    const now = Date.now();

    if (lastSubmission) {
      const elapsed = now - parseInt(lastSubmission, 10);
      if (elapsed < MIN_INTERVAL_MS) {
        const waitSeconds = Math.ceil((MIN_INTERVAL_MS - elapsed) / 1000);
        setToast({
          message: `Please wait ${waitSeconds} seconds before submitting another request.`,
          type: "error",
        });
        return;
      }
    }

    // 3. Strict Input Sanitization & Boundary Validation
    const clientName = data.fullName.trim();
    const businessName = data.businessName.trim();
    const businessType = data.businessType.trim();
    const email = data.email.trim();
    const phoneNumber = data.phoneNumber.trim();
    const description = data.description.trim();

    if (
      !clientName || clientName.length < 2 || clientName.length > 100 ||
      !businessName || businessName.length < 2 || businessName.length > 150 ||
      !businessType || businessType.length < 1 || businessType.length > 100 ||
      !email || email.length > 100 || !EMAIL_REGEX.test(email) ||
      !phoneNumber || !/^[0-9]{10,15}$/.test(phoneNumber) ||
      !description || description.length < 20 || description.length > 3000
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
        body: JSON.stringify({ ...data, formStartTime }),
      });

      const responseBody = await emailRes.json().catch(() => null);

      if (!emailRes.ok) {
        const errorMsg =
          responseBody?.error || `Submission failed with status code ${emailRes.status}`;
        throw new Error(errorMsg);
      }

      // Record successful submission timestamp for rate limiting
      if (typeof window !== "undefined") {
        localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      }

      // Show success toast
      setToast({
        message: "Project request submitted successfully!",
        type: "success",
      });

      // Reset the form after success
      reset();
      setUploadedFile(null);
      setFileError("");

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
    setUploadedFile(null);
    setFileError("");
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
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/80 backdrop-blur-xl"
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
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-3xl mx-4 my-8 md:my-12"
          >
            {/* ── Glassmorphism Container ── */}
            <div className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#0a0a0c]/95 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
              {/* Ambient glow */}
              <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.08)_0%,transparent_70%)] blur-3xl" />

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
                className="max-h-[85vh] overflow-y-auto custom-scrollbar overscroll-contain"
                data-lenis-prevent
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
                          <h2 className="font-geist text-3xl font-bold tracking-tight text-white md:text-4xl">
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

                          <h2 className="font-geist text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.1] tracking-tight text-white mb-4">
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
                                className={inputClasses}
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
                                className={inputClasses}
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
                                  placeholder="Phone number"
                                  className={`${inputClasses} flex-1`}
                                  type="tel"
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

                          {/* Services */}
                          <FieldWrapper label="Services Required" index={7}>
                            <Controller
                              name="services"
                              control={control}
                              render={({ field }) => (
                                <MultiSelect
                                  options={SERVICES}
                                  value={field.value || []}
                                  onChange={field.onChange}
                                />
                              )}
                            />
                          </FieldWrapper>

                          {/* Description */}
                          <FieldWrapper
                            label="Project Description"
                            required
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

                          {/* File Upload */}
                          <motion.div
                            custom={9}
                            variants={fieldVariants}
                            className="flex flex-col gap-2"
                          >
                            <label className="font-poppins text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                              Optional Upload
                            </label>
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="group/upload flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-8 transition-all duration-300 hover:border-[#FF7A00]/30 hover:bg-white/[0.04]"
                            >
                              {uploadedFile ? (
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-[#FF7A00]" />
                                  <span className="font-inter text-sm text-white/70">
                                    {uploadedFile.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setUploadedFile(null);
                                      if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="ml-2 text-white/30 hover:text-red-400"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <Upload className="h-6 w-6 text-white/20 transition-colors duration-300 group-hover/upload:text-[#FF7A00]/60" />
                                  <p className="font-inter text-xs text-white/30 text-center">
                                    Upload reference images, logo, brand guide or
                                    inspiration files
                                    <br />
                                    <span className="text-white/20">
                                      JPG, PNG, PDF, ZIP — Max 20MB
                                    </span>
                                  </p>
                                </>
                              )}
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf,.zip"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            {fileError && (
                              <p className="font-inter text-xs text-red-400">
                                {fileError}
                              </p>
                            )}
                          </motion.div>

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
