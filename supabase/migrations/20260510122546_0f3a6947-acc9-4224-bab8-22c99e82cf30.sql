-- 1. Hard-revoke landlord contact columns from anon and public roles
REVOKE SELECT (contact_email, contact_phone, contact_person) ON public.accommodations FROM PUBLIC;
REVOKE SELECT (contact_email, contact_phone, contact_person) ON public.accommodations FROM anon;
GRANT  SELECT (contact_email, contact_phone, contact_person) ON public.accommodations TO authenticated;

-- 2. Restrict listing_analytics UPDATE to owning landlord or admin
DROP POLICY IF EXISTS "Authenticated users can update listing analytics" ON public.listing_analytics;
DROP POLICY IF EXISTS "Authenticated can update listing analytics" ON public.listing_analytics;
DROP POLICY IF EXISTS "Update listing analytics" ON public.listing_analytics;

CREATE POLICY "Owner or admin can update listing analytics"
ON public.listing_analytics
FOR UPDATE
TO authenticated
USING (
  public.has_role((select auth.uid()), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.accommodations a
    WHERE a.id = listing_analytics.accommodation_id
      AND a.landlord_id = (select auth.uid())
  )
)
WITH CHECK (
  public.has_role((select auth.uid()), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.accommodations a
    WHERE a.id = listing_analytics.accommodation_id
      AND a.landlord_id = (select auth.uid())
  )
);

-- 3. Same for listing_analytics_daily
DROP POLICY IF EXISTS "Authenticated users can update daily analytics" ON public.listing_analytics_daily;
DROP POLICY IF EXISTS "Authenticated can update daily analytics" ON public.listing_analytics_daily;
DROP POLICY IF EXISTS "Update daily analytics" ON public.listing_analytics_daily;

CREATE POLICY "Owner or admin can update daily analytics"
ON public.listing_analytics_daily
FOR UPDATE
TO authenticated
USING (
  public.has_role((select auth.uid()), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.accommodations a
    WHERE a.id = listing_analytics_daily.accommodation_id
      AND a.landlord_id = (select auth.uid())
  )
)
WITH CHECK (
  public.has_role((select auth.uid()), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.accommodations a
    WHERE a.id = listing_analytics_daily.accommodation_id
      AND a.landlord_id = (select auth.uid())
  )
);

-- 4. Allow public newsletter sign-up but keep list private
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND char_length(email) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);

-- 5. Drop the misleading edge_function_logs JWT-role policy (the has_role-based duplicate stays)
DROP POLICY IF EXISTS "Allow admins to read edge function logs" ON public.edge_function_logs;

NOTIFY pgrst, 'reload schema';