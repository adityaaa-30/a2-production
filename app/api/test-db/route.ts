import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * TEMPORARY DEBUG ENDPOINT — DELETE AFTER DEBUGGING
 * GET /api/test-db
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      status: "ENV_MISSING",
      supabaseUrl: supabaseUrl ? "SET ✓" : "MISSING ✗",
      supabaseKey: supabaseKey ? "SET ✓" : "MISSING ✗",
      resendApiKey: process.env.RESEND_API_KEY ? "SET ✓" : "MISSING ✗",
    });
  }

  try {
    const db = createClient(supabaseUrl.trim(), supabaseKey.trim());

    const { error } = await db.from("project_requests").insert([
      {
        client_name: "DEBUG TEST",
        business_name: "Debug Co",
        business_type: "Test",
        email: "debug@test.com",
        phone: "+91 9999999999",
        project_description: "Debug test insert",
        budget: "Test",
        status: "New",
      },
    ]);

    if (error) {
      return NextResponse.json({
        status: "INSERT_FAILED",
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        supabaseUrl: supabaseUrl.substring(0, 30) + "...",
        keyType: process.env.SUPABASE_SERVICE_ROLE_KEY
          ? "service_role"
          : "anon",
        resendApiKey: process.env.RESEND_API_KEY ? "SET ✓" : "MISSING ✗",
      });
    }

    return NextResponse.json({
      status: "SUCCESS ✓",
      message: "Supabase insert worked! Check your table for DEBUG TEST row.",
      supabaseUrl: supabaseUrl.substring(0, 30) + "...",
      keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : "anon",
      resendApiKey: process.env.RESEND_API_KEY ? "SET ✓" : "MISSING ✗",
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "EXCEPTION",
      error: err?.message || String(err),
      supabaseUrl: supabaseUrl.substring(0, 30) + "...",
      resendApiKey: process.env.RESEND_API_KEY ? "SET ✓" : "MISSING ✗",
    });
  }
}
