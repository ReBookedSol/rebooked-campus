import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useSEO } from "@/hooks/useSEO";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Search, Bus, Train, Navigation, Clock, Banknote, ArrowLeftRight, Loader2, Map as MapIcon, Info, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import L from 'leaflet';

// Leaflet icon fix
const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Polyline decoder function
const decodePolyline = (encoded: string) => {
  if (!encoded) return [];
  let points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    points.push([lat / 1E5, lng / 1E5] as [number, number]);
  }
  return points;
};

// Distance calculation (Haversine)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MapController = ({ bounds, center }: { bounds?: L.LatLngBoundsExpression, center?: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (center) {
      map.setView(center, 13);
    }
  }, [map, bounds, center]);
  return null;
};

const ReBookedTravel = () => {
  useSEO({
    title: "ReBooked Travel — Coming Soon",
    description: "South Africa's universal transport information platform. Coming soon to ReBooked.",
    canonical: "/rebooked-travel",
  });

  const [originInput, setOriginInput] = useState("");
  const [destInput, setDestInput] = useState("");
  const [originStop, setOriginStop] = useState<any>(null);
  const [destStop, setDestStop] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeInput, setActiveInput] = useState<"origin" | "dest" | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-26.2041, 28.0473]);
  const [mapBounds, setMapBounds] = useState<L.LatLngBoundsExpression | undefined>(undefined);

  // SET THIS TO FALSE TO REVEAL THE TRIP PLANNER
  const SHOW_COMING_SOON = true;

  const { data: allStops } = useQuery({
    queryKey: ["all-stops"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stops").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: routes, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["trip-routes", originStop?.id, destStop?.id],
    enabled: !!originStop && !!destStop,
    queryFn: async () => {
      const { data: originRS } = await supabase.from("route_stops").select("*").eq("stop_id", originStop.id);
      const { data: destRS } = await supabase.from("route_stops").select("*").eq("stop_id", destStop.id);
      if (!originRS || !destRS) return [];
      const commonRoutes = originRS.filter(ors => destRS.some(drs => drs.route_id === ors.route_id));
      const matchedRoutes = [];
      for (const ors of commonRoutes) {
        const drs = destRS.find(d => d.route_id === ors.route_id);
        if (!drs) continue;
        if (ors.is_outbound_stop && drs.is_outbound_stop && (ors.sequence_outbound || 0) < (drs.sequence_outbound || 0)) {
          matchedRoutes.push({ route_id: ors.route_id, direction: 'outbound' });
        }
        if (ors.is_inbound_stop && drs.is_inbound_stop && (ors.sequence_inbound || 0) < (drs.sequence_inbound || 0)) {
          matchedRoutes.push({ route_id: ors.route_id, direction: 'inbound' });
        }
      }
      if (matchedRoutes.length === 0) return [];
      const { data: routeDetails } = await supabase.from("routes").select("*").in("id", matchedRoutes.map(m => m.route_id));
      const { data: allFrequencies } = await supabase.from("service_frequencies").select("*").in("route_id", matchedRoutes.map(m => m.route_id));
      const { data: fares } = await supabase.from("fares").select("*")
        .or(`from_stop_id.eq.${originStop.id},to_stop_id.eq.${destStop.id},route_code.in.(${routeDetails?.map(r => r.route_code).join(',')})`);
      return matchedRoutes.map(m => {
        const route = routeDetails?.find(r => r.id === m.route_id);
        const routeFreqs = allFrequencies?.filter(f => f.route_id === m.route_id);
        const fare = fares?.find(f => (f.from_stop_id === originStop.id && f.to_stop_id === destStop.id) || f.route_code === route?.route_code);
        const peakFreq = routeFreqs?.find(f => f.period_type === 'peak')?.frequency_minutes;
        const offPeakFreq = routeFreqs?.find(f => f.period_type === 'off-peak')?.frequency_minutes;
        let frequencyLabel = "Consult timetable";
        if (peakFreq && offPeakFreq) frequencyLabel = `Peak: ${peakFreq}m | Off: ${offPeakFreq}m`;
        else if (peakFreq || offPeakFreq) frequencyLabel = `Every ${peakFreq || offPeakFreq} min`;
        return {
          ...route,
          direction: m.direction,
          frequency: frequencyLabel,
          fare: fare?.amount ? `R ${fare.amount.toFixed(2)}` : "Contact operator",
          color: route?.operator?.toLowerCase().includes("gautrain") ? "#f59e0b" : 
                 route?.operator?.toLowerCase().includes("myciti") ? "#e11d48" : 
                 route?.operator?.toLowerCase().includes("golden arrow") ? "#16a34a" : "#64748b"
        };
      });
    }
  });

  const handleAutocomplete = async (input: string, type: "origin" | "dest") => {
    if (type === "origin") setOriginInput(input);
    else setDestInput(input);
    if (input.length < 2) { setSuggestions([]); return; }
    const filteredStops = allStops?.filter(s => 
      s.stop_name.toLowerCase().includes(input.toLowerCase()) || 
      s.city?.toLowerCase().includes(input.toLowerCase()) ||
      s.suburb?.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5) || [];
    let placeSuggestions: any[] = [];
    if (filteredStops.length < 3) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=za&limit=3&q=${encodeURIComponent(input + ", South Africa")}`);
        const data = await res.json();
        placeSuggestions = data.map((item: any) => ({
          id: `place-${item.place_id}`,
          stop_name: item.display_name.split(',')[0],
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          type: 'place',
          description: item.display_name
        }));
      } catch (e) {}
    }
    setSuggestions([...filteredStops, ...placeSuggestions]);
    setActiveInput(type);
  };

  const selectSuggestion = (item: any) => {
    let finalStop = item;
    if (item.type === 'place' && allStops) {
      let closest = allStops[0];
      let minDist = getDistance(item.latitude, item.longitude, closest.latitude!, closest.longitude!);
      allStops.forEach(s => {
        const d = getDistance(item.latitude, item.longitude, s.latitude!, s.longitude!);
        if (d < minDist) { minDist = d; closest = s; }
      });
      finalStop = closest;
    }
    if (activeInput === "origin") { setOriginStop(finalStop); setOriginInput(finalStop.stop_name); }
    else { setDestStop(finalStop); setDestInput(finalStop.stop_name); }
    setSuggestions([]);
    setActiveInput(null);
  };

  useEffect(() => {
    if (originStop && destStop) {
      const bounds = L.latLngBounds([originStop.latitude, originStop.longitude], [destStop.latitude, destStop.longitude]);
      setMapBounds(bounds);
    } else if (originStop) { setMapCenter([originStop.latitude, originStop.longitude]); }
  }, [originStop, destStop]);

  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  return (
    <Layout>
      <div className="relative min-h-screen bg-background">
        {/* Coming Soon Overlay */}
        {SHOW_COMING_SOON && (
          <div className="absolute inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-6">
              <Badge variant="secondary" className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
                COMING SOON
              </Badge>
              
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                  ReBooked Travel
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  South Africa's universal transport information platform is currently in development.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button size="lg" className="rounded-xl font-bold w-full" onClick={() => window.location.href = '/'}>
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Trip Planner UI (Hidden by overlay but code preserved) */}
        <div className={SHOW_COMING_SOON ? "blur-xl pointer-events-none opacity-20 transition-all duration-1000" : ""}>
          <div className="bg-primary/5 border-b border-border py-10 md:py-14">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-xs mb-4">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Beta Release</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
                  South Africa's Universal <span className="text-primary">Transport Network</span>
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Connect between 16 operators including Gautrain, MyCiTi, Rea Vaya, and more. Find the best way from point A to B.
                </p>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
              <div className="lg:col-span-4 flex flex-col gap-6">
                <Card className="shadow-lg border-primary/10 overflow-visible z-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Plan your trip</CardTitle>
                    <CardDescription>Select origin and destination stops</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
                          </div>
                          <Input placeholder="From where?" value={originInput} onChange={(e) => handleAutocomplete(e.target.value, "origin")} onFocus={() => setActiveInput("origin")} className="flex-1" />
                        </div>
                        {activeInput === "origin" && suggestions.length > 0 && (
                          <div className="absolute left-11 right-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-[100] overflow-hidden">
                            {suggestions.map((s, idx) => (
                              <button key={idx} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm flex flex-col border-b last:border-0" onClick={() => selectSuggestion(s)}>
                                <span className="font-semibold">{s.stop_name}</span>
                                <span className="text-xs text-muted-foreground">{s.suburb || s.city || s.description?.substring(0, 40)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-background border-2 border-red-500 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-red-500" />
                          </div>
                          <Input placeholder="To where?" value={destInput} onChange={(e) => handleAutocomplete(e.target.value, "dest")} onFocus={() => setActiveInput("dest")} className="flex-1" />
                        </div>
                        {activeInput === "dest" && suggestions.length > 0 && (
                          <div className="absolute left-11 right-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-[100] overflow-hidden">
                            {suggestions.map((s, idx) => (
                              <button key={idx} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm flex flex-col border-b last:border-0" onClick={() => selectSuggestion(s)}>
                                <span className="font-semibold">{s.stop_name}</span>
                                <span className="text-xs text-muted-foreground">{s.suburb || s.city || s.description?.substring(0, 40)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-4">
                  <h3 className="font-semibold text-lg flex items-center justify-between">Suggested Routes</h3>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4 pb-6">
                      {isLoadingRoutes ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin mb-3" /><p>Searching...</p></div>
                      ) : !originStop || !destStop ? (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200"><MapIcon className="w-10 h-10 mx-auto mb-3 text-slate-300" /><p className="text-sm text-muted-foreground">Select locations to start.</p></div>
                      ) : routes && routes.length > 0 ? (
                        routes.map((route, idx) => (
                          <Card key={idx} className={`overflow-hidden transition-all cursor-pointer border-2 ${selectedRoute?.id === route.id ? 'border-primary' : 'hover:border-primary/50'}`} onClick={() => setSelectedRoute(route)}>
                            <div className="h-1.5 w-full" style={{ backgroundColor: route.color }}></div>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">{route.route_type?.toLowerCase().includes("train") ? <Train className="w-4 h-4" /> : <Bus className="w-4 h-4" />}<Badge variant="secondary" className="bg-slate-100 text-[10px] font-bold">{route.operator}</Badge></div>
                                <span className="font-bold text-base">{route.route_code}</span>
                              </div>
                              <h4 className="font-semibold text-sm mb-3 line-clamp-1">{route.route_name}</h4>
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="flex items-center text-muted-foreground"><Clock className="w-3.5 h-3.5 mr-1.5" />{route.journey_time_minutes ? `${route.journey_time_minutes} min` : "Est. time unavailable"}</div>
                                <div className="flex items-center text-muted-foreground"><ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" />{route.frequency}</div>
                                <div className="flex items-center text-foreground font-bold col-span-2 mt-1"><Banknote className="w-3.5 h-3.5 mr-1.5 text-green-600" />{route.fare}</div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-12 bg-orange-50 rounded-xl border border-orange-100"><Info className="w-10 h-10 mx-auto mb-3 text-orange-300" /><p className="text-sm text-orange-800 px-4 font-medium">No direct routes found.</p></div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-border shadow-2xl h-[600px] lg:h-auto relative group">
                <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="w-full h-full z-0">
                  <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <MapController bounds={mapBounds} center={mapCenter} />
                  {originStop && <Marker position={[originStop.latitude, originStop.longitude]} icon={originIcon} />}
                  {destStop && <Marker position={[destStop.latitude, destStop.longitude]} icon={destinationIcon} />}
                  {selectedRoute?.encoded_polyline && <Polyline positions={decodePolyline(selectedRoute.encoded_polyline)} color={selectedRoute.color} weight={6} opacity={0.8} />}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReBookedTravel;
