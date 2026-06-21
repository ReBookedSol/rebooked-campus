import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = "https://living.rebookedsolutions.co.za";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all accommodations
    const allListings: any[] = [];
    let from = 0;
    const batchSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from('accommodations')
        .select('id, property_name, city, university, updated_at')
        .range(from, from + batchSize - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allListings.push(...data);
      if (data.length < batchSize) break;
      from += batchSize;
    }

    // Static pages
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/student-accommodation", priority: "0.9", changefreq: "daily" },
      { loc: "/accommodation", priority: "0.8", changefreq: "daily" },
      { loc: "/about", priority: "0.6", changefreq: "monthly" },
      { loc: "/contact", priority: "0.5", changefreq: "monthly" },
      { loc: "/pricing", priority: "0.7", changefreq: "monthly" },
      { loc: "/faq", priority: "0.6", changefreq: "monthly" },
      { loc: "/guides/how-to-find-student-accommodation-in-south-africa", priority: "0.8", changefreq: "monthly" },
      { loc: "/nsfas-accommodation-guide", priority: "0.8", changefreq: "monthly" },
      { loc: "/terms", priority: "0.3", changefreq: "yearly" },
      { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
      { loc: "/campus", priority: "0.6", changefreq: "monthly" },
      { loc: "/campus-guide", priority: "0.6", changefreq: "monthly" },
      { loc: "/auth", priority: "0.4", changefreq: "monthly" },
    ];

    // Collect unique cities and city+university combos
    const cities = new Set<string>();
    const cityUniCombos = new Set<string>();

    for (const listing of allListings) {
      if (listing.city) cities.add(listing.city);
      if (listing.city && listing.university) {
        cityUniCombos.add(`${listing.city}|||${listing.university}`);
      }
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const page of staticPages) {
      xml += `  <url>\n    <loc>${BASE_URL}${page.loc}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
    }

    // City filter pages
    for (const city of cities) {
      xml += `  <url>\n    <loc>${BASE_URL}/student-accommodation/${slugify(city)}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // City + University filter pages
    for (const combo of cityUniCombos) {
      const [city, uni] = combo.split("|||");
      xml += `  <url>\n    <loc>${BASE_URL}/student-accommodation/${slugify(city)}/${slugify(uni)}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    // Individual listing pages
    for (const listing of allListings) {
      const citySlug = listing.city ? slugify(listing.city) : "all";
      const uniSlug = listing.university ? slugify(listing.university) : "all";
      const propSlug = slugify(listing.property_name);
      const shortId = listing.id.replace(/-/g, '').substring(0, 8);
      const lastmod = listing.updated_at ? listing.updated_at.split('T')[0] : '';

      xml += `  <url>\n    <loc>${BASE_URL}/student-accommodation/${citySlug}/${uniSlug}/${propSlug}/${shortId}</loc>\n`;
      if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { status: 500, headers: { 'Content-Type': 'application/xml', ...corsHeaders } }
    );
  }
});
