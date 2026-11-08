"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, Search, SlidersHorizontal, Sparkles, Star, Tag } from "lucide-react";
import { useProjectInquiryModal } from "@/components/ProjectInquiryContext";
import { useMonthlyPackages } from "@/hooks/useMonthlyPackages";
import { formatMonthlyPrice } from "@/lib/monthly-packages";
import { AmbientLightBackground } from "@/components/AmbientLightBackground";

type SortMode = "recommended" | "newest" | "price-low" | "price-high";

function effectivePrice(price: number, offerPrice: number | null) {
  return offerPrice ?? price;
}

export default function PlansPage() {
  const packages = useMonthlyPackages();
  const { openModal } = useProjectInquiryModal();
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recommended");
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setNow(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const newPlanIds = useMemo(() => {
    if (now === null) return new Set<string>();
    const newSince = now - 30 * 24 * 60 * 60 * 1000;
    return new Set(packages
      .filter((item) =>
        !["starter", "professional", "premium-growth"].includes(item.id) &&
        item.createdAt && Date.parse(item.createdAt) >= newSince,
      )
      .map((item) => item.id));
  }, [now, packages]);

  const visiblePackages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    return packages
      .filter((item) => {
        const haystack = [item.name, item.description, ...item.features, item.offerLabel]
          .join(" ")
          .toLowerCase();
        const price = effectivePrice(item.priceInr, item.offerPriceInr);
        return (!normalizedQuery || haystack.includes(normalizedQuery)) &&
          (min === null || price >= min) &&
          (max === null || price <= max);
      })
      .sort((a, b) => {
        if (sortMode === "price-low") return effectivePrice(a.priceInr, a.offerPriceInr) - effectivePrice(b.priceInr, b.offerPriceInr);
        if (sortMode === "price-high") return effectivePrice(b.priceInr, b.offerPriceInr) - effectivePrice(a.priceInr, a.offerPriceInr);
        if (sortMode === "newest") return Date.parse(b.createdAt || "") - Date.parse(a.createdAt || "") || b.sortOrder - a.sortOrder;
        return a.sortOrder - b.sortOrder;
      });
  }, [packages, query, minPrice, maxPrice, sortMode]);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#050507] px-5 pb-24 pt-32 text-white sm:px-8 md:pt-40">
      <AmbientLightBackground />

      <div className="relative z-10 mx-auto max-w-7xl">
        <Link href="/#plans" className="mb-8 inline-flex items-center gap-2 font-inter text-sm text-white/55 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to monthly plans
        </Link>

        <div className="flex flex-col gap-7 border-b border-white/10 pb-9 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/25 bg-[#FF7A00]/[0.06] px-4 py-1.5 font-poppins text-[10px] font-medium uppercase tracking-[0.28em] text-[#FFB15C]">
              <Sparkles className="h-3.5 w-3.5" /> All monthly plans
            </div>
            <h1 className="font-geist text-4xl font-semibold tracking-tight sm:text-5xl">Find the right plan for your next move.</h1>
            <p className="mt-4 max-w-2xl font-inter text-sm leading-relaxed text-white/55 sm:text-base">
              Explore every plan, compare monthly pricing, and find the package that fits your goals.
            </p>
          </div>
          <p className="font-inter text-xs text-white/40">{visiblePackages.length} {visiblePackages.length === 1 ? "plan" : "plans"} available</p>
        </div>

        <section aria-label="Search and sort plans" className="mt-8 rounded-3xl border border-white/12 bg-[#0c0e15]/60 p-3 shadow-[0_18px_65px_rgba(0,0,0,0.28)] sm:p-5 md:backdrop-blur-2xl">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-[minmax(240px,1fr)_170px_170px_230px]">
            <label className="relative col-span-2 block lg:col-span-1">
              <span className="sr-only">Search plans</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search plans or included services…"
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/35 py-3.5 pl-11 pr-4 font-inter text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#FF7A00]/50"
              />
            </label>
            <label className="relative">
              <span className="sr-only">Minimum monthly price</span>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-inter text-sm text-white/40">₹</span>
              <input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Min price" className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/35 py-3.5 pl-9 pr-2 font-inter text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#FF7A00]/50" />
            </label>
            <label className="relative">
              <span className="sr-only">Maximum monthly price</span>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-inter text-sm text-white/40">₹</span>
              <input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max price" className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/35 py-3.5 pl-9 pr-2 font-inter text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#FF7A00]/50" />
            </label>
            <label className="relative col-span-2 lg:col-span-1">
              <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FFB15C]" />
              <span className="sr-only">Sort plans</span>
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="w-full min-w-0 appearance-none rounded-2xl border border-white/10 bg-black/35 py-3.5 pl-11 pr-9 font-inter text-sm text-white outline-none transition focus:border-[#FF7A00]/50">
                <option value="recommended" className="bg-[#101117]">Recommended</option>
                <option value="newest" className="bg-[#101117]">Newest first</option>
                <option value="price-low" className="bg-[#101117]">Price: low to high</option>
                <option value="price-high" className="bg-[#101117]">Price: high to low</option>
              </select>
            </label>
          </div>
        </section>

        {visiblePackages.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-16 text-center">
            <Search className="mx-auto h-7 w-7 text-white/35" />
            <h2 className="mt-4 font-geist text-xl font-semibold">No plans match those filters</h2>
            <p className="mt-2 font-inter text-sm text-white/45">Try another search or widen the monthly price range.</p>
          </div>
        ) : (
          <div className="mt-7 grid items-stretch gap-4 sm:mt-9 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visiblePackages.map((pkg) => {
              const discounted = pkg.offerPriceInr !== null;
              const isNewest = newPlanIds.has(pkg.id);
              return (
                <article key={pkg.id} className={`relative flex h-full flex-col overflow-hidden rounded-3xl border p-5 transition md:hover:-translate-y-1.5 sm:p-7 md:backdrop-blur-xl ${pkg.isBestValue ? "border-[#FF7A00]/45 bg-gradient-to-b from-[#FF7A00]/[0.11] via-[#0b0b0d]/75 to-[#0b0b0d]/80 shadow-[0_20px_55px_rgba(255,122,0,0.08)]" : "border-white/12 bg-[#0b0d13]/60 hover:border-white/25"}`}>
                  <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-indigo-400/[0.09] blur-3xl" />
                  <div className="relative mb-5 flex flex-wrap gap-2">
                    {pkg.isBestValue && <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF7A00]/35 bg-[#FF7A00]/10 px-3 py-1 font-poppins text-[9px] font-semibold uppercase tracking-[0.16em] text-[#FFB15C]"><Star className="h-3 w-3 fill-current" /> Best Value</span>}
                    {isNewest && <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-300/[0.08] px-3 py-1 font-poppins text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-200"><Sparkles className="h-3 w-3" /> Newest</span>}
                    {discounted && <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-300/[0.08] px-3 py-1 font-poppins text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-200"><Tag className="h-3 w-3" /> {pkg.offerLabel || "Offer"}</span>}
                  </div>
                  <h2 className="relative font-geist text-2xl font-semibold tracking-tight">{pkg.name}</h2>
                  <p className="relative mt-3 min-h-12 font-inter text-sm leading-relaxed text-white/55">{pkg.description}</p>

                  <div className="relative mt-6 border-b border-white/10 pb-6">
                    {discounted && <span className="mr-3 font-geist text-base text-white/40 line-through">{pkg.price}</span>}
                    <span className="whitespace-nowrap font-geist text-3xl font-semibold tracking-tight sm:text-4xl">{formatMonthlyPrice(effectivePrice(pkg.priceInr, pkg.offerPriceInr))}</span>
                    <span className="ml-2 font-inter text-xs text-white/45">/ month</span>
                    {discounted && <p className="mt-2 font-inter text-xs text-emerald-200/80">Save {formatMonthlyPrice(pkg.priceInr - (pkg.offerPriceInr || 0))} per month</p>}
                  </div>

                  <div className="relative flex-1 py-6">
                    <p className="mb-4 font-poppins text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">What&apos;s included</p>
                    <ul className="flex flex-col gap-3">
                      {pkg.features.map((feature, index) => <li key={`${pkg.id}-${index}`} className="flex items-start gap-3 font-inter text-sm leading-relaxed text-white/75"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#FF7A00]" /><span>{feature}</span></li>)}
                    </ul>
                  </div>

                  <button type="button" onClick={() => openModal(pkg.id)} className={`relative mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3.5 font-poppins text-[10px] font-semibold uppercase tracking-[0.15em] transition ${pkg.isBestValue ? "border-[#FF7A00] bg-[#FF7A00] text-black hover:bg-[#ff9638]" : "border-white/15 bg-white/[0.03] text-white/80 hover:border-[#FF7A00]/60 hover:bg-[#FF7A00]/10 hover:text-[#FFB15C]"}`}>
                    Choose this plan <ArrowUpRight className="h-4 w-4" />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
