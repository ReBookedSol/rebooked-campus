import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import AccommodationCard from "@/components/AccommodationCard";
import Ad from "@/components/Ad";
import { AD_SLOTS } from "@/config/adSlots";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { useAccessControl } from "@/hooks/useAccessControl";
import { getUniversitiesWithTrainAccess } from "@/lib/gautrain";
import { buildListingUrl, deslugify, getUniversityFromSlug } from "@/lib/slugify";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";

const formatRand = (value?: number | null) => {
  if (typeof value !== "number") return "Contact";
  return `R${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;
};

const getStableOffset = (seed: string, scale: number) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return ((hash % 1000) / 1000 - 0.5) * scale;
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const ROADMAP_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ROADMAP_TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { citySlug, uniSlug } = useParams<{ citySlug?: string; uniSlug?: string }>();
  const { accessLevel } = useAccessControl();
  const isPaidUser = accessLevel === "paid";

  const location = citySlug && citySlug !== "all" ? deslugify(citySlug) : "";
  const university = uniSlug ? (getUniversityFromSlug(uniSlug) || deslugify(uniSlug)) : "";

  const province = searchParams.get("province") || "";
  const maxCost = searchParams.get("maxCost") || "";
  const minRating = parseFloat(searchParams.get("minRating") || "") || 0;
  const amenitiesParam = searchParams.get("amenities") || "";
  const amenities = amenitiesParam ? amenitiesParam.split(",").map((value) => value.trim()).filter(Boolean) : [];
  const nsfasParam = searchParams.get("nsfas") === "true";
  const nearTrainParam = searchParams.get("nearTrain") === "true";
  const radius = parseInt(searchParams.get("radius") || "5", 10);
  const selectedType = searchParams.get("type") || "All Types";
  const selectedGender = searchParams.get("gender") || "all";
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    latParam && lngParam ? { lat: parseFloat(latParam), lng: parseFloat(lngParam) } : null
  );
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Geocode location using Nominatim
  useEffect(() => {
    if (latParam && lngParam) {
      const pLat = parseFloat(latParam);
      const pLng = parseFloat(lngParam);
      if (!center || center.lat !== pLat || center.lng !== pLng) {
        setCenter({ lat: pLat, lng: pLng });
      }
      return;
    }

    const searchString = university || location;
    if (!searchString) {
      setCenter(null);
      return;
    }

    setIsGeocoding(true);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=za&limit=1&q=${encodeURIComponent(searchString + ", South Africa")}`)
      .then(res => res.json())
      .then((data: any[]) => {
        if (data && data.length > 0) {
          setCenter({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      })
      .catch(() => {})
      .finally(() => setIsGeocoding(false));
  }, [location, university, latParam, lngParam]);

  const locationDisplay = location;
  const universityDisplay = university;

  const seoTitle = universityDisplay && locationDisplay
    ? `${universityDisplay} Student Accommodation in ${locationDisplay} 2025`
    : universityDisplay
      ? `${universityDisplay} Student Accommodation 2025`
      : locationDisplay
        ? `Student Accommodation in ${locationDisplay} 2025`
        : "Browse NSFAS Accredited Student Accommodation South Africa";

  const seoDescription = universityDisplay
    ? `Find verified NSFAS-accredited student accommodation near ${universityDisplay}${locationDisplay ? ` in ${locationDisplay}` : ""}. Compare prices, amenities, and reviews from R1500/month.`
    : locationDisplay
      ? `Find verified NSFAS-accredited student accommodation in ${locationDisplay} 2025/2026. Compare prices, amenities, and reviews.`
      : "Find verified NSFAS-accredited student accommodation in South Africa 2025/2026. Compare prices, amenities, and reviews from R1500/month.";

  const canonicalPath = uniSlug && citySlug
    ? `/student-accommodation/${citySlug}/${uniSlug}`
    : citySlug
      ? `/student-accommodation/${citySlug}`
      : "/student-accommodation";

  useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: `NSFAS accommodation 2025, student accommodation ${locationDisplay || "South Africa"}, ${universityDisplay || "university"} student housing, university accredited accommodation`,
    canonical: canonicalPath,
  });

  const [sortBy] = React.useState("newest");
  const [isLargeScreen, setIsLargeScreen] = React.useState(window.innerWidth >= 1024);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hasActiveSearch = Boolean(
    location || university || province || maxCost || minRating > 0 || amenities.length > 0 ||
    nsfasParam || nearTrainParam || (selectedGender && selectedGender !== "all") ||
    (selectedType && selectedType !== "All Types") || radius !== 5 || (latParam && lngParam)
  );

  const itemsPerPage = isLargeScreen ? 30 : 15;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isLoading: isQueryLoading,
  } = useInfiniteQuery({
    queryKey: [
      "accommodations-infinite", citySlug, uniSlug, province, maxCost, nsfasParam, nearTrainParam,
      sortBy, minRating, amenitiesParam, selectedGender, selectedType, radius, center, isLargeScreen, hasActiveSearch,
    ],
    enabled: hasActiveSearch,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query: any = supabase.from("accommodations").select("*", { count: "exact" });

      if (center) {
        const latDelta = radius / 111;
        const lngDelta = radius / (111 * Math.cos(center.lat * Math.PI / 180));
        query = query
          .gte("latitude", center.lat - latDelta)
          .lte("latitude", center.lat + latDelta)
          .gte("longitude", center.lng - lngDelta)
          .lte("longitude", center.lng + lngDelta);
      } else if (location) {
        query = query.or(`property_name.ilike.%${location}%,city.ilike.%${location}%,province.ilike.%${location}%,address.ilike.%${location}%`);
      }

      if (university && !center) query = query.eq("university", university);
      if (maxCost) query = query.lte("monthly_cost", parseInt(maxCost, 10));
      if (nsfasParam) query = query.eq("nsfas_accredited", true);
      if (province) query = query.eq("province", province);
      if (minRating > 0) query = query.gte("rating", minRating);
      if (amenities.length > 0) query = query.contains("amenities", amenities);
      if (nearTrainParam) {
        const trainAccessUniversities = getUniversitiesWithTrainAccess();
        query = query.in("university", trainAccessUniversities);
      }
      if (selectedGender && selectedGender !== "all") {
        if (selectedGender === "Co-ed") {
          query = query.or("gender_policy.eq.Co-ed,gender_policy.eq.Mixed");
        } else {
          query = query.eq("gender_policy", selectedGender);
        }
      }
      if (selectedType && selectedType !== "All Types") query = query.eq("type", selectedType);

      if (sortBy === "price-low") {
        query = query.order("monthly_cost", { ascending: true }).order("created_at", { ascending: false });
      } else if (sortBy === "price-high") {
        query = query.order("monthly_cost", { ascending: false }).order("created_at", { ascending: false });
      } else if (sortBy === "rating") {
        query = query.order("rating", { ascending: false }).order("created_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error, count } = await query.range(from, to);
      if (error) throw error;

      let filteredData = data;
      if (center) {
        filteredData = data.filter((item: any) => {
          if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
            return getDistance(center.lat, center.lng, item.latitude, item.longitude) <= radius;
          }
          return false;
        });
      }

      return { data: filteredData, count: count ?? 0, nextPage: data.length === itemsPerPage ? pageParam + 1 : undefined };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const isLoading = isQueryLoading || isGeocoding;

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchNextPage(); },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const accommodations = useMemo(() => {
    return infiniteData?.pages.flatMap((page) => page.data) || [];
  }, [infiniteData]);

  const currentBrowsePath = `${window.location.pathname}${window.location.search}`;

  const listingRows = useMemo(() => {
    return accommodations.flatMap((accommodation: any, index: number) => {
      const rows = [
        <div
          key={accommodation.id}
          onMouseEnter={() => setSelectedListingId(accommodation.id)}
          onMouseLeave={() => setSelectedListingId((current) => (current === accommodation.id ? null : current))}
        >
          <AccommodationCard
            id={accommodation.id}
            propertyName={accommodation.property_name}
            type={accommodation.type}
            university={accommodation.university || ""}
            address={accommodation.address}
            city={accommodation.city || ""}
            monthlyCost={accommodation.monthly_cost || 0}
            rating={accommodation.rating || 0}
            nsfasAccredited={accommodation.nsfas_accredited || false}
            genderPolicy={accommodation.gender_policy || ""}
            website={accommodation.website || null}
            amenities={accommodation.amenities || []}
            imageUrls={accommodation.image_urls || []}
            latitude={accommodation.latitude}
            longitude={accommodation.longitude}
            isLandlordListing={accommodation.is_landlord_listing || false}
            distanceFromUniversityKm={accommodation.distance_from_university_km}
            roomsAvailable={accommodation.rooms_available}
            certifiedUniversities={accommodation.certified_universities}
            variant="browse-sidebar"
            isActive={selectedListingId === accommodation.id}
            returnPath={currentBrowsePath}
          />
        </div>,
      ];

      const isEveryFourth = (index + 1) % 4 === 0;
      const isEndUnderFour = index === accommodations.length - 1 && accommodations.length > 0 && accommodations.length < 4;

      if (isEveryFourth || isEndUnderFour) {
        rows.push(
          <div key={`ad-${accommodation.id}-${index}`} className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4 md:p-6 overflow-hidden">
            <Ad density="compact" adSlot={AD_SLOTS.browseFeed} isPaidUser={isPaidUser} className="my-0" />
          </div>
        );
      }

      return rows;
    });
  }, [accommodations, currentBrowsePath, selectedListingId]);

  const sidebarTitle = hasActiveSearch
    ? `Student Accommodation in ${location || citySlug || university || "South Africa"}`
    : "Find student accommodation";

  const totalFound = infiniteData?.pages[0]?.count || 0;
  const sidebarSubtitle = hasActiveSearch
    ? `${totalFound} places found`
    : "Search by suburb, university, city or apply filters to see listings.";

  return (
    <Layout showFooter={false} fixedHeight={true}>
      <div className="flex h-full overflow-hidden bg-white">
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Scrollable */}
          <div className="flex h-full w-full flex-col border-r bg-white md:w-[48%] lg:w-[44%]">
            <div className="z-20 p-4">
              <SearchBar compact />
            </div>
            
            <div className="px-6 pb-0 pt-6">
              <h1 className="mb-1 text-xl font-bold text-slate-900">{sidebarTitle}</h1>
              <p className="mb-4 text-sm text-slate-500">{sidebarSubtitle}</p>
            </div>

            <ScrollArea className="flex-1">
              <div className="px-4 md:px-6 pb-12 pt-4" data-listings-container>
                {isLoading ? (
                  <div className="space-y-5">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="h-52 animate-pulse rounded-[28px] bg-slate-50" />
                    ))}
                  </div>
                ) : !hasActiveSearch ? (
                  <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center">
                    <p className="text-base font-semibold text-slate-700">Start with a suburb, university or filter.</p>
                    <p className="mt-2 text-sm text-slate-500">We will only show accommodation once a search or filter has been applied.</p>
                  </div>
                ) : accommodations.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 gap-5">{listingRows}</div>
                    
                    {hasNextPage && (
                      <div ref={loadMoreRef} className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-20 text-center">
                    <p className="font-medium text-slate-400">No listings found for this search.</p>
                    <Button variant="link" onClick={() => navigate("/student-accommodation")} className="mt-2 text-primary font-bold">
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Area - Fixed Map */}
          <div className="relative hidden h-full flex-1 bg-slate-100 md:block">
            <BrowseMap listings={accommodations} activeListingId={selectedListingId} center={center} />
          </div>
        </div>
      </div>
    </Layout>
  );
};


