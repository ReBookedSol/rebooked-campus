import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import AccommodationCard from "@/components/AccommodationCard";
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
  MapPin,
  Search,
  ShieldCheck,
  Calendar,
  Newspaper,
  Award,
  Clock,
  GraduationCap,
  Home as HomeIcon,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  MessageSquare,
  BookmarkCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { UNIVERSITY_LOGOS } from "@/constants/universityLogos";
import { useSEO } from "@/hooks/useSEO";
import { buildBrowseUrl } from "@/lib/slugify";

/* ─── constants ─── */

const AREAS = [
  { label: "Cape Town", city: "Cape Town", slug: "cape-town" },
  { label: "Johannesburg", city: "Johannesburg", slug: "johannesburg" },
  { label: "Pretoria", city: "Pretoria", slug: "pretoria" },
  { label: "KZN", city: "Durban", slug: "durban" },
] as const;

type AreaKey = (typeof AREAS)[number]["city"];

const QUICK_ACCESS = [
  {
    title: "Accommodation",
    desc: "Browse 4,000+ verified student listings",
    icon: HomeIcon,
    href: "/student-accommodation",
  },
  {
    title: "Bursaries",
    desc: "Active funding & application deadlines",
    icon: Award,
    href: "#bursaries",
  },
  {
    title: "Campus News",
    desc: "Education updates & NSFAS deadlines",
    icon: Newspaper,
    href: "#news",
  },
  {
    title: "Campus Guide",
    desc: "Explore universities & student resources",
    icon: GraduationCap,
    href: "/campus-guide",
  },
];

const HERO_IMAGES = [
  {
    src: "https://images.pexels.com/photos/26571207/pexels-photo-26571207.jpeg",
    alt: "NSFAS accredited student accommodation",
  },
  {
    src: "https://images.pexels.com/photos/14601013/pexels-photo-14601013.jpeg",
    alt: "University accredited student housing",
  },
  {
    src: "https://images.pexels.com/photos/6782578/pexels-photo-6782578.jpeg",
    alt: "Affordable student rooms near campus",
  },
  {
    src: "https://images.pexels.com/photos/7212942/pexels-photo-7212942.jpeg",
    alt: "Student community shared spaces",
  },
];

const MOCK_NEWS = [
  {
    id: 1,
    title: "NSFAS 2026 Funding Applications: Key Dates and Requirements",
    summary:
      "The Department of Higher Education has officially announced the opening dates for NSFAS 2026 applications. Here is everything you need to know about the new online portal and household income thresholds.",
    category: "Funding",
    date: "21 Jun 2026",
    readTime: "4 min read",
    image: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg",
    source: "DHET News",
  },
  {
    id: 2,
    title: "University Application Deadlines for 2027 Academic Year",
    summary:
      "Early applications for top South African universities including UCT, Wits, UP, and UJ are closing soon. Check our comprehensive list of deadlines, prospectus downloads, and registration portals.",
    category: "Admissions",
    date: "18 Jun 2026",
    readTime: "5 min read",
    image: "https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg",
    source: "Advisory",
  },
  {
    id: 3,
    title: "Accommodation Accreditation Standards Raised for Student Safety",
    summary:
      "New safety and Wi-Fi compliance standards have been implemented for off-campus student housing in Johannesburg and Cape Town. How this affects your NSFAS accommodation allowance.",
    category: "Housing",
    date: "15 Jun 2026",
    readTime: "3 min read",
    image: "https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg",
    source: "ReBooked Living",
  },
];

