// Mapbox Features Edge Function
// Handles category search, campus directions, and route static images using Mapbox APIs.
// Caches results on the accommodations table row.

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

// Constant coordinates mapping for major SA Universities
const UNIVERSITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "university of cape town": { lat: -33.9573, lng: 18.4612 },
  "university of the witwatersrand": { lat: -26.1929, lng: 28.0305 },
  "university of johannesburg": { lat: -26.1853, lng: 27.9972 },
  "university of pretoria": { lat: -25.7545, lng: 28.2294 },
  "stellenbosch university": { lat: -33.9322, lng: 18.8644 },
  "university of kwazulu-natal": { lat: -29.8665, lng: 30.9806 },
  "rhodes university": { lat: -33.3130, lng: 26.5218 },
  "north-west university": { lat: -26.6976, lng: 27.0943 },
  "tshwane university of technology": { lat: -25.7323, lng: 28.1623 },
  "cape peninsula university of technology": { lat: -33.9317, lng: 18.4287 },
  "durban university of technology": { lat: -29.8517, lng: 31.0067 },
  "university of the western cape": { lat: -33.9328, lng: 18.6277 },
  "university of fort hare": { lat: -32.7872, lng: 26.8374 },
  "university of the free state": { lat: -29.1107, lng: 26.1850 },
  "nelson mandela university": { lat: -34.0017, lng: 25.6698 },
  "walter sisulu university": { lat: -31.6033, lng: 28.7483 },
  "university of zululand": { lat: -28.7533, lng: 31.8483 },
  "university of south africa (unisa)": { lat: -25.7617, lng: 28.2017 },
  "central university of technology": { lat: -29.1217, lng: 26.2167 },
  "vaal university of technology": { lat: -26.7117, lng: 27.8583 },
  "university of limpopo": { lat: -23.8317, lng: 29.7017 },
  "university of mpumalanga": { lat: -25.4367, lng: 30.9817 },
  "sefako makgatho health sciences university": { lat: -25.6183, lng: 28.0217 },
};

async function geocodeUniversity(uniName: string): Promise<{ lat: number; lng: number } | null> {
  const norm = uniName.trim().toLowerCase();
  if (UNIVERSITY_COORDINATES[norm]) return UNIVERSITY_COORDINATES[norm];

  // Mapbox Geocoding search fallback
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(uniName + ", South Africa")}.json?limit=1&country=za&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const f = data.features?.[0];
    if (!f?.center) return null;
    return { lng: f.center[0], lat: f.center[1] };
  } catch (err) {
    console.error("Failed to geocode university:", err);
    return null;
  }
}


