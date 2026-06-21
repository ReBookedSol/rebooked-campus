import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import Ad from "@/components/Ad";
import { AD_SLOTS } from "@/config/adSlots";
import { AdFreePrompt } from "@/components/AdFreePrompt";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Phone, Mail, CheckCircle, ArrowLeft, Flag, Heart, Share, Building2, Lock, Image, Train, Bus, ShieldCheck, ExternalLink, Car, ShoppingBag, Pill, Utensils, GraduationCap, HeartPulse, Footprints, Compass, Route, Info } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { triggerWebhook } from "@/lib/webhook";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewsList } from "@/components/ReviewsList";
import { useAuth } from "@clerk/clerk-react";
import { useAccessControl, FREE_TIER_LIMITS } from "@/hooks/useAccessControl";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { getPlaceData, getUserTier } from "@/lib/placeCache";
import { rememberCurrentScroll } from "@/lib/scrollMemory";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { getGautrainStation, isGautrainAccessible, getMycitiStation, isMycitiAccessible } from "@/lib/gautrain";
import L from "leaflet";
import type { GoogleReview } from "@/types/place-cache";
import { useActivityTracking } from "@/hooks/useActivityTracking";
import { ShareListingPopup } from "@/components/ShareListingPopup";
import { useAnalyticsTracking } from "@/hooks/useAnalyticsTracking";
import AccommodationCard from "@/components/AccommodationCard";
import { useSEO } from "@/hooks/useSEO";
import { slugify } from "@/lib/slugify";
import { getAddressImageUrl } from "@/lib/addressImage";