const MOCK_BURSARIES = [
  {
    id: "isfap-2026",
    name: "ISFAP Bursary Scheme",
    provider: "Ikusasa Student Financial Aid Programme",
    description:
      "Funding for missing middle students in priority fields including Engineering, Medicine, Commerce, and Actuarial Science.",
    amount: "Fully Funded",
    closing_date: "2026-10-31",
    qualifications: "Undergraduate degrees in STEM, Commerce, or Health Sciences",
    status: "active",
  },
  {
    id: "funza-lushaka",
    name: "Funza Lushaka Educator Bursary",
    provider: "Department of Basic Education",
    description:
      "Multi-year bursary to promote teaching in public schools. Recipients are placed to teach in provincial education departments.",
    amount: "Full Tuition + Stipend",
    closing_date: "2026-11-15",
    qualifications: "B.Ed or PGCE degrees",
    status: "active",
  },
  {
    id: "sasol-2026",
    name: "Sasol Corporate Bursary Programme",
    provider: "Sasol Limited",
    description:
      "Comprehensive bursary covering tuition, accommodation, books, pocket money, and vacation work opportunities for top science and engineering students.",
    amount: "Fully Funded",
    closing_date: "2026-08-31",
    qualifications: "B.Sc or B.Eng in Chemical, Mechanical, or Mining Engineering",
    status: "active",
  },
];

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

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Search by university or city",
    description:
      "Start with your campus, area, or budget to narrow down accommodation that fits your needs.",
    icon: Search,
  },
  {
    num: "02",
    title: "Check accreditation details",
    description:
      "Review NSFAS status, pricing, amenities, and location so you can compare trusted options.",
    icon: ShieldCheck,
  },
  {
    num: "03",
    title: "Compare costs and rooms",
    description:
      "See monthly pricing, property information, and listing details before deciding.",
    icon: HandCoins,
  },
  {
    num: "04",
    title: "Contact the landlord",
    description:
      "Reach out from the listing to ask questions, confirm availability, and secure your home.",
    icon: MessageSquare,
  },
];

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
];

/* ─── component ─── */

