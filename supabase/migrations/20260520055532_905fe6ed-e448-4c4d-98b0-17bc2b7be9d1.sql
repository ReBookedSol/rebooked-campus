
-- 1) Recreate admin RLS policies wrapping auth.uid()/has_role() in (select ...)

DROP POLICY IF EXISTS "Admins can view site visits" ON public.admin_site_visits;
CREATE POLICY "Admins can view site visits" ON public.admin_site_visits
FOR SELECT TO authenticated
USING (public.has_role((select auth.uid()), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
FOR SELECT
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = (select auth.uid()) AND user_roles.role = 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete audit logs" ON public.audit_logs;
CREATE POLICY "Admins can delete audit logs" ON public.audit_logs
FOR DELETE
USING (public.has_role((select auth.uid()), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can view blocked emails" ON public.blocked_emails;
CREATE POLICY "Admins can view blocked emails" ON public.blocked_emails
FOR SELECT
USING (public.has_role((select auth.uid()), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can insert blocked emails" ON public.blocked_emails;
CREATE POLICY "Admins can insert blocked emails" ON public.blocked_emails
FOR INSERT
WITH CHECK (public.has_role((select auth.uid()), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete blocked emails" ON public.blocked_emails;
CREATE POLICY "Admins can delete blocked emails" ON public.blocked_emails
FOR DELETE
USING (public.has_role((select auth.uid()), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can view blocked IPs" ON public.blocked_ips;
CREATE POLICY "Admins can view blocked IPs" ON public.blocked_ips
FOR SELECT
USING (public.has_role((select auth.uid()), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can insert blocked IPs" ON public.blocked_ips;
CREATE POLICY "Admins can insert blocked IPs" ON public.blocked_ips
FOR INSERT
WITH CHECK (public.has_role((select auth.uid()), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete blocked IPs" ON public.blocked_ips;
CREATE POLICY "Admins can delete blocked IPs" ON public.blocked_ips
FOR DELETE
USING (public.has_role((select auth.uid()), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can read contact analytics" ON public.contact_analytics;
CREATE POLICY "Admins can read contact analytics" ON public.contact_analytics
FOR SELECT
USING (public.has_role((select auth.uid()), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can view edge function errors" ON public.edge_function_errors;
CREATE POLICY "Admins can view edge function errors" ON public.edge_function_errors
FOR SELECT
USING (public.has_role((select auth.uid()), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can update edge function errors" ON public.edge_function_errors;
CREATE POLICY "Admins can update edge function errors" ON public.edge_function_errors
FOR UPDATE
USING (public.has_role((select auth.uid()), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete edge function errors" ON public.edge_function_errors;
CREATE POLICY "Admins can delete edge function errors" ON public.edge_function_errors
FOR DELETE
USING (public.has_role((select auth.uid()), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Allow admins to read logs" ON public.edge_function_logs;
CREATE POLICY "Allow admins to read logs" ON public.edge_function_logs
FOR SELECT
USING (public.has_role((select auth.uid()), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can read search analytics" ON public.search_analytics;
CREATE POLICY "Admins can read search analytics" ON public.search_analytics
FOR SELECT
USING (public.has_role((select auth.uid()), 'admin'::public.app_role));

-- 2) Add missing foreign-key indexes
CREATE INDEX IF NOT EXISTS idx_fares_to_stop_id ON public.fares(to_stop_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON public.route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_stop_id ON public.route_stops(stop_id);
CREATE INDEX IF NOT EXISTS idx_schedules_route_id ON public.schedules(route_id);
CREATE INDEX IF NOT EXISTS idx_service_frequencies_route_id ON public.service_frequencies(route_id);
CREATE INDEX IF NOT EXISTS idx_stop_time_offsets_stop_id ON public.stop_time_offsets(stop_id);

-- 3) Revoke EXECUTE on internal trigger / admin-only SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_landlord_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_review_rating() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_payment_expiry() FROM PUBLIC, anon, authenticated;
