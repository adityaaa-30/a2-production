import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";


/**
 * Utility function to HTML-escape user inputs to prevent XSS in HTML emails.
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
 * Secure server-side route that receives project inquiry data,
 * validates parameters, performs anti-bot checks, escapes HTML,
 * and sends email notifications via Resend API.
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
      formStartTime,
    } = body;

    // ── 1. Honeypot Check (Spam Bot Trap) ──
    if (websiteUrl && typeof websiteUrl === "string" && websiteUrl.trim() !== "") {
      console.warn("[Security] Spam submission caught by honeypot field.");
      return NextResponse.json({ success: true });
    }

    // ── 2. Bot Timing Check (Must take at least 2.5s to fill form) ──
    if (formStartTime && typeof formStartTime === "number") {
      const elapsed = Date.now() - formStartTime;
      if (elapsed < 2500) {
        console.warn(`[Security] Automated submission detected (filled in ${elapsed}ms).`);
        return NextResponse.json({ success: true }); // Return fake success to confuse bots
      }
    }

    // ── 3. Whitespace Trimming & Sanitization ──
    const capitalizeWords = (str: string) =>
      str.trim().replace(/\b[a-z]/g, (c) => c.toUpperCase());

    const cleanFullName = typeof fullName === "string" ? capitalizeWords(fullName) : "";
    const cleanBusinessName = typeof businessName === "string" ? capitalizeWords(businessName) : "";
    const cleanBusinessType = typeof businessType === "string" ? businessType.trim() : "";
    const cleanPhone = typeof phoneNumber === "string" ? phoneNumber.trim().replace(/[^0-9]/g, "") : "";
    const cleanEmail = typeof email === "string" ? sanitizeHeader(email) : "";
    const cleanDescription = typeof description === "string" ? description.trim() : "";
    const code = typeof phoneCode === "string" ? sanitizeHeader(phoneCode) : "+91";

    // ── 4. Strict Server-Side Validation ──
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (
      !cleanFullName || cleanFullName.length < 2 || cleanFullName.length > 100 ||
      !cleanBusinessName || cleanBusinessName.length < 2 || cleanBusinessName.length > 150 ||
      !cleanBusinessType || cleanBusinessType.length < 1 || cleanBusinessType.length > 100 ||
      !cleanPhone || !/^[0-9]{10}$/.test(cleanPhone) ||
      !cleanEmail || cleanEmail.length > 100 || !EMAIL_REGEX.test(cleanEmail) ||
      !cleanDescription || cleanDescription.length < 20 || cleanDescription.length > 3000 ||
      !consent
    ) {
      return NextResponse.json(
        { error: "Invalid submission parameters. Please check all inputs." },
        { status: 400 }
      );
    }

    // HTML escape sanitized strings for template rendering (XSS Protection)
    const safeFullName = escapeHtml(cleanFullName);
    const safeBusinessName = escapeHtml(cleanBusinessName);
    const safeBusinessType = escapeHtml(cleanBusinessType);
    const safePhone = escapeHtml(cleanPhone);
    const safeEmail = escapeHtml(cleanEmail);
    const safeDescription = escapeHtml(cleanDescription);
    const safeCode = escapeHtml(code);

    const safeTimeline = typeof timeline === "string" ? escapeHtml(timeline.trim()) : "";
    const safeServices = Array.isArray(services)
      ? services.map((s) => (typeof s === "string" ? escapeHtml(s.trim()) : "")).filter(Boolean)
      : [];

    const budgetOrTimeline = safeTimeline || (safeServices.length > 0 ? safeServices.join(", ") : "Not specified");

    // ── 5. Server-Side Supabase DB Storage ──
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const dbClient = createClient(supabaseUrl.trim(), supabaseAnonKey.trim());
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
          console.error("[Supabase DB Insert Error]:", dbError);
        }
      } catch (dbErr) {
        console.error("[Supabase Client Init Error]:", dbErr);
      }
    }

    // ── 6. Server-Side Email Delivery via Resend ──
    const resendApiKey = process.env.RESEND_API_KEY;

    // Guard: RESEND_API_KEY must be present and non-empty
    if (!resendApiKey || resendApiKey.trim() === "") {
      console.error(
        "[Config Error] RESEND_API_KEY is not set or is empty. " +
        "Ensure this variable is added to your Vercel project environment variables."
      );
      return NextResponse.json(
        { error: "Email service is temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    // Safely resolve admin and from email — never let these be undefined or empty strings.
    // On Vercel, env vars containing angle brackets (<>) must be set WITHOUT quotes in the
    // dashboard (Vercel handles the raw value). If the value arrives as an empty string or
    // undefined (e.g. the variable was not configured), we fall back to a safe hardcoded value.
    const rawAdminEmail = process.env.ADMIN_EMAIL;
    const rawFromEmail = process.env.RESEND_FROM_EMAIL;

    const adminEmail =
      rawAdminEmail && rawAdminEmail.trim() !== ""
        ? rawAdminEmail.trim()
        : "a2production440@gmail.com";

    const fromEmail =
      rawFromEmail && rawFromEmail.trim() !== ""
        ? rawFromEmail.trim()
        : "A2 Production <onboarding@resend.dev>";

    // Validate that fromEmail is a non-empty string safe to use as a header value
    if (typeof fromEmail !== "string" || fromEmail.length === 0) {
      console.error(
        "[Config Error] RESEND_FROM_EMAIL resolved to an invalid value:",
        fromEmail
      );
      return NextResponse.json(
        { error: "Email service misconfiguration. Please contact support." },
        { status: 503 }
      );
    }

    const submissionTime = new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "medium",
    });

    {
      // Block scope — always runs (resendApiKey already validated above)
      const resend = new Resend(resendApiKey);

      // Send Admin Alert Email
      const { error: resendError } = await resend.emails.send({
        from: fromEmail,
        to: [adminEmail],
        subject: `🎬 New Project Inquiry — ${cleanBusinessName} (${cleanFullName})`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050507; color: #e5e5e5; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #0a0a0c; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; overflow: hidden; }
                .header { background: linear-gradient(135deg, #FF7A00 0%, #FF9A40 100%); padding: 32px 28px; text-align: left; }
                .header h1 { margin: 0; font-size: 22px; color: #000; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
                .header p { margin: 6px 0 0 0; font-size: 13px; color: rgba(0,0,0,0.8); font-weight: 500; }
                .body { padding: 28px; }
                .field-row { display: flex; border-bottom: 1px solid rgba(255, 255, 255, 0.06); padding: 12px 0; }
                .label { width: 150px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #888; letter-spacing: 0.1em; }
                .value { font-size: 14px; color: #fff; font-weight: 400; flex: 1; }
                .value a { color: #FF7A00; text-decoration: none; }
                .desc-box { margin-top: 12px; padding: 18px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; font-size: 14px; line-height: 1.6; color: #d4d4d4; white-space: pre-wrap; }
                .footer { padding: 20px 28px; background: #070709; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>New Project Inquiry</h1>
                  <p>A2 Production — Project Submission Alert</p>
                </div>
                <div class="body">
                  <div class="field-row">
                    <div class="label">Client Name</div>
                    <div class="value"><strong>${safeFullName}</strong></div>
                  </div>
                  <div class="field-row">
                    <div class="label">Business Name</div>
                    <div class="value">${safeBusinessName}</div>
                  </div>
                  <div class="field-row">
                    <div class="label">Business Type</div>
                    <div class="value">${safeBusinessType}</div>
                  </div>
                  <div class="field-row">
                    <div class="label">Email</div>
                    <div class="value"><a href="mailto:${safeEmail}">${safeEmail}</a></div>
                  </div>
                  <div class="field-row">
                    <div class="label">Phone</div>
                    <div class="value"><a href="tel:${safeCode} ${safePhone}">${safeCode} ${safePhone}</a></div>
                  </div>
                  <div class="field-row">
                    <div class="label">Budget / Timeline</div>
                    <div class="value">${budgetOrTimeline}</div>
                  </div>
                  <div class="field-row">
                    <div class="label">Submission Time</div>
                    <div class="value" style="color: #FF7A00;">${submissionTime}</div>
                  </div>

                  <div style="margin-top: 24px;">
                    <div class="label">Project Description</div>
                    <div class="desc-box">${safeDescription}</div>
                  </div>
                </div>
                <div class="footer">
                  This notification was automatically sent by A2 Production system.
                </div>
              </div>
            </body>
          </html>
        `,
      });

      if (resendError) {
        console.error("[Resend Admin Email Error]:", JSON.stringify(resendError, null, 2));
      }

      // Send Client Confirmation Email (best-effort, fails silently if unverified domain)
      try {
        const { error: clientEmailError } = await resend.emails.send({
          from: fromEmail,
          to: [cleanEmail],
          subject: "We've Received Your Project Inquiry | A2 Production",
          html: `
            <!DOCTYPE html>
            <html>
              <body style="font-family: Arial, sans-serif; background:#111; color:#fff; padding:40px;">
                <div style="max-width:600px;margin:auto;background:#1b1b1b;padding:30px;border-radius:12px;">
                  <h2 style="color:#FF7A00;">Thank You, ${safeFullName}! 🎉</h2>

                  <p>We have successfully received your project inquiry.</p>

                  <p>Our team will carefully review your requirements and contact you within the next 24 hours.</p>

                  <hr style="border:none;border-top:1px solid #333;margin:25px 0;" />

                  <h3>Your Submission Summary</h3>

                  <p><strong>Business:</strong> ${safeBusinessName}</p>
                  <p><strong>Business Type:</strong> ${safeBusinessType}</p>
                  <p><strong>Email:</strong> ${safeEmail}</p>
                  <p><strong>Phone:</strong> ${safeCode} ${safePhone}</p>

                  <br>

                  <p>Thank you for choosing <strong>A2 Production</strong>.</p>

                  <p>Regards,<br><strong>A2 Production Team</strong></p>
                </div>
              </body>
            </html>
          `,
        });

        if (clientEmailError) {
          console.error("[Resend Client Email Error]:", JSON.stringify(clientEmailError, null, 2));
        }
      } catch (clientErr) {
        console.error("[Resend Client Exception]:", clientErr);
      }

    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[Project Inquiry Error]:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
