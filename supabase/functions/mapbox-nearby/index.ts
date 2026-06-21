// Mapbox Nearby Shops Edge Function
// Handles fetching nearby shops from Mapbox Category Search and caching them.

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

async function fetchNearbyCategory(category: string, lat: number, lng: number): Promise<any[]> {
  try {
    // Generate a secure UUIDv4 session token required by Mapbox Search Box v1 REST API
    const sessionToken = crypto.randomUUID();
    const url = `https://api.mapbox.com/search/search-box/v1/category/${category}?proximity=${lng},${lat}&limit=5&country=za&session_token=${sessionToken}&access_token=${MAPBOX_TOKEN}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Mapbox category search failed for ${category}: ${res.status}`);
      return [];
    }
    
    const data = await res.json();
    return (data.features || []).map((f: any) => {
      const distance = f.properties.distance ?? null;
      const distanceKm = distance !== null ? parseFloat((distance / 1000).toFixed(2)) : null;
      // Estimate walking speed at 80m/minute (approx 4.8 km/h)
      const walkMinutes = distance !== null ? Math.round(distance / 80) : null;

      return {
        name: f.properties.name,
        address: f.properties.place_formatted ?? null,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        distance_km: distanceKm,
        walk_minutes: walkMinutes
      };
    });
  } catch (err) {
    console.error(`Error in nearby category fetch for ${category}:`, err);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Accommodation ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Fetch coordinates and existing cache
    const { data: acc, error: accError } = await supabaseClient
      .from("accommodations")
      .select("latitude, longitude, nearby_shops")
      .eq("id", id)
      .single();

    if (accError || !acc) {
      return new Response(JSON.stringify({ error: "Accommodation not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cache hit: return existing nearby shops if they are populated
    if (acc.nearby_shops && Array.isArray(acc.nearby_shops) && acc.nearby_shops.length > 0) {
      return new Response(JSON.stringify(acc.nearby_shops), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-Cache": "HIT",
        },
      });
    }

    const lat = acc.latitude;
    const lng = acc.longitude;
    if (lat == null || lng == null) {
      return new Response(JSON.stringify({ error: "Coordinates missing for accommodation" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Query categories for shops/conveniences
    const categories = ["grocery", "pharmacy", "restaurant", "convenience_store"];
    const fetches = categories.map((cat) => fetchNearbyCategory(cat, lat, lng));
    const resultsArray = await Promise.all(fetches);

    // Flatten all shops results and sort by distance
    const shops = resultsArray.flat().sort((a, b) => {
      if (a.distance_km === null) return 1;
      if (b.distance_km === null) return -1;
      return a.distance_km - b.distance_km;
    });

    // Save to database cache
    await supabaseClient
      .from("accommodations")
      .update({ nearby_shops: shops })
      .eq("id", id);

    return new Response(JSON.stringify(shops), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Cache": "MISS",
      },
    });
  } catch (e) {
    console.error("mapbox-nearby error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
