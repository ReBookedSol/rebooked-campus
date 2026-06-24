import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Maintenance from "./pages/Maintenance";
import Contact from "./pages/Contact";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import ListingDetail from "./pages/ListingDetail";
import Ad from "./pages/Ad";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Campus from "./pages/Campus";
import CampusLanding from "./pages/CampusLanding";
import ReBookedCampus from "./pages/ReBookedCampus";
import UniversityProfile from "./pages/UniversityProfile";
import LandlordDashboard from "./pages/landlord/Dashboard";
import AddListing from "./pages/landlord/AddListing";
import LandlordPayment from "./pages/landlord/Payment";
import PaymentResult from "./pages/PaymentResult";
import Notifications from "./pages/Notifications";
import FAQ from "./pages/FAQ";
import StudentAccommodationGuide from "./pages/guides/StudentAccommodationGuide";
import NSFASAccommodationGuide from "./pages/guides/NSFASAccommodationGuide";
import ReBookedTravel from "./pages/ReBookedTravel";

import NotFound from "./pages/NotFound";
import ProtectedLandlordRoute from "./components/ProtectedLandlordRoute";
import { AdManager } from "./components/AdManager";
import RouteScrollManager from "./components/RouteScrollManager";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Layout from "@/components/Layout";
import { slugify } from "@/lib/slugify";
import { useClerkProfileSync } from "@/hooks/useClerkProfileSync";

const queryClient = new QueryClient();

// Resolves a property slug to a listing and renders ListingDetail
const ListingBySlug = () => {
  const { citySlug, uniSlug, propertySlug, id: shortId } = useParams();

  const { data: resolvedId, isLoading, error } = useQuery({
    queryKey: ["resolve-listing-slug", propertySlug, shortId],
    queryFn: async () => {
      if (!propertySlug) throw new Error("No slug");

      // 1. If explicit ID provided in URL segment - search directly by ID prefix with no limit
      if (shortId) {
        const searchId = shortId.toLowerCase();
        const { data: matchedData } = await supabase
          .from("accommodations")
          .select("id");

        if (matchedData && matchedData.length > 0) {
          const matchFound = matchedData.find(a =>
            a.id.replace(/-/g, '').toLowerCase().startsWith(searchId)
          );
          if (matchFound) return matchFound.id;
        }
      }

      // 2. Legacy Support: Check if ID suffix still exists in propertySlug (format: property-name-XXXXXXXX)
      const idSuffixMatch = propertySlug.match(/-([0-9a-f]{8})$/i);
      if (idSuffixMatch) {
        const legacyShortId = idSuffixMatch[1].toLowerCase();
        const { data: matchedData } = await supabase
          .from("accommodations")
          .select("id");

        if (matchedData && matchedData.length > 0) {
          const matchFound = matchedData.find(a =>
            a.id.replace(/-/g, '').toLowerCase().startsWith(legacyShortId)
          );
          if (matchFound) return matchFound.id;
        }
      }

      // 3. Search by property name with optional city/university filters
      const propertyNameWords = propertySlug.split('-').filter(w => w.length > 2);
      if (propertyNameWords.length > 0) {
        let nameQuery = supabase.from("accommodations").select("id, property_name, city, university");

        nameQuery = nameQuery.ilike("property_name", `%${propertyNameWords[0]}%`);

        const { data: nameResults } = await nameQuery.limit(100);

        if (nameResults && nameResults.length > 0) {
          // Exact slug match
          let bestMatch = nameResults.find(item => slugify(item.property_name) === propertySlug);

          // Fallback: starts with property slug
          if (!bestMatch) {
            bestMatch = nameResults.find(item => propertySlug.startsWith(slugify(item.property_name)));
          }

          // Last fallback: contains all key words from the slug
          if (!bestMatch && propertyNameWords.length > 1) {
            bestMatch = nameResults.find(item => {
              const itemSlug = slugify(item.property_name);
              return propertyNameWords.every(word => itemSlug.includes(word));
            });
          }

          if (bestMatch) return bestMatch.id;
        }
      }

      throw new Error("Listing not found");
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <Layout showFooter={false}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-muted rounded-lg mb-8" />
            <div className="h-8 bg-muted rounded w-1/2 mb-4" />
            <div className="h-4 bg-muted rounded w-1/4 mb-8" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !resolvedId) return <NotFound />;

  try {
    return <ListingDetail listingId={resolvedId} />;
  } catch {
    return <NotFound />;
  }
};


const App = () => {
  const AuthRedirector = () => {
    const navigate = useNavigate();
    const { isLoaded, isSignedIn } = useAuth();
    useClerkProfileSync();

    useEffect(() => {
      if (isLoaded && isSignedIn) {
        if (window.location.pathname === "/auth") {
          navigate("/profile");
        }
      }
    }, [isLoaded, isSignedIn, navigate]);

    return null;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AdManager />
          <AuthRedirector />
          <RouteScrollManager />
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Accommodation browse routes - path segments as filters */}
            <Route path="/student-accommodation" element={<Browse />} />
            <Route path="/student-accommodation/:citySlug" element={<Browse />} />
            <Route path="/student-accommodation/:citySlug/:uniSlug" element={<Browse />} />
            <Route path="/student-accommodation/:citySlug/:uniSlug/:propertySlug" element={<ListingBySlug />} />
            <Route path="/student-accommodation/:citySlug/:uniSlug/:propertySlug/:id" element={<ListingBySlug />} />

            {/* Legacy routes - redirects for backward compatibility */}
            <Route path="/accommodation" element={<Navigate to="/student-accommodation" replace />} />
            <Route path="/accommodation/:citySlug" element={<Navigate to="/student-accommodation/:citySlug" replace />} />
            <Route path="/accommodation/:citySlug/:uniSlug" element={<Navigate to="/student-accommodation/:citySlug/:uniSlug" replace />} />
            <Route path="/accommodation/:citySlug/:uniSlug/:propertySlug" element={<ListingBySlug />} />
            <Route path="/browse" element={<Navigate to="/student-accommodation" replace />} />
            <Route path="/listing/:id" element={<ListingDetail />} />

            <Route path="/ad" element={<Ad />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/guides/how-to-find-student-accommodation-in-south-africa" element={<StudentAccommodationGuide />} />
            <Route path="/nsfas-accommodation-guide" element={<NSFASAccommodationGuide />} />
            <Route path="/rebooked-travel" element={<ReBookedTravel />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/campus" element={<CampusLanding />} />
            <Route path="/campus-guide" element={<ReBookedCampus />} />
            <Route path="/university/:id" element={<UniversityProfile />} />

            {/* Payment Result Routes */}
            <Route path="/payment/success" element={<PaymentResult />} />
            <Route path="/payment/pending" element={<PaymentResult />} />
            <Route path="/payment/cancel" element={<PaymentResult />} />
            
            {/* Landlord Routes */}
            <Route path="/landlord" element={<ProtectedLandlordRoute><LandlordDashboard /></ProtectedLandlordRoute>} />
            <Route path="/landlord/add-listing" element={<ProtectedLandlordRoute><AddListing /></ProtectedLandlordRoute>} />
            <Route path="/landlord/pay/:listingId" element={<ProtectedLandlordRoute><LandlordPayment /></ProtectedLandlordRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Analytics />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
