## Part 1 — Mapbox satellite tile for listing card placeholder

**Goal**: When a listing has no `image_urls`, show a cached Mapbox satellite aerial of the address. Same address → same cached image for everyone.

### DB changes
- New table `address_image_cache`:
  - `address_key` (text, PK) — normalized address prefix (lowercased, trimmed text before first comma)
  - `latitude`, `longitude` (numeric)
  - `image_url` (text) — public Supabase Storage URL of the cached PNG
  - `mapbox_style` (text, default `satellite-v9`)
  - `zoom` (int, default 17), `width` (int, default 600), `height` (int, default 400)
  - `cached_at`, `updated_at`
- Public read (`GRANT SELECT TO anon, authenticated`); writes only via edge function (service role).
- New public storage bucket `address-images` for the rendered PNGs.

### Edge function `address-image`
- Input: `{ address, latitude?, longitude? }`
- Flow:
  1. Compute `address_key`. Look up `address_image_cache`. If hit → return cached `image_url`.
  2. If no lat/lng provided, geocode via Mapbox Geocoding API using `MAPBOX_ACCESS_TOKEN`.
  3. Fetch Mapbox Static Images: `/styles/v1/mapbox/satellite-v9/static/{lng},{lat},17,0/600x400@2x?access_token=...`
  4. Upload PNG to `address-images` bucket keyed by hashed `address_key`.
  5. Insert row in `address_image_cache`. Return `image_url`.
