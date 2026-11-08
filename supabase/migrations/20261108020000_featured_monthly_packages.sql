-- Admin-selectable homepage showcase. Defaults to the original three plans on upgrade.
ALTER TABLE public.monthly_packages
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.monthly_packages
SET is_featured = TRUE
WHERE id IN ('starter', 'professional', 'premium-growth')
  AND NOT EXISTS (
    SELECT 1 FROM public.monthly_packages WHERE is_featured = TRUE
  );