const Index = () => {
  useSEO({
    title:
      "ReBooked Living — Student Accommodation in South Africa | NSFAS Accredited",
    description:
      "Find safe, affordable NSFAS-accredited student accommodation near your university. Browse 4,000+ verified listings in Cape Town, Johannesburg, Pretoria & KZN. Free to search.",
    keywords:
      "student accommodation South Africa, NSFAS accredited housing, Cape Town student rooms, Johannesburg student accommodation, Pretoria student housing, KZN student accommodation",
    canonical: "/",
  });

  const [activeArea, setActiveArea] = useState<AreaKey>(AREAS[0].city);
  const [heroIndex, setHeroIndex] = useState(0);
  const uniScrollRef = useRef<HTMLDivElement>(null);

  // auto-rotate hero images
  useEffect(() => {
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  /* ── data ── */

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

  const { data: dbBursaries } = useQuery({
    queryKey: ["home-bursaries-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bursaries")
        .select("*")
        .eq("status", "active")
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 15,
  });

  const bursaries =
    dbBursaries && dbBursaries.length > 0 ? dbBursaries : MOCK_BURSARIES;

  const { data: universityMetrics } = useQuery({
    queryKey: ["home-university-metrics"],
    queryFn: async () => {
      const [universityRowsResult, minRentResult] = await Promise.all([
        supabase
          .from("accommodations")
          .select("university")
          .not("university", "is", null),
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
          const u = row.university?.trim();
          if (!u) return acc;
          acc[u] = (acc[u] || 0) + 1;
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

  const { data: areaListings, isLoading: areaLoading } = useQuery({
    queryKey: ["area-accommodations", activeArea],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .or(
          `city.ilike.%${activeArea}%,province.ilike.%${activeArea}%,address.ilike.%${activeArea}%`,
        )
        .order("rating", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 15,
  });

  /* ── derived ── */

  const activeAreaConfig = AREAS.find((a) => a.city === activeArea)!;

  const browseUniversities = Object.entries(UNIVERSITY_LOGOS)
    .map(([name, logo]) => ({
      name,
      logo,
      shortName: UNIVERSITY_SHORT_NAMES[name] || name,
      count: universityMetrics?.universityCounts[name] || 0,
    }))
    .sort((a, b) => a.shortName.localeCompare(b.shortName));

  const scrollUni = (dir: "left" | "right") => {
    if (!uniScrollRef.current) return;
    uniScrollRef.current.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  const stats = [
    {
      label: "Listings",
      value: `${totalAccommodations?.toLocaleString() || "4,361"}+`,
    },
    { label: "Universities", value: "26" },
    {
      label: "From per month",
      value: `R${(universityMetrics?.minMonthlyCost || 1500).toLocaleString()}`,
    },
    { label: "Accreditation", value: "NSFAS" },
  ];

  /* ── render ── */

  return (
    <Layout noPaddingTop>
      {/* ────────── HERO ────────── */}
      <section className="relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          {HERO_IMAGES.map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={img.alt}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
              style={{ opacity: heroIndex === i ? 1 : 0 }}
              loading={i === 0 ? "eager" : "lazy"}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-28 pb-14 md:pt-36 md:pb-20 lg:pt-44 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* left — text + search */}
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-white leading-tight tracking-tight mb-4">
                Find Your Perfect
                <br />
                Student Home
              </h1>
              <p className="text-sm md:text-base text-white/65 mb-6 max-w-md leading-relaxed">
                Browse NSFAS-accredited accommodation, track bursary deadlines,
                and stay on top of campus news — all in one place.
              </p>
              <div className="max-w-lg">
                <SearchBar compact />
              </div>

              {/* stats row */}
              <div className="flex flex-wrap gap-6 mt-7">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-lg md:text-xl font-bold text-white leading-none">
                      {s.value}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* right — image cards */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* main image */}
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3]">
                  {HERO_IMAGES.map((img, i) => (
                    <img
                      key={i}
                      src={img.src}
                      alt={img.alt}
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-1000"
                      style={{ opacity: heroIndex === i ? 1 : 0 }}
                    />
                  ))}
                </div>
                {/* floating accent card */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-lg border border-border flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">NSFAS Accredited</div>
                    <div className="text-[11px] text-muted-foreground">Verified student housing</div>
                  </div>
                </div>
                {/* slide indicators */}
                <div className="absolute bottom-4 right-4 flex gap-1.5">
                  {HERO_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${heroIndex === i ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── QUICK ACCESS ────────── */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACCESS.map(({ title, desc, icon: Icon, href }) => (
              <Link
                key={title}
                to={href}
                className="group rounded-xl border border-border bg-white p-4 md:p-5 hover:shadow-md hover:border-primary/25 transition-all duration-200"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3 transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5 leading-snug">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── ACCOMMODATION BY AREA ────────── */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Student Accommodation
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Verified listings by area — click a city to explore
              </p>
            </div>
            <Link
              to={`/student-accommodation/${activeAreaConfig.slug}`}
              className="text-sm font-medium text-primary hover:underline underline-offset-4 inline-flex items-center gap-1 shrink-0"
            >
              View all in {activeAreaConfig.label}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* area tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {AREAS.map((area) => (
              <button
                key={area.city}
                onClick={() => setActiveArea(area.city)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                  activeArea === area.city
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-border text-foreground hover:border-primary/30"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                {area.label}
              </button>
            ))}
          </div>

          {/* listings grid */}
          {areaLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-72 bg-muted rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : areaListings && areaListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No listings found in {activeArea} yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ────────── NEWS + BURSARIES ────────── */}
      <section id="news" className="py-8 md:py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* news — left */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Campus News
                </h2>
                <Link
                  to="/campus-guide"
                  className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  All news <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* featured article */}
              <div className="group overflow-hidden rounded-xl border border-border bg-white mb-4 hover:shadow-md transition-shadow">
                <div className="h-48 sm:h-56 overflow-hidden">
                  <img
                    src={MOCK_NEWS[0].image}
                    alt={MOCK_NEWS[0].title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    {MOCK_NEWS[0].category}
                  </span>
                  <h3 className="text-lg font-bold text-foreground mt-2 mb-1.5 group-hover:text-primary transition-colors">
                    {MOCK_NEWS[0].title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {MOCK_NEWS[0].summary}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {MOCK_NEWS[0].date}
                    </span>
                    <span>{MOCK_NEWS[0].readTime}</span>
                  </div>
                </div>
              </div>

              {/* smaller articles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MOCK_NEWS.slice(1).map((news) => (
                  <div
                    key={news.id}
                    className="group flex gap-3 rounded-xl border border-border bg-white p-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="w-20 h-16 shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={news.image}
                        alt={news.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                        {news.category}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug mt-0.5 group-hover:text-primary transition-colors">
                        {news.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {news.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* bursaries — right */}
            <div id="bursaries" className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Bursaries
                </h2>
                <Link
                  to="/bursary-packs"
                  className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {bursaries.map((b: any) => (
                  <div
                    key={b.id}
                    className="group rounded-xl border border-border bg-white p-4 hover:shadow-sm hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {b.name}
                      </h3>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                        {b.amount}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                      {b.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground truncate mr-2">
                        {b.provider}
                      </span>
                      <span className="flex items-center gap-1 text-red-600 font-medium shrink-0">
                        <Clock className="w-3 h-3" />
                        {b.closing_date
                          ? new Date(b.closing_date).toLocaleDateString(
                              "en-ZA",
                              { day: "numeric", month: "short" },
                            )
                          : "TBC"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/bursary-packs" className="block mt-4">
                <Button className="w-full rounded-lg gap-2 text-sm">
                  <BookmarkCheck className="w-4 h-4" />
                  Get Bursary Application Packs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── BROWSE UNIVERSITIES ────────── */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Browse by University
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Find accommodation near your campus
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scrollUni("left")}
                className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollUni("right")}
                className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={uniScrollRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {browseUniversities.map((uni) => (
              <Link
                key={uni.name}
                to={buildBrowseUrl(undefined, uni.name)}
                className="group flex-none w-[160px] md:w-[180px] rounded-xl border border-border bg-white p-4 hover:border-primary/25 hover:shadow-md transition-all"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/50 p-2 mb-3">
                  <img
                    src={uni.logo}
                    alt={uni.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="text-sm font-semibold text-foreground leading-snug line-clamp-1">
                  {uni.shortName}
                </div>
                {uni.count > 0 && (
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {uni.count} listings
                  </div>
                )}
                <div className="mt-2 text-xs font-medium text-primary inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── HOW IT WORKS ────────── */}
      <section className="py-8 md:py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              How ReBooked Living Works
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xl mx-auto">
              From search to landlord contact in four simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map(({ num, title, description, icon: Icon }) => (
              <div
                key={num}
                className="rounded-xl bg-white border border-border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold tracking-widest text-primary/60">
                    {num}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── NSFAS INFO ────────── */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto rounded-xl border border-border bg-white p-6 md:p-8">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
                  <BookOpen className="w-3.5 h-3.5" />
                  NSFAS Explained
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-snug">
                  What NSFAS-accredited accommodation actually means
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Accreditation tells students that a property meets the
                  expectations used in student housing approval — including
                  safety, campus access, facilities, and compliance.
                </p>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
                  <div className="text-sm font-semibold text-foreground mb-1">
                    Why students look for it
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    It reduces uncertainty when comparing accommodation,
                    especially if relying on NSFAS support or university
                    requirements.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-white p-4">
                  <div className="text-sm font-semibold text-foreground mb-1">
                    Always confirm before paying
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Accreditation can change by university and funding cycle —
                    verify the latest details directly before committing.
                  </p>
                </div>
                <Link
                  to="/student-accommodation"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  Search accredited listings
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── ECOSYSTEM ────────── */}
      <section className="py-8 md:py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-6">
            Our Ecosystem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://rebookedsolutions.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-border bg-white p-5 hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2">
                ReBooked Solutions
              </div>
              <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                Buy & Sell School Essentials
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Student marketplace for second-hand textbooks, uniforms,
                stationery and sports gear.
              </p>
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                Visit <ArrowRight className="w-3 h-3" />
              </span>
            </a>
            <Link
              to="/student-accommodation"
              className="group rounded-xl border border-border bg-white p-5 hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2">
                ReBooked Living
              </div>
              <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                Student Accommodation
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                University-accredited student accommodation across South
                Africa. Verified listings, real reviews.
              </p>
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                Browse <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
            <a
              href="https://genius.rebookedsolutions.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-border bg-white p-5 hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2">
                ReBooked Genius
              </div>
              <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                AI Study Platform
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Upload textbooks and past papers — get AI-generated lessons,
                summaries, and practice questions.
              </p>
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                Start Studying <ArrowRight className="w-3 h-3" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ────────── FAQ ────────── */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
                <CircleHelp className="w-3.5 h-3.5" />
                FAQ
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Common Questions
              </h2>
            </div>
            <div className="rounded-xl border border-border bg-white px-5 md:px-6">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq) => (
                  <AccordionItem
                    key={faq.question}
                    value={faq.question}
                    className="border-border"
                  >
                    <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── CTA ────────── */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center rounded-xl bg-primary p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to find your student home?
            </h2>
            <p className="text-sm md:text-base text-white/65 mb-6 max-w-lg mx-auto">
              Browse verified listings, compare prices, and connect with
              landlords directly. It starts with one search.
            </p>
            <Link to="/student-accommodation">
              <Button
                size="lg"
                className="rounded-full px-8 bg-white text-primary hover:bg-white/90 font-semibold"
              >
                Start Searching Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
