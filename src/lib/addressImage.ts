// Builds a URL that points at the address-image edge function.
// The function returns the cached Mapbox satellite PNG (works for signed-out users).
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = "https://gzihagvdpdjcoyjpvyvs.supabase.co";
const SUPABASE_ANON_KEY = (supabase as any).supabaseKey
  || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6aWhhZ3ZkcGRqY295anB2eXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzM2NzQsImV4cCI6MjA3NzE0OTY3NH0.2y2vuzaq9dKDrJIyjbAfcNAgrxVEpxeYwS5xNHSrqYw";

export function getAddressImageUrl(
  address: string | null | undefined,
  opts?: { latitude?: number | null; longitude?: number | null },
): string | null {
  if (!address || address.trim().length < 3) return null;
  const params = new URLSearchParams();
  params.set("address", address);
  if (opts?.latitude != null) params.set("lat", String(opts.latitude));
  if (opts?.longitude != null) params.set("lng", String(opts.longitude));
  params.set("apikey", SUPABASE_ANON_KEY);
  return `${SUPABASE_URL}/functions/v1/address-image?${params.toString()}`;
}
