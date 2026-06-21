
-- 1. Create accommodation_contacts side table (auth-only)
CREATE TABLE IF NOT EXISTS public.accommodation_contacts (
  accommodation_id uuid PRIMARY KEY REFERENCES public.accommodations(id) ON DELETE CASCADE,
  contact_email text,
  contact_phone text,
  contact_person text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.accommodation_contacts (accommodation_id, contact_email, contact_phone, contact_person)
SELECT id, contact_email, contact_phone, contact_person
FROM public.accommodations
WHERE contact_email IS NOT NULL OR contact_phone IS NOT NULL OR contact_person IS NOT NULL
ON CONFLICT (accommodation_id) DO NOTHING;

ALTER TABLE public.accommodation_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view contacts"
  ON public.accommodation_contacts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Owner or admin can insert contacts"
  ON public.accommodation_contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role((select auth.uid()), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.accommodations a
      WHERE a.id = accommodation_contacts.accommodation_id
        AND a.landlord_id = (select auth.uid())
    )
  );

CREATE POLICY "Owner or admin can update contacts"
  ON public.accommodation_contacts FOR UPDATE
  TO authenticated
  USING (
    public.has_role((select auth.uid()), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.accommodations a
      WHERE a.id = accommodation_contacts.accommodation_id
        AND a.landlord_id = (select auth.uid())
    )
  )
  WITH CHECK (
    public.has_role((select auth.uid()), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.accommodations a
      WHERE a.id = accommodation_contacts.accommodation_id
        AND a.landlord_id = (select auth.uid())
    )
  );

CREATE POLICY "Owner or admin can delete contacts"
  ON public.accommodation_contacts FOR DELETE
  TO authenticated
  USING (
    public.has_role((select auth.uid()), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.accommodations a
      WHERE a.id = accommodation_contacts.accommodation_id
        AND a.landlord_id = (select auth.uid())
    )
  );

DROP TRIGGER IF EXISTS update_accommodation_contacts_updated_at ON public.accommodation_contacts;
CREATE TRIGGER update_accommodation_contacts_updated_at
BEFORE UPDATE ON public.accommodation_contacts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Drop contact columns from public accommodations table
ALTER TABLE public.accommodations
  DROP COLUMN IF EXISTS contact_email,
  DROP COLUMN IF EXISTS contact_phone,
  DROP COLUMN IF EXISTS contact_person;

-- 3. Lock down listing_analytics: only owner/admin may insert or update
DROP POLICY IF EXISTS "Authenticated users can update analytics" ON public.listing_analytics;
DROP POLICY IF EXISTS "Authenticated users can insert analytics" ON public.listing_analytics;
DROP POLICY IF EXISTS "Users can manage listing analytics" ON public.listing_analytics;

CREATE POLICY "Owner or admin can insert listing analytics"
  ON public.listing_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role((select auth.uid()), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.accommodations a
      WHERE a.id = listing_analytics.accommodation_id
        AND a.landlord_id = (select auth.uid())
    )
  );

-- 4. Lock down listing_analytics_daily inserts to owner/admin
DROP POLICY IF EXISTS "Authenticated users can insert daily analytics" ON public.listing_analytics_daily;

CREATE POLICY "Owner or admin can insert daily analytics"
  ON public.listing_analytics_daily FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role((select auth.uid()), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.accommodations a
      WHERE a.id = listing_analytics_daily.accommodation_id
        AND a.landlord_id = (select auth.uid())
    )
  );
