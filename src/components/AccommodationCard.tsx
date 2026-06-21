import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Car,
  Dumbbell,
  GraduationCap,
  Heart,
  MapPin,
  ShieldCheck,
  Share,
  Sofa,
  Star,
  Train,
  Users,
  UtensilsCrossed,
  Wifi,
  Zap,
  Droplets,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAccessControl } from "@/hooks/useAccessControl";
import { isGautrainAccessible } from "@/lib/gautrain";
import { ShareListingPopup } from "@/components/ShareListingPopup";
import { buildListingUrl } from "@/lib/slugify";
import { Card, CardContent } from "@/components/ui/card";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { getAddressImageUrl } from "@/lib/addressImage";

interface AccommodationCardProps {
  id: string;
  propertyName: string;
  type: string;
  university: string;
  address: string;
  city: string;
  monthlyCost?: number | null;
  rating: number;
  nsfasAccredited: boolean;
  genderPolicy: string;
  website?: string | null;
  amenities?: string[];
  imageUrls?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  isLandlordListing?: boolean;
  distanceFromUniversityKm?: number | null;
  roomsAvailable?: number | null;
  certifiedUniversities?: string[] | null;
  variant?: "default" | "browse-sidebar";
  isActive?: boolean;
  returnPath?: string;
}

