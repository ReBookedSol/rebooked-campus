-- 1. Helper function for Clerk JWT claims
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE SQL STABLE;

-- 2. Drop triggers and functions that depend on old auth.users triggers
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role();

-- 3. Drop existing foreign key constraints referencing auth.users(id)
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE public.offerwall_completions DROP CONSTRAINT IF EXISTS offerwall_completions_user_id_fkey;
ALTER TABLE public.ai_settings DROP CONSTRAINT IF EXISTS ai_settings_updated_by_fkey;
ALTER TABLE public.landlord_subscriptions DROP CONSTRAINT IF EXISTS landlord_subscriptions_user_id_fkey;
ALTER TABLE public.landlord_listings DROP CONSTRAINT IF EXISTS landlord_listings_landlord_id_fkey;

-- 4. Alter user-identifying columns from UUID to TEXT in all tables

-- profiles
ALTER TABLE public.profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT USING id::text;

-- user_roles
ALTER TABLE public.user_roles ALTER COLUMN user_id TYPE TEXT USING user_id::text;

-- offerwall_completions
ALTER TABLE public.offerwall_completions ALTER COLUMN user_id TYPE TEXT USING user_id::text;

-- ai_settings
ALTER TABLE public.ai_settings ALTER COLUMN updated_by TYPE TEXT USING updated_by::text;

-- ai_pack_requests
ALTER TABLE public.ai_pack_requests ALTER COLUMN user_id TYPE TEXT USING user_id::text;

-- landlord_subscriptions
ALTER TABLE public.landlord_subscriptions ALTER COLUMN user_id TYPE TEXT USING user_id::text;

-- landlord_listings
ALTER TABLE public.landlord_listings ALTER COLUMN landlord_id TYPE TEXT USING landlord_id::text;
ALTER TABLE public.landlord_listings ALTER COLUMN reviewed_by TYPE TEXT USING reviewed_by::text;

-- landlord_documents
ALTER TABLE public.landlord_documents ALTER COLUMN verified_by TYPE TEXT USING verified_by::text;

-- accommodations
ALTER TABLE public.accommodations ALTER COLUMN landlord_id TYPE TEXT USING landlord_id::text;

-- search_analytics
ALTER TABLE public.search_analytics ALTER COLUMN user_id TYPE TEXT USING user_id::text;

-- contact_analytics
ALTER TABLE public.contact_analytics ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE public.contact_analytics ALTER COLUMN landlord_id TYPE TEXT USING landlord_id::text;

-- 5. Recreate functions accepting UUIDs to accept TEXT

-- increment_user_credits
CREATE OR REPLACE FUNCTION public.increment_user_credits(p_user_id TEXT, p_amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET credits = COALESCE(credits, 0) + p_amount
  WHERE id = p_user_id;
END;
$$;

-- has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id TEXT, _role app_role)
RETURNS boolean
LANGUAGE sql
安定
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id TEXT)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  from public.user_roles
  where user_id = _user_id
  limit 1
$$;

-- 6. Recreate RLS Policies to use requesting_user_id() instead of auth.uid()

