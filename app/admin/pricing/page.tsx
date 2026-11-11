"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowDown, ArrowLeft, ArrowUp, CheckCircle2, CircleDollarSign, Loader2, LogOut, Plus, Save, Search, ShieldCheck, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MONTHLY_PACKAGES, type MonthlyPackage } from "@/lib/monthly-packages";
import { AmbientLightBackground } from "@/components/AmbientLightBackground";

type PackageRow = {
  id: MonthlyPackage["id"];
  name: string;
  price_inr: number;
  description: string;
  features: string[];
  sort_order: number;
  created_at: string;
  offer_price_inr: number | null;
  offer_label: string | null;
  is_best_value: boolean;
  is_featured: boolean;
};

const fieldsClass = "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#FF7A00]/60";

export default function PricingAdminPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [packages, setPackages] = useState<MonthlyPackage[]>(MONTHLY_PACKAGES);
  const [planSearch, setPlanSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MonthlyPackage | null>(null);
  const [deletingPackageId, setDeletingPackageId] = useState<string | null>(null);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [saveToast, setSaveToast] = useState(false);
  const [saveToastKind, setSaveToastKind] = useState<"success" | "error">("success");
  const [saveToastTitle, setSaveToastTitle] = useState("Plans saved successfully");
  const [saveToastDetail, setSaveToastDetail] = useState("The website pricing and inquiry form are updated.");
  const [migrationMissing, setMigrationMissing] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [loggingOutForExit, setLoggingOutForExit] = useState(false);
  const [exitLogoutError, setExitLogoutError] = useState("");
  const pendingExitHref = useRef<string | null>(null);
  const exitingThroughConfirmation = useRef(false);
  const persistedPackageIds = useRef(new Set<string>());

  useEffect(() => {
    if (!saveToast) return;
    const timeout = window.setTimeout(() => setSaveToast(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [saveToast]);

  const loadPackages = useCallback(async () => {
    setLoadingPackages(true);
    const { data, error } = await supabase
      .from("monthly_packages")
      .select("id,name,price_inr,description,features,sort_order,created_at,offer_price_inr,offer_label,is_best_value,is_featured")
      .order("sort_order", { ascending: true });

    if (error) {
      setMigrationMissing(true);
      setNotice({ kind: "error", text: "Pricing setup is incomplete. Run the Supabase migrations listed below, then reload this page." });
      setLoadingPackages(false);
      return;
    }

    setMigrationMissing(false);
    const loadedPackages = ((data || []) as PackageRow[]).map((row) => {
      const fallback = MONTHLY_PACKAGES.find((item) => item.id === row.id);
      return {
        id: row.id,
        name: row.name,
        priceInr: row.price_inr,
        price: `₹${Number(row.price_inr).toLocaleString("en-IN")}`,
        description: row.description,
        features: Array.isArray(row.features) ? row.features : fallback?.features || [],
        sortOrder: row.sort_order,
        createdAt: row.created_at || fallback?.createdAt || null,
        offerPriceInr: row.offer_price_inr,
        offerLabel: row.offer_label || "",
        isBestValue: row.is_best_value ?? fallback?.isBestValue ?? false,
        isFeatured: row.is_featured ?? fallback?.isFeatured ?? false,
      };
    });
    loadedPackages.sort((a, b) => a.sortOrder - b.sortOrder);
    setPackages(loadedPackages);
    persistedPackageIds.current = new Set(loadedPackages.map((item) => item.id));
    setLoadingPackages(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const hasAdminRole = session?.user.app_metadata?.role === "admin";

      if (!mounted) return;
      setIsAdmin(hasAdminRole);
      setCheckingAuth(false);
      if (hasAdminRole) void loadPackages();
      else router.replace("/admin");
    };

    void checkAdmin();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasAdminRole = session?.user.app_metadata?.role === "admin";
      if (hasAdminRole) {
        setIsAdmin(true);
        void loadPackages();
      } else if (!exitingThroughConfirmation.current) {
        setIsAdmin(false);
        router.replace("/admin");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadPackages, router]);

  useEffect(() => {
    if (!isAdmin) return;

    const handleNavigationAttempt = (event: Event) => {
      const href = (event as CustomEvent<{ href?: string }>).detail?.href;
      if (!href || showExitConfirmation) return;
      const destination = new URL(href, window.location.origin);
      if (destination.origin !== window.location.origin) return;
      pendingExitHref.current = `${destination.pathname}${destination.search}${destination.hash}`;
      setExitLogoutError("");
      setShowExitConfirmation(true);
    };

    window.addEventListener("a2:admin-exit-request", handleNavigationAttempt);
    return () => window.removeEventListener("a2:admin-exit-request", handleNavigationAttempt);
  }, [isAdmin, showExitConfirmation]);

  const updatePackage = (id: MonthlyPackage["id"], update: Partial<MonthlyPackage>) => {
    setPackages((current) => current.map((item) => {
      if (item.id === id) return { ...item, ...update };
      if (update.isBestValue) return { ...item, isBestValue: false };
      return item;
    }));
  };

  const toggleFeaturedPackage = (id: MonthlyPackage["id"], isFeatured: boolean) => {
    const selectedCount = packages.filter((item) => item.isFeatured).length;
    const maxFeatured = Math.min(3, packages.length);
    if (isFeatured && selectedCount >= maxFeatured) {
      setNotice({ kind: "error", text: "Homepage par maximum 3 plans feature kar sakte ho. Pehle kisi selected plan ko unselect karo." });
      return;
    }
    updatePackage(id, { isFeatured });
    setNotice(null);
  };

  const addPackage = () => {
    const id = `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    setPackages((current) => [...current, {
      id,
      name: "New Plan",
      price: "₹0",
      priceInr: 0,
      description: "",
      features: [""],
      sortOrder: current.length,
      createdAt: new Date().toISOString(),
      offerPriceInr: null,
      offerLabel: "",
      isBestValue: false,
      isFeatured: false,
    }]);
    setNotice({ kind: "success", text: "New plan added. Fill in its details, then save to publish it on the website." });
  };

  const movePackage = (index: number, direction: -1 | 1) => {
    setPackages((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const reordered = [...current];
      [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
      return reordered.map((item, sortOrder) => ({ ...item, sortOrder }));
    });
  };

  const confirmRemovePackage = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeletingPackageId(target.id);
    setNotice(null);
    setSaveToast(false);

    const isPersisted = persistedPackageIds.current.has(target.id);
    let deletedRows: { id: string }[] | null = [{ id: target.id }];
    let error: { message: string } | null = null;
    if (isPersisted) {
      try {
        const result = await supabase.from("monthly_packages").delete().eq("id", target.id).select("id");
        deletedRows = result.data;
        error = result.error;
      } catch (deleteError) {
        error = { message: deleteError instanceof Error ? deleteError.message : "Unexpected database error." };
      }
    }

    if (error || !deletedRows?.length) {
      const message = error?.message || "Supabase did not confirm the plan removal. Check admin permissions and try again.";
      setNotice({ kind: "error", text: `Plan delete nahi hua: ${message}` });
      setSaveToastKind("error");
      setSaveToastTitle("Plan could not be deleted");
      setSaveToastDetail(message);
      setSaveToast(true);
      setDeleteTarget(null);
      setDeletingPackageId(null);
      return;
    }

    setPackages((current) => current
      .filter((item) => item.id !== target.id)
      .map((item, sortOrder) => ({ ...item, sortOrder })));
    persistedPackageIds.current.delete(target.id);
    setDeleteTarget(null);
    setNotice({ kind: "success", text: isPersisted
      ? `${target.name || "Plan"} is deleted from the website.`
      : `${target.name || "Plan"} draft removed.` });
    setSaveToastKind("success");
    setSaveToastTitle(isPersisted ? "Plan deleted successfully" : "Plan draft removed");
    setSaveToastDetail(isPersisted
      ? `${target.name || "Plan"} has been removed from the website pricing and inquiry form.`
      : `${target.name || "Plan"} was removed before being published.`);
    setSaveToast(true);
    setDeletingPackageId(null);
  };

  const savePackages = async () => {
    const featuredCount = packages.filter((item) => item.isFeatured).length;
    const expectedFeaturedCount = Math.min(3, packages.length);
    if (featuredCount !== expectedFeaturedCount) {
      setNotice({ kind: "error", text: `Homepage ke liye ${expectedFeaturedCount} plans select karo. Abhi ${featuredCount} selected hain.` });
      return;
    }

    const duplicateNames = packages.some((item, index) =>
      packages.findIndex((candidate) => candidate.name.trim().toLowerCase() === item.name.trim().toLowerCase()) !== index
    );
    if (duplicateNames) {
      setNotice({ kind: "error", text: "Each plan needs a unique name so clients can select the right one in the inquiry form." });
      return;
    }

    const invalidPackage = packages.find((item) =>
      !item.name.trim() || !item.description.trim() || !Number.isInteger(item.priceInr) || item.priceInr < 1 || item.priceInr > 100000000 ||
      (item.offerPriceInr !== null && (!Number.isInteger(item.offerPriceInr) || item.offerPriceInr < 1 || item.offerPriceInr >= item.priceInr)) ||
      item.offerLabel.trim().length > 40 ||
      item.features.filter((feature) => feature.trim()).length === 0
    );
    if (invalidPackage) {
      setNotice({ kind: "error", text: `Check the name, description, price, and at least one feature for ${invalidPackage.name || "each plan"}.` });
      return;
    }

    setSaving(true);
    setNotice(null);
    setSaveToast(false);
    const rows = packages.map((item, index) => ({
      id: item.id,
      name: item.name.trim(),
      price_inr: item.priceInr,
      description: item.description.trim(),
      features: item.features.map((feature) => feature.trim()).filter(Boolean),
      sort_order: index,
      offer_price_inr: item.offerPriceInr,
      offer_label: item.offerLabel.trim() || null,
      is_best_value: item.isBestValue,
      is_featured: item.isFeatured,
      updated_at: new Date().toISOString(),
    }));
    const { data: savedRows, error } = rows.length
      ? await supabase.from("monthly_packages").upsert(rows, { onConflict: "id" }).select("id")
      : { data: [], error: null };

    if (error) {
      const isIdConstraintError = error.code === "23514" || error.message.toLowerCase().includes("monthly_packages_id_check");
      setNotice({ kind: "error", text: isIdConstraintError
        ? "Plan save nahi hua: Supabase abhi custom plan IDs allow nahi kar raha. Run supabase/migrations/20261108000000_dynamic_monthly_package_ids.sql, phir isi page par Save pricing dobara click karo. Aapka current draft abhi form mein hai."
        : `Supabase save failed: ${error.message}. Aapka current draft abhi form mein hai.` });
      setSaving(false);
      return;
    }

    if (rows.length > 0 && (!savedRows || savedRows.length !== rows.length)) {
      setNotice({ kind: "error", text: "Supabase ne sabhi plans save hone ki confirmation nahi di. Draft abhi form mein hai; reload karne se pehle save error check karo." });
      setSaving(false);
      return;
    }
    savedRows?.forEach((row) => persistedPackageIds.current.add(row.id));

    setPackages((current) => current.map((item) => ({
      ...item,
      price: `₹${item.priceInr.toLocaleString("en-IN")}`,
    })));
    setNotice({ kind: "success", text: "Pricing saved. The plans section and inquiry form now use these prices." });
    setSaveToastKind("success");
    setSaveToastTitle("Plans saved successfully");
    setSaveToastDetail("The website pricing and inquiry form are updated.");
    setSaveToast(true);
    setSaving(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/admin");
  };

  const stayInAdmin = () => {
    pendingExitHref.current = null;
    setShowExitConfirmation(false);
    setExitLogoutError("");
  };

  const confirmAdminExit = async () => {
    if (loggingOutForExit) return;
    setLoggingOutForExit(true);
    setExitLogoutError("");
    exitingThroughConfirmation.current = true;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      const destination = pendingExitHref.current || "/";
      pendingExitHref.current = null;
      window.location.replace(destination);
    } catch (error) {
      exitingThroughConfirmation.current = false;
      console.error("Sign out error:", error);
      setExitLogoutError("We couldn't sign you out. Please try again.");
    } finally {
      setLoggingOutForExit(false);
    }
  };

  const normalizedPlanSearch = planSearch.trim().toLocaleLowerCase();
  const visiblePackages = packages
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      if (!normalizedPlanSearch) return true;
      const searchableText = [
        item.name,
        item.price,
        item.priceInr.toString(),
        item.priceInr.toLocaleString("en-IN"),
        item.offerPriceInr?.toString() ?? "",
        item.offerPriceInr?.toLocaleString("en-IN") ?? "",
        item.description,
        item.offerLabel,
        ...item.features,
      ].join(" ").toLocaleLowerCase();
      return searchableText.includes(normalizedPlanSearch);
    });

  if (checkingAuth || !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050507] text-white">
        <div className="flex items-center gap-3 font-inter text-sm text-white/60">
          <Loader2 className="h-5 w-5 animate-spin text-[#FF7A00]" /> Checking admin access…
        </div>
      </main>
    );
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#050507] px-4 pb-16 pt-28 text-white sm:px-8">
      <AmbientLightBackground />
      <div className="relative z-10 mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/admin" className="mb-5 inline-flex items-center gap-2 font-inter text-xs text-white/50 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Project requests
            </Link>
            <div className="flex items-center gap-2 font-poppins text-[10px] uppercase tracking-[0.24em] text-[#FF7A00]">
              <ShieldCheck className="h-4 w-4" /> Admin pricing
            </div>
            <h1 className="mt-2 font-geist text-3xl font-semibold tracking-tight sm:text-4xl">Monthly plans</h1>
            <p className="mt-2 max-w-2xl font-inter text-sm leading-relaxed text-white/50">
              Choose the three plans featured on the homepage, set optional offers, and control the Best Value highlight. Other plans appear under Explore More Plans.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            <button onClick={addPackage} className="inline-flex items-center gap-2 rounded-xl border border-[#FF7A00]/35 bg-[#FF7A00]/10 px-4 py-2.5 font-poppins text-xs text-[#ffb15c] transition hover:bg-[#FF7A00]/20">
              <Plus className="h-4 w-4" /> Add plan
            </button>
            <button onClick={signOut} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 font-poppins text-xs text-white/65 transition hover:border-white/20 hover:text-white">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </header>

        {notice && (
          <div className={`rounded-2xl border px-4 py-3 font-inter text-sm ${notice.kind === "success" ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200" : "border-rose-400/20 bg-rose-400/[0.07] text-rose-200"}`}>
            {notice.text}
          </div>
        )}

        {migrationMissing && (
          <section className="rounded-2xl border border-[#FF7A00]/25 bg-[#FF7A00]/[0.06] p-5 font-inter text-sm leading-relaxed text-white/70">
            <h2 className="mb-2 font-semibold text-white">One-time Supabase setup</h2>
            <p>Run the migrations in order in your project&apos;s Supabase SQL Editor: <code className="text-[#FFB15C]">20261106000000_manage_monthly_packages.sql</code>, <code className="text-[#FFB15C]">20261108000000_dynamic_monthly_package_ids.sql</code>, <code className="text-[#FFB15C]">20261108010000_monthly_package_discovery_metadata.sql</code>, <code className="text-[#FFB15C]">20261108020000_featured_monthly_packages.sql</code>, then <code className="text-[#FFB15C]">20261108030000_route_public_requests_through_api.sql</code>. Reload this page afterward.</p>
          </section>
        )}

        {loadingPackages ? (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-6 font-inter text-sm text-white/55">
            <Loader2 className="h-4 w-4 animate-spin text-[#FF7A00]" /> Loading plans…
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col gap-2 rounded-2xl border border-[#FF7A00]/20 bg-[#FF7A00]/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-poppins text-xs font-medium text-white/80">Homepage showcase</p>
              <p className={`font-inter text-xs ${packages.filter((item) => item.isFeatured).length === Math.min(3, packages.length) ? "text-emerald-200" : "text-[#FFB15C]"}`}>
                {packages.filter((item) => item.isFeatured).length} / {Math.min(3, packages.length)} selected. Changes apply after Save pricing.
              </p>
            </div>
            {packages.length > 0 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="relative block w-full sm:max-w-sm">
                  <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    type="search"
                    value={planSearch}
                    onChange={(event) => setPlanSearch(event.target.value)}
                    placeholder="Search by plan name, price or details"
                    aria-label="Search by plan name, price or details"
                    className={`${fieldsClass} pl-11`}
                  />
                </label>
                <p className="font-inter text-xs text-white/40" aria-live="polite">
                  Showing {visiblePackages.length} of {packages.length} plans
                </p>
              </div>
            )}
            {packages.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/15 bg-[#080a10]/45 px-6 py-12 text-center backdrop-blur-xl">
                <p className="font-geist text-lg font-semibold text-white">No plans yet</p>
                <p className="mt-2 font-inter text-sm text-white/45">Add a plan to publish it in the website pricing section.</p>
              </div>
            )}
            {packages.length > 0 && visiblePackages.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-8 text-center">
                <p className="font-inter text-sm text-white/65">No plans match “{planSearch.trim()}”.</p>
                <button type="button" onClick={() => setPlanSearch("")} className="mt-3 font-inter text-xs text-[#FFB15C] transition hover:text-white">
                  Clear search
                </button>
              </div>
            )}
            {visiblePackages.map(({ item, index }) => (
              <section key={item.id} className="rounded-3xl border border-white/15 bg-[#080a10]/70 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] sm:p-7">
                <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF7A00]">Plan 0{index + 1}</span>
                    <h2 className="mt-1 font-geist text-xl font-semibold">{item.name}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => movePackage(index, -1)} disabled={index === 0} aria-label={`Move ${item.name} up`} className="rounded-lg border border-white/10 p-2 text-white/60 transition hover:border-white/25 hover:text-white disabled:opacity-25">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => movePackage(index, 1)} disabled={index === packages.length - 1} aria-label={`Move ${item.name} down`} className="rounded-lg border border-white/10 p-2 text-white/60 transition hover:border-white/25 hover:text-white disabled:opacity-25">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setDeleteTarget(item)} aria-label={`Remove ${item.name}`} title="Remove plan" className="rounded-lg border border-rose-400/20 bg-rose-400/[0.04] p-2 text-rose-300/75 transition hover:border-rose-400/50 hover:bg-rose-400/10 hover:text-rose-200">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <CircleDollarSign className="ml-1 h-5 w-5 text-[#FF7A00]/70" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2 font-poppins text-[10px] uppercase tracking-[0.15em] text-white/45">
                    Plan name
                    <input className={fieldsClass} value={item.name} maxLength={80} onChange={(event) => updatePackage(item.id, { name: event.target.value })} />
                  </label>
                  <label className="flex flex-col gap-2 font-poppins text-[10px] uppercase tracking-[0.15em] text-white/45">
                    Monthly price (₹)
                    <input className={fieldsClass} type="number" min={1} max={100000000} step={1} value={item.priceInr} onChange={(event) => updatePackage(item.id, { priceInr: Number(event.target.value) })} />
                  </label>
                  <label className="flex flex-col gap-2 font-poppins text-[10px] uppercase tracking-[0.15em] text-white/45">
                    Offer price (₹, optional)
                    <input className={fieldsClass} type="number" min={1} max={100000000} step={1} value={item.offerPriceInr ?? ""} placeholder="Leave blank for no offer" onChange={(event) => updatePackage(item.id, { offerPriceInr: event.target.value ? Number(event.target.value) : null })} />
                    <span className="font-inter text-[10px] normal-case tracking-normal text-white/35">Must be lower than the monthly price.</span>
                  </label>
                  <label className="flex flex-col gap-2 font-poppins text-[10px] uppercase tracking-[0.15em] text-white/45">
                    Offer label (optional)
                    <input className={fieldsClass} value={item.offerLabel} maxLength={40} placeholder="e.g. Launch offer" onChange={(event) => updatePackage(item.id, { offerLabel: event.target.value })} />
                  </label>
                  <label className="flex items-center gap-3 font-inter text-sm text-white/70 md:col-span-2">
                    <input type="checkbox" checked={item.isBestValue} onChange={(event) => updatePackage(item.id, { isBestValue: event.target.checked })} className="h-4 w-4 accent-[#FF7A00]" />
                    Highlight as Best Value
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 font-inter text-sm text-white/75 md:col-span-2">
                    <input type="checkbox" checked={item.isFeatured} onChange={(event) => toggleFeaturedPackage(item.id, event.target.checked)} className="h-4 w-4 accent-[#FF7A00]" />
                    <span className="flex-1">Show on homepage</span>
                    {item.isFeatured && <span className="font-poppins text-[9px] uppercase tracking-[0.16em] text-[#FFB15C]">Homepage plan</span>}
                  </label>
                  <label className="flex flex-col gap-2 font-poppins text-[10px] uppercase tracking-[0.15em] text-white/45 md:col-span-2">
                    Short description
                    <input className={fieldsClass} value={item.description} maxLength={220} onChange={(event) => updatePackage(item.id, { description: event.target.value })} />
                  </label>
                  <label className="flex flex-col gap-2 font-poppins text-[10px] uppercase tracking-[0.15em] text-white/45 md:col-span-2">
                    What&apos;s included (one item per line)
                    <textarea className={`${fieldsClass} min-h-36 resize-y leading-relaxed`} value={item.features.join("\n")} maxLength={2400} onChange={(event) => updatePackage(item.id, { features: event.target.value.split("\n") })} />
                  </label>
                </div>
              </section>
            ))}

            <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-inter text-xs text-white/40">Changes appear on the public site as soon as they are saved.</p>
              <button onClick={savePackages} disabled={saving || migrationMissing} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF7A00] px-6 py-3 font-poppins text-xs font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-[#ff9233] disabled:cursor-not-allowed disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving…" : "Save pricing"}
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
            onClick={(event) => {
              if (event.target === event.currentTarget && !deletingPackageId) setDeleteTarget(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="remove-plan-title"
              className="w-full max-w-md rounded-3xl border border-rose-300/20 bg-[#0b0c11]/90 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-7"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-300/20 bg-rose-300/[0.08] text-rose-200">
                <Trash2 className="h-5 w-5" />
              </div>
              <h2 id="remove-plan-title" className="font-geist text-xl font-semibold text-white">Remove {deleteTarget.name || "this plan"}?</h2>
              <p className="mt-2 font-inter text-sm leading-relaxed text-white/55">After confirmation, this plan is deleted from the website immediately. You can cancel and keep editing it.</p>
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setDeleteTarget(null)} disabled={Boolean(deletingPackageId)} className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 font-poppins text-[10px] font-medium uppercase tracking-[0.12em] text-white/65 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50">Keep plan</button>
                <button type="button" onClick={confirmRemovePackage} disabled={Boolean(deletingPackageId)} className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-300/30 bg-rose-400/15 px-5 py-3 font-poppins text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-100 transition hover:bg-rose-400/25 disabled:cursor-wait disabled:opacity-60">{deletingPackageId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}{deletingPackageId ? "Deleting…" : "Remove plan"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saveToast && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className={`fixed right-4 top-24 z-[250] flex w-[min(92vw,390px)] items-start gap-3 rounded-2xl border p-4 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:right-8 ${saveToastKind === "success" ? "border-emerald-300/25 bg-[#07130f]/90 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.1)]" : "border-rose-300/25 bg-[#180b0d]/90 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.1)]"}`}
          >
            {saveToastKind === "success"
              ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
              : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />}
            <div className="min-w-0 flex-1">
              <p className="font-poppins text-xs font-semibold">{saveToastTitle}</p>
              <p className={`mt-1 font-inter text-xs leading-relaxed ${saveToastKind === "success" ? "text-emerald-100/65" : "text-rose-100/65"}`}>{saveToastDetail}</p>
            </div>
            <button type="button" onClick={() => setSaveToast(false)} aria-label="Dismiss notification" className="rounded-lg p-1 text-white/50 transition hover:bg-white/[0.08] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExitConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
            onClick={(event) => {
              if (event.target === event.currentTarget && !loggingOutForExit) stayInAdmin();
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape" && !loggingOutForExit) stayInAdmin();
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="pricing-exit-title"
              aria-describedby="pricing-exit-description"
              className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[#FF7A00]/35 bg-[#0a0a0c]/75 p-7 shadow-[0_24px_100px_rgba(0,0,0,0.68),0_0_45px_rgba(255,122,0,0.1)] backdrop-blur-2xl sm:p-8"
            >
              <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#FF7A00]/10 blur-3xl" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FF7A00]/30 bg-[#FF7A00]/10 text-[#FF7A00]">
                  <LogOut className="h-6 w-6" />
                </div>
                <p className="mb-2 font-poppins text-[10px] font-medium uppercase tracking-[0.24em] text-[#FF7A00]">Admin session</p>
                <h2 id="pricing-exit-title" className="font-geist text-2xl font-semibold tracking-tight text-white sm:text-3xl">Leaving the dashboard?</h2>
                <p id="pricing-exit-description" className="mt-3 font-inter text-sm leading-relaxed text-white/55">
                  Would you like to sign out before you leave? Your admin session on this browser will end.
                </p>
                {exitLogoutError && (
                  <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 font-inter text-xs text-red-300">{exitLogoutError}</p>
                )}
                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={stayInAdmin}
                    disabled={loggingOutForExit}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 font-poppins text-[11px] font-medium uppercase tracking-[0.12em] text-white/65 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
                  >
                    Stay in dashboard
                  </button>
                  <button
                    type="button"
                    onClick={confirmAdminExit}
                    disabled={loggingOutForExit}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#FF7A00]/50 bg-[#FF7A00] px-5 py-3 font-poppins text-[11px] font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-[#ff8c1a] disabled:opacity-60"
                  >
                    {loggingOutForExit ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {loggingOutForExit ? "Signing out…" : "Log out & exit"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
