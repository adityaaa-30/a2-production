-- Metadata used by the public all-plans page for New, Offer, and Best Value highlights.
ALTER TABLE public.monthly_packages
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS offer_price_inr INTEGER,
  ADD COLUMN IF NOT EXISTS offer_label TEXT,
  ADD COLUMN IF NOT EXISTS is_best_value BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Existing custom plans use their last saved timestamp as a practical creation-time estimate.
UPDATE public.monthly_packages
SET created_at = updated_at
WHERE id NOT IN ('starter', 'professional', 'premium-growth');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.monthly_packages'::regclass
      AND conname = 'monthly_packages_offer_price_inr_check'
  ) THEN
    ALTER TABLE public.monthly_packages
      ADD CONSTRAINT monthly_packages_offer_price_inr_check
      CHECK (offer_price_inr IS NULL OR (offer_price_inr > 0 AND offer_price_inr < price_inr));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.monthly_packages'::regclass
      AND conname = 'monthly_packages_offer_label_check'
  ) THEN
    ALTER TABLE public.monthly_packages
      ADD CONSTRAINT monthly_packages_offer_label_check
      CHECK (offer_label IS NULL OR char_length(offer_label) BETWEEN 1 AND 40);
  END IF;
END $$;

-- The existing Premium Growth package remains the initial Best Value selection.
UPDATE public.monthly_packages
SET is_best_value = TRUE
WHERE id = 'premium-growth'
  AND NOT EXISTS (
    SELECT 1 FROM public.monthly_packages WHERE is_best_value = TRUE
  );

UPDATE public.monthly_packages
SET is_featured = TRUE
WHERE id IN ('starter', 'professional', 'premium-growth')
  AND NOT EXISTS (SELECT 1 FROM public.monthly_packages WHERE is_featured = TRUE);

