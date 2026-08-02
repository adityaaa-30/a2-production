-- ════════════════════════════════════════════════════════════════════════
-- SUPABASE SCHEMA: project_requests
-- Execute this SQL in your Supabase SQL Editor (https://app.supabase.com)
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.project_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    client_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,

    email TEXT NOT NULL,
    phone TEXT NOT NULL,

    project_description TEXT,
    budget TEXT,

    status TEXT DEFAULT 'New' NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_requests_created_at ON public.project_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_requests_status ON public.project_requests(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Anyone can insert project requests" ON public.project_requests;
DROP POLICY IF EXISTS "Authenticated users can select project requests" ON public.project_requests;
DROP POLICY IF EXISTS "Authenticated users can update project requests" ON public.project_requests;
DROP POLICY IF EXISTS "Authenticated users can delete project requests" ON public.project_requests;

-- RLS Policies
CREATE POLICY "Anyone can insert project requests"
ON public.project_requests
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Authenticated users can select project requests"
ON public.project_requests
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update project requests"
ON public.project_requests
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete project requests"
ON public.project_requests
FOR DELETE
TO authenticated
USING (true);
