
-- 1. Restrict landlord contact columns to authenticated users
REVOKE SELECT (contact_email, contact_phone, contact_person) ON public.accommodations FROM anon;
GRANT SELECT (contact_email, contact_phone, contact_person) ON public.accommodations TO authenticated;

-- 2. Remove unsafe activity_logs UPDATE policy
DROP POLICY IF EXISTS "Users can update their activity" ON public.activity_logs;

-- 3. Tighten always-true INSERT policies
DROP POLICY IF EXISTS "Anyone can insert search analytics" ON public.search_analytics;
CREATE POLICY "Anyone can insert search analytics" ON public.search_analytics
  FOR INSERT WITH CHECK (search_query IS NOT NULL OR session_id IS NOT NULL OR user_id IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can insert contact analytics" ON public.contact_analytics;
CREATE POLICY "Anyone can insert contact analytics" ON public.contact_analytics
  FOR INSERT WITH CHECK (accommodation_id IS NOT NULL AND contact_type IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can insert edge function errors" ON public.edge_function_errors;
CREATE POLICY "Anyone can insert edge function errors" ON public.edge_function_errors
  FOR INSERT WITH CHECK (function_name IS NOT NULL);

DROP POLICY IF EXISTS "Allow edge functions to insert logs" ON public.edge_function_logs;
DROP POLICY IF EXISTS "Allow functions to insert logs" ON public.edge_function_logs;
CREATE POLICY "Allow functions to insert logs" ON public.edge_function_logs
  FOR INSERT WITH CHECK (function_name IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can insert visit logs" ON public.admin_site_visits;
CREATE POLICY "Anyone can insert visit logs" ON public.admin_site_visits
  FOR INSERT WITH CHECK (session_fingerprint IS NOT NULL OR page_url IS NOT NULL);

-- 4. Enable RLS on public transit reference tables with public read access
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stop_time_offsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_frequencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Public read route_stops" ON public.route_stops FOR SELECT USING (true);
CREATE POLICY "Public read stops" ON public.stops FOR SELECT USING (true);
CREATE POLICY "Public read fares" ON public.fares FOR SELECT USING (true);
CREATE POLICY "Public read routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Public read stop_time_offsets" ON public.stop_time_offsets FOR SELECT USING (true);
CREATE POLICY "Public read service_frequencies" ON public.service_frequencies FOR SELECT USING (true);

-- 5. Fix mutable search_path on trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;
