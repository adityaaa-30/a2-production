"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  ArrowUpDown,
  Menu,
  Trash2,
  CheckCircle2,
  Clock,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  Layers,
  CircleDollarSign,
  Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AmbientLightBackground } from "@/components/AmbientLightBackground";

interface ProjectRequest {
  id: string;
  created_at: string;
  client_name: string;
  business_name: string;
  business_type: string;
  email: string;
  phone: string;
  project_description?: string;
  budget?: string;
  status: string;
}

const STATUS_OPTIONS = ["New", "In Progress", "Completed", "Archived"];
const ADMIN_EXIT_GUARD_KEY = "__a2AdminExitGuard";

function getAdminSignInErrorMessage(error: unknown) {
  const authError =
    error && typeof error === "object"
      ? (error as { code?: unknown; status?: unknown; name?: unknown })
      : {};
  const code = typeof authError.code === "string" ? authError.code : "";
  const status = typeof authError.status === "number" ? authError.status : undefined;
  const name = typeof authError.name === "string" ? authError.name : "";

  if (code === "invalid_credentials") {
    return "Email or password was rejected by the Supabase project configured for this website. Check that this account belongs to that project.";
  }
  if (code === "email_not_confirmed") {
    return "Confirm this account's email in Supabase before signing in.";
  }
  if (code === "email_provider_disabled" || code === "provider_disabled") {
    return "Password sign-in is disabled in this Supabase project's Auth settings.";
  }
  if (code === "invalid_api_key" || status === 401) {
    return "The website could not authenticate with Supabase. Check the public Supabase URL and anon key configuration.";
  }
  if (status === 429 || code.includes("rate_limit")) {
    return "Too many sign-in attempts. Wait a few minutes, then try again.";
  }
  if (name === "AuthRetryableFetchError" || error instanceof TypeError) {
    return "Could not reach Supabase Auth. Check your connection and try again.";
  }

  return "Sign-in could not be completed. Check Supabase Auth configuration and try again.";
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "New":
      return "border-[#FF7A00]/50 bg-[#3A210C]/90 text-[#FFB15C]";
    case "In Progress":
      return "border-blue-400/50 bg-blue-950/80 text-blue-300";
    case "Completed":
      return "border-emerald-400/50 bg-emerald-950/80 text-emerald-300";
    case "Archived":
      return "border-neutral-500/40 bg-neutral-500/15 text-neutral-400";
    default:
      return "border-white/25 bg-[#20232B]/95 text-white/85";
  }
}

function StatusDropdown({
  value,
  disabled,
  label,
  onChange,
  compact = false,
}: {
  value: string;
  disabled: boolean;
  label: string;
  onChange: (status: string) => void;
  compact?: boolean;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, minWidth: 156 });

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        !triggerRef.current?.contains(event.target as Node) &&
        !menuRef.current?.contains(event.target as Node)
      ) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOnViewportChange = () => setOpen(false);

    document.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [open]);

  const toggleMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuHeight = STATUS_OPTIONS.length * 42 + 16;
    const top = rect.bottom + 8 + menuHeight <= window.innerHeight
      ? rect.bottom + 8
      : Math.max(8, rect.top - menuHeight - 8);
    const menuWidth = Math.max(156, rect.width + 24);
    const left = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8));
    setPosition({ top, left, minWidth: menuWidth });
    setOpen(true);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={toggleMenu}
        className={`inline-flex max-w-full items-center justify-between gap-2 rounded-full border ${getStatusBadgeClass(value)} ${compact ? "px-3 py-2 font-poppins text-[10px]" : "px-3 py-1.5 font-poppins text-[11px]"} font-medium outline-none transition duration-200 hover:brightness-125 focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-wait disabled:opacity-60`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown className={`h-3 w-3 shrink-0 opacity-70 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <motion.div
          ref={menuRef}
          role="listbox"
          aria-label={`Status for ${label.replace("Update status for ", "")}`}
          initial={{ opacity: 0, y: -5, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed z-[10000] overflow-hidden rounded-2xl border border-white/15 bg-[#11141d]/85 p-1.5 shadow-[0_20px_70px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl"
          style={{ top: position.top, left: position.left, minWidth: position.minWidth }}
        >
          <div className="mb-1 px-3 pt-1.5 font-poppins text-[9px] uppercase tracking-[0.2em] text-white/35">Set status</div>
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              onClick={() => {
                if (option !== value) onChange(option);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-left font-inter text-xs transition ${value === option ? `${getStatusBadgeClass(option)} border` : "border border-transparent text-white/70 hover:border-white/10 hover:bg-white/[0.08] hover:text-white"}`}
            >
              <span>{option}</span>
              {value === option && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </motion.div>,
        document.body,
      )}
    </>
  );
}