-- user_roles
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT TO authenticated
USING (requesting_user_id() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(requesting_user_id(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(requesting_user_id(), 'admin'))
WITH CHECK (public.has_role(requesting_user_id(), 'admin'));

-- offerwall_completions
DROP POLICY IF EXISTS "Users can view own completions" ON public.offerwall_completions;
CREATE POLICY "Users can view own completions"
ON public.offerwall_completions FOR SELECT TO authenticated
USING (requesting_user_id() = user_id);

-- ai_settings
DROP POLICY IF EXISTS "Admins can manage AI settings" ON public.ai_settings;
CREATE POLICY "Admins can manage AI settings"
ON public.ai_settings FOR ALL
USING (has_role(requesting_user_id(), 'admin'::app_role))
WITH CHECK (has_role(requesting_user_id(), 'admin'::app_role));

-- ai_pack_requests
DROP POLICY IF EXISTS "Users can view their own requests" ON public.ai_pack_requests;
DROP POLICY IF EXISTS "Users can create their own requests" ON public.ai_pack_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.ai_pack_requests;

CREATE POLICY "Users can view their own requests"
ON public.ai_pack_requests FOR SELECT
USING (requesting_user_id() = user_id);

CREATE POLICY "Users can create their own requests"
ON public.ai_pack_requests FOR INSERT
WITH CHECK (requesting_user_id() = user_id);

CREATE POLICY "Admins can view all requests"
ON public.ai_pack_requests FOR SELECT
USING (has_role(requesting_user_id(), 'admin'::app_role));

-- landlord_subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.landlord_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.landlord_subscriptions;

CREATE POLICY "Users can view their own subscription"
ON public.landlord_subscriptions FOR SELECT
USING (requesting_user_id() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
ON public.landlord_subscriptions FOR ALL
USING (public.has_role(requesting_user_id(), 'admin'))
WITH CHECK (public.has_role(requesting_user_id(), 'admin'));

-- landlord_listings
DROP POLICY IF EXISTS "Landlords can view their own listings" ON public.landlord_listings;
DROP POLICY IF EXISTS "Landlords can insert their own listings" ON public.landlord_listings;
DROP POLICY IF EXISTS "Landlords can update their own listings" ON public.landlord_listings;
DROP POLICY IF EXISTS "Admins can manage all landlord listings" ON public.landlord_listings;

CREATE POLICY "Landlords can view their own listings"
ON public.landlord_listings FOR SELECT
USING (requesting_user_id() = landlord_id);

CREATE POLICY "Landlords can insert their own listings"
ON public.landlord_listings FOR INSERT
WITH CHECK (requesting_user_id() = landlord_id);

CREATE POLICY "Landlords can update their own listings"
ON public.landlord_listings FOR UPDATE
USING (requesting_user_id() = landlord_id);

CREATE POLICY "Admins can manage all landlord listings"
ON public.landlord_listings FOR ALL
USING (public.has_role(requesting_user_id(), 'admin'))
WITH CHECK (public.has_role(requesting_user_id(), 'admin'));

-- landlord_documents
DROP POLICY IF EXISTS "Landlords can view their own documents" ON public.landlord_documents;
DROP POLICY IF EXISTS "Landlords can upload their own documents" ON public.landlord_documents;
DROP POLICY IF EXISTS "Landlords can delete their own documents" ON public.landlord_documents;
DROP POLICY IF EXISTS "Admins can manage all documents" ON public.landlord_documents;

CREATE POLICY "Landlords can view their own documents"
ON public.landlord_documents FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.landlord_listings ll
        WHERE ll.id = landlord_listing_id
        AND ll.landlord_id = requesting_user_id()
    )
);

CREATE POLICY "Landlords can upload their own documents"
ON public.landlord_documents FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.landlord_listings ll
        WHERE ll.id = landlord_listing_id
        AND ll.landlord_id = requesting_user_id()
    )
);

CREATE POLICY "Landlords can delete their own documents"
ON public.landlord_documents FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.landlord_listings ll
        WHERE ll.id = landlord_listing_id
        AND ll.landlord_id = requesting_user_id()
    )
);

CREATE POLICY "Admins can manage all documents"
ON public.landlord_documents FOR ALL
USING (public.has_role(requesting_user_id(), 'admin'))
WITH CHECK (public.has_role(requesting_user_id(), 'admin'));

-- listing_analytics
DROP POLICY IF EXISTS "Landlords can view analytics for their listings" ON public.listing_analytics;
DROP POLICY IF EXISTS "Admins can manage all analytics" ON public.listing_analytics;

CREATE POLICY "Landlords can view analytics for their listings"
ON public.listing_analytics FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.accommodations a
        WHERE a.id = accommodation_id
        AND a.landlord_id = requesting_user_id()
    )
);

CREATE POLICY "Admins can manage all analytics"
ON public.listing_analytics FOR ALL
USING (public.has_role(requesting_user_id(), 'admin'))
WITH CHECK (public.has_role(requesting_user_id(), 'admin'));

-- search_analytics
DROP POLICY IF EXISTS "Admins can read search analytics" ON public.search_analytics;
CREATE POLICY "Admins can read search analytics"
ON public.search_analytics FOR SELECT
USING (public.has_role(requesting_user_id(), 'admin'));

-- contact_analytics
DROP POLICY IF EXISTS "Admins can read contact analytics" ON public.contact_analytics;
CREATE POLICY "Admins can read contact analytics"
ON public.contact_analytics FOR SELECT
USING (public.has_role(requesting_user_id(), 'admin'));
