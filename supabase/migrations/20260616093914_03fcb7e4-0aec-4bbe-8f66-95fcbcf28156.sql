
-- 1. accommodation_contacts: restrict SELECT to paid users, landlord owner, or admin
DROP POLICY IF EXISTS "Authenticated can view contacts" ON public.accommodation_contacts;
CREATE POLICY "Paid users, owners, and admins can view contacts"
ON public.accommodation_contacts
FOR SELECT
USING (
  has_role(requesting_user_id(), 'admin'::app_role)
  OR has_paid_access(requesting_user_id())
  OR EXISTS (
    SELECT 1 FROM public.accommodations a
    WHERE a.id = accommodation_contacts.accommodation_id
      AND a.landlord_id = requesting_user_id()
  )
);

-- 2. admin_site_visits: remove permissive INSERT — only service_role inserts via edge functions
DROP POLICY IF EXISTS "Anyone can insert visit logs" ON public.admin_site_visits;

-- 3. edge_function_errors: remove permissive INSERT — only service_role inserts
DROP POLICY IF EXISTS "Anyone can insert edge function errors" ON public.edge_function_errors;

-- 4. listing_analytics: remove permissive UPDATE/INSERT/SELECT — analytics are written via increment_listing_analytics (SECURITY DEFINER)
DROP POLICY IF EXISTS "Owner or admin can update listing analytics" ON public.listing_analytics;
DROP POLICY IF EXISTS "Owner or admin can insert listing analytics" ON public.listing_analytics;
DROP POLICY IF EXISTS "Anyone can view analytics" ON public.listing_analytics;
-- Landlord-scoped SELECT and admin ALL policies remain.

-- 5. notifications: restrict SELECT to recipient or broadcast (target_user_id IS NULL)
DROP POLICY IF EXISTS "Users can view general notifications" ON public.notifications;
CREATE POLICY "Users can view their own or broadcast notifications"
ON public.notifications
FOR SELECT
USING (
  target_user_id IS NULL
  OR target_user_id = requesting_user_id()
  OR has_role(requesting_user_id(), 'admin'::app_role)
);

-- 6. Fix mutable search_path on functions
ALTER FUNCTION public.requesting_user_id() SET search_path = public;
ALTER FUNCTION public.clear_mapbox_cache_on_address_change() SET search_path = public;

NOTIFY pgrst, 'reload schema';