const MapController = ({ center, listings }: { center: { lat: number; lng: number } | null, listings: any[] }) => {
  const map = useMap();

  useEffect(() => {
    const resizeTimers = [120, 420].map((delay) =>
      window.setTimeout(() => {
        map.invalidateSize();
      }, delay)
    );

    if (center) {
      map.setView([center.lat, center.lng], 13);
    } else if (listings.length > 0) {
      const coords = listings
        .filter(l => typeof l.latitude === 'number' && typeof l.longitude === 'number')
        .map(l => [l.latitude, l.longitude] as L.LatLngExpression);
      
      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    return () => {
      resizeTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [map, center, listings]);

  return null;
};

const BrowseMap = ({ listings, activeListingId, center }: { listings: any[]; activeListingId: string | null, center: { lat: number; lng: number } | null }) => {
  const mapCenter = useMemo(() => center || { lat: -26.2041, lng: 28.0473 }, [center]);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={12}
        zoomControl={false}
        className="h-full w-full z-10"
      >
        <TileLayer
          url={ROADMAP_TILE_URL}
          attribution={ROADMAP_TILE_ATTRIBUTION}
        />
        
        <ZoomControl position="topright" />
        
        <MapController center={center} listings={listings} />

        {listings.map((listing, index) => {
          const lat = typeof listing.latitude === "number"
            ? listing.latitude
            : (center?.lat || -26.2041) + getStableOffset(`${listing.id || index}-lat`, 0.04);
          const lng = typeof listing.longitude === "number"
            ? listing.longitude
            : (center?.lng || 28.0473) + getStableOffset(`${listing.id || index}-lng`, 0.04);
            
          const price = formatRand(listing.monthly_cost);
          const isActive = activeListingId === listing.id;

          const customIcon = L.divIcon({
            className: "",
            html: `<div style="position:absolute;left:50%;top:100%;transform:translate(-50%,-100%);white-space:nowrap;pointer-events:auto;z-index:${isActive ? 1000 : 10}">
              <div style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:9999px;font-size:11px;font-weight:700;line-height:1;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:1px solid ${isActive ? 'hsl(var(--primary))' : '#e2e8f0'};background:${isActive ? 'hsl(var(--primary))' : '#fff'};color:${isActive ? '#fff' : '#1e293b'}">
                ${price}
              </div>
              <div style="width:0;height:0;margin:0 auto;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid ${isActive ? 'hsl(var(--primary))' : '#fff'}"></div>
            </div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });

          return (
            <Marker 
              key={`${listing.id}-${index}`} 
              position={[lat, lng]} 
              icon={customIcon}
              eventHandlers={{
                click: (e) => { e.target.openPopup(); }
              }}
            >
              <Popup maxWidth={320} className="custom-leaflet-premium-popup">
                <div className="w-[300px] scale-[0.85] origin-top -mt-2">
                  <AccommodationCard
                    id={listing.id}
                    propertyName={listing.property_name}
                    type={listing.type}
                    university={listing.university || ""}
                    address={listing.address}
                    city={listing.city || ""}
                    monthlyCost={listing.monthly_cost || 0}
                    rating={listing.rating || 0}
                    nsfasAccredited={listing.nsfas_accredited || false}
                    genderPolicy={listing.gender_policy || ""}
                    website={listing.website || null}
                    amenities={listing.amenities || []}
                    imageUrls={listing.image_urls || []}
                    isLandlordListing={listing.is_landlord_listing || false}
                    distanceFromUniversityKm={listing.distance_from_university_km}
                    roomsAvailable={listing.rooms_available}
                    certifiedUniversities={listing.certified_universities}
                    variant="default"
                  />
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Browse;
