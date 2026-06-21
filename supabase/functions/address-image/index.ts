// Address Image edge function
// Returns a cached Mapbox satellite aerial PNG for a given accommodation address.
// Public endpoint — works for signed-out users.

import { createClient } from "npm:@supabase/supabase-js@2";

const MAPBOX_TOKEN = Deno.env.get("MAPBOX_ACCESS_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const STYLE = "satellite-v9";
const ZOOM = 17;
const WIDTH = 600;
const HEIGHT = 400;

function normalizeAddressKey(address: string): string {
  return address
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = "\\x";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b < 16) hex += "0";
    hex += b.toString(16);
  }
  return hex;
}


function base64ToBytes(b64: string): Uint8Array {
  // Postgres returns bytea as `\x...` hex by default. Handle both.
  if (b64.startsWith("\\x")) {
    const hex = b64.slice(2);
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) {
      out[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return out;
  }
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function geocode(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?limit=1&country=za&access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const f = data.features?.[0];
  if (!f?.center) return null;
  return { lng: f.center[0], lat: f.center[1] };
}

async function fetchMapboxTile(lat: number, lng: number): Promise<Uint8Array> {
  const url =
    `https://api.mapbox.com/styles/v1/mapbox/${STYLE}/static/${lng},${lat},${ZOOM},0/${WIDTH}x${HEIGHT}@2x?access_token=${MAPBOX_TOKEN}&attribution=false&logo=false`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Mapbox tile fetch failed: ${res.status} ${await res.text()}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    let address = url.searchParams.get("address") ?? "";
    let lat = parseFloat(url.searchParams.get("lat") ?? "");
    let lng = parseFloat(url.searchParams.get("lng") ?? "");

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      address = body.address ?? address;
      lat = Number.isFinite(body.latitude) ? body.latitude : lat;
      lng = Number.isFinite(body.longitude) ? body.longitude : lng;
    }

    if (!address || address.length < 3) {
      return new Response(JSON.stringify({ error: "address required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = normalizeAddressKey(address);
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Cache lookup
    const { data: cached } = await supabase
      .from("address_image_cache")
      .select("image_data, content_type")
      .eq("address_key", key)
      .maybeSingle();

    if (cached?.image_data) {
      const bytes = base64ToBytes(cached.image_data as unknown as string);
      
      // Best-effort last accessed time update
      try {
        await supabase
          .from("address_image_cache")
          .update({ last_accessed_at: new Date().toISOString() })
          .eq("address_key", key);
      } catch (err) {
        console.error("Failed to update last_accessed_at:", err);
      }

      return new Response(bytes, {
        headers: {
          ...corsHeaders,
          "Content-Type": cached.content_type || "image/png",
          "Cache-Control": "public, max-age=2592000, immutable",
          "X-Cache": "HIT",
        },
      });
    }

    // Geocode if needed
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const geo = await geocode(address);
      if (!geo) {
        return new Response(JSON.stringify({ error: "geocode_failed" }), {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      lat = geo.lat;
      lng = geo.lng;
    }

    const png = await fetchMapboxTile(lat, lng);

    // Persist
    await supabase.from("address_image_cache").upsert(
      {
        address_key: key,
        latitude: lat,
        longitude: lng,
        // Convert Uint8Array to hex string starting with \x for Postgres bytea
        image_data: bytesToHex(png),
        content_type: "image/png",
        mapbox_style: STYLE,
        zoom: ZOOM,
        width: WIDTH,
        height: HEIGHT,
        byte_size: png.byteLength,
        hit_count: 1,
        last_accessed_at: new Date().toISOString(),
      },
      { onConflict: "address_key" },
    );

    return new Response(png, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=2592000, immutable",
        "X-Cache": "MISS",
      },
    });
  } catch (e) {
    console.error("address-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
