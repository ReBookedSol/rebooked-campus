import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import AccommodationCard from "@/components/AccommodationCard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  BookOpen,
  CircleHelp,
  HandCoins,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { UNIVERSITY_LOGOS } from "@/constants/universityLogos";
import { useSEO } from "@/hooks/useSEO";
import { buildBrowseUrl } from "@/lib/slugify";

// Area tabs configuration
const AREAS = [
  { label: "Cape Town", city: "Cape Town", slug: "cape-town" },
  { label: "Johannesburg", city: "Johannesburg", slug: "johannesburg" },
  { label: "Pretoria", city: "Pretoria", slug: "pretoria" },
  { label: "KZN", city: "Durban", slug: "durban" },
] as const;

const HOW_IT_WORKS_STEPS = [
  {
    num: "01",
    title: "Search by university or city",
    description:
      "Start with your campus, area, or budget to narrow down student accommodation that fits your needs.",
    icon: Search,
  },
  {
    num: "02",
    title: "Check NSFAS and accreditation details",
    description:
      "Review accreditation status, pricing, amenities, and location so you can compare trusted options faster.",
    icon: ShieldCheck,
  },
  {
    num: "03",
    title: "Compare costs and room options",
    description:
      "See monthly pricing, property information, and listing details before deciding which spaces are worth pursuing.",
    icon: HandCoins,
  },
  {
    num: "04",
    title: "Contact the landlord directly",
    description:
      "Reach out from the listing page to ask questions, confirm availability, and secure your next student home.",
    icon: MessageSquare,
  },
] as const;

const FAQS = [
  {
    question: "What does university-accredited mean?",
    answer:
      "University-accredited accommodation is housing that meets the standards a university or funding process expects for student living. This usually relates to factors like safety, location, facilities, and compliance requirements.",
  },
  {
    question: "Can I use NSFAS funding for these listings?",
    answer:
      "Listings marked as NSFAS-accredited are intended to align with NSFAS-supported accommodation requirements. Because approval can depend on your institution and funding cycle, it is still best to confirm the latest status before making payment.",
  },
  {
    question: "How do I contact a landlord?",
    answer:
      "Open the listing you are interested in to view the contact options provided for that property. ReBooked Living helps you discover the listing, then connect directly with the landlord or property contact.",
  },
  {
    question: "Is ReBooked Living free?",
    answer:
      "Yes, browsing listings on ReBooked Living is free. Some premium access or extra platform features may have separate pricing, but students can search and explore accommodation without paying to start.",
  },
  {
    question: "How do I know if accommodation is near my campus?",
    answer:
      "Use the university browse cards, search filters, and listing location details to focus on properties close to your campus. Each listing includes address information to help you compare distance and area.",
  },
  {
    question: "Are listings verified before they appear?",
    answer:
      "ReBooked Living presents listing details, accreditation indicators, and property information to help students make informed choices. You should still review the full listing carefully and confirm important details directly with the landlord before committing.",
  },
] as const;

const UNIVERSITY_SHORT_NAMES: Record<string, string> = {
  "University of Cape Town": "UCT",
  "University of the Witwatersrand": "Wits",
  "University of Johannesburg": "UJ",
  "University of Pretoria": "UP",
  "Stellenbosch University": "Stellenbosch",
  "University of KwaZulu-Natal": "UKZN",
  "Rhodes University": "Rhodes",
  "North-West University": "NWU",
  "Tshwane University of Technology": "TUT",
  "Cape Peninsula University of Technology": "CPUT",
  "Durban University of Technology": "DUT",
  "University of the Western Cape": "UWC",
  "University of Fort Hare": "UFH",
  "University of the Free State": "UFS",
  "University of Zululand": "UNIZULU",
  "Walter Sisulu University": "WSU",
  "Nelson Mandela University": "NMU",
  "Mangosuthu University of Technology": "MUT",
  "Sol Plaatje University": "SPU",
  "University of South Africa (UNISA)": "UNISA",
  "Central University of Technology": "CUT",
  "Vaal University of Technology": "VUT",
  "University of Limpopo": "UL",
  "University of Mpumalanga": "UMP",
  "Sefako Makgatho Health Sciences University": "SMU",
};