// ─── More places like this ─────────────────────────────────────────────────
const MoreLikethis = ({ currentId, city, university, isPaidUser = false }: { currentId: string; city: string; university: string; isPaidUser?: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: similar, isLoading } = useQuery({
    queryKey: ["more-like-this", currentId, city, university],
    queryFn: async () => {
      // Try same university first, fallback to same city
      let query = supabase
        .from("accommodations")
        .select("*")
        .neq("id", currentId)
        .limit(8);

      if (university) {
        query = query.eq("university", university);
      } else if (city) {
        query = query.ilike("city", `%${city}%`);
      }

      const { data } = await query.order("rating", { ascending: false });

      if (data && data.length > 0) return data;

      // Fallback: city-based if uni returned nothing
      if (university && city) {
        const { data: cityData } = await supabase
          .from("accommodations")
          .select("*")
          .neq("id", currentId)
          .ilike("city", `%${city}%`)
          .order("rating", { ascending: false })
          .limit(8);
        return cityData || [];
      }
      return [];
    },
    enabled: !!currentId,
    staleTime: 1000 * 60 * 10,
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      // Scroll by one card width (approx 300px) + gap (20px)
      const scrollAmount = 320; 
      const scrollTo = direction === 'left' 
        ? scrollLeft - scrollAmount 
        : scrollLeft + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading || !similar || similar.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-4 py-12 md:py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">More places like this</h2>
          <p className="text-muted-foreground mt-1">Recommended accommodations in {university || city}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-10 w-10 shadow-sm hover:bg-primary hover:text-white transition-all"
            onClick={() => scroll('left')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-10 w-10 shadow-sm hover:bg-primary hover:text-white transition-all"
            onClick={() => scroll('right')}
          >
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-6 -mx-1 px-1 no-scrollbar snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {similar.flatMap((acc: any, index: number) => {
          const items = [
            <div key={acc.id} className="min-w-[280px] sm:min-w-[320px] lg:min-w-[300px] snap-start">
              <AccommodationCard
                id={acc.id}
                propertyName={acc.property_name}
                type={acc.type}
                university={acc.university || ""}
                address={acc.address}
                city={acc.city || ""}
                monthlyCost={acc.monthly_cost || 0}
                rating={acc.rating || 0}
                nsfasAccredited={acc.nsfas_accredited || false}
                genderPolicy={acc.gender_policy || ""}
                website={acc.website || null}
                amenities={acc.amenities || []}
                imageUrls={acc.image_urls || []}
                latitude={acc.latitude}
                longitude={acc.longitude}
                isLandlordListing={acc.is_landlord_listing || false}
                distanceFromUniversityKm={acc.distance_from_university_km}
                roomsAvailable={acc.rooms_available}
                certifiedUniversities={acc.certified_universities}
              />
            </div>
          ];
          
          if ((index + 1) % 3 === 0) {
            items.push(
              <div key={`ad-${acc.id}`} className="min-w-[280px] sm:min-w-[320px] lg:min-w-[300px] snap-start flex items-center justify-center border border-slate-100 rounded-[28px] bg-slate-50/50 p-4">
                <div className="w-full">
                  <Ad density="compact" adSlot="8895459763" isPaidUser={isPaidUser} />
                </div>
              </div>
            );
          }
          return items;
        })}
      </div>
    </div>
  );
};



const ListingDetail = ({ listingId: propId, returnBasePath }: { listingId?: string; returnBasePath?: string } = {}) => {
  const { id: paramId } = useParams();
  const id = propId || paramId;
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const stateReturnPath = (location.state as any)?.returnPath as string | undefined;
  const returnPath = stateReturnPath || params.get('return') || returnBasePath || '/student-accommodation';
  
  // Access control
  const { accessLevel, hasActivePayment, isLoading: accessLoading } = useAccessControl();
  const isPaidUser = accessLevel === "paid";

  // Mapbox features states
  const [showRouteMap, setShowRouteMap] = useState<boolean>(false);
  const [isRouteImageLoading, setIsRouteImageLoading] = useState<boolean>(true);

  // Auth state — hoisted so downstream hooks can branch on it
  const { isLoaded: clerkAuthLoaded, isSignedIn: clerkIsSignedIn, userId } = useAuth();
  const isSignedIn = clerkAuthLoaded ? clerkIsSignedIn : null;

  // Real-time activity tracking — only for signed-in users
  const { trackEvent } = useActivityTracking({
    accommodationId: isSignedIn ? id : undefined,
    pagePath: window.location.pathname,
  });

  // Contact/lead analytics tracking
  const { trackContact } = useAnalyticsTracking();

  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportForm, setReportForm] = useState({
    reporter_name: "",
    reporter_email: "",
    reason: "",
    details: ""
  });
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);

  // Legacy listing-scoped scroll restore is now handled globally by
  // RouteScrollManager via scrollMemory. This effect remains for the older
  // listing-scroll:<id> session keys written prior to the global helper.
  useEffect(() => {
    if (isSignedIn !== true || !id) return;
    const key = `listing-scroll:${id}`;
    const saved = sessionStorage.getItem(key);
    if (saved) {
      const y = parseInt(saved, 10);
      sessionStorage.removeItem(key);
      setTimeout(() => window.scrollTo({ top: y, behavior: "auto" }), 100);
    }
  }, [isSignedIn, id]);

  useEffect(() => {
    if (!userId || !id) return;
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.from("favorites").select("*").eq("user_id", userId).eq("accommodation_id", id).maybeSingle();
        if (!mounted) return;
        if (!error && data) setIsSaved(true);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [id, userId]);

  const toggleFavorite = async () => {
    if (!userId) {
      rememberCurrentScroll();
      window.location.href = '/auth';
      return;
    }

    setSavingFavorite(true);
    try {
      if (!isSaved) {
        const { error } = await supabase.from('favorites').insert({ user_id: userId, accommodation_id: id });
        if (error) throw error;
        setIsSaved(true);
        toast.success('Saved to your favorites');
      } else {
        const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('accommodation_id', id);
        if (error) throw error;
        setIsSaved(false);
        toast.success('Removed from favorites');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update favorites');
    } finally {
      setSavingFavorite(false);
    }
  };

  const shareListing = async () => {
    const url = window.location.href.split('?')[0];
    const title = listing?.property_name || 'Listing';
    const text = listing?.description ? listing.description.slice(0, 140) : `${listing?.property_name || ''} - check this listing`;

    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title, text, url });
        toast.success('Share dialog opened');
        return;
      } catch (err: any) {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
            toast.success('Listing link copied to clipboard');
            return;
          }
        } catch (e) {
          // ignore
        }
        // eslint-disable-next-line no-alert
        prompt('Copy link', url);
        return;
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Listing link copied to clipboard');
        return;
      } catch (e) {
        // ignore
      }
    }

    // eslint-disable-next-line no-alert
    prompt('Copy link', url);
  };

  const { data: listing, isLoading, error: queryError } = useQuery({
    queryKey: ["accommodation", id],
    queryFn: async () => {
      if (!id) throw new Error("No accommodation ID provided");

      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching accommodation:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Accommodation not found");
      }

      return data;
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Hook to fetch campus directions (Feature 2)
  const { data: campusDirections, isLoading: directionsLoading } = useQuery({
    queryKey: ["campus-directions", id],
    queryFn: async () => {
      if (!id) return null;
      if (listing?.campus_directions) {
        return listing.campus_directions as any;
      }
      const { data, error } = await supabase.functions.invoke(`mapbox-features?action=campus-directions&id=${id}`);
      if (error) throw error;
      return data;
    },
    enabled: !!listing && !!listing.university && isSignedIn === true && isPaidUser === true,
  });

  // Hook to fetch nearby shops (Feature 1)
  const { data: nearbyShops, isLoading: shopsLoading } = useQuery({
    queryKey: ["nearby-shops", id],
    queryFn: async () => {
      if (!id) return null;
      if (listing?.nearby_shops && Array.isArray(listing.nearby_shops) && listing.nearby_shops.length > 0) {
        return listing.nearby_shops as any[];
      }
      const { data, error } = await supabase.functions.invoke(`mapbox-nearby?id=${id}`);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!listing && isSignedIn === true && isPaidUser === true,
  });



  // Per-listing SEO: unique title/description/canonical + Product structured data
  const seoTitle = listing
    ? `${listing.property_name}${listing.city ? ` in ${listing.city}` : ""}`
    : undefined;
  const seoDescription = listing
    ? `${listing.property_name} — ${listing.type || "Student accommodation"}${listing.city ? ` in ${listing.city}` : ""}${listing.university ? ` near ${listing.university}` : ""}. ${listing.monthly_cost ? `From R${Math.round(listing.monthly_cost)}/month. ` : ""}${listing.nsfas_accredited ? "NSFAS accredited. " : ""}Verified on ReBooked Living.`.slice(0, 158)
    : undefined;
  const seoCanonical = listing
    ? `/student-accommodation/${slugify(listing.city || "all")}/${slugify(listing.university || "all")}/${slugify(listing.property_name || "listing")}/${(listing.id || "").replace(/-/g, "").substring(0, 8)}`
    : undefined;
  const seoOgImage = listing?.image_urls?.[0];
  const seoJsonLd = listing
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: listing.property_name,
        description: seoDescription,
        image: listing.image_urls && listing.image_urls.length > 0 ? listing.image_urls : undefined,
        brand: { "@type": "Organization", name: "ReBooked Living" },
        category: listing.type || "Student Accommodation",
        ...(listing.address || listing.city
          ? {
              address: {
                "@type": "PostalAddress",
                streetAddress: listing.address || undefined,
                addressLocality: listing.city || undefined,
                addressRegion: listing.province || undefined,
                addressCountry: "ZA",
              },
            }
          : {}),
        ...(listing.monthly_cost
          ? {
              offers: {
                "@type": "Offer",
                price: Math.round(listing.monthly_cost),
                priceCurrency: "ZAR",
                availability: "https://schema.org/InStock",
                url: typeof window !== "undefined" ? window.location.href : undefined,
              },
            }
          : {}),
        ...(listing.rating && (listing as any).review_count
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: listing.rating,
                reviewCount: (listing as any).review_count,
              },
            }
          : {}),
      }
    : undefined;

  useSEO({
    title: seoTitle,
    description: seoDescription,
    canonical: seoCanonical,
    ogImage: seoOgImage,
    jsonLd: seoJsonLd,
  });

  // Fetch photos with tier-based limits enforced at database level
  // Only fetched for signed-in users - signed out users only see the listing's primary image
  const { data: tieredPhotos } = useQuery({
    queryKey: ["accommodation-photos", id, isPaidUser],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_accommodation_photos', {
        p_accommodation_id: id,
        p_user_id: userId,
      });

      if (error) {
        console.warn('Failed to fetch tiered photos:', error);
        return null;
      }
      return data as string[] | null;
    },
    enabled: !!id && isSignedIn === true,
  });

  // Landlord contact details — auth-gated table
  const { data: contactInfo } = useQuery({
    queryKey: ["accommodation-contacts", id, isSignedIn],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("accommodation_contacts")
        .select("contact_email, contact_phone, contact_person")
        .eq("accommodation_id", id)
        .maybeSingle();
      if (error) {
        console.warn("Failed to fetch contact info:", error);
        return null;
      }
      return data;
    },
    enabled: !!id && isSignedIn === true,
  });

  useEffect(() => {
    if (!id || !listing || !userId) return;
    
    const trackView = async () => {
      try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: existing } = await supabase
          .from("viewed_accommodations")
          .select("id")
          .eq("user_id", userId)
          .eq("accommodation_id", id)
          .gte("viewed_at", oneDayAgo)
          .single();

        if (existing) return;

        await supabase.from("viewed_accommodations").insert({
          user_id: userId,
          accommodation_id: id,
        });
      } catch (err) {
        console.debug("Failed to track view:", err);
      }
    };

    trackView();
  }, [id, listing, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("messages").insert({
        name: contactForm.name,
        email: contactForm.email,
        subject: `Inquiry about ${listing?.property_name}`,
        message: `${contactForm.message}\n\nProperty: ${listing?.property_name} (${id})`,
      });

      if (error) throw error;

      // Track message sent event
      trackEvent("message_sent", { property_name: listing?.property_name });

      // Increment messages in daily analytics
      if (id) {
        try {
          await supabase.rpc("increment_listing_analytics", {
            p_accommodation_id: id,
            p_field: "messages",
          });
        } catch (err) {
          console.debug("Failed to increment message analytics:", err);
        }
      }

      await triggerWebhook("contact_message", {
        name: contactForm.name,
        email: contactForm.email,
        subject: `Inquiry about ${listing?.property_name}`,
        message: `${contactForm.message}\n\nProperty: ${listing?.property_name} (${id})`,
        accommodation_id: id,
      });

      toast.success("Message sent! The landlord will contact you soon.");
      setContactForm({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const { error } = await supabase.from("reports").insert({
        accommodation_id: id,
        ...reportData,
      });
      if (error) throw error;
      return reportData;
    },
    onSuccess: async (reportData) => {
      await triggerWebhook("report", reportData);
      toast.success("Report submitted successfully. Thank you for helping us maintain quality.");
      setReportForm({ reporter_name: "", reporter_email: "", reason: "", details: "" });
      setReportDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to submit report. Please try again.");
    },
  });

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const passedImages = (location.state as any)?.images as string[] | undefined;

  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  const [googlePhotos, setGooglePhotos] = useState<string[]>([]);
  const [totalGooglePhotos, setTotalGooglePhotos] = useState<number>(0);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<number>(0);
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  // Fetch place data from cache/API - ONLY for signed-in users
  // Signed out users only get the primary listing image; no Places API spend
  const { data: placeCache, isLoading: placeCacheLoading } = useQuery({
    queryKey: ["place-cache", listing?.property_name, listing?.address, accessLevel],
    queryFn: async () => {
      if (!listing) return null;
      const tier = getUserTier(accessLevel);
      return getPlaceData({
        property_name: listing.property_name,
        address: listing.address,
        city: listing.city || undefined,
        latitude: listing.latitude || undefined,
        longitude: listing.longitude || undefined,
        user_tier: tier,
        action: "listing",
      });
    },
    enabled: !!listing && isSignedIn === true,
    staleTime: 1000 * 60 * 5,
  });

  const listingCardPhoto = listing ? getAddressImageUrl(listing.address, { latitude: listing.latitude, longitude: listing.longitude }) : null;
  const allPhotos = placeCache?.photos?.length ? placeCache.photos :
                    (passedImages && passedImages.length > 0 ? passedImages : googlePhotos);
  const basePhotos = (tieredPhotos && tieredPhotos.length > 0) ? tieredPhotos : allPhotos;
  const fullPhotoSet = basePhotos;
  
  // When signed out: show ONLY the listing's primary image (no extra fetches)
  // When signed in but free: show exactly 3 photos (includes the listingCardPhoto and 2 other photos)
  const photos = isSignedIn === false
    ? (listing?.image_urls && listing.image_urls.length > 0 ? [listing.image_urls[0]] : [])
    : (isPaidUser ? fullPhotoSet : fullPhotoSet.slice(0, 3));
    
  const allReviews = placeCache?.reviews?.length ? placeCache.reviews : googleReviews;
  const reviews = isPaidUser ? allReviews : allReviews?.slice(0, FREE_TIER_LIMITS.MAX_REVIEWS);
  const totalPhotos = (listingCardPhoto ? 1 : 0) + (placeCache?.photo_count || totalGooglePhotos || allPhotos?.length || 0);
  const totalReviews = placeCache?.review_count || allReviews?.length || 0;
  const hasMorePhotos = !isPaidUser && totalPhotos > 3;
  const hasMoreReviews = !isPaidUser && totalReviews > FREE_TIER_LIMITS.MAX_REVIEWS;
  const cacheHit = placeCache?.cached || false;
  const cacheAttributions = placeCache?.attributions;

  // Leaflet map initialization
  useEffect(() => {
    if (!mapRef.current || !listing || isSignedIn !== true) return;

    // Cleanup previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const lat0 = listing.latitude || -33.9249;
    const lng0 = listing.longitude || 18.4241;

    const map = L.map(mapRef.current, {
      center: [lat0, lng0],
      zoom: 15,
      zoomControl: true,
    });

    const roadTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const roadTileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    const tileUrl = mapType === 'satellite' && isPaidUser
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : roadTileUrl;

    L.tileLayer(tileUrl, {
      attribution: mapType === 'satellite' && isPaidUser
        ? '&copy; Esri'
        : roadTileAttribution,
    }).addTo(map);

    // Force proper tile rendering after container is visible - multiple attempts
    setTimeout(() => { map.invalidateSize(); }, 100);
    setTimeout(() => { map.invalidateSize(); }, 500);
    setTimeout(() => { map.invalidateSize(); }, 1500);

    mapInstanceRef.current = map;

    const blueIcon = new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
    });
    const redIcon = new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
    });

    // Geocode and place markers
    const addressQuery = [listing.property_name, listing.address, listing.city, listing.province].filter(Boolean).join(', ');

    (async () => {
      try {
        let lat = listing.latitude;
        let lng = listing.longitude;

        if (!lat || !lng) {
          // Fallback to geocoding only if DB is missing coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery + ", South Africa")}&limit=1`,
            { headers: { "User-Agent": "ReBookLiving/1.0" } }
          );
          const data = await res.json();
          if (data && data[0]) {
            lat = parseFloat(data[0].lat);
            lng = parseFloat(data[0].lon);
          }
        }

        if (lat && lng) {
          map.setView([lat, lng], 17);
          L.marker([lat, lng], { icon: blueIcon })
            .addTo(map)
            .bindPopup(`<strong>${listing.property_name}</strong>`);

          // University distance calculation
          if (isPaidUser && listing.university) {
            const uniRes = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(listing.university + ", South Africa")}&limit=1`,
              { headers: { "User-Agent": "ReBookLiving/1.0" } }
            );
            const uniData = await uniRes.json();
            if (uniData && uniData[0]) {
              const uniLat = parseFloat(uniData[0].lat);
              const uniLng = parseFloat(uniData[0].lon);
              L.marker([uniLat, uniLng], { icon: redIcon })
                .addTo(map)
                .bindPopup(`<strong>${listing.university}</strong>`);

            }
          }
        }
      } catch (err) {
        console.warn("Leaflet map init error", err);
      }
    })();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [listing, isPaidUser, mapType, isSignedIn]);

  const toggleReviewExpand = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const enterStreetView = () => {
    toast.error('Street View is not available with Leaflet maps');
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.reason) {
      toast.error("Please select a reason for reporting");
      return;
    }
    reportMutation.mutate(reportForm);
  };

  if (isLoading || accessLoading) {
    return (
      <Layout showFooter={false}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-muted rounded-lg mb-8"></div>
            <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/4 mb-8"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (queryError || !listing) {
    return (
      <Layout showFooter={false}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-8 text-center">
              <h1 className="text-2xl font-bold mb-2 text-foreground">Listing not found</h1>
              <p className="text-muted-foreground mb-6">
                {queryError
                  ? `Error: ${(queryError as any).message || "Failed to load listing"}`
                  : "The accommodation you're looking for doesn't exist or has been removed."}
              </p>
              <Link to={returnPath}>
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to listings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
          {/* Back Button */}
          <Link to={returnPath} className="inline-block mb-4">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          {/* Header Card */}
          <Card className="mb-8 border-0 shadow-md">
            <CardContent className="p-6 md:p-10">
              <div className="flex flex-col gap-6 md:gap-8">
                {/* Top section with badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {listing.is_landlord_listing && (
                    <Badge className="bg-green-500 text-white gap-1 text-xs">
                      <Building2 className="w-3 h-3" />
                      Listed by Landlord
                    </Badge>
                  )}
                  {listing.nsfas_accredited && (
                    <Badge className="bg-blue-500 text-white gap-1 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      NSFAS Accredited
                    </Badge>
                  )}
                </div>

                {/* Main title and location */}
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold mb-3 text-foreground">{listing.property_name || "Listing"}</h1>
                  {listing.address && (
                    <div className="flex items-start gap-1 text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base">
                        {listing.address}
                        {listing.city && `, ${listing.city}`}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {listing.type && <Badge variant="secondary" className="text-xs">{listing.type}</Badge>}
                    {listing.gender_policy && <Badge variant="secondary" className="text-xs">{listing.gender_policy}</Badge>}
                    {listing.rooms_available && (
                      <Badge variant="secondary" className="text-xs">{listing.rooms_available} rooms</Badge>
                    )}
                  </div>
                </div>

                {/* Bottom section - rating and actions */}
                <div className="flex items-center justify-between pt-6 border-t gap-3 flex-wrap">
                  <div className="text-center bg-accent/10 px-3 py-2 rounded-lg">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <Star className="h-4 w-4 text-accent fill-accent" />
                      <span className="text-xl md:text-2xl font-bold">{(listing.rating || 0).toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFavorite}
                      className="rounded-full"
                      disabled={savingFavorite}
                      title={isSaved ? 'Remove favorite' : 'Save favorite'}
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <ShareListingPopup
                      listingId={id || ""}
                      listingName={listing?.property_name || "Listing"}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          title="Share listing"
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-full" title="Report listing">
                          <Flag className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Report Listing</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleReportSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="reason">Reason for reporting *</Label>
                            <Select
                              value={reportForm.reason}
                              onValueChange={(value) => setReportForm({ ...reportForm, reason: value })}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a reason" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Inaccurate Information">Inaccurate Information</SelectItem>
                                <SelectItem value="Scam or Fraud">Scam or Fraud</SelectItem>
                                <SelectItem value="Property No Longer Available">Property No Longer Available</SelectItem>
                                <SelectItem value="Inappropriate Content">Inappropriate Content</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="report-details">Details</Label>
                            <Textarea
                              id="report-details"
                              value={reportForm.details}
                              onChange={(e) => setReportForm({ ...reportForm, details: e.target.value })}
                              placeholder="Please provide more information about this report..."
                              rows={4}
                            />
                          </div>
                          <div>
                            <Label htmlFor="reporter-name">Your Name (optional)</Label>
                            <Input
                              id="reporter-name"
                              value={reportForm.reporter_name}
                              onChange={(e) => setReportForm({ ...reportForm, reporter_name: e.target.value })}
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <Label htmlFor="reporter-email">Your Email (optional)</Label>
                            <Input
                              id="reporter-email"
                              type="email"
                              value={reportForm.reporter_email}
                              onChange={(e) => setReportForm({ ...reportForm, reporter_email: e.target.value })}
                              placeholder="john@example.com"
                            />
                          </div>
                          <Button type="submit" disabled={reportMutation.isPending}>
                            {reportMutation.isPending ? "Submitting..." : "Submit Report"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isSignedIn === false ? (
            <div className="space-y-6">
              {/* Single photo (no API fetches) — fixed aspect ratio prevents layout shift */}
              <Card className="border-0 shadow-md overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative w-full aspect-[16/10]">
                    <ImageWithSkeleton
                      src={
                        (listing.image_urls && listing.image_urls.length > 0)
                          ? listing.image_urls[0]
                          : (getAddressImageUrl(listing.address, { latitude: listing.latitude, longitude: listing.longitude }) || "/placeholder.svg")
                      }
                      alt={listing.property_name || "Listing photo"}
                      className="absolute inset-0"
                      loading="eager"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Description (visible) */}
              {(listing.ai_description || listing.description) && (
                <Card className="border-0 shadow-md">
                  <CardHeader className="border-b bg-muted/30 px-6 md:px-8 py-4 md:py-5">
                    <CardTitle className="text-base md:text-lg">About this property</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8">
                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                      {listing.ai_description || listing.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Blurred teaser + sign-in CTA */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-md">
                <div
                  aria-hidden
                  className="pointer-events-none select-none blur-md opacity-60 p-8 space-y-4"
                >
                  <div className="h-8 w-1/3 bg-muted rounded" />
                  <div className="h-4 w-2/3 bg-muted rounded" />
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="h-24 bg-muted rounded" />
                    <div className="h-24 bg-muted rounded" />
                    <div className="h-24 bg-muted rounded" />
                    <div className="h-24 bg-muted rounded" />
                  </div>
                  <div className="h-48 bg-muted rounded mt-4" />
                  <div className="h-32 bg-muted rounded" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-background/40 via-background/80 to-background">
                  <div className="text-center max-w-md px-6 py-10">
                    <Lock className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h2 className="text-xl md:text-2xl font-bold mb-2">Sign in to see the full listing</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Create a free account or sign in to view all photos, contact details, reviews, the map and similar properties.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        to={`/auth?redirect=${encodeURIComponent(location.pathname)}`}
                        onClick={() => rememberCurrentScroll()}
                      >
                        <Button size="lg" className="w-full sm:w-auto">Sign in</Button>
                      </Link>
                      <Link
                        to={`/auth?mode=signup&redirect=${encodeURIComponent(location.pathname)}`}
                        onClick={() => rememberCurrentScroll()}
                      >
                        <Button size="lg" variant="outline" className="w-full sm:w-auto">Create account</Button>
                      </Link>
                    </div>
                    <Link to={returnPath} className="inline-block mt-4">
                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back to listings
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : isSignedIn === null ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
          ) : (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {!isPaidUser && <Ad adSlot={AD_SLOTS.listingTop} isPaidUser={false} className="mb-4" />}
              {/* Photos Card */}
              <Card className="border-0 shadow-md overflow-hidden">
                <CardHeader className="border-b bg-muted/30 px-6 md:px-8 py-4 md:py-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      <CardTitle className="text-base md:text-lg">Gallery</CardTitle>
                    </div>
                    {hasMorePhotos && (
                      <div className="flex items-center gap-2 ml-auto">
                        <Badge variant="secondary" className="text-xs">
                          More Photos Available
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  {photos && photos.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                        {photos.map((src, i) => (
                          <button
                            key={i}
                            onClick={() => { setSelectedPhoto(i); setPhotoDialogOpen(true); }}
                            className="group relative overflow-hidden rounded-lg aspect-square bg-muted hover:shadow-lg transition-all duration-200"
                          >
                            <img loading="lazy" src={src} alt={`Photo ${i+1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                          </button>
                        ))}
                      </div>

                      {!isPaidUser && (
                        <div className="mt-6 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">Upgrade to see all photos and unlock more features</p>
                          <Link to="/pricing" className="ml-4">
                            <Button size="sm" className="whitespace-nowrap">Upgrade</Button>
                          </Link>
                        </div>
                      )}

                      {hasMorePhotos && (
                        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                          <UpgradePrompt
                            type="photos"
                            totalCount={totalPhotos}
                            compact
                            buttonText="Unlock More Photos"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No photos available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ad-free prompt (only once) and Ad between Gallery and About */}
              {!isPaidUser && <AdFreePrompt className="mb-4" />}

              {/* Details Card */}
              <Card className="border-0 shadow-md">
                <CardHeader className="border-b bg-muted/30 px-6 md:px-8 py-4 md:py-5">
                  <CardTitle className="text-base md:text-lg">About this property</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-6 md:space-y-8">
                  {(listing.ai_description || listing.description) && (
                    <div>
                      <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-2">Description</h3>
                      {(() => {
                        let text = listing.ai_description || listing.description;
                        const lines = text.split('\n');
                        const deduped = [];
                        let lastWasNearby = false;
                        for (const line of lines) {
                          const isNearby = line.toLowerCase().includes('nearby shops');
                          if (isNearby && lastWasNearby) continue;
                          deduped.push(line);
                          lastWasNearby = isNearby;
                        }
                        text = deduped.join('\n').trim();
                        return <p className="text-foreground text-sm leading-relaxed">{text}</p>;
                      })()}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">University</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-foreground text-sm font-medium">{listing.university}</p>
                        {listing.distance_from_university_km !== null && listing.distance_from_university_km !== undefined && (
                          <Badge variant="secondary" className="text-[10px] h-5 bg-blue-50 text-blue-700 border-blue-100">
                            {listing.distance_from_university_km}km away
                          </Badge>
                        )}
                      </div>
                      {listing.university && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {isGautrainAccessible(listing.university) && (
                            <Badge className="bg-emerald-100 text-emerald-700 flex items-center gap-1">
                              <Train className="w-3 h-3" />
                              {getGautrainStation(listing.university)}
                            </Badge>
                          )}
                          {isMycitiAccessible(listing.university) && (
                            <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                              <Train className="w-3 h-3" />
                              {getMycitiStation(listing.university)}
                            </Badge>
                          )}
                          {!isGautrainAccessible(listing.university) && !isMycitiAccessible(listing.university) && (
                            <p className="text-xs text-muted-foreground">Not on major transit networks</p>
                          )}
                        </div>
                      )}
                      
                      {directionsLoading && (
                        <div className="mt-2.5 border-t border-slate-100 pt-2 text-xs text-muted-foreground animate-pulse flex items-center gap-1.5">
                          <Info className="h-3 w-3 animate-spin" /> Calculating route to campus...
                        </div>
                      )}
                    </div>
                    {listing.units && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Units & Availability</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-foreground text-sm font-medium">{listing.units} total units</p>
                          {listing.rooms_available !== null && listing.rooms_available !== undefined && (
                            <Badge variant="secondary" className="text-[10px] h-5 bg-orange-50 text-orange-700 border-orange-100">
                              {listing.rooms_available} rooms available
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {listing.amenities && Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-2">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {listing.amenities.map((amenity: string) => (
                          <Badge key={amenity} variant="outline" className="border-primary/20 bg-primary/5">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {listing.certified_universities && Array.isArray(listing.certified_universities) && listing.certified_universities.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-2">Accredited For</h3>
                      <div className="space-y-1">
                        {listing.certified_universities.map((uni: string) => (
                          <div key={uni} className="flex items-center gap-2 text-foreground text-sm">
                            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                            <span>{uni}</span>
                          </div>
                        ))}
                      </div>
                      {listing.accreditation_number && (
                        <div className="mt-2 pt-2 border-t border-dashed">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Accreditation No.</p>
                          <p className="text-sm font-mono text-slate-700">{listing.accreditation_number}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {listing.website && (
                    <div className="pt-3 border-t">
                      <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Website</h3>
                      <a href={listing.website} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all text-xs md:text-sm">
                        {listing.website}
                      </a>
                    </div>
                  )}

                  {/* Additional Property Details - integrated into About card */}
                  <div className="pt-6 md:pt-8 border-t grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {listing.property_name && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Property Name</h3>
                        <p className="text-foreground text-sm font-medium">{listing.property_name}</p>
                      </div>
                    )}
                    {listing.type && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Type</h3>
                        <p className="text-foreground text-sm font-medium">{listing.type}</p>
                      </div>
                    )}
                    {listing.address && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Address</h3>
                        <p className="text-foreground text-sm">{listing.address}</p>
                      </div>
                    )}
                    {listing.city && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">City</h3>
                        <p className="text-foreground text-sm font-medium">{listing.city}</p>
                      </div>
                    )}
                    {listing.province && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Province</h3>
                        <p className="text-foreground text-sm font-medium">{listing.province}</p>
                      </div>
                    )}
                    {listing.gender_policy && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Gender Policy</h3>
                        <p className="text-foreground text-sm font-medium">{listing.gender_policy}</p>
                      </div>
                    )}
                    {listing.lease_move_in_date && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Move-in Date</h3>
                        <p className="text-foreground text-sm font-medium">{new Date(listing.lease_move_in_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {listing.lease_term_months !== null && listing.lease_term_months !== undefined && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Lease Term</h3>
                        <p className="text-foreground text-sm font-medium">{listing.lease_term_months} months</p>
                      </div>
                    )}
                    {listing.deposit_amount !== null && listing.deposit_amount !== undefined && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Deposit Amount</h3>
                        <p className="text-foreground text-sm font-medium">R{listing.deposit_amount.toLocaleString()}</p>
                      </div>
                    )}
                    {listing.pet_friendly !== null && listing.pet_friendly !== undefined && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Pet Friendly</h3>
                        <p className="text-foreground text-sm font-medium">{listing.pet_friendly ? 'Yes' : 'No'}</p>
                      </div>
                    )}
                    {listing.smoking_policy && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Smoking Policy</h3>
                        <p className="text-foreground text-sm font-medium">{listing.smoking_policy}</p>
                      </div>
                    )}

                    {listing.response_rate !== null && listing.response_rate !== undefined && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Response Rate</h3>
                        <p className="text-foreground text-sm font-medium">{(listing.response_rate * 100).toFixed(0)}%</p>
                      </div>
                    )}
                    {listing.avg_response_minutes !== null && listing.avg_response_minutes !== undefined && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Avg Response Time</h3>
                        <p className="text-foreground text-sm font-medium">{listing.avg_response_minutes} minutes</p>
                      </div>
                    )}
                    {listing.nsfas_last_inspected !== null && listing.nsfas_last_inspected !== undefined && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">NSFAS Last Inspected</h3>
                        <p className="text-foreground text-sm font-medium">{new Date(listing.nsfas_last_inspected as any).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>


                  {listing.room_types && Array.isArray(listing.room_types) && listing.room_types.length > 0 && (
                    <div className="pt-6 md:pt-8 border-t">
                      <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-4">Room Types</h3>
                      <div className="space-y-4">
                        {listing.room_types.map((room: any, idx: number) => {
                          const roomName = typeof room === 'string' ? room : room?.name || room?.type || 'Room';
                          const amenities = room?.amenities || [];
                          const price = room?.monthly_price_zar;
                          const totalRooms = room?.total_rooms;
                          const availableRooms = room?.available_rooms;

                          return (
                            <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-primary/30 transition-colors">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground text-sm md:text-base">{roomName}</p>
                                  {room?.notes && <p className="text-xs text-muted-foreground mt-1">{room.notes}</p>}
                                </div>
                                {price && <p className="text-sm font-bold text-primary whitespace-nowrap ml-2">R{price.toLocaleString()}/mo</p>}
                              </div>

                              {amenities.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Amenities</p>
                                  <div className="flex flex-wrap gap-2">
                                    {amenities.map((amenity: string, aIdx: number) => (
                                      <Badge key={aIdx} variant="outline" className="bg-slate-50 border-slate-200 text-xs">
                                        {amenity}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-3 pt-3 border-t border-slate-100">
                                {totalRooms !== null && totalRooms !== undefined && (
                                  <div className="text-xs">
                                    <p className="text-muted-foreground font-medium">Total Rooms</p>
                                    <p className="font-semibold text-foreground">{totalRooms}</p>
                                  </div>
                                )}
                                {availableRooms !== null && availableRooms !== undefined && (
                                  <div className="text-xs">
                                    <p className="text-muted-foreground font-medium">Available</p>
                                    <p className={`font-semibold ${availableRooms > 0 ? 'text-green-600' : 'text-orange-600'}`}>{availableRooms}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}


                  {listing.security && (
                    <div className="pt-6 border-t">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Security</h3>
                      {typeof listing.security === 'string' ? (
                        <p className="text-foreground text-sm leading-relaxed">{listing.security}</p>
                      ) : typeof listing.security === 'object' && Object.keys(listing.security).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(listing.security).map(([key, value]: any) => (
                            <Badge key={key} variant="outline" className="bg-green-50 border-green-200 text-green-800">
                              {String(key).replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}

                  {listing.qa && Array.isArray(listing.qa) && listing.qa.length > 0 && (
                    <div className="pt-6 md:pt-8 border-t">
                      <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-3">Q&A</h3>
                      <div className="space-y-3">
                        {listing.qa.map((item: any, idx: number) => {
                          const question = typeof item === 'string' ? item : (item?.question || item?.q || '');
                          const answer = item?.answer || item?.a || '';
                          return (
                            <div key={idx} className="bg-slate-50 rounded-lg p-3 md:p-4">
                              {question && (
                                <>
                                  <p className="text-xs text-muted-foreground mb-1 font-semibold">Q:</p>
                                  <p className="text-sm font-medium text-foreground mb-2">{question}</p>
                                </>
                              )}
                              {answer && (
                                <>
                                  <p className="text-xs text-muted-foreground mb-1 font-semibold">A:</p>
                                  <p className="text-sm text-foreground">{answer}</p>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {listing.qa && Array.isArray(listing.qa) && listing.qa.length > 0 && (
                    <div className="pt-6 md:pt-8 border-t">
                      <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-3">Frequently Asked Questions</h3>
                      <div className="space-y-3">
                        {listing.qa.map((item: any, idx: number) => (
                          <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-primary/30 transition-colors">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Question</p>
                              {item.source_url && (
                                <a
                                  href={item.source_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                                  title="View source"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            {item.question && (
                              <p className="text-sm font-medium text-foreground mb-3">{item.question}</p>
                            )}
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Answer</p>
                            {item.answer && (
                              <p className="text-sm text-foreground leading-relaxed">{item.answer}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gated Nearby Shops Card */}
              <Card className="border-0 shadow-md">
                <CardHeader className="border-b bg-muted/30 px-6 md:px-8 py-4 md:py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      <CardTitle className="text-base md:text-lg">Nearby Shops</CardTitle>
                    </div>
                    {!isPaidUser && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Lock className="h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  {isPaidUser ? (
                    shopsLoading ? (
                      <div className="py-8 text-center text-xs text-muted-foreground animate-pulse flex items-center justify-center gap-2">
                        <Info className="h-4 w-4 animate-spin text-primary" /> Searching nearby shops...
                      </div>
                    ) : nearbyShops && nearbyShops.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {nearbyShops.map((shop: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:border-primary/30 transition-colors">
                            <div className="flex-1 min-w-0">
                              {shop.name && <p className="font-medium text-foreground text-sm truncate">{shop.name}</p>}
                              {shop.address && <p className="text-xs text-muted-foreground mt-0.5 truncate">{shop.address}</p>}
                              {shop.category && <p className="text-xs text-muted-foreground truncate">{shop.category}</p>}
                            </div>
                            <div className="flex-shrink-0 text-right whitespace-nowrap">
                              {shop.distance_km && <p className="text-xs font-medium text-primary">{shop.distance_km}km</p>}
                              {shop.walk_minutes && <p className="text-xs text-muted-foreground">{shop.walk_minutes}m walk</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No nearby shops information available for this property.</p>
                    )
                  ) : (
                    <div className="py-4 text-center">
                      <UpgradePrompt type="general" compact buttonText="Unlock nearby shops details" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ad between About and Location (no banner here - only one banner total) */}
              {!isPaidUser && <Ad adSlot="8895459763" isPaidUser={false} />}

              <Card className="border-0 shadow-md">
                <CardHeader className="border-b bg-muted/30 px-6 md:px-8 py-4 md:py-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg">Location</CardTitle>
                    {!isPaidUser && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Lock className="h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {isPaidUser && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap')}
                      >
                        {mapType === 'roadmap' ? '🛰️ Satellite' : '🗺️ Map'}
                      </Button>
                    )}
                    {listing.university && (
                      <Button
                        size="sm"
                        variant={showRouteMap ? "default" : "outline"}
                        className="text-xs gap-1.5"
                        onClick={() => {
                          if (!isPaidUser) {
                            toast.error("Upgrade to premium to view routes to campus");
                            return;
                          }
                          setShowRouteMap(prev => !prev);
                          if (!showRouteMap) setIsRouteImageLoading(true);
                        }}
                      >
                        <Route className="h-3.5 w-3.5" />
                        Route to Campus
                      </Button>
                    )}
                  </div>
                  <div ref={mapRef} className="h-60 md:h-80 w-full rounded-lg overflow-hidden bg-muted" />

                  {/* Distance to Campus metrics gated for paying users */}
                  {isPaidUser && (listing.walk_minutes_to_campus !== null || listing.drive_minutes_to_campus !== null || campusDirections) && (
                    <div className="mt-4 p-3 bg-muted/40 rounded-lg border border-border/50 space-y-2">
                      <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Travel to Campus</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {(listing.walk_minutes_to_campus !== null || campusDirections?.walking) && (
                          <div className="flex items-center gap-2">
                            <Footprints className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-xs font-semibold">Walking</p>
                              <p className="text-xs text-muted-foreground">
                                {campusDirections?.walking 
                                  ? `${campusDirections.walking.distance >= 1000 
                                      ? `${(campusDirections.walking.distance / 1000).toFixed(1)} km` 
                                      : `${Math.round(campusDirections.walking.distance)} m`} (${Math.round(campusDirections.walking.duration / 60)} mins)`
                                  : `${listing.walk_minutes_to_campus} mins`}
                              </p>
                            </div>
                          </div>
                        )}
                        {(listing.drive_minutes_to_campus !== null || campusDirections?.driving) && (
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-xs font-semibold">Driving</p>
                              <p className="text-xs text-muted-foreground">
                                {campusDirections?.driving 
                                  ? `${campusDirections.driving.distance >= 1000 
                                      ? `${(campusDirections.driving.distance / 1000).toFixed(1)} km` 
                                      : `${Math.round(campusDirections.driving.distance)} m`} (${Math.round(campusDirections.driving.duration / 60)} mins)`
                                  : `${listing.drive_minutes_to_campus} mins`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Feature 3: Route to Campus Inline Image */}
                  {showRouteMap && (
                    <div className="mt-4 border border-border rounded-lg overflow-hidden relative bg-slate-50 aspect-[3/2] w-full">
                      {isRouteImageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-10">
                          <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1.5">
                            <Info className="h-3.5 w-3.5 animate-spin" /> Generating driving route map...
                          </span>
                        </div>
                      )}
                      <img
                        src={`${(supabase as any).supabaseUrl}/functions/v1/mapbox-features?action=route-image&id=${id}&apikey=${(supabase as any).supabaseKey}`}
                        alt="Route to Campus Map"
                        className="w-full h-full object-cover"
                        onLoad={() => setIsRouteImageLoading(false)}
                        onError={() => setIsRouteImageLoading(false)}
                      />
                    </div>
                  )}

                  {/* Upgrade prompt for free users */}
                  {!isPaidUser && (
                    <div className="pt-3 border-t">
                      <UpgradePrompt type="map" compact buttonText="Unlock satellite & campus route details" />
                    </div>
                  )}
                </CardContent>
              </Card>


            </div>

            {/* Sidebar */}
            <div className="space-y-8 lg:sticky lg:top-20">
              {/* Contact Card */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6 md:p-8">
                  {listing.monthly_cost !== null && listing.monthly_cost !== undefined && (
                    <div className="mb-6 md:mb-8">
                      <div className="text-3xl md:text-4xl font-bold text-primary mb-2">R{listing.monthly_cost.toLocaleString()}</div>
                      <p className="text-xs md:text-sm text-muted-foreground">per month</p>
                    </div>
                  )}

                  <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 pb-6 md:pb-8 border-b">
                    {contactInfo?.contact_phone && (
                      <div className="flex items-start gap-2 md:gap-3">
                        <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0 mt-1 md:mt-1.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Phone</p>
                          <p className="font-medium text-xs md:text-sm break-all">{contactInfo.contact_phone}</p>
                        </div>
                      </div>
                    )}
                    {contactInfo?.contact_email && (
                      <div className="flex items-start gap-2 md:gap-3">
                        <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0 mt-1 md:mt-1.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Email</p>
                          <p className="font-medium text-xs md:text-sm break-all">{contactInfo.contact_email}</p>
                        </div>
                      </div>
                    )}
                    {contactInfo?.contact_person && (
                      <div className="flex items-start gap-2 md:gap-3">
                        <p className="text-xs text-muted-foreground mb-1">Contact Person</p>
                        <p className="font-medium text-xs md:text-sm">{contactInfo.contact_person}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {contactInfo?.contact_phone && (
                      <a 
                        href={`tel:${contactInfo.contact_phone}`} 
                        className="block"
                        onClick={() => trackContact({
                          accommodationId: id || "",
                          contactType: "phone",
                          university: listing.university || undefined,
                          city: listing.city || undefined,
                          province: listing.province || undefined,
                          monthlyCost: listing.monthly_cost || undefined,
                          landlordId: listing.landlord_id || undefined,
                        })}
                      >
                        <Button className="w-full bg-primary hover:bg-primary/90 text-sm">
                          <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                          Call Now
                        </Button>
                      </a>
                    )}
                    {contactInfo?.contact_email && (
                      <a 
                        href={`mailto:${contactInfo.contact_email}`} 
                        className="block"
                        onClick={() => trackContact({
                          accommodationId: id || "",
                          contactType: "email",
                          university: listing.university || undefined,
                          city: listing.city || undefined,
                          province: listing.province || undefined,
                          monthlyCost: listing.monthly_cost || undefined,
                          landlordId: listing.landlord_id || undefined,
                        })}
                      >
                        <Button variant="outline" className="w-full text-sm">
                          <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                          Send Email
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Unified Reviews Section */}
              <Card className="border-0 shadow-md">
                <CardHeader className="border-b bg-muted/30 px-6 md:px-8 py-4 md:py-5">
                  <CardTitle className="text-base md:text-lg">Reviews & Feedback</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <div className="space-y-6 md:space-y-8">
                    {/* Review Form */}
                    <div className="pb-6 md:pb-8 border-b">
                      <ReviewForm
                        accommodationId={id || ""}
                        onReviewSubmitted={() => setReviewsRefreshTrigger(prev => prev + 1)}
                      />
                    </div>

                    {/* All Reviews */}
                    <div>
                      <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-3 md:mb-4">All Reviews</h3>
                      <div className="space-y-3 md:space-y-4 max-h-[50vh] overflow-y-auto">
                        {/* ReBooked Living Reviews */}
                        <ReviewsList
                          accommodationId={id}
                          onReviewsUpdated={() => setReviewsRefreshTrigger(prev => prev + 1)}
                          maxReviews={isPaidUser ? undefined : FREE_TIER_LIMITS.MAX_REVIEWS}
                        />

                        {/* Google Reviews */}
                        {reviews && reviews.length > 0 && (
                          <>
                            <div className="my-2 md:my-3 text-center text-xs text-muted-foreground">
                              ─ Google Reviews ─
                            </div>
                            {reviews.map((r: any, idx: number) => {
                              const reviewId = `google-${idx}`;
                              const isExpanded = expandedReviews.has(reviewId);
                              const isTruncated = r.text && r.text.length > 150;
                              return (
                                <div key={reviewId} className="p-2 md:p-2.5 bg-muted/30 rounded-lg border border-muted text-xs md:text-sm">
                                  <div className="flex gap-2 items-start mb-1">
                                    {r.profile_photo_url ? (
                                      <img src={r.profile_photo_url} alt={r.author_name} className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover flex-shrink-0" />
                                    ) : (
                                      <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-muted flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1 justify-between mb-0.5">
                                        <div className="flex items-center gap-1">
                                          <p className="font-semibold text-xs truncate">{r.author_name}</p>
                                          <span className="text-xs px-1 py-0 bg-blue-100 text-blue-700 rounded-full">Google</span>
                                        </div>
                                        <span className="text-xs text-yellow-500 font-medium flex-shrink-0">{r.rating}★</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground">{r.relative_time_description}</p>
                                    </div>
                                  </div>
                                  <p className={`text-xs text-foreground ${!isExpanded && isTruncated ? 'line-clamp-2' : ''}`}>{r.text}</p>
                                  {isTruncated && (
                                    <button
                                      onClick={() => toggleReviewExpand(reviewId)}
                                      className="text-xs text-primary hover:underline mt-1 font-medium"
                                    >
                                      {isExpanded ? 'Show less' : 'Show more'}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                            {hasMoreReviews && (
                              <div className="mt-2 md:mt-3 p-2 md:p-2.5 bg-muted/50 rounded-lg">
                                <UpgradePrompt
                                  type="reviews"
                                  totalCount={totalReviews}
                                  compact
                                  buttonText="View More Reviews"
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Upgrade CTA for Reviews */}
                      {!isPaidUser && (
                        <div className="mt-6 p-4 bg-muted/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-foreground">See more reviews</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Upgrade to unlock all reviews and premium features</p>
                          </div>
                          <Link to="/pricing" className="shrink-0">
                            <Button size="sm" className="w-full sm:w-auto">Upgrade</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>


            </div>
          </div>
          </>
          )}
        </div>

        {/* ── More places like this — shown to everyone ──────────────────────────── */}
        <MoreLikethis
          currentId={id || ""}
          city={listing.city || ""}
          university={listing.university || ""}
          isPaidUser={isPaidUser}
        />

        {/* Photo Dialog — only rendered when signed in (signed-out users only see the primary image inline) */}
        <Dialog open={isSignedIn === true && photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
          <DialogContent className="max-w-2xl md:max-w-4xl w-[90vw] md:w-[95vw] p-2 md:p-4 rounded-2xl">
            <div>
              <div className="flex items-center justify-between mb-3 md:mb-4 px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPhoto(p => Math.max(0, p - 1))}
                  disabled={selectedPhoto === 0}
                  className="text-xs md:text-sm"
                >
                  ← Prev
                </Button>
                <p className="text-xs md:text-sm font-medium">{selectedPhoto + 1} / {photos?.length || 0}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPhoto(p => Math.min((photos?.length || 1) - 1, p + 1))}
                  disabled={photos && selectedPhoto >= photos.length - 1}
                  className="text-xs md:text-sm"
                >
                  Next →
                </Button>
              </div>
              <img loading="lazy" src={photos && photos[selectedPhoto]} alt={`Photo ${selectedPhoto+1}`} className="w-full h-[40vh] md:h-[65vh] object-contain rounded-xl" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ListingDetail;
