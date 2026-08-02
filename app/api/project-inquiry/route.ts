import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * POST /api/project-inquiry
 *
 * Receives form data, saves to Firestore (client-side),
 * and sends an email notification to the admin.
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
    } = body;

    // ── Basic server-side validation ──
    if (
      !fullName ||
      !businessName ||
      !businessType ||
      !phoneNumber ||
      !email ||
      !description ||
      !consent
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ── Send email notification ──
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (smtpHost && smtpUser && smtpPass && adminEmail) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const servicesText = Array.isArray(services)
        ? services.join(", ")
        : "None selected";

      await transporter.sendMail({
        from: `"A2 Production" <${smtpUser}>`,
        to: adminEmail,
        subject: `🎬 New Project Inquiry — ${businessName}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e0e0e0; border-radius: 16px; overflow: hidden; border: 1px solid #1a1a1a;">
            <div style="background: linear-gradient(135deg, #FF7A00 0%, #e06800 100%); padding: 32px 28px;">
              <h1 style="margin: 0; font-size: 22px; color: #000; font-weight: 700;">New Project Inquiry</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #000; opacity: 0.8;">A2 Production — Project Submission</p>
            </div>
            <div style="padding: 28px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 10px 0; color: #888; font-size: 13px; width: 140px;">Full Name</td><td style="padding: 10px 0; color: #fff; font-size: 14px;">${fullName}</td></tr>
                <tr><td style="padding: 10px 0; color: #888; font-size: 13px;">Business Name</td><td style="padding: 10px 0; color: #fff; font-size: 14px;">${businessName}</td></tr>
                <tr><td style="padding: 10px 0; color: #888; font-size: 13px;">Business Type</td><td style="padding: 10px 0; color: #fff; font-size: 14px;">${businessType}</td></tr>
                <tr><td style="padding: 10px 0; color: #888; font-size: 13px;">Phone</td><td style="padding: 10px 0; color: #fff; font-size: 14px;">${phoneCode} ${phoneNumber}</td></tr>
                <tr><td style="padding: 10px 0; color: #888; font-size: 13px;">Email</td><td style="padding: 10px 0; color: #fff; font-size: 14px;">${email}</td></tr>
                <tr><td style="padding: 10px 0; color: #888; font-size: 13px;">Timeline</td><td style="padding: 10px 0; color: #fff; font-size: 14px;">${timeline || "Not specified"}</td></tr>
                <tr><td style="padding: 10px 0; color: #888; font-size: 13px;">Services</td><td style="padding: 10px 0; color: #fff; font-size: 14px;">${servicesText}</td></tr>
              </table>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #1a1a1a;">
                <p style="color: #888; font-size: 13px; margin: 0 0 8px;">Project Description</p>
                <p style="color: #e0e0e0; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${description}</p>
              </div>
            </div>
            <div style="padding: 16px 28px; background: #0d0d0d; text-align: center;">
              <p style="margin: 0; color: #555; font-size: 12px;">A2 Production — Project Inquiry System</p>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Project inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to process inquiry" },
      { status: 500 }
    );
  }
}