function hasAdminExitGuard() {
  const currentState = window.history.state;
  return Boolean(
    currentState &&
      typeof currentState === "object" &&
      currentState[ADMIN_EXIT_GUARD_KEY] === true,
  );
}

function pushAdminExitGuard() {
  const currentState = window.history.state;
  const safeState =
    currentState && typeof currentState === "object" && !Array.isArray(currentState)
      ? currentState
      : {};
  window.history.pushState(
    { ...safeState, [ADMIN_EXIT_GUARD_KEY]: true },
    "",
    window.location.href,
  );
}

export default function AdminDashboardPage() {
  // ── Auth States ──
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const exitGuardInitialized = useRef(false);
  const exitConfirmationPending = useRef(false);
  const restoreHistoryOnStay = useRef(false);
  const pendingExitHref = useRef<string | null>(null);

  // ── Data States ──
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // ── Modals / Interactivity ──
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [loggingOutForExit, setLoggingOutForExit] = useState(false);
  const [exitLogoutError, setExitLogoutError] = useState("");

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (!isSortMenuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!sortMenuRef.current?.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSortMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isSortMenuOpen]);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from("project_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err: unknown) {
      console.error("Fetch requests error:", err);
      const errMsg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to load project requests.";
      showToast(errMsg, "error");
    } finally {
      setLoadingData(false);
    }
  }, [showToast]);

  // ── Check Auth Status on Mount ──
  useEffect(() => {
    let mounted = true;
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;
        if (session?.user.app_metadata?.role === "admin") {
          setIsAuthenticated(true);
          fetchRequests();
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        if (mounted) console.error("Auth check error:", err);
      } finally {
        if (mounted) setLoadingAuth(false);
      }
    };

    checkUser();

    // Listen to Auth State Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user.app_metadata?.role === "admin") {
          setIsAuthenticated(true);
          fetchRequests();
        } else {
          setIsAuthenticated(false);
          setRequests([]);
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchRequests]);

  // Confirm before browser Back exits the authenticated admin dashboard.
  useEffect(() => {
    if (!isAuthenticated) {
      exitGuardInitialized.current = false;
      exitConfirmationPending.current = false;
      return;
    }

    if (!exitGuardInitialized.current && !hasAdminExitGuard()) {
      pushAdminExitGuard();
    }
    exitGuardInitialized.current = true;

    const handleBackNavigation = () => {
      if (hasAdminExitGuard() || exitConfirmationPending.current) return;
      exitConfirmationPending.current = true;
      restoreHistoryOnStay.current = true;
      pendingExitHref.current = null;
      setExitLogoutError("");
      setShowExitConfirmation(true);
    };
    const handleNavigationAttempt = (event: Event) => {
      const href = (event as CustomEvent<{ href?: string }>).detail?.href;
      if (!href || exitConfirmationPending.current) return;
      const destination = new URL(href, window.location.origin);
      if (destination.origin !== window.location.origin) return;
      exitConfirmationPending.current = true;
      restoreHistoryOnStay.current = false;
      pendingExitHref.current = `${destination.pathname}${destination.search}${destination.hash}`;
      setExitLogoutError("");
      setShowExitConfirmation(true);
    };

    window.addEventListener("popstate", handleBackNavigation);
    window.addEventListener("a2:admin-exit-request", handleNavigationAttempt);
    return () => {
      window.removeEventListener("popstate", handleBackNavigation);
      window.removeEventListener("a2:admin-exit-request", handleNavigationAttempt);
    };
  }, [isAuthenticated]);

  const handleStayInAdmin = () => {
    exitConfirmationPending.current = false;
    setShowExitConfirmation(false);
    setExitLogoutError("");
    pendingExitHref.current = null;
    if (restoreHistoryOnStay.current) pushAdminExitGuard();
    restoreHistoryOnStay.current = false;
  };

  const handleConfirmExit = async () => {
    if (loggingOutForExit) return;
    setLoggingOutForExit(true);
    setExitLogoutError("");

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthenticated(false);
      setRequests([]);
      setShowExitConfirmation(false);
      const destination = pendingExitHref.current || "/";
      pendingExitHref.current = null;
      window.location.replace(destination);
    } catch (err) {
      console.error("Sign out error:", err);
      setExitLogoutError("We couldn't sign you out. Please try again.");
      pushAdminExitGuard();
    } finally {
      setLoggingOutForExit(false);
    }
  };

  // ── Handle Admin Login ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.user.app_metadata?.role === "admin") {
        setIsAuthenticated(true);
        showToast("Signed in successfully", "success");
        fetchRequests();
      } else {
        await supabase.auth.signOut();
        setLoginError(
          "This account is not authorized for the admin panel. In the configured Supabase project, an administrator must set app_metadata.role to admin for this account, then you can sign in again."
        );
      }
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Login error:", err);
      }
      setLoginError(getAdminSignInErrorMessage(err));
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Handle Sign Out ──
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setRequests([]);
      showToast("Signed out successfully", "success");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // ── Update Request Status ──
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("project_requests")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
      );

      if (selectedRequest?.id === id) {
        setSelectedRequest((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      showToast(`Status updated to "${newStatus}"`, "success");
    } catch (err: unknown) {
      console.error("Update status error:", err);
      const errMsg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to update status.";
      showToast(errMsg, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Delete Request ──
  const handleDeleteRequest = async () => {
    if (!deleteConfirmId) return;
    setDeletingId(deleteConfirmId);

    try {
      const { error } = await supabase
        .from("project_requests")
        .delete()
        .eq("id", deleteConfirmId);

      if (error) throw error;

      setRequests((prev) => prev.filter((req) => req.id !== deleteConfirmId));

      if (selectedRequest?.id === deleteConfirmId) {
        setSelectedRequest(null);
      }

      setDeleteConfirmId(null);
      showToast("Project request deleted successfully", "success");
    } catch (err: unknown) {
      console.error("Delete request error:", err);
      const errMsg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to delete request.";
      showToast(errMsg, "error");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Filtered and Sorted Requests ──
  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          req.client_name.toLowerCase().includes(query) ||
          req.business_name.toLowerCase().includes(query) ||
          req.email.toLowerCase().includes(query) ||
          req.phone.toLowerCase().includes(query) ||
          req.business_type.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "All" ||
          req.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [requests, searchQuery, statusFilter, sortOrder]);

  // ── Stats Summary ──
  const stats = useMemo(() => {
    const total = requests.length;
    const newCount = requests.filter((r) => r.status === "New").length;
    const inProgressCount = requests.filter((r) => r.status === "In Progress").length;
    const completedCount = requests.filter((r) => r.status === "Completed").length;
    return { total, newCount, inProgressCount, completedCount };
  }, [requests]);

  // Render Loading Auth Screen
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF7A00]" />
          <p className="font-inter text-sm text-white/50">Verifying session...</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // 1. LOGIN SCREEN (UNAUTHENTICATED)
  // ════════════════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 pt-24 pb-12 text-white [background:linear-gradient(180deg,#08090d_0%,#050507_58%,#080807_100%)]">
        <AmbientLightBackground />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 isolate w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/[0.16] bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.055)_24%,rgba(10,12,18,0.82)_65%,rgba(255,122,0,0.045)_100%)] p-7 shadow-[0_35px_110px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-[40px] backdrop-saturate-150 sm:p-10 md:p-12"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(120deg,rgba(255,255,255,0.09)_0%,transparent_28%,transparent_70%,rgba(255,122,0,0.035)_100%)]"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.14)_0%,transparent_70%)] blur-3xl" />

          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/25 bg-[#FF7A00]/[0.06] px-4 py-1.5 backdrop-blur-md">
              <Lock className="h-3.5 w-3.5 text-[#FF7A00]" />
              <span className="font-poppins text-[10px] font-medium uppercase tracking-[0.3em] text-[#FF7A00]">
                Admin Portal
              </span>
            </div>

            <h1 className="mb-4 font-geist text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.08] tracking-tight text-white">
              Welcome back
              <br />
              <span className="bg-gradient-to-r from-[#FF7A00] to-[#FF9A40] bg-clip-text text-transparent">
                Admin Portal
              </span>
            </h1>
            <p className="mb-9 max-w-lg font-inter text-sm font-light leading-relaxed text-white/45 md:text-base">
              Secure access for authorized administrators.
            </p>

            {loginError && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 font-inter text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="admin-email" className="font-poppins text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                  Email Address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-5 py-4 font-inter text-sm text-white placeholder:text-white/30 outline-none backdrop-blur-md transition-all duration-300 focus:border-[#FF7A00]/50 focus:bg-white/[0.07] focus:shadow-[0_0_20px_rgba(255,122,0,0.1)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="admin-password" className="font-poppins text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-5 py-4 pr-12 font-inter text-sm text-white placeholder:text-white/30 outline-none backdrop-blur-md transition-all duration-300 focus:border-[#FF7A00]/50 focus:bg-white/[0.07] focus:shadow-[0_0_20px_rgba(255,122,0,0.1)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-3 flex items-center justify-center px-1 text-white/45 transition hover:text-[#FFB15C]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#FF7A00]/50 bg-[#FF7A00] px-8 py-4 font-poppins text-xs font-semibold uppercase tracking-[0.2em] text-black transition duration-300 hover:bg-[#ff8c1a] hover:shadow-[0_0_30px_rgba(255,122,0,0.4)] disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // 2. DASHBOARD VIEW (AUTHENTICATED)
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="relative isolate min-h-screen pt-28 pb-20 px-4 md:px-10 lg:px-14 text-white [background:linear-gradient(180deg,#08090d_0%,#050507_58%,#080807_100%)]">
      <AmbientLightBackground />
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-3 rounded-2xl px-6 py-3.5 border shadow-2xl backdrop-blur-xl font-inter text-xs ${
              toast.type === "success"
                ? "border-[#FF7A00]/40 bg-[#0a0a0c]/95 text-white shadow-[0_0_30px_rgba(255,122,0,0.25)]"
                : "border-red-500/40 bg-[#0a0a0c]/95 text-white shadow-[0_0_30px_rgba(239,68,68,0.25)]"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-[#FF7A00]" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/40 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-[1600px] flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/30 bg-[#FF7A00]/10 px-3 py-1 text-[10px] font-poppins font-medium uppercase tracking-[0.25em] text-[#FF7A00] mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF7A00] animate-pulse" />
              PORTAL ADMIN
            </div>
            <h1 className="font-geist text-3xl font-bold tracking-tight text-white md:text-4xl">
              Project Requests Dashboard
            </h1>
            <p className="font-inter text-xs text-white/40 mt-1">
              Manage and review incoming client inquiries from Supabase
            </p>
          </div>

          <div className="grid w-full grid-cols-3 items-center gap-2 md:flex md:w-auto md:gap-3">
            <Link
              href="/admin/pricing"
              className="inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border border-[#FF7A00]/55 bg-[#2B1B0E]/95 px-1.5 py-2.5 font-poppins text-[10px] font-semibold text-[#FFC078] shadow-[0_0_22px_rgba(255,122,0,0.12)] transition duration-300 hover:border-[#FF7A00]/80 hover:bg-[#3A230F] hover:shadow-[0_0_28px_rgba(255,122,0,0.2)] sm:px-2.5 sm:text-[11px] md:gap-2 md:px-4 md:text-xs max-[360px]:gap-1 max-[360px]:px-1 max-[360px]:text-[9px]"
            >
              <CircleDollarSign className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5 max-[360px]:h-2.5 max-[360px]:w-2.5" />
              <span>Manage Pricing</span>
            </Link>
            <button
              onClick={fetchRequests}
              disabled={loadingData}
              className="inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border border-white/20 bg-[#121620]/95 px-1.5 py-2.5 font-poppins text-[10px] font-medium text-white/90 shadow-[inset_0_1px_rgba(255,255,255,0.06)] transition duration-300 hover:border-white/35 hover:bg-[#1A202B] hover:text-white sm:px-2.5 sm:text-[11px] md:gap-2 md:px-4 md:text-xs max-[360px]:gap-1 max-[360px]:px-1 max-[360px]:text-[9px]"
              title="Refresh Records"
            >
              <RefreshCw className={`h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5 ${loadingData ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleSignOut}
              className="inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border border-red-400/45 bg-[#260F16]/95 px-1.5 py-2.5 font-poppins text-[10px] font-medium text-red-300 shadow-[inset_0_1px_rgba(255,255,255,0.04)] transition duration-300 hover:border-red-400/65 hover:bg-[#35121B] hover:text-red-200 sm:px-2.5 sm:text-[11px] md:gap-2 md:px-4 md:text-xs max-[360px]:gap-1 max-[360px]:px-1 max-[360px]:text-[9px]"
            >
              <LogOut className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-3xl border border-white/20 bg-[#0B0D13]/72 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.22),inset_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-5">
            <div className="flex items-center justify-between">
              <span className="font-poppins text-[10px] uppercase tracking-wider text-white/40">
                Total Requests
              </span>
              <Layers className="h-4 w-4 text-white/30" />
            </div>
            <p className="font-geist text-3xl font-bold text-white mt-2">
              {stats.total}
            </p>
          </div>

          <div className="rounded-3xl border border-[#FF7A00]/40 bg-[#17100B]/74 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.22),inset_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-5">
            <div className="flex items-center justify-between">
              <span className="font-poppins text-[10px] uppercase tracking-wider text-[#FF7A00]">
                New Requests
              </span>
              <Clock className="h-4 w-4 text-[#FF7A00]/60" />
            </div>
            <p className="font-geist text-3xl font-bold text-[#FF7A00] mt-2">
              {stats.newCount}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-400/35 bg-[#0B1220]/74 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.22),inset_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-5">
            <div className="flex items-center justify-between">
              <span className="font-poppins text-[10px] uppercase tracking-wider text-blue-400">
                In Progress
              </span>
              <RefreshCw className="h-4 w-4 text-blue-400/60" />
            </div>
            <p className="font-geist text-3xl font-bold text-blue-400 mt-2">
              {stats.inProgressCount}
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-400/35 bg-[#091610]/74 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.22),inset_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-5">
            <div className="flex items-center justify-between">
              <span className="font-poppins text-[10px] uppercase tracking-wider text-emerald-400">
                Completed
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400/60" />
            </div>
            <p className="font-geist text-3xl font-bold text-emerald-400 mt-2">
              {stats.completedCount}
            </p>
          </div>
        </div>

        {/* Toolbar: Search, Filter, Sort */}
        <div className="relative z-30 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-3xl border border-white/18 bg-[#0A0C12]/78 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.28),inset_0_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {/* Search */}
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client, business, email, phone..."
                className="w-full rounded-2xl border border-white/18 bg-[#05070D]/96 pl-11 pr-10 py-2.5 font-inter text-xs text-white placeholder:text-white/45 outline-none transition duration-300 focus:border-[#FF7A00]/70 focus:ring-2 focus:ring-[#FF7A00]/15"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div ref={sortMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsSortMenuOpen((open) => !open)}
                aria-label="Sort requests"
                aria-haspopup="menu"
                aria-expanded={isSortMenuOpen}
                aria-controls="request-sort-menu"
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border bg-[#11141C]/96 text-white/85 shadow-[inset_0_1px_rgba(255,255,255,0.04)] transition duration-200 ${
                  isSortMenuOpen
                    ? "border-[#FF7A00]/55 text-[#FFB15C]"
                    : "border-white/18 hover:border-white/30 hover:text-white"
                }`}
              >
                <Menu className="h-5 w-5" />
              </button>

              <AnimatePresence>
                {isSortMenuOpen && (
                  <motion.div
                    id="request-sort-menu"
                    role="menu"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-full z-50 mt-2 max-h-[min(70vh,28rem)] w-64 overflow-y-auto rounded-2xl border border-white/15 bg-[#10131A]/[0.98] p-1.5 shadow-[0_18px_55px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
                  >
                    <p className="px-3 py-2 font-poppins text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
                      Sort by date
                    </p>
                    {([
                      ["desc", "Newest First"],
                      ["asc", "Oldest First"],
                    ] as const).map(([order, label]) => (
                      <button
                        key={order}
                        type="button"
                        role="menuitemradio"
                        aria-checked={sortOrder === order}
                        onClick={() => {
                          setSortOrder(order);
                          setIsSortMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left font-inter text-xs transition ${
                          sortOrder === order
                            ? "bg-[#FF7A00]/12 text-[#FFC078]"
                            : "text-white/75 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        <span>{label}</span>
                        {sortOrder === order && <ArrowUpDown className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                    <div className="my-1.5 border-t border-white/[0.08]" />
                    <p className="px-3 py-2 font-poppins text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
                      Filter by status
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {["All", ...STATUS_OPTIONS].map((option) => (
                        <button
                          key={option}
                          type="button"
                          role="menuitemradio"
                          aria-checked={statusFilter === option}
                          onClick={() => {
                            setStatusFilter(option);
                            setIsSortMenuOpen(false);
                          }}
                          className={`rounded-xl px-2.5 py-2 text-left font-inter text-[11px] transition ${
                            statusFilter === option
                              ? "bg-[#FF7A00]/15 text-[#FFC078]"
                              : "text-white/70 hover:bg-white/[0.06] hover:text-white"
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
          </div>

        </div>

        {/* Table Container */}
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-[#080A10]/84 shadow-[0_24px_80px_rgba(0,0,0,0.42),inset_0_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl">
          {loadingData ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF7A00]" />
              <p className="font-inter text-xs text-white/40">Fetching project requests from Supabase...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-4">
              <Briefcase className="h-10 w-10 text-white/20" />
              <h3 className="font-geist text-lg font-semibold text-white/80">No Project Requests Found</h3>
              <p className="font-inter text-xs text-white/40 max-w-sm">
                {searchQuery || statusFilter !== "All"
                  ? "No records match your current search or filter criteria. Try clearing your filters."
                  : "No project requests have been submitted yet."}
              </p>
              {(searchQuery || statusFilter !== "All") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("All");
                  }}
                  className="mt-2 text-xs font-poppins text-[#FF7A00] underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
            <div className="divide-y divide-white/[0.07] md:hidden">
              {filteredRequests.map((req) => (
                <article key={req.id} className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words font-inter text-sm font-semibold text-white">
                        {req.client_name}
                      </h3>
                      <p className="mt-1 break-words font-inter text-xs text-white/65">
                        {req.business_name}
                      </p>
                    </div>
                    <div className="max-w-[145px] shrink-0">
                      <StatusDropdown
                        value={req.status}
                        disabled={updatingId === req.id}
                        label={`Update status for ${req.client_name}`}
                        compact
                        onChange={(status) => handleUpdateStatus(req.id, status)}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
                    <div className="min-w-0">
                      <p className="font-poppins text-[9px] uppercase tracking-wider text-white/40">Business Type</p>
                      <p className="mt-1 truncate font-inter text-xs text-white/75">{req.business_type || "N/A"}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-poppins text-[9px] uppercase tracking-wider text-white/40">Budget / Timeline</p>
                      <p className="mt-1 truncate font-inter text-xs text-white/75">{req.budget || "N/A"}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-poppins text-[9px] uppercase tracking-wider text-white/40">Email</p>
                      <a href={`mailto:${req.email}`} className="mt-1 block break-all font-inter text-xs text-white/75 hover:text-[#FFB15C]">
                        {req.email}
                      </a>
                    </div>
                    <div className="min-w-0">
                      <p className="font-poppins text-[9px] uppercase tracking-wider text-white/40">Phone</p>
                      <a href={`tel:${req.phone}`} className="mt-1 block break-all font-inter text-xs text-white/75 hover:text-[#FFB15C]">
                        {req.phone}
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3">
                    <p className="font-inter text-[11px] text-white/40">
                      {new Date(req.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        aria-label={`View details for ${req.client_name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/22 bg-[#191D27] text-white/85 shadow-[inset_0_1px_rgba(255,255,255,0.07)] transition hover:border-[#FF7A00]/55 hover:bg-[#35200F] hover:text-[#FFB15C]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(req.id)}
                        aria-label={`Delete request from ${req.client_name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/40 bg-[#281117] text-red-300 shadow-[inset_0_1px_rgba(255,255,255,0.04)] transition hover:border-red-400/60 hover:bg-[#3A141D] hover:text-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto custom-scrollbar md:block">
              <table className="w-full text-left font-inter text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/14 bg-[#11141B]/88 font-poppins text-[11px] uppercase tracking-wider text-white/60">
                    <th className="px-6 py-4 font-medium">Client Name</th>
                    <th className="px-6 py-4 font-medium">Business Name</th>
                    <th className="px-6 py-4 font-medium">Business Type</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Phone</th>
                    <th className="px-6 py-4 font-medium">Budget / Timeline</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="group transition duration-200 hover:bg-white/[0.03]"
                    >
                      {/* Client Name */}
                      <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                        {req.client_name}
                      </td>

                      {/* Business Name */}
                      <td className="px-6 py-4 text-white/80 whitespace-nowrap">
                        {req.business_name}
                      </td>

                      {/* Business Type */}
                      <td className="px-6 py-4 text-white/60 whitespace-nowrap">
                        <span className="inline-block rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px]">
                          {req.business_type}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-white/70 whitespace-nowrap">
                        <a
                          href={`mailto:${req.email}`}
                          className="hover:text-[#FF7A00] transition-colors"
                        >
                          {req.email}
                        </a>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-white/70 whitespace-nowrap">
                        <a
                          href={`tel:${req.phone}`}
                          className="hover:text-[#FF7A00] transition-colors"
                        >
                          {req.phone}
                        </a>
                      </td>

                      {/* Budget */}
                      <td className="px-6 py-4 text-white/60 max-w-[180px] truncate">
                        {req.budget || "N/A"}
                      </td>

                      {/* Status Selector */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusDropdown
                          value={req.status}
                          disabled={updatingId === req.id}
                          label={`Update status for ${req.client_name}`}
                          onChange={(status) => handleUpdateStatus(req.id, status)}
                        />
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-white/40 whitespace-nowrap">
                        {new Date(req.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/22 bg-[#191D27] text-white/85 shadow-[inset_0_1px_rgba(255,255,255,0.07)] transition hover:border-[#FF7A00]/55 hover:bg-[#35200F] hover:text-[#FFB15C]"
                            title="View Full Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(req.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-400/40 bg-[#281117] text-red-300 shadow-[inset_0_1px_rgba(255,255,255,0.04)] transition hover:border-red-400/60 hover:bg-[#3A141D] hover:text-red-200"
                            title="Delete Request"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          3. VIEW REQUEST DETAILS MODAL
          ════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            data-lenis-prevent
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedRequest(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0a0a0c]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl"
            >
              <button
                onClick={() => setSelectedRequest(null)}
                className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <span
                  className={`rounded-full border px-3 py-1 font-poppins text-[10px] font-medium uppercase tracking-wider ${getStatusBadgeClass(
                    selectedRequest.status
                  )}`}
                >
                  {selectedRequest.status}
                </span>
                <span className="font-inter text-xs text-white/40">
                  Submitted on {new Date(selectedRequest.created_at).toLocaleString()}
                </span>
              </div>

              <h2 className="font-geist text-2xl font-bold text-white mb-1">
                {selectedRequest.business_name}
              </h2>
              <p className="font-inter text-sm text-[#FF7A00] mb-6">
                Client: {selectedRequest.client_name} • {selectedRequest.business_type}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-6 text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#FF7A00]" />
                  <a href={`mailto:${selectedRequest.email}`} className="text-white hover:underline">
                    {selectedRequest.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#FF7A00]" />
                  <a href={`tel:${selectedRequest.phone}`} className="text-white hover:underline">
                    {selectedRequest.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Calendar className="h-4 w-4 text-[#FF7A00]" />
                  <span className="text-white/70">
                    Monthly Package & Timeline: {selectedRequest.budget || "Not specified"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-6">
                <h4 className="font-poppins text-xs font-medium uppercase tracking-wider text-white/60">
                  Project Description
                </h4>
                <div className="max-h-60 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-4 font-inter text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
                  {selectedRequest.project_description || "No description provided."}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-full border border-white/10 bg-transparent px-6 py-2.5 font-poppins text-xs font-medium uppercase tracking-wider text-white/60 hover:text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════════════
          4. DELETE CONFIRMATION MODAL
          ════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            data-lenis-prevent
            onClick={(e) => {
              if (e.target === e.currentTarget) setDeleteConfirmId(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-3xl border border-red-500/20 bg-[#0a0a0c]/95 p-6 text-center shadow-2xl backdrop-blur-2xl"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
                <Trash2 className="h-6 w-6" />
              </div>

              <h3 className="font-geist text-xl font-bold text-white mb-2">
                Delete Project Request?
              </h3>
              <p className="font-inter text-xs text-white/50 mb-6 leading-relaxed">
                Are you sure you want to permanently delete this project inquiry? This action cannot be undone.
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={deletingId === deleteConfirmId}
                  className="rounded-full border border-white/10 bg-transparent px-6 py-2.5 font-poppins text-xs font-medium uppercase tracking-wider text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRequest}
                  disabled={deletingId === deleteConfirmId}
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/50 bg-red-500 px-6 py-2.5 font-poppins text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-red-600 disabled:opacity-50"
                >
                  {deletingId === deleteConfirmId ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Confirm Delete</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExitConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
            onClick={(event) => {
              if (event.target === event.currentTarget && !loggingOutForExit) {
                handleStayInAdmin();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape" && !loggingOutForExit) {
                handleStayInAdmin();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-exit-title"
              aria-describedby="admin-exit-description"
              className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[#FF7A00]/35 bg-[#0a0a0c]/68 p-7 shadow-[0_24px_100px_rgba(0,0,0,0.68),0_0_45px_rgba(255,122,0,0.1)] backdrop-blur-2xl sm:p-8"
            >
              <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#FF7A00]/10 blur-3xl" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FF7A00]/30 bg-[#FF7A00]/10 text-[#FF7A00] shadow-[0_0_28px_rgba(255,122,0,0.12)]">
                  <LogOut className="h-6 w-6" />
                </div>

                <p className="mb-2 font-poppins text-[10px] font-medium uppercase tracking-[0.24em] text-[#FF7A00]">
                  Admin session
                </p>
                <h2 id="admin-exit-title" className="font-geist text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Leaving the dashboard?
                </h2>
                <p id="admin-exit-description" className="mt-3 font-inter text-sm leading-relaxed text-white/55">
                  Would you like to sign out before you exit? Your admin session on this browser will end.
                </p>

                {exitLogoutError && (
                  <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 font-inter text-xs text-red-300">
                    {exitLogoutError}
                  </p>
                )}

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleStayInAdmin}
                    disabled={loggingOutForExit}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 font-poppins text-[11px] font-medium uppercase tracking-[0.12em] text-white/65 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Stay in dashboard
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmExit}
                    disabled={loggingOutForExit}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#FF7A00]/50 bg-[#FF7A00] px-5 py-3 font-poppins text-[11px] font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-[#ff8c1a] hover:shadow-[0_0_28px_rgba(255,122,0,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loggingOutForExit ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Signing out…</span>
                      </>
                    ) : (
                      <span>Log out &amp; exit</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
