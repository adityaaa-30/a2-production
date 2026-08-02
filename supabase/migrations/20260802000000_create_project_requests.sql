-- ════════════════════════════════════════════════════════════════════════
-- SUPABASE MIGRATION: Create project_requests table with RLS Policies
-- ════════════════════════════════════════════════════════════════════════

-- 1. Create table `project_requests`
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

-- 2. Indexes for performance on status & sorting by created_at
CREATE INDEX IF NOT EXISTS idx_project_requests_created_at ON public.project_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_requests_status ON public.project_requests(status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Anyone (Public / Anonymous) can INSERT a new project request
CREATE POLICY "Anyone can insert project requests"
ON public.project_requests
FOR INSERT
TO public
WITH CHECK (true);

-- 5. RLS Policy: Only authenticated users can SELECT records
CREATE POLICY "Authenticated users can select project requests"
ON public.project_requests
FOR SELECT
TO authenticated
USING (true);

-- 6. RLS Policy: Only authenticated users can UPDATE records
CREATE POLICY "Authenticated users can update project requests"
ON public.project_requests
FOR UPDATE
TO authenticated
USING (true);

-- 7. RLS Policy: Only authenticated users can DELETE records
CREATE POLICY "Authenticated users can delete project requests"
ON public.project_requests
FOR DELETE
TO authenticated
USING (true);
