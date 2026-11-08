-- Public inquiries must pass through the validated and rate-limited server route.
DROP POLICY IF EXISTS "Anyone can insert project requests" ON public.project_requests;
REVOKE INSERT ON public.project_requests FROM PUBLIC, anon, authenticated;
GRANT INSERT ON public.project_requests TO service_role;