const formatRand = (value?: number | null) => {
  if (typeof value !== "number") return "Contact";
  return `R${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;
};

const getAmenityDisplay = (amenity: string) => {
  const normalizedAmenity = amenity.toLowerCase();

  if (normalizedAmenity.includes("wifi") || normalizedAmenity.includes("internet")) {
    return { icon: Wifi, label: "WiFi" };
  }

  if (normalizedAmenity.includes("security") || normalizedAmenity.includes("cctv")) {
    return { icon: ShieldCheck, label: "Security" };
  }

  if (normalizedAmenity.includes("parking")) {
    return { icon: Car, label: "Parking" };
  }

  if (normalizedAmenity.includes("study")) {
    return { icon: BookOpen, label: "Study" };
  }

  if (normalizedAmenity.includes("kitchen")) {
    return { icon: UtensilsCrossed, label: "Kitchen" };
  }

  if (normalizedAmenity.includes("water")) {
    return { icon: Droplets, label: "Water" };
  }

  if (normalizedAmenity.includes("electricity")) {
    return { icon: Zap, label: "Electricity" };
  }

  if (normalizedAmenity.includes("furnished") || normalizedAmenity.includes("lounge")) {
    return { icon: Sofa, label: "Furnished" };
  }

  if (normalizedAmenity.includes("gym") || normalizedAmenity.includes("fitness")) {
    return { icon: Dumbbell, label: "Gym" };
  }

  return { icon: GraduationCap, label: amenity };
};

const AccommodationCard = ({
  id,
  propertyName,
  type,
  university,
  address,
  city,
  monthlyCost,
  rating,
  nsfasAccredited,
  genderPolicy,
  website,
  amenities = [],
  imageUrls = [],
  latitude,
  longitude,
  isLandlordListing = false,
  distanceFromUniversityKm,
  roomsAvailable,
  certifiedUniversities,
  variant = "default",
  isActive = false,
  returnPath,
}: AccommodationCardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { accessLevel } = useAccessControl();
  const isPaidUser = accessLevel === "paid";
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [showPremiumBorderAnimation, setShowPremiumBorderAnimation] = useState(false);

  const listingUrl = buildListingUrl(city, university, propertyName, id);
  const browseReturnPath = returnPath || `${location.pathname}${location.search}`;
  const listingDestination = returnPath ? `${listingUrl}?return=${encodeURIComponent(browseReturnPath)}` : listingUrl;
  const fullShareUrl = `${window.location.origin}${listingUrl}`;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSignedIn(!!session?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isPaidUser && sessionStorage.getItem("justPaid") === "true") {
      setShowPremiumBorderAnimation(true);
      const timer = setTimeout(() => {
        setShowPremiumBorderAnimation(false);
        sessionStorage.removeItem("justPaid");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isPaidUser]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;
      const { data, error } = await supabase.from("favorites").select("*").eq("user_id", userId).eq("accommodation_id", id).maybeSingle();
      if (!mounted) return;
      if (error) return;
      setIsSaved(!!data);
    })();
    return () => { mounted = false; };
  }, [id]);

  const toggleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) {
      navigate("/auth");
      return;
    }

    setAnimating(true);
    const previousValue = isSaved;
    setIsSaved(!previousValue);
    setLoading(true);
    try {
      if (!previousValue) {
        const { error } = await supabase.from("favorites").insert({ user_id: userId, accommodation_id: id });
        if (error) throw error;
        toast({ title: "Saved", description: "Added to your saved properties" });
      } else {
        const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("accommodation_id", id);
        if (error) throw error;
        toast({ title: "Removed", description: "Removed from your saved properties" });
      }
    } catch (err: any) {
      setIsSaved(previousValue);
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
      setTimeout(() => setAnimating(false), 350);
    }
  };

  const handleImgError = () => (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = "/placeholder.svg";
  };

  const mapboxImageUrl = useMemo(
    () => getAddressImageUrl(address, { latitude, longitude }) || "/placeholder.svg",
    [address, latitude, longitude]
  );

  const cardImages = useMemo(() => {
    if (imageUrls && imageUrls.length > 0) {
      return imageUrls;
    }
    return [mapboxImageUrl];
  }, [mapboxImageUrl, imageUrls]);

  const thumb = cardImages[0] || "/placeholder.svg";

  const navigationState = useMemo(() => ({
    images: cardImages,
    returnPath: browseReturnPath,
  }), [browseReturnPath, cardImages]);

  const handleOpenListing = () => {
    navigate(listingDestination, { state: navigationState });
  };

  const amenityPills = amenities.slice(0, variant === "browse-sidebar" ? 4 : 3).map((amenity) => ({
    amenity,
    ...getAmenityDisplay(amenity),
  }));

  if (variant === "browse-sidebar") {
    return (
      <div className="group block h-full">
        <Card
          onClick={handleOpenListing}
          className={`overflow-hidden rounded-[28px] border bg-white transition-all duration-300 cursor-pointer active:scale-[0.99] ${
            isActive
              ? "border-primary/30 shadow-xl ring-2 ring-primary/10"
              : "border-slate-200 shadow-sm hover:border-primary/20 hover:shadow-lg"
          } ${showPremiumBorderAnimation ? "ring-2 ring-primary animate-pulse" : isPaidUser ? "ring-1 ring-yellow-400/40" : ""}`}
        >
          <div className="flex min-h-[190px] flex-col sm:flex-row">
            <div className="relative h-72 w-full overflow-hidden bg-slate-100 sm:h-auto sm:w-[34%] sm:min-w-[180px]">
              <ImageWithSkeleton
                src={thumb}
                alt={propertyName}
                className="transition-transform duration-500 group-hover:scale-105"
                onError={handleImgError()}
              />

              <div className="absolute left-3 top-3 flex flex-col gap-2">
                {nsfasAccredited && (
                  <Badge className="rounded-full border-0 bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary shadow-sm hover:bg-white">
                    NSFAS
                  </Badge>
                )}
                {isLandlordListing && (
                  <Badge className="rounded-full border-0 bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm hover:bg-primary">
                    Direct landlord
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      {type}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span>{(rating || 0).toFixed(1)}</span>
                    </div>
                  </div>

                  <h3 className="line-clamp-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">
                    {propertyName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {city}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                      <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                      <span className="max-w-[180px] truncate">{university}</span>
                    </span>
                    {isGautrainAccessible(university) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <Train className="h-3.5 w-3.5" />
                        Gautrain
                      </span>
                    )}
                    {distanceFromUniversityKm !== null && distanceFromUniversityKm !== undefined && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        <MapPin className="h-3.5 w-3.5" />
                        {distanceFromUniversityKm}km away
                      </span>
                    )}
                    {roomsAvailable !== null && roomsAvailable !== undefined && roomsAvailable > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                        {roomsAvailable} rooms left
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{formatRand(monthlyCost)}</p>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">per month</p>
                  </div>

                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      toggleSave();
                    }}
                    disabled={loading}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                      isSaved
                        ? "border-transparent bg-accent text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-primary/30 hover:text-primary"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${animating ? "scale-125" : ""}`} fill={isSaved ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {amenityPills.length > 0 ? (
                  amenityPills.map(({ amenity, icon: Icon, label }) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                    >
                      <Icon className="h-3.5 w-3.5 text-primary/80" />
                      <span>{label}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Utilities available on request</span>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Users className="h-3.5 w-3.5 text-primary/70" />
                  <span>{genderPolicy || "Mixed preferred"}</span>
                </div>

                <div className="flex items-center gap-2" onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}>
                  <ShareListingPopup
                    listingId={id}
                    listingName={propertyName}
                    listingUrl={fullShareUrl}
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-primary">
                        <Share className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full border-slate-200 px-3 text-[11px] font-bold text-primary hover:border-primary hover:bg-primary hover:text-white"
                    onClick={handleOpenListing}
                  >
                    View details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="block group h-full">
      <Card
        onClick={handleOpenListing}
        className={`overflow-hidden rounded-3xl hover:shadow-xl transition-all duration-500 cursor-pointer h-full flex flex-col bg-white border-0 shadow-sm ${
          showPremiumBorderAnimation ? "ring-2 ring-primary animate-pulse" : isPaidUser ? "ring-1 ring-yellow-400/50" : "ring-1 ring-slate-100"
        }`}
      >
        <div className="relative w-full h-72 overflow-hidden bg-slate-50">
          <ImageWithSkeleton
            src={thumb}
            alt={propertyName}
            className="group-hover:scale-110 transition-transform duration-700 ease-out"
            onError={handleImgError()}
          />

          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {nsfasAccredited && (
              <Badge className="bg-white/90 backdrop-blur-md text-primary hover:bg-white shadow-sm border-0 text-[10px] font-bold tracking-wider px-2.5 py-1 uppercase rounded-full">
                NSFAS Accredited
              </Badge>
            )}
            {isLandlordListing && (
              <Badge className="bg-primary/90 backdrop-blur-md text-white hover:bg-primary shadow-sm border-0 text-[10px] font-bold tracking-wider px-2.5 py-1 uppercase rounded-full">
                Direct Landlord
              </Badge>
            )}
          </div>

          <button
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleSave();
            }}
            disabled={loading}
            className={`absolute top-4 right-4 h-9 w-9 rounded-full backdrop-blur-md transition-all duration-300 flex items-center justify-center shadow-sm ${
              isSaved ? "bg-accent text-white" : "bg-white/70 text-slate-700 hover:bg-white hover:text-accent"
            }`}
          >
            <Heart className={`w-4 h-4 ${animating ? "scale-125" : ""}`} fill={isSaved ? "currentColor" : "none"} />
          </button>

          <div className="absolute bottom-4 left-4">
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-white/20">
              <span className="text-sm font-bold text-slate-900 leading-none">{formatRand(monthlyCost)}</span>
              <span className="text-[10px] text-slate-500 ml-1 font-medium">/mo</span>
            </div>
          </div>
        </div>

        <CardContent className="p-5 flex flex-col flex-1 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">
                {type}
              </span>
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-[11px] font-bold text-slate-700">{(rating || 0).toFixed(1)}</span>
              </div>
            </div>

            <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors duration-300 line-clamp-1">
              {propertyName}
            </h3>

            <div className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs font-medium truncate">{city}</span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                <GraduationCap className="w-3 h-3 text-slate-400" />
                <span className="text-[11px] font-medium text-slate-600 line-clamp-1 max-w-[140px]">{university}</span>
              </div>

              {isGautrainAccessible(university) && (
                <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                  <Train className="w-3 h-3 text-emerald-600" />
                  <span className="text-[11px] font-medium text-emerald-700 uppercase tracking-tight">Gautrain</span>
                </div>
              )}
              {distanceFromUniversityKm !== null && distanceFromUniversityKm !== undefined && (
                <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span className="text-[11px] font-medium text-blue-700">{distanceFromUniversityKm}km</span>
                </div>
              )}
              {roomsAvailable !== null && roomsAvailable !== undefined && roomsAvailable > 0 && (
                <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                  <span className="text-[11px] font-medium text-orange-700">{roomsAvailable} left</span>
                </div>
              )}
            </div>

            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 border-t border-slate-50 pt-3">
                {amenities.slice(0, 3).map((amenity) => {
                  const { icon: Icon, label } = getAmenityDisplay(amenity);
                  return (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500"
                    >
                      <Icon className="h-3 w-3 text-primary/70" />
                      {label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>

        <div className="px-5 py-3 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Users className="w-3 h-3 text-primary/60" />
            <span>{genderPolicy || "Mixed Preferred"}</span>
          </div>

          <div className="flex items-center gap-1" onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}>
            <ShareListingPopup
              listingId={id}
              listingName={propertyName}
              listingUrl={fullShareUrl}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-primary hover:bg-white transition-all">
                  <Share className="w-3.5 h-3.5" />
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full text-[11px] font-bold text-primary bg-white shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all group-hover:px-4"
              onClick={handleOpenListing}
            >
              View Details
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AccommodationCard;
