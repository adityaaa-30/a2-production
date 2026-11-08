import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MONTHLY_PACKAGES } from "@/lib/monthly-packages";
import { BUSINESS_TYPES, PHONE_CODES, PROJECT_TIMELINES } from "@/lib/project-inquiry-options";

const MAX_BODY_BYTES = 10 * 1024;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const FORBIDDEN_CONTROLS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  const response = NextResponse.json(payload, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

async function readBodyWithLimit(request: NextRequest) {
  const reader = request.body?.getReader();
  if (!reader) return { text: "", tooLarge: false };

  const decoder = new TextDecoder();
  let text = "";
  let bytesRead = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    if (bytesRead > MAX_BODY_BYTES) {
      await reader.cancel();
      return { text: "", tooLarge: true };
    }
    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  return { text, tooLarge: false };
}

/**
 * POST /api/project-inquiry
 *
 * Receives project inquiry data, validates, and saves to Supabase.
 * Email notifications disabled — will be added after domain setup.
 */
export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    const fetchSite = request.headers.get("sec-fetch-site");
    let originHost = "";
    try {
      originHost = origin ? new URL(origin).host.toLowerCase() : "";
    } catch {
      return jsonResponse({ error: "Request origin is not allowed." }, 403);
    }
    const requestHost = request.headers.get("host")?.toLowerCase();
    if ((origin && (!requestHost || originHost !== requestHost)) || fetchSite === "cross-site") {
      return jsonResponse({ error: "Request origin is not allowed." }, 403);
    }

    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return jsonResponse({ error: "Expected a JSON request." }, 415);
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: "Request body is too large." }, 413);
    }

    const { text: rawBody, tooLarge } = await readBodyWithLimit(request);
    if (tooLarge) {
      return jsonResponse({ error: "Request body is too large." }, 413);
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ error: "Invalid request body." }, 400);
    }
    if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
      return jsonResponse({ error: "Invalid request body." }, 400);
    }
    const body = parsedBody as Record<string, unknown>;

    const {
      fullName,
      businessName,
      businessType,
      phoneCode,
      phoneNumber,
      email,
      timeline,
      monthlyPackage,
      description,
      consent,
      websiteUrl,
    } = body;

    // ── 1. Honeypot Check (Spam Bot Trap) ──
    if (websiteUrl && typeof websiteUrl === "string" && websiteUrl.trim() !== "") {
      console.warn("[Security] Spam submission caught by honeypot field.");
      return jsonResponse({ success: true });
    }

    // ── 2. Whitespace Trimming & Sanitization ──
    const capitalizeWords = (str: string) => str.trim().replace(/\b[a-z]/g, (c) => c.toUpperCase());

    const cleanFullName = typeof fullName === "string" ? capitalizeWords(fullName) : "";
    const cleanBusinessName = typeof businessName === "string" ? capitalizeWords(businessName) : "";
    const cleanBusinessType = typeof businessType === "string" ? businessType.trim() : "";
    const cleanPhone = typeof phoneNumber === "string" ? phoneNumber.trim().replace(/[^0-9]/g, "") : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanDescription = typeof description === "string" ? description.trim() : "";
    const code = typeof phoneCode === "string" ? phoneCode.trim() : "";
    const cleanTimeline = typeof timeline === "string" ? timeline.trim() : "";

    if (
      (description !== undefined && typeof description !== "string") ||
      (timeline !== undefined && typeof timeline !== "string") ||
      (monthlyPackage !== undefined && typeof monthlyPackage !== "string")
    ) {
      return jsonResponse({ error: "Invalid submission parameters." }, 400);
    }

    // ── 3. Strict Server-Side Validation ──
    if (
      !cleanFullName || cleanFullName.length < 2 || cleanFullName.length > 100 ||
      FORBIDDEN_CONTROLS.test(cleanFullName) ||
      !cleanBusinessName || cleanBusinessName.length < 2 || cleanBusinessName.length > 150 ||
      FORBIDDEN_CONTROLS.test(cleanBusinessName) ||
      !BUSINESS_TYPES.includes(cleanBusinessType as (typeof BUSINESS_TYPES)[number]) ||
      !PHONE_CODES.includes(code as (typeof PHONE_CODES)[number]) ||
      !cleanPhone || !/^[0-9]{10}$/.test(cleanPhone) ||
      !cleanEmail || cleanEmail.length > 100 || !EMAIL_REGEX.test(cleanEmail) ||
      FORBIDDEN_CONTROLS.test(cleanEmail) ||
      cleanDescription.length > 3000 || FORBIDDEN_CONTROLS.test(cleanDescription) ||
      (cleanTimeline !== "" && !PROJECT_TIMELINES.includes(cleanTimeline as (typeof PROJECT_TIMELINES)[number])) ||
      consent !== true
    ) {
      return jsonResponse({ error: "Invalid submission parameters. Please check all inputs." }, 400);
    }

    // Escape for safe storage
    const packageId = typeof monthlyPackage === "string" ? monthlyPackage : "";
    const fallbackPackage = MONTHLY_PACKAGES.find((pkg) => pkg.id === packageId);
    if (packageId && !/^[a-z0-9][a-z0-9-]{0,99}$/.test(packageId)) {
      return jsonResponse({ error: "Please select a valid monthly package." }, 400);
    }

    // ── 4. Save to Supabase ──
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!supabaseUrl || !supabaseKey) {
      console.error("[Supabase Config Error] Missing server-side Supabase URL or service-role key.");
      return jsonResponse({ error: "Database configuration error. Please contact support." }, 500);
    }

    const dbClient = createClient(supabaseUrl.trim(), supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let selectedPackage: { name: string; price: string } | undefined = fallbackPackage;
    if (packageId) {
      const { data: packageRow, error: packageError } = await dbClient
        .from("monthly_packages")
        .select("name,price_inr,offer_price_inr")
        .eq("id", packageId)
        .maybeSingle();

      if (packageError && !fallbackPackage) {
        return jsonResponse({ error: "Please select a valid monthly package." }, 400);
      }
      if (!packageError && packageRow && Number.isFinite(packageRow.price_inr) && packageRow.price_inr > 0) {
        selectedPackage = {
          name: packageRow.name || fallbackPackage?.name || "Monthly Plan",
          price: `₹${Number(packageRow.offer_price_inr || packageRow.price_inr).toLocaleString("en-IN")}`,
        };
      } else if (!packageError) {
        return jsonResponse({ error: "Please select a valid monthly package." }, 400);
      }
      if (!selectedPackage) {
        return jsonResponse({ error: "Please select a valid monthly package." }, 400);
      }
    }

    const packageText = selectedPackage
      ? `Package: ${selectedPackage.name} (${selectedPackage.price}/month)`
      : "";
    const timelineText = cleanTimeline ? `Timeline: ${cleanTimeline}` : "";
    const budgetOrTimeline =
      [packageText, timelineText].filter(Boolean).join(" | ") || "Not specified";

    const { error: dbError } = await dbClient
      .from("project_requests")
      .insert([
        {
          client_name: cleanFullName,
          business_name: cleanBusinessName,
          business_type: cleanBusinessType,
          email: cleanEmail,
          phone: `${code} ${cleanPhone}`,
          project_description: cleanDescription,
          budget: budgetOrTimeline,
          status: "New",
        },
      ]);

    if (dbError) {
      console.error("[Supabase Insert Error]", { code: dbError.code || "unknown" });
      return jsonResponse({ error: "Failed to save your request. Please try again." }, 500);
    }

    console.log("[Success] Project inquiry saved.");
    return jsonResponse({ success: true });
  } catch (error: unknown) {
    console.error("[Project Inquiry Error]:", error);
    return jsonResponse({ error: "An unexpected error occurred. Please try again." }, 500);
  }
}
