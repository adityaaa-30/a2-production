"use client";

import { useEffect, useState } from "react";
import { MONTHLY_PACKAGES, formatMonthlyPrice, type MonthlyPackage } from "@/lib/monthly-packages";
import { supabase } from "@/lib/supabase";

type PackageRow = {
  id: string;
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

export function useMonthlyPackages() {
  const [packages, setPackages] = useState<MonthlyPackage[]>(MONTHLY_PACKAGES);

  useEffect(() => {
    let active = true;

    const loadPackages = async () => {
      const { data, error } = await supabase
        .from("monthly_packages")
        .select("id,name,price_inr,description,features,sort_order,created_at,offer_price_inr,offer_label,is_best_value,is_featured")
        .order("sort_order", { ascending: true });

      if (!active) return;
      if (error) return;
      if (!data?.length) {
        setPackages([]);
        return;
      }

      const rows = data as PackageRow[];
      const fallbackById = new Map(MONTHLY_PACKAGES.map((item) => [item.id, item]));
      const updatedPackages = rows
        .filter((row) => Number.isFinite(row.price_inr) && row.price_inr >= 1)
        .map((row) => {
          const fallback = fallbackById.get(row.id);
          return {
            id: row.id,
            name: row.name || fallback?.name || "Monthly Plan",
            priceInr: row.price_inr,
            price: formatMonthlyPrice(row.price_inr),
            description: row.description || fallback?.description || "",
            features: Array.isArray(row.features) ? row.features : fallback?.features || [],
            sortOrder: row.sort_order,
            createdAt: row.created_at || fallback?.createdAt || null,
            offerPriceInr: row.offer_price_inr,
            offerLabel: row.offer_label || "",
            isBestValue: row.is_best_value ?? fallback?.isBestValue ?? false,
            isFeatured: row.is_featured ?? fallback?.isFeatured ?? false,
          };
        });

      updatedPackages.sort((a, b) => a.sortOrder - b.sortOrder);

      setPackages(updatedPackages);
    };

    void loadPackages();
    return () => {
      active = false;
    };
  }, []);

  return packages;
}
