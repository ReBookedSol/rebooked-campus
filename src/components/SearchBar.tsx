import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Search, MapPin, GraduationCap, DollarSign, CheckCircle, ChevronsUpDown, SlidersHorizontal, Train } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAnalyticsTracking } from "@/hooks/useAnalyticsTracking";
import { supabase } from "@/integrations/supabase/client";
import { deslugify, getUniversityFromSlug, getUniversitySlug, slugify } from "@/lib/slugify";

const SA_UNIVERSITIES = [
  "All Universities",
  "University of Cape Town",
  "University of the Witwatersrand",
  "University of Johannesburg",
  "University of Pretoria",
  "Stellenbosch University",
  "University of KwaZulu-Natal",
  "Rhodes University",
  "North-West University",
  "Tshwane University of Technology",
  "Cape Peninsula University of Technology",
  "Durban University of Technology",
  "University of the Western Cape",
  "University of Fort Hare",
  "University of the Free State",
  "University of Zululand",
  "Walter Sisulu University",
  "Nelson Mandela University",
  "Mangosuthu University of Technology",
  "Sol Plaatje University",
  "University of South Africa (UNISA)",
  "Central University of Technology",
  "Vaal University of Technology",
  "University of Limpopo",
  "University of Mpumalanga",
  "Sefako Makgatho Health Sciences University",
];

const SA_PROVINCES = [
  "All Provinces",
  "Western Cape",
  "Eastern Cape",
  "Northern Cape",
  "Free State",
  "KwaZulu-Natal",
  "North West",
  "Gauteng",
  "Mpumalanga",
  "Limpopo",
];

const AMENITIES = [
  "WiFi/Internet",
  "Laundry Facilities",
  "Study Room",
  "Parking",
  "24/7 Security",
  "CCTV Surveillance",
  "Kitchen Facilities",
  "Furnished",
  "Gym/Fitness Center",
  "Swimming Pool",
  "Cleaning Services",
  "Air Conditioning",
  "Heating",
  "Hot Water",
  "Electricity Included",
  "Water Included",
  "Common Area/Lounge",
  "Garden/Outdoor Space",
  "Bike Storage",
  "Pet Friendly",
  "Wheelchair Access",
  "Fire Safety Equipment",
  "Medical Facilities Nearby",
  "Public Transport Access",
];

