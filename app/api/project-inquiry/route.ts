import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Utility function to HTML-escape user inputs.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Utility to sanitize email string against CRLF header injection.
 */
function sanitizeHeader(str: string): string {
  return str.replace(/[\r\n]/g, "").trim();
}

/**
 * POST /api/project-inquiry
 *
 * Receives project inquiry data, validates, and saves to Supabase.
 * Email notifications disabled — will be added after domain setup.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      fullName,
      businessName,
      businessType,
      phoneCode,
      phoneNumber,
      email,
      timeline,
      services,
      description,
      consent,
      websiteUrl,
    } = body;

    // ── 1. Honeypot Check (Spam Bot Trap) ──
    if (websiteUrl && typeof websiteUrl === "string" && websiteUrl.trim() !== "") {
      console.warn("[Security] Spam submission caught by honeypot field.");
      return NextResponse.json({ success: true });
    }

    // ── 2. Whitespace Trimming & Sanitization ──
    const capitalizeWords = (str: string) =>
      str.trim().replace(/\b[a-z]/g, (c) => c.toUpperCase());

    const cleanFullName = typeof fullName === "string" ? capitalizeWords(fullName) : "";
    const cleanBusinessName = typeof businessName === "string" ? capitalizeWords(businessName) : "";
    const cleanBusinessType = typeof businessType === "string" ? businessType.trim() : "";
    const cleanPhone = typeof phoneNumber === "string" ? phoneNumber.trim().replace(/[^0-9]/g, "") : "";
    const cleanEmail = typeof email === "string" ? sanitizeHeader(email) : "";
    const cleanDescription = typeof description === "string" ? description.trim() : "";
    const code = typeof phoneCode === "string" ? sanitizeHeader(phoneCode) : "+91";

    // ── 3. Strict Server-Side Validation ──
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (
      !cleanFullName || cleanFullName.length < 2 || cleanFullName.length > 100 ||
      !cleanBusinessName || cleanBusinessName.length < 2 || cleanBusinessName.length > 150 ||
      !cleanBusinessType || cleanBusinessType.length < 1 || cleanBusinessType.length > 100 ||
      !cleanPhone || !/^[0-9]{10}$/.test(cleanPhone) ||
      !cleanEmail || cleanEmail.length > 100 || !EMAIL_REGEX.test(cleanEmail) ||
      cleanDescription.length > 3000
    ) {
      return NextResponse.json(
        { error: "Invalid submission parameters. Please check all inputs." },
        { status: 400 }
      );
    }

    // Escape for safe storage
    const safeTimeline = typeof timeline === "string" ? escapeHtml(timeline.trim()) : "";
    const safeServices = Array.isArray(services)
      ? services.map((s) => (typeof s === "string" ? escapeHtml(s.trim()) : "")).filter(Boolean)
      : [];

    const timelineText = safeTimeline ? `Timeline: ${safeTimeline}` : "";
    const servicesText = safeServices.length > 0 ? `Services: ${safeServices.join(", ")}` : "";
    const budgetOrTimeline =
      [timelineText, servicesText].filter(Boolean).join(" | ") || "Not specified";

    // ── 4. Save to Supabase ──
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("[Supabase Config Error] Missing Supabase URL or Key in environment.");
      return NextResponse.json(
        { error: "Database configuration error. Please contact support." },
        { status: 500 }
      );
    }

    const dbClient = createClient(supabaseUrl.trim(), supabaseKey.trim());
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
      console.error("[Supabase Insert Error]:", JSON.stringify(dbError, null, 2));
      return NextResponse.json(
        { error: `Failed to save your request. Please try again.` },
        { status: 500 }
      );
    }

    console.log("[Success] Project inquiry saved for:", cleanEmail);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[Project Inquiry Error]:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