type AreaKey = (typeof AREAS)[number]["city"];

const Index = () => {
  useSEO({
    title: "ReBooked Living — Student Accommodation in South Africa | NSFAS Accredited",
    description:
      "Find safe, affordable NSFAS-accredited student accommodation near your university. Browse 4,000+ verified listings in Cape Town, Johannesburg, Pretoria & KZN. Free to search.",
    keywords:
      "student accommodation South Africa, NSFAS accredited housing, Cape Town student rooms, Johannesburg student accommodation, Pretoria student housing, KZN student accommodation",
    canonical: "/",
  });

  const [activeArea, setActiveArea] = useState<AreaKey>(AREAS[0].city);

  // Fetch total count
  const { data: totalAccommodations } = useQuery({
    queryKey: ["total-accommodations-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("accommodations")
        .select("id", { count: "exact", head: true });
      return count || 0;
    },
    staleTime: 1000 * 60 * 30,
  });

  const { data: universityMetrics } = useQuery({
    queryKey: ["home-university-metrics"],
    queryFn: async () => {
      const [universityRowsResult, minRentResult] = await Promise.all([
        supabase.from("accommodations").select("university").not("university", "is", null),
        supabase
          .from("accommodations")
          .select("monthly_cost")
          .not("monthly_cost", "is", null)
          .gt("monthly_cost", 0)
          .order("monthly_cost", { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

      if (universityRowsResult.error) throw universityRowsResult.error;
      if (minRentResult.error) throw minRentResult.error;

      const universityCounts = (universityRowsResult.data || []).reduce(
        (acc, row) => {
          const universityName = row.university?.trim();
          if (!universityName) return acc;
          acc[universityName] = (acc[universityName] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        universityCounts,
        minMonthlyCost: minRentResult.data?.monthly_cost || 1500,
      };
    },
    staleTime: 1000 * 60 * 30,
  });

  // Fetch accommodations per selected area — only load when the tab is first clicked
  const { data: areaListings, isLoading: areaLoading } = useQuery({
    queryKey: ["area-accommodations", activeArea],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .or(`city.ilike.%${activeArea}%,province.ilike.%${activeArea}%,address.ilike.%${activeArea}%`)
        .order("rating", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 15,
  });

  const activeAreaConfig = AREAS.find((a) => a.city === activeArea)!;
  const universityCounts = universityMetrics?.universityCounts || {};
  const browseUniversities = Object.entries(UNIVERSITY_LOGOS)
    .map(([name, logo]) => ({
      name,
      logo,
      shortName: UNIVERSITY_SHORT_NAMES[name] || name,
    }))
    .sort((a, b) => a.shortName.localeCompare(b.shortName));

  const featuredUniversities = browseUniversities.slice(0, 8);
  const [featuredUniversityIndex, setFeaturedUniversityIndex] = useState(0);

  useEffect(() => {
    if (!featuredUniversities.length) return;

    const interval = window.setInterval(() => {
      setFeaturedUniversityIndex((current) => (current + 1) % featuredUniversities.length);
    }, 2800);

    return () => window.clearInterval(interval);
  }, [featuredUniversities.length]);

  const featuredUniversity =
    featuredUniversities[featuredUniversityIndex % featuredUniversities.length] ||
    featuredUniversities[0];

  const stats = [
    {
      label: "Listings",
      value: `${totalAccommodations?.toLocaleString() || "4,361"}+`,
    },
    {
      label: "Universities",
      value: "26",
    },
    {
      label: "From per month",
      value: `R${(universityMetrics?.minMonthlyCost || 1500).toLocaleString()}/month`,
    },
    {
      label: "Accreditation",
      value: "NSFAS Accredited",
    },
  ] as const;

  return (
    <Layout>
      <HeroCarousel />

      <section className="border-y border-white/30 bg-white/70 backdrop-blur">
        <div className="container mx-auto px-4 py-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs md:text-sm uppercase tracking-[0.18em] text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gradient-to-b from-transparent via-white/30 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">How ReBooked Living works</h2>
            <p className="text-base text-muted-foreground max-w-3xl mx-auto">
              Compare student accommodation faster with a clearer path from search to landlord
              contact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {HOW_IT_WORKS_STEPS.map(({ num, title, description, icon: Icon }) => (
              <div
                key={num}
                className="group rounded-2xl p-6 bg-white/70 backdrop-blur border border-white/40 hover:border-primary/30 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-semibold tracking-[0.2em] text-primary/80">{num}</div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gradient-to-b from-white/40 to-white/10">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="rounded-3xl border border-white/40 bg-white/80 backdrop-blur p-6 md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm text-primary mb-5">
                <MapPin className="w-4 h-4" />
                Browse by university
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Find accommodation close to your campus
              </h2>
              <p className="text-base text-muted-foreground leading-7 mb-6">
                Start with the university you attend and jump straight into listings that are more
                relevant to your student life, your campus, and your budget.
              </p>
              <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-4 mb-6">
                <div className="text-xs uppercase tracking-[0.22em] text-primary/70 mb-2">
                  Currently highlighting
                </div>
                <div className="flex items-center gap-3">
                  {featuredUniversity ? (
                    <>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/80 p-2 shadow-sm">
                        <img
                          src={featuredUniversity.logo}
                          alt={featuredUniversity.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-lg font-semibold text-foreground truncate">
                          {featuredUniversity.shortName}
                        </div>
                        <div className="text-sm text-muted-foreground">Tap a university to explore nearby options</div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground mb-8">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span>Browse verified options near the universities students search for most.</span>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span>Jump to a university page or browse everything from one place.</span>
                </div>
              </div>
              <Link to="/student-accommodation">
                <Button className="rounded-full px-6 gap-2">
                  Browse all listings
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {featuredUniversities.map((university) => (
                <Link
                  key={university.name}
                  to={buildBrowseUrl(undefined, university.name)}
                  className="group rounded-2xl border border-white/40 bg-white/80 backdrop-blur p-4 md:p-5 hover:border-primary/30 hover:shadow-lg transition-all"
                  aria-label={`Browse listings near ${university.name}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted/30 p-2">
                      <img
                        src={university.logo}
                        alt={university.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                        {university.shortName}
                      </div>
                      <div className="mt-2 text-xs font-medium text-primary inline-flex items-center gap-1">
                        <span>Browse nearby listings</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="search" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Find Your Student Accommodation Now
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Search {totalAccommodations?.toLocaleString() || "4,000+"}+ verified listings by
                university, city, price, and NSFAS accreditation status
              </p>
            </div>
            <div className="bg-gradient-to-br from-white/40 to-white/20 backdrop-blur border border-white/30 rounded-2xl p-6 md:p-8">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gradient-to-r from-primary/5 via-white to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto rounded-3xl border border-white/40 bg-white/80 backdrop-blur p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm text-primary mb-5">
                  <BookOpen className="w-4 h-4" />
                  NSFAS / accreditation explained
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  What NSFAS-accredited student accommodation actually means
                </h2>
                <p className="text-base text-muted-foreground leading-7 max-w-2xl">
                  In simple terms, accreditation tells students that a property is meant to meet the
                  expectations used in student housing approval, including practical factors like
                  safety, access to campus, facilities, and compliance.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                  <div className="text-sm font-semibold text-foreground mb-1">Why students look for it</div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    It helps reduce uncertainty when comparing accommodation, especially if you are
                    relying on NSFAS support or need housing that fits university requirements.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/50 bg-white p-5 shadow-sm">
                  <div className="text-sm font-semibold text-foreground mb-1">Always confirm before paying</div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Accreditation can change by university and funding cycle, so students should
                    verify the latest details directly before committing to a property.
                  </p>
                </div>
                <Link to="#search" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline">
                  Search accredited listings
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gradient-to-b from-transparent via-white/20 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Our Ecosystem</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="https://rebookedsolutions.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between rounded-2xl p-6 bg-white/70 backdrop-blur border border-white/40 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
            >
              <div>
                <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2">ReBooked Solutions</div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  Buy & Sell School Essentials
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                  South Africa's student marketplace for second-hand textbooks, uniforms, stationery and sports gear. Buy for less, sell what you don't need.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                <span>Visit Marketplace</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </a>

            <Link
              to="/student-accommodation"
              className="group flex flex-col justify-between rounded-2xl p-6 bg-white/70 backdrop-blur border border-white/40 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
            >
              <div>
                <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2">
                  ReBooked Living
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  Find Accredited Student Accommodation
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                  Discover university-accredited student accommodation across South Africa. Verified listings, real reviews, and everything you need to find your place.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                <span>Find Accommodation</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            <a
              href="https://genius.rebookedsolutions.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between rounded-2xl p-6 bg-white/70 backdrop-blur border border-white/40 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
            >
              <div>
                <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2">ReBooked Genius</div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  AI-Powered Study Platform
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                  Upload your textbooks and past papers and let AI generate in-depth lessons, summaries, and practice questions tailored to the South African curriculum.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                <span>Start Studying</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
              Student Accommodations in South Africa
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Explore verified listings by area. Click a city to browse accommodations near top
              universities.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10">
            {AREAS.map((area) => (
              <button
                key={area.city}
                onClick={() => setActiveArea(area.city)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                  activeArea === area.city
                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                    : "bg-white/60 backdrop-blur border-white/30 text-foreground hover:border-primary/40 hover:bg-white/80"
                }`}
                aria-pressed={activeArea === area.city}
              >
                <MapPin className="w-3.5 h-3.5" />
                {area.label}
              </button>
            ))}
          </div>

          {areaLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : areaListings && areaListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {areaListings.map((listing) => (
                <AccommodationCard
                  key={listing.id}
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
                  distanceFromUniversityKm={listing.distance_from_university_km}
                  roomsAvailable={listing.rooms_available}
                  certifiedUniversities={listing.certified_universities}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No listings found in {activeArea} yet. Check back soon!</p>
            </div>
          )}

          <div className="flex justify-center mt-8">
            <Link to={`/student-accommodation/${activeAreaConfig.slug}`}>
              <Button
                variant="outline"
                className="rounded-full px-6 gap-2 hover:border-primary/50 hover:text-primary transition-colors"
              >
                View all {activeAreaConfig.label} listings
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gradient-to-b from-white/20 to-white/60">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm text-primary mb-4">
                <CircleHelp className="w-4 h-4" />
                Frequently asked questions
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Answers students ask before booking
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Helpful information about accreditation, NSFAS funding, pricing, and contacting
                landlords.
              </p>
            </div>

            <div className="rounded-3xl border border-white/40 bg-white/80 backdrop-blur px-6 md:px-8">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq) => (
                  <AccordionItem key={faq.question} value={faq.question} className="border-white/40">
                    <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base leading-7 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/40 px-6 md:px-12 py-12 md:py-16">
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
                  Why waste <span className="text-primary">R1,500</span> when{" "}
                  <span className="text-accent">R24.99</span> unlocks everything?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  Get verified information, direct landlord access, and insider tips to find your
                  perfect student home. Better safe than sorry.
                </p>
                <Link to="/student-accommodation">
                  <Button
                    size="lg"
                    className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white font-semibold"
                  >
                    Start Searching Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
