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
DROP POLICY IF EXISTS "Admins can select project requests" ON public.project_requests;
DROP POLICY IF EXISTS "Admins can update project requests" ON public.project_requests;
DROP POLICY IF EXISTS "Admins can delete project requests" ON public.project_requests;

-- Public submissions must pass through the validated server API route.
REVOKE INSERT ON public.project_requests FROM PUBLIC, anon, authenticated;
GRANT INSERT ON public.project_requests TO service_role;

-- RLS Policies

CREATE POLICY "Admins can select project requests"
ON public.project_requests
FOR SELECT
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update project requests"
ON public.project_requests
FOR UPDATE
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete project requests"
ON public.project_requests
FOR DELETE
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Monthly package pricing managed in /admin/pricing
CREATE TABLE IF NOT EXISTS public.monthly_packages (
    id TEXT PRIMARY KEY CHECK (id ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
    price_inr INTEGER NOT NULL CHECK (price_inr > 0 AND price_inr <= 100000000),
    description TEXT NOT NULL CHECK (char_length(description) BETWEEN 1 AND 220),
    features JSONB NOT NULL CHECK (jsonb_typeof(features) = 'array'),
    sort_order SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    offer_price_inr INTEGER CHECK (offer_price_inr IS NULL OR (offer_price_inr > 0 AND offer_price_inr < price_inr)),
    offer_label TEXT CHECK (offer_label IS NULL OR char_length(offer_label) BETWEEN 1 AND 40),
    is_best_value BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.monthly_packages (id, name, price_inr, description, features, sort_order)
VALUES
    ('starter', 'Starter Plan', 9999, 'For new businesses starting their social media journey.',
     '["5 high-quality reels", "Professional shoot + editing", "Complete Instagram page management", "Basic growth strategy", "Page optimization + content planning"]'::jsonb, 0),
    ('professional', 'Professional Plan', 19999, 'For consistent content and professional page management.',
     '["10 high-quality reels", "Creative posters", "Complete Instagram page management", "Professional shoot + editing", "Growth-focused content strategy", "Monthly performance tracking", "Regular content + page optimization"]'::jsonb, 1),
    ('premium-growth', 'Premium Growth Plan', 24999, 'For businesses pursuing aggressive, consistent social growth.',
     '["15 high-quality reels", "High-quality creative posters", "Complete Instagram page management", "Growth-focused marketing strategy", "Professional shoot + editing", "Monthly performance + growth tracking", "Consistent content + audience engagement", "3-month growth roadmap"]'::jsonb, 2)
ON CONFLICT (id) DO NOTHING;

UPDATE public.monthly_packages
SET is_best_value = TRUE
WHERE id = 'premium-growth'
  AND NOT EXISTS (SELECT 1 FROM public.monthly_packages WHERE is_best_value = TRUE);

UPDATE public.monthly_packages
SET is_featured = TRUE
WHERE id IN ('starter', 'professional', 'premium-growth')
  AND NOT EXISTS (SELECT 1 FROM public.monthly_packages WHERE is_featured = TRUE);

ALTER TABLE public.monthly_packages ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.monthly_packages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.monthly_packages TO authenticated;

DROP POLICY IF EXISTS "Public can read monthly packages" ON public.monthly_packages;
DROP POLICY IF EXISTS "Admins can manage monthly packages" ON public.monthly_packages;

CREATE POLICY "Public can read monthly packages"
ON public.monthly_packages FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage monthly packages"
ON public.monthly_packages FOR ALL TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
