"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ArrowUpDown,
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
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  Layers,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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

export default function AdminDashboardPage() {
  // ── Auth States ──
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // ── Data States ──
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // ── Modals / Interactivity ──
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // ── Check Auth Status on Mount ──
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setIsAuthenticated(true);
          fetchRequests();
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setLoadingAuth(false);
      }
    };

    checkUser();

    // Listen to Auth State Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          fetchRequests();
        } else {
          setIsAuthenticated(false);
          setRequests([]);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ── Fetch Records ──
  const fetchRequests = async () => {
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

      if (data.user) {
        setIsAuthenticated(true);
        showToast("Signed in successfully", "success");
        fetchRequests();
      }
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Login error:", err);
      }
      setLoginError("Invalid email or password.");
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

  // Status Badge Helper
  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case "New":
        return "border-[#FF7A00]/40 bg-[#FF7A00]/15 text-[#FF7A00]";
      case "In Progress":
        return "border-blue-500/40 bg-blue-500/15 text-blue-400";
      case "Completed":
        return "border-emerald-500/40 bg-emerald-500/15 text-emerald-400";
      case "Archived":
        return "border-neutral-500/40 bg-neutral-500/15 text-neutral-400";
      default:
        return "border-white/20 bg-white/10 text-white/70";
    }
  };

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
      <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4 bg-[#050507]">
        {/* Background glow */}
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(circle,rgba(255,122,0,0.12)_0%,transparent_70%)] blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0c]/90 p-8 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FF7A00]/30 bg-[#FF7A00]/10 text-[#FF7A00] shadow-[0_0_25px_rgba(255,122,0,0.2)]">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="font-geist text-2xl font-bold tracking-tight text-white">
              Admin Portal
            </h1>
            <p className="font-inter text-xs text-white/40 mt-1">
              Sign in with your Supabase Admin credentials
            </p>
          </div>

          {loginError && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 font-inter text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-poppins text-xs uppercase tracking-[0.15em] text-white/60">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 font-inter text-sm text-white placeholder:text-white/20 outline-none transition duration-300 focus:border-[#FF7A00]/50 focus:bg-white/[0.05]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-poppins text-xs uppercase tracking-[0.15em] text-white/60">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 font-inter text-sm text-white placeholder:text-white/20 outline-none transition duration-300 focus:border-[#FF7A00]/50 focus:bg-white/[0.05]"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-[#FF7A00]/50 bg-[#FF7A00] px-6 py-4 font-poppins text-xs font-semibold uppercase tracking-[0.2em] text-black transition duration-300 hover:bg-[#ff8c1a] hover:shadow-[0_0_30px_rgba(255,122,0,0.4)] disabled:opacity-50"
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
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // 2. DASHBOARD VIEW (AUTHENTICATED)
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-10 lg:px-14 bg-[#050507] text-white">
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

      <div className="mx-auto max-w-[1600px] flex flex-col gap-8">
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

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRequests}
              disabled={loadingData}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 font-poppins text-xs font-medium text-white/70 transition duration-300 hover:border-white/20 hover:text-white"
              title="Refresh Records"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 font-poppins text-xs font-medium text-red-400 transition duration-300 hover:bg-red-500/20 hover:text-red-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
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

          <div className="rounded-3xl border border-[#FF7A00]/20 bg-[#FF7A00]/[0.03] p-5 backdrop-blur-md">
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

          <div className="rounded-3xl border border-blue-500/20 bg-blue-500/[0.03] p-5 backdrop-blur-md">
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

          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5 backdrop-blur-md">
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-3xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-xl">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, business, email, phone..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-11 pr-4 py-2.5 font-inter text-xs text-white placeholder:text-white/30 outline-none transition duration-300 focus:border-[#FF7A00]/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
              <Filter className="h-3.5 w-3.5 text-white/40 ml-2.5" />
              {["All", ...STATUS_OPTIONS].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setStatusFilter(opt)}
                  className={`rounded-xl px-3 py-1.5 font-poppins text-[11px] font-medium transition duration-200 ${
                    statusFilter === opt
                      ? "bg-[#FF7A00] text-black shadow-md"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder((v) => (v === "desc" ? "asc" : "desc"))}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 font-poppins text-xs text-white/70 transition duration-300 hover:border-white/20 hover:text-white"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-[#FF7A00]" />
              <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0c]/80 shadow-2xl backdrop-blur-2xl">
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
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left font-inter text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] font-poppins text-[11px] uppercase tracking-wider text-white/40">
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
                        <div className="relative inline-block">
                          <select
                            value={req.status}
                            disabled={updatingId === req.id}
                            onChange={(e) => handleUpdateStatus(req.id, e.target.value)}
                            className={`appearance-none cursor-pointer rounded-full border px-3 py-1 pr-7 font-poppins text-[11px] font-medium outline-none transition duration-200 ${getStatusBadge(
                              req.status
                            )}`}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option
                                key={opt}
                                value={opt}
                                className="bg-[#0d0d0f] text-white"
                              >
                                {opt}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 opacity-60" />
                        </div>
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
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:border-[#FF7A00]/40 hover:bg-[#FF7A00]/10 hover:text-[#FF7A00]"
                            title="View Full Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(req.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 transition hover:border-red-500/40 hover:bg-red-500/20"
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
                  className={`rounded-full border px-3 py-1 font-poppins text-[10px] font-medium uppercase tracking-wider ${getStatusBadge(
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
                    Services & Timeline: {selectedRequest.budget || "Not specified"}
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
    </div>
  );
}