async function fetchDirections(
  profile: "walking" | "driving",
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<{ distance: number; duration: number; geometry?: string } | null> {
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${startLng},${startLat};${endLng},${endLat}?geometries=polyline&overview=full&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Mapbox Directions API failed for ${profile}: ${res.status}`);
      return null;
    }
    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return null;
    return {
      distance: route.distance, // meters
      duration: route.duration, // seconds
      geometry: route.geometry  // encoded polyline
    };
  } catch (err) {
    console.error(`Error fetching directions for ${profile}:`, err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Accommodation ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);



    // 2. ACTION: Campus Directions
    if (action === "campus-directions") {
      let uniLat = parseFloat(url.searchParams.get("uni_lat") ?? "");
      let uniLng = parseFloat(url.searchParams.get("uni_lng") ?? "");

      const { data: acc, error: accError } = await supabaseClient
        .from("accommodations")
        .select("latitude, longitude, university, campus_directions")
        .eq("id", id)
        .single();

      if (accError || !acc) {
        return new Response(JSON.stringify({ error: "Accommodation not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (acc.campus_directions) {
        return new Response(JSON.stringify(acc.campus_directions), {
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

      // If coordinates are not provided, geocode university
      if (!Number.isFinite(uniLat) || !Number.isFinite(uniLng)) {
        if (!acc.university) {
          return new Response(JSON.stringify({ error: "University name not available to geocode" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const coords = await geocodeUniversity(acc.university);
        if (!coords) {
          return new Response(JSON.stringify({ error: "Failed to locate university campus" }), {
            status: 422,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        uniLat = coords.lat;
        uniLng = coords.lng;
      }

      // Fetch walking and driving directions
      const [walkRoute, driveRoute] = await Promise.all([
        fetchDirections("walking", lat, lng, uniLat, uniLng),
        fetchDirections("driving", lat, lng, uniLat, uniLng)
      ]);

      if (!walkRoute || !driveRoute) {
        return new Response(JSON.stringify({ error: "Failed to calculate routes to campus" }), {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const directionsData = {
        walking: {
          distance: walkRoute.distance, // meters
          duration: walkRoute.duration  // seconds
        },
        driving: {
          distance: driveRoute.distance, // meters
          duration: driveRoute.duration  // seconds
        },
        driving_geometry: driveRoute.geometry, // encoded polyline
        uni_lat: uniLat,
        uni_lng: uniLng
      };

      // Save to database cache
      await supabaseClient
        .from("accommodations")
        .update({ campus_directions: directionsData })
        .eq("id", id);

      return new Response(JSON.stringify(directionsData), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-Cache": "MISS",
        },
      });
    }

    // 3. ACTION: Route Image (Proxies Static Map Image request)
    if (action === "route-image") {
      let uniLat = parseFloat(url.searchParams.get("uni_lat") ?? "");
      let uniLng = parseFloat(url.searchParams.get("uni_lng") ?? "");

      const { data: acc, error: accError } = await supabaseClient
        .from("accommodations")
        .select("latitude, longitude, university, campus_directions, campus_route_image")
        .eq("id", id)
        .single();

      if (accError || !acc) {
        return new Response(JSON.stringify({ error: "Accommodation not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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

      // If we already have the static route image URL cached, fetch and return it
      if (acc.campus_route_image) {
        const imageRes = await fetch(acc.campus_route_image);
        if (imageRes.ok) {
          const imgBytes = new Uint8Array(await imageRes.arrayBuffer());
          return new Response(imgBytes, {
            headers: {
              ...corsHeaders,
              "Content-Type": "image/png",
              "Cache-Control": "public, max-age=2592000, immutable",
              "X-Cache": "HIT",
            },
          });
        }
      }

      // Generate the URL if not cached or fetch failed
      let drivingGeometry = acc.campus_directions?.driving_geometry;
      let finalUniLat = acc.campus_directions?.uni_lat ?? uniLat;
      let finalUniLng = acc.campus_directions?.uni_lng ?? uniLng;

      // If we don't have directions/geometry, calculate them first
      if (!drivingGeometry || !Number.isFinite(finalUniLat) || !Number.isFinite(finalUniLng)) {
        if (!Number.isFinite(finalUniLat) || !Number.isFinite(finalUniLng)) {
          if (!acc.university) {
            return new Response(JSON.stringify({ error: "University coordinates / name missing" }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          const coords = await geocodeUniversity(acc.university);
          if (!coords) {
            return new Response(JSON.stringify({ error: "Failed to locate university campus" }), {
              status: 422,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          finalUniLat = coords.lat;
          finalUniLng = coords.lng;
        }

        const driveRoute = await fetchDirections("driving", lat, lng, finalUniLat, finalUniLng);
        if (driveRoute) {
          drivingGeometry = driveRoute.geometry;
        }
      }

      if (!drivingGeometry) {
        return new Response(JSON.stringify({ error: "Failed to generate driving route for map" }), {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Construct Mapbox Static Image URL
      // pin-s-a (red, starting accommodation), pin-s-b (blue, campus ending), path-5+0066cc (blue route)
      const overlayPath = `path-5+0066cc-1(${encodeURIComponent(drivingGeometry)})`;
      const pinAcc = `pin-s-a+ff4444(${lng},${lat})`;
      const pinUni = `pin-s-b+3b51b5(${finalUniLng},${finalUniLat})`;
      
      const staticImageUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${pinAcc},${pinUni},${overlayPath}/auto/600x400?access_token=${MAPBOX_TOKEN}&attribution=false&logo=false`;

      // Cache the generated URL in the database
      await supabaseClient
        .from("accommodations")
        .update({ campus_route_image: staticImageUrl })
        .eq("id", id);

      const imageRes = await fetch(staticImageUrl);
      if (!imageRes.ok) {
        throw new Error(`Failed to fetch static map image from Mapbox: ${imageRes.status}`);
      }

      const imgBytes = new Uint8Array(await imageRes.arrayBuffer());
      return new Response(imgBytes, {
        headers: {
          ...corsHeaders,
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=2592000, immutable",
          "X-Cache": "MISS",
        },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mapbox-features error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