const formatCurrencyLabel = (value: string) => {
  const numericValue = parseInt(value || "0", 10) || 0;
  return `R ${numericValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;
};

const SUPABASE_FUNCTIONS_BASE_URL = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) || "https://gzihagvdpdjcoyjpvyvs.supabase.co").replace(/\/$/, "");
const SUPABASE_FUNCTIONS_API_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "";

// Google places autocomplete retired

const SearchBar = ({ compact = false }) => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [searchParams] = useSearchParams();
  const { citySlug, uniSlug } = useParams<{ citySlug?: string; uniSlug?: string }>();
  const { trackSearch } = useAnalyticsTracking();

  const [searchLocation, setSearchLocation] = useState("");
  const [university, setUniversity] = useState("All Universities");
  const [province, setProvince] = useState("All Provinces");
  const [maxCost, setMaxCost] = useState("");
  const [minRating, setMinRating] = useState<number>(0);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [nsfasOnly, setNsfasOnly] = useState(false);
  const [nearTrain, setNearTrain] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [radius, setRadius] = useState(5);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [accommodationType, setAccommodationType] = useState("All Types");
  const [genderPolicy, setGenderPolicy] = useState("all");
  const [lat, setLat] = useState<string | null>(null);
  const [lng, setLng] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const compactInputRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [nominatimResults, setNominatimResults] = useState<any[]>([]);
  const [isSearchingNominatim, setIsSearchingNominatim] = useState(false);

  const performNominatimSearch = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setNominatimResults([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearchingNominatim(true);
    setShowSuggestions(true);
    setNominatimResults([]);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=za`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setNominatimResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Nominatim search error:", err);
      setNominatimResults([]);
    } finally {
      setIsSearchingNominatim(false);
    }
  };

  const handleLocationChange = (value: string) => {
    setSearchLocation(value);
    setLat(null);
    setLng(null);
    setShowSuggestions(false);
    setNominatimResults([]);
  };

  const handleSuggestionSelect = (result: any) => {
    const displayName = result.display_name;
    const parts = displayName.split(",");
    const shortName = parts.slice(0, 3).map((p: string) => p.trim()).join(", ");

    setSearchLocation(shortName || displayName);
    setLat(result.lat);
    setLng(result.lon);
    setShowSuggestions(false);
    setNominatimResults([]);

    handleSearch({
      overrideLocation: shortName || displayName,
      overrideLat: result.lat,
      overrideLng: result.lon
    });
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const nextLocation = citySlug && citySlug !== "all" ? deslugify(citySlug) : "";
    const nextUniversity = uniSlug
      ? getUniversityFromSlug(uniSlug) || deslugify(uniSlug)
      : "All Universities";
    const nextProvince = searchParams.get("province") || "All Provinces";
    const nextMaxCost = searchParams.get("maxCost") || "";
    const nextMinRating = parseFloat(searchParams.get("minRating") || "0") || 0;
    const nextAmenities = (searchParams.get("amenities") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    setSearchLocation(nextLocation);
    setUniversity(nextUniversity);
    setProvince(nextProvince);
    setMaxCost(nextMaxCost);
    setMinRating(nextMinRating);
    setAmenities(nextAmenities);
    setNsfasOnly(searchParams.get("nsfas") === "true");
    setNearTrain(searchParams.get("nearTrain") === "true");
    setRadius(parseInt(searchParams.get("radius") || "5", 10));
    setAccommodationType(searchParams.get("type") || "All Types");
    setGenderPolicy(searchParams.get("gender") || "all");
    setLat(searchParams.get("lat"));
    setLng(searchParams.get("lng"));
  }, [citySlug, uniSlug, routerLocation.pathname, routerLocation.search, searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (filterRef.current && filterRef.current.contains(target)) return;
      const isPortalClick = target.closest('[data-radix-portal]') || 
                            target.closest('[data-radix-popper-content-wrapper]') ||
                            target.closest('.radix-select-content') ||
                            target.closest('[role="listbox"]');
      if (isPortalClick) return;
      setShowAdvanced(false);
    };

    if (showAdvanced) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAdvanced]);

  const handleSearch = (opts?: { overrideLocation?: string; overrideLat?: string | null; overrideLng?: string | null }) => {
    setShowSuggestions(false);

    const effectiveLocation = opts?.overrideLocation !== undefined ? opts.overrideLocation : searchLocation;
    const effectiveLat = opts?.overrideLat !== undefined ? opts.overrideLat : lat;
    const effectiveLng = opts?.overrideLng !== undefined ? opts.overrideLng : lng;

    if (effectiveLocation && !effectiveLat && !effectiveLng && opts?.overrideLat === undefined) {
      performNominatimSearch(effectiveLocation);
      return;
    }

    const pathParts = ["/student-accommodation"];
    const citySlugValue = effectiveLocation ? slugify(effectiveLocation) : "";
    const uniSlugValue = university !== "All Universities" ? getUniversitySlug(university) : "";

    if (citySlugValue) pathParts.push(citySlugValue);
    if (uniSlugValue) {
      if (!citySlugValue) pathParts.push("all");
      pathParts.push(uniSlugValue);
    }

    const params = new URLSearchParams();
    if (province && province !== "All Provinces") params.set("province", province);
    if (maxCost && parseInt(maxCost, 10) > 0) params.set("maxCost", maxCost);
    if (nsfasOnly) params.set("nsfas", "true");
    if (nearTrain) params.set("nearTrain", "true");
    if (minRating > 0) params.set("minRating", String(minRating));
    if (amenities.length > 0) params.set("amenities", amenities.join(","));
    if (radius !== 5) params.set("radius", String(radius));
    if (effectiveLat) params.set("lat", effectiveLat);
    if (effectiveLng) params.set("lng", effectiveLng);
    if (accommodationType !== "All Types") params.set("type", accommodationType);
    if (genderPolicy !== "all") params.set("gender", genderPolicy);

    trackSearch({
      searchQuery: effectiveLocation || undefined,
      university: university !== "All Universities" ? university : undefined,
      province: province !== "All Provinces" ? province : undefined,
      maxPrice: maxCost ? parseInt(maxCost, 10) : undefined,
      usedGenderFilter: genderPolicy !== "all",
      genderFilterValue: genderPolicy !== "all" ? genderPolicy : undefined,
      usedAmenitiesFilter: amenities.length > 0,
      usedPriceFilter: !!maxCost && parseInt(maxCost, 10) > 0,
      amenitiesFilterValues: amenities.length > 0 ? amenities : undefined,
    });

    const basePath = pathParts.join("/");
    const queryString = params.toString();
    navigate(queryString ? `${basePath}?${queryString}` : basePath);

    setTimeout(() => {
      const firstListing = document.querySelector("[data-listings-container]");
      if (firstListing) {
        firstListing.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
  };

  const handleClearFilters = () => {
    setSearchLocation("");
    setUniversity("All Universities");
    setProvince("All Provinces");
    setMaxCost("");
    setMinRating(0);
    setAmenities([]);
    setNsfasOnly(false);
    setNearTrain(false);
    setRadius(5);
    setAccommodationType("All Types");
    setGenderPolicy("all");
    setShowSuggestions(false);
    setNominatimResults([]);
    navigate("/student-accommodation");
  };

  const hasActiveFilters =
    !!searchLocation ||
    university !== "All Universities" ||
    province !== "All Provinces" ||
    !!maxCost ||
    minRating > 0 ||
    amenities.length > 0 ||
    nsfasOnly ||
    nearTrain ||
    accommodationType !== "All Types" ||
    genderPolicy !== "all";

  const toggleAmenity = (amenity: string, checked: boolean) => {
    if (checked) {
      setAmenities((prev) => (prev.includes(amenity) ? prev : [...prev, amenity]));
      return;
    }
    setAmenities((prev) => prev.filter((value) => value !== amenity));
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  // Suggestions dropdown component
  const SuggestionsDropdown = () => {
    if (!showSuggestions) return null;
    if (isSearchingNominatim) {
      return (
        <div ref={suggestionsRef} className="absolute left-0 right-0 top-full z-[200] mt-1 overflow-hidden rounded-xl border border-border bg-background p-4 text-center text-xs text-muted-foreground shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Searching South African addresses…</span>
          </div>
        </div>
      );
    }
    if (nominatimResults.length === 0) return null;

    return (
      <div ref={suggestionsRef} className="absolute left-0 right-0 top-full z-[200] mt-1 overflow-hidden rounded-xl border border-border bg-background shadow-lg max-h-[300px] overflow-y-auto">
        {nominatimResults.map((s) => {
          const parts = s.display_name.split(",");
          const mainText = parts[0];
          const secondaryText = parts.slice(1).join(",").trim();
          return (
            <button
              key={s.place_id}
              type="button"
              className="block w-full cursor-pointer px-4 py-3.5 text-left text-sm hover:bg-muted/60 active:bg-muted first:rounded-t-xl last:rounded-b-xl border-b border-border/40 last:border-b-0 transition-colors"
              onMouseDown={(e) => { e.preventDefault(); handleSuggestionSelect(s); }}
              onTouchStart={(e) => { e.preventDefault(); handleSuggestionSelect(s); }}
            >
              <MapPin className="mr-2 inline h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-semibold text-foreground">{mainText}</span>
              {secondaryText && <span className="ml-1.5 text-xs text-muted-foreground">{secondaryText}</span>}
            </button>
          );
        })}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="group relative" ref={filterRef}>
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/80 p-1.5 shadow-2xl backdrop-blur-xl transition-all hover:bg-white/95 ring-1 ring-black/5">
          <div className="flex flex-1 items-center gap-3 pl-4">
            <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <div className="relative flex-1">
              <Input
                ref={compactInputRef}
                placeholder="Type your address..."
                value={searchLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                onFocus={() => {
                  if (nominatimResults.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={handleInputKeyDown}
                className="h-8 border-none bg-transparent px-0 text-sm font-medium shadow-none focus-visible:ring-0 placeholder:text-slate-400"
              />
              <SuggestionsDropdown />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`h-9 w-9 rounded-full p-0 transition-all ${showAdvanced ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-100 hover:text-primary"}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>

          <Button onClick={() => handleSearch()} className="h-9 rounded-full bg-primary px-6 text-xs font-bold shadow-md shadow-primary/10 transition-all hover:bg-primary/95 active:scale-95">
            Search
          </Button>
        </div>

        <div className={`absolute left-0 right-0 top-full z-[100] origin-top overflow-hidden px-2 pb-6 transition-all duration-300 ease-in-out ${showAdvanced ? "max-h-[850px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="mt-2 space-y-5 rounded-3xl border border-slate-100/50 bg-white p-5 shadow-lg ring-1 ring-black/5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Province</p>
                 <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger className="h-9 rounded-xl border-slate-200 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    {SA_PROVINCES.map((item) => (
                      <SelectItem key={item} value={item} className="text-xs">{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">University</p>
                <Select value={university} onValueChange={setUniversity}>
                  <SelectTrigger className="h-9 rounded-xl border-slate-200 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] rounded-xl border-slate-200">
                    {SA_UNIVERSITIES.map((uni) => (
                      <SelectItem key={uni} value={uni} className="text-xs">{uni}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</p>
                <Select value={accommodationType} onValueChange={setAccommodationType}>
                  <SelectTrigger className="h-9 rounded-xl border-slate-200 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="All Types" className="text-xs">All Types</SelectItem>
                    <SelectItem value="Apartment" className="text-xs">Apartment</SelectItem>
                    <SelectItem value="Studio" className="text-xs">Studio</SelectItem>
                    <SelectItem value="Room" className="text-xs">Single Room</SelectItem>
                    <SelectItem value="Sharing Room" className="text-xs">Sharing Room</SelectItem>
                    <SelectItem value="Purpose-Built Res" className="text-xs">Purpose-Built Res</SelectItem>
                    <SelectItem value="Cottage" className="text-xs">Cottage</SelectItem>
                    <SelectItem value="Communal" className="text-xs">Communal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gender</p>
                <Select value={genderPolicy} onValueChange={setGenderPolicy}>
                  <SelectTrigger className="h-9 rounded-xl border-slate-200 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="all" className="text-xs">Any Gender</SelectItem>
                    <SelectItem value="Male Only" className="text-xs">Male Only</SelectItem>
                    <SelectItem value="Female Only" className="text-xs">Female Only</SelectItem>
                    <SelectItem value="Co-ed" className="text-xs">Co-ed (Mixed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Max Monthly Cost</p>
                <span className="text-[10px] font-bold text-primary">{formatCurrencyLabel(maxCost)}</span>
              </div>
              <Slider
                value={[parseInt(maxCost || "0", 10) || 0]}
                onValueChange={(v) => setMaxCost(String(v[0]))}
                max={10000}
                step={100}
                className="py-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-50 bg-slate-50/50 p-2.5">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-700">NSFAS Only</p>
                </div>
                <Checkbox id="comp-nsfas" checked={nsfasOnly} onCheckedChange={(c) => setNsfasOnly(c === true)} />
              </div>
              
              <div className="flex items-center justify-between rounded-xl border border-slate-50 bg-slate-50/50 p-2.5">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-700">Near Train</p>
                </div>
                <Checkbox id="comp-train" checked={nearTrain} onCheckedChange={(c) => setNearTrain(c === true)} />
              </div>
            </div>

            <div className="space-y-2">
               <div className="flex items-center justify-between">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Search Radius</p>
                 <span className="text-[10px] font-bold text-primary">{radius} km</span>
               </div>
               <Slider
                 value={[radius]}
                 onValueChange={(v) => setRadius(v[0])}
                 max={50}
                 min={1}
                 step={1}
                 className="py-1"
               />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Amenities</p>
              <Popover open={amenitiesOpen} onOpenChange={setAmenitiesOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between rounded-xl border-slate-200 text-xs">
                    {amenities.length > 0 ? `${amenities.length} selected` : "Select amenities"}
                    <ChevronsUpDown className="ml-2 h-3 w-3 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="start">
                  <ScrollArea className="h-[250px] w-full">
                    <div className="space-y-2 p-3">
                      {AMENITIES.map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox
                            id={`amenity-compact-${amenity}`}
                            checked={amenities.includes(amenity)}
                            onCheckedChange={(checked) => toggleAmenity(amenity, checked === true)}
                          />
                          <label htmlFor={`amenity-compact-${amenity}`} className="flex-1 cursor-pointer text-[11px] font-medium">
                            {amenity}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleSearch()} className="flex-1 rounded-xl bg-primary py-4 text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/95">
                Apply Filters
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClearFilters} className="rounded-xl border-slate-200 px-4 text-xs font-bold text-slate-500">
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-lg">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end">
        <div className="min-w-0 flex-1 space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-primary" />
            Search
          </label>
          <div className="relative">
            <Input
              ref={inputRef}
              placeholder="Type your address..."
              value={searchLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              onFocus={() => {
                if (nominatimResults.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onKeyDown={handleInputKeyDown}
              className="h-10 !border-none !ring-0 focus-visible:!ring-0 shadow-none bg-white/50"
            />
            <SuggestionsDropdown />
          </div>
        </div>

        <div className="flex flex-shrink-0 flex-wrap items-end gap-2 sm:flex-nowrap">
          <Button onClick={() => setShowAdvanced((value) => !value)} variant="outline" className="h-10 flex-shrink-0 px-3 text-sm sm:px-4">
            {showAdvanced ? "Hide Filters" : "Filters"}
          </Button>

          <Button
            onClick={handleClearFilters}
            variant={hasActiveFilters ? "default" : "ghost"}
            className={`h-10 flex-shrink-0 px-3 text-sm sm:px-4 rounded-xl ${
              hasActiveFilters
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Clear All
          </Button>

          <Button onClick={() => handleSearch()} className="h-10 flex-shrink-0 bg-primary px-4 text-sm hover:bg-primary-hover sm:px-6 rounded-xl">
            <Search className="mr-1 h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Search Now</span>
            <span className="sm:hidden">Go</span>
          </Button>
        </div>
      </div>

      <div className={`origin-top overflow-y-auto transition-all duration-300 ${showAdvanced ? "max-h-[600px] scale-y-100 opacity-100" : "max-h-0 scale-y-0 opacity-0"}`}>
        <div className="mt-4 grid grid-cols-1 gap-4 pb-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <GraduationCap className="h-4 w-4 text-primary" />
              University
            </label>
            <Select value={university} onValueChange={setUniversity}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {SA_UNIVERSITIES.map((uni) => (
                  <SelectItem key={uni} value={uni}>
                    {uni}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4 text-primary" />
              Max Monthly Cost (ZAR)
            </label>
            <div className="px-2">
              <Slider
                value={[parseInt(maxCost || "0", 10) || 0]}
                onValueChange={(value) => setMaxCost(String(value[0]))}
                max={10000}
                step={100}
              />
              <div className="mt-2 text-xs text-muted-foreground">Up to {formatCurrencyLabel(maxCost)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Province</label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {SA_PROVINCES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Min Rating</label>
            <Select value={String(minRating)} onValueChange={(value) => setMinRating(parseFloat(value))}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="3">3.0+</SelectItem>
                <SelectItem value="4">4.0+</SelectItem>
                <SelectItem value="4.5">4.5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Accommodation Type</label>
            <Select value={accommodationType} onValueChange={setAccommodationType}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Studio">Studio</SelectItem>
                <SelectItem value="Room">Single Room</SelectItem>
                <SelectItem value="Sharing Room">Sharing Room</SelectItem>
                <SelectItem value="Cottage">Cottage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Gender Policy</label>
            <Select value={genderPolicy} onValueChange={setGenderPolicy}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Gender</SelectItem>
                <SelectItem value="Male Only">Male Only</SelectItem>
                <SelectItem value="Female Only">Female Only</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amenities</label>
            <Popover open={amenitiesOpen} onOpenChange={setAmenitiesOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={amenitiesOpen} className="w-full justify-between text-left font-normal rounded-xl">
                  {amenities.length > 0 ? `${amenities.length} selected` : "Select amenities"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 pointer-events-auto rounded-2xl shadow-2xl border-slate-100" align="start">
                <ScrollArea className="h-[300px] w-full">
                  <div className="space-y-2 p-4">
                    {AMENITIES.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={`amenity-${amenity}`}
                          checked={amenities.includes(amenity)}
                          onCheckedChange={(checked) => toggleAmenity(amenity, checked === true)}
                        />
                        <label htmlFor={`amenity-${amenity}`} className="flex-1 cursor-pointer text-sm">
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

            <div className="flex flex-col gap-4 space-y-2 md:col-span-2 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Search Radius ({radius} km)</label>
                </div>
                <Slider
                  value={[radius]}
                  onValueChange={(v) => setRadius(v[0])}
                  max={50}
                  min={1}
                  step={1}
                  className="py-1"
                />
              </div>

              <div className="flex items-center space-x-2 pb-1">
                <Checkbox id="nsfas" checked={nsfasOnly} onCheckedChange={(checked) => setNsfasOnly(checked === true)} />
                <label htmlFor="nsfas" className="flex items-center gap-2 text-sm font-medium leading-none">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  NSFAS accredited
                </label>
              </div>

              <div className="flex items-center space-x-2 pb-1">
                <Checkbox id="nearTrain" checked={nearTrain} onCheckedChange={(checked) => setNearTrain(checked === true)} />
                <label htmlFor="nearTrain" className="flex items-center gap-2 text-sm font-medium leading-none">
                  <Train className="h-4 w-4 text-primary" />
                  Near Train
                </label>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