- Requires secret: **`MAPBOX_ACCESS_TOKEN`** (we'll prompt you).

### Frontend
- New util `getAddressImage(address)` calling the edge function (works for signed-out users — anon key only).
- `AccommodationCard.tsx`: when `image_urls?.[0]` is missing, lazily call `getAddressImage` and render in `ImageWithSkeleton`. Stable placeholder shown while loading; no layout shift.
- `ListingDetail.tsx`: same fallback for the primary image when signed-out and the listing has no images.

---

## Part 2 — Full Clerk migration (replacing Supabase Auth)

### Frontend
- `bun add @clerk/clerk-react`
- Wrap `<App />` in `<ClerkProvider publishableKey={VITE_CLERK_PUBLISHABLE_KEY}>` in `main.tsx`.
- Replace `src/pages/Auth.tsx` with Clerk's `<SignIn />` / `<SignUp />` components, styled to match the site (slate/yellow theme via Clerk `appearance` prop).
- Remove all `supabase.auth.*` calls across the codebase. Replace with Clerk hooks: `useUser`, `useAuth`, `useSession`, `SignedIn`, `SignedOut`, `SignOutButton`.
- New helper `src/lib/supabaseWithClerk.ts`: returns a Supabase client whose `Authorization` header is set to the Clerk session JWT (template name: `supabase`) — refreshed via `useAuth().getToken({ template: 'supabase' })`.
- Update all hooks/components that currently read user from Supabase:
  `useAccessControl`, `useActivityTracking`, `useAnalyticsTracking`, `ProtectedAdminRoute`, `ProtectedLandlordRoute`, `RouteScrollManager`, `AuthRedirector` in `App.tsx`, `Profile`, `Notifications`, `ListingDetail`, `Browse`, `AccommodationCard`, `ReviewForm`, `ReviewReplyForm`, `ReviewCard`, `ShareListingPopup`, `landlord/Dashboard`, `landlord/AddListing`, `landlord/Payment`, `admin/Dashboard` + all `admin/*` tabs, `Auth`, `Index`.
- Scroll-memory + redirect-after-auth logic preserved (uses Clerk's `afterSignInUrl` / `afterSignUpUrl`).

### Backend (RLS + edge functions)
- `user_id` columns are already `text` and `has_role`/`has_paid_access` already accept `text` — good.
- Migration to swap RLS predicates from `auth.uid()::text` (and similar) to a new helper `public.clerk_user_id()`:
  ```sql
  CREATE OR REPLACE FUNCTION public.clerk_user_id() RETURNS text
    LANGUAGE sql STABLE
    AS $$ SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '') $$;
  ```
  Then rewrite every policy on: `profiles`, `user_roles`, `user_payments`, `favorites`, `viewed_accommodations`, `notifications`, `user_notifications`, `reviews`, `review_likes`, `review_replies`, `messages`, `landlord_listings`, `landlord_subscriptions`, `landlord_documents`, `accommodation_contacts`, `activity_logs`, `flagged_content`, `reports`, `admin_notifications`, `audit_logs`, `search_analytics`, `listing_analytics*`, `contact_analytics`, `newsletter_subscribers`, `blocked_emails`, `blocked_ips`, `ai_pack_requests`, `ai_pack_cache`, `bursaries`, `programs`, `private_institutions`, `ai_settings`, `edge_function_*`, `admin_site_visits`, `offerwall_completions`, `place_cache*`, `address_image_cache`.
- Drop `auth.users` FK references — Clerk users don't exist in `auth.users`. Profiles will be created by Clerk webhook instead of `handle_new_user` trigger.
- New edge function `clerk-webhook`:
  - Verifies Svix signature (`CLERK_WEBHOOK_SECRET`).
  - Handles `user.created` / `user.updated` / `user.deleted` → upsert/delete `profiles` row using Clerk `user.id` (text).
- All other edge functions:
  - Replace JWT verification: parse `Authorization: Bearer <clerk_jwt>`, verify via Clerk JWKS (`https://<clerk-frontend-api>/.well-known/jwks.json`) using `jose`, extract `sub` as user id.
  - Functions to update: `ai-chat`, `ai-accommodation-assistant`, `place-cache`, `bobpay`, `paystack`, `handle-subscription-event`, `generate-bursary-pack`, `send-email`, `notify-expiring-subscriptions`, `check-subscription-expiry`, `expire-entitlements`, `add-subscriber`, `places-autocomplete`, `offerwall-callback`, `webhook-proxy`, `address-image` (new).
- Update Supabase JWT settings: configure `JWKS_URL` to point at Clerk so Postgres can verify Clerk-issued tokens for direct PostgREST calls.

### Secrets needed
- `MAPBOX_ACCESS_TOKEN` (new)
- `CLERK_WEBHOOK_SECRET` (new, from Clerk → Webhooks)
- `CLERK_JWT_ISSUER` (new, your Clerk Frontend API URL)
- `VITE_CLERK_PUBLISHABLE_KEY` (frontend env — added via build secrets or `.env`)
- `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` already present.

### Manual steps you'll do in Clerk dashboard
1. Create JWT template named **`supabase`** with claim `{ "role": "authenticated" }` and signing algorithm matching what we configure on Supabase.
2. Add webhook endpoint pointing to `https://gzihagvdpdjcoyjpvyvs.supabase.co/functions/v1/clerk-webhook`, copy signing secret → I'll prompt for it.
3. Style the Clerk hosted UI (optional) or rely on embedded components I theme.
4. In Supabase dashboard → Auth → JWT settings, set the JWKS URL to Clerk's (or use the Clerk-Supabase integration in their docs).

---

## Execution order

1. Ship Part 1 (Mapbox + cache) end-to-end first — small, isolated, immediately useful. **Prompt for `MAPBOX_ACCESS_TOKEN`.**
2. Then Part 2 in this sequence: prompt for Clerk secrets → DB migration (helper + RLS rewrite + drop `auth.users` FKs) → `clerk-webhook` edge function → frontend Clerk provider + Auth page + supabaseWithClerk → mass-replace `supabase.auth` calls → edge-function JWT verification swap → smoke-test sign-in, profile, favorites, paid access, landlord, admin.

### Risks / things to confirm
- Existing Supabase auth users will lose access (you confirmed fresh start — OK).
- Active paid subscriptions are keyed by old Supabase `user_id` — they'll be orphaned. Tell me if you want to wipe `user_payments` or leave them (they'll be unreachable either way).
- `verify_jwt = true` edge functions can't easily verify Clerk JWTs without config changes — I'll set `verify_jwt = false` for each and verify Clerk JWT in code.

Approve and I'll start with Part 1 by prompting for the Mapbox token.