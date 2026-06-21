import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const input = url.searchParams.get('input');
    const placeId = url.searchParams.get('place_id');

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_PLACES_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- PLACE DETAILS MODE: resolve a place_id to lat/lng ---
    if (placeId) {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=geometry,formatted_address,name&key=${apiKey}`;
      const r = await fetch(detailsUrl);
      const d = await r.json();
      if (d.status !== 'OK') {
        return new Response(
          JSON.stringify({ error: `Google API error: ${d.status}`, details: d.error_message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const loc = d.result?.geometry?.location;
      return new Response(
        JSON.stringify({
          place_id: placeId,
          name: d.result?.name,
          formatted_address: d.result?.formatted_address,
          latitude: loc?.lat,
          longitude: loc?.lng,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!input || input.length < 2) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const placesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&components=country:za&types=geocode`;

    console.log(`Autocomplete query: "${input}"`);
    const response = await fetch(placesUrl);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google API error:', data.status, data.error_message);
      return new Response(
        JSON.stringify({ error: `Google API error: ${data.status}`, details: data.error_message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const suggestions = (data.predictions || []).map((prediction: any) => ({
      description: prediction.description,
      place_id: prediction.place_id,
      main_text: prediction.structured_formatting?.main_text || prediction.description.split(',')[0],
      secondary_text: prediction.structured_formatting?.secondary_text || '',
      types: prediction.types || [],
    }));

    console.log(`Found ${suggestions.length} suggestions for "${input}"`);

    return new Response(
      JSON.stringify({ suggestions }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in autocomplete function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
