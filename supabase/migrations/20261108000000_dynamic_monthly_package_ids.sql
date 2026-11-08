-- Allow admin-created plans while keeping IDs URL/form safe and predictable.
ALTER TABLE public.monthly_packages
  DROP CONSTRAINT IF EXISTS monthly_packages_id_check;

ALTER TABLE public.monthly_packages
  ADD CONSTRAINT monthly_packages_id_check
  CHECK (id ~ '^[a-z0-9][a-z0-9-]{0,99}$');
