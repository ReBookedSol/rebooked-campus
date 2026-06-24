import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Building2,
  MapPin,
  Users,
  Calendar,
  ChevronRight,
  Coins,
  Clock,
  Newspaper,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { UNIVERSITY_LOGOS } from "@/constants/universityLogos";
import { useSEO } from "@/hooks/useSEO";

/* ─────────────────────────────────────────────
   Placeholder data — swap for real data later
   ───────────────────────────────────────────── */

const PLACEHOLDER_NEWS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&q=80",
    headline: "NSFAS 2026 Applications Now Open",
    snippet: "The National Student Financial Aid Scheme has opened applications for the 2026 academic year. Here's everything you need to know about eligibility and deadlines.",
    date: "20 Jun 2026",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80",
    headline: "Wits Launches New AI Engineering Degree",
    snippet: "The University of the Witwatersrand unveils a cutting-edge Bachelor of AI Engineering programme starting in 2027, with bursary spots available.",
    date: "18 Jun 2026",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
    headline: "UCT Ranked #1 in Africa Again",
    snippet: "The University of Cape Town retains its position as the top-ranked university on the African continent according to the latest QS World Rankings.",
    date: "15 Jun 2026",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&q=80",
    headline: "New Student Housing Regulations for 2027",
    snippet: "The Department of Higher Education has announced updated regulations for NSFAS-accredited private student accommodation providers.",
    date: "12 Jun 2026",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&q=80",
    headline: "Stellenbosch Bursary Fair — August 2026",
    snippet: "Stellenbosch University is hosting its annual bursary fair, featuring over 40 corporate and government funders under one roof.",
    date: "10 Jun 2026",
  },
];

const PLACEHOLDER_BURSARIES = [
  {
    id: 1,
    name: "Allan Gray Orbis Foundation Scholarship",
    provider: "Allan Gray Orbis Foundation",
    deadline: "2026-07-15",
    eligibility: "South African citizens, matric or 1st-year students with strong leadership potential.",
  },
  {
    id: 2,
    name: "Sasol Bursary Programme",
    provider: "Sasol Limited",
    deadline: "2026-08-31",
    eligibility: "Engineering, Science & IT students. Minimum 70% average in maths and science.",
  },
  {
    id: 3,
    name: "NSFAS Full Bursary",
    provider: "National Student Financial Aid Scheme",
    deadline: "2026-11-30",
    eligibility: "SA citizens with combined household income under R350,000 per year.",
  },
  {
    id: 4,
    name: "Eskom Bursary Scheme",
    provider: "Eskom Holdings",
    deadline: "2026-07-31",
    eligibility: "Engineering students. South African citizens only. Min 60% maths & science.",
  },
  {
    id: 5,
    name: "Capitec Bank Bursary",
    provider: "Capitec Bank",
    deadline: "2026-09-30",
    eligibility: "BCom, BSc, and IT degrees. Academic merit and financial need.",
  },
  {
    id: 6,
    name: "Anglo American Bursary",
    provider: "Anglo American SA",
    deadline: "2026-08-15",
    eligibility: "Mining, Engineering & Geoscience students. Min APS of 30.",
  },
  {
    id: 7,
    name: "Old Mutual Bursary",
    provider: "Old Mutual",
    deadline: "2027-01-15",
    eligibility: "Actuarial Science, Finance, IT students with strong academics.",
  },
  {
    id: 8,
    name: "Motsepe Foundation Bursary",
    provider: "Motsepe Foundation",
    deadline: "2026-10-31",
    eligibility: "Disadvantaged SA students in any field of study at a public university.",
  },
];

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

const getDeadlineUrgency = (deadline: string) => {
  const now = new Date();
  const dl = new Date(deadline);
  const daysLeft = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return { label: "Closed", color: "bg-slate-400 text-white" };
  if (daysLeft <= 14) return { label: `${daysLeft}d left`, color: "bg-red-500 text-white" };
  if (daysLeft <= 60) return { label: `${daysLeft}d left`, color: "bg-amber-500 text-white" };
  return { label: `${daysLeft}d left`, color: "bg-emerald-500 text-white" };
};

const formatDeadline = (deadline: string) => {
  return new Date(deadline).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

/* ── News Card ───────────────────────────── */
const NewsCard = ({ item }: { item: (typeof PLACEHOLDER_NEWS)[number] }) => (
  <article className="group flex-shrink-0 w-[310px] sm:w-[340px] bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 snap-start">
    <div className="relative h-44 overflow-hidden">
      <img
        src={item.image}
        alt={item.headline}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/90 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
        <Calendar className="w-3 h-3" />
        {item.date}
      </span>
    </div>
    <div className="p-5 space-y-2">
      <h3 className="font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {item.headline}
      </h3>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{item.snippet}</p>
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary pt-1 group-hover:translate-x-0.5 transition-transform">
        Read more <ChevronRight className="w-3 h-3" />
      </span>
    </div>
  </article>
);

/* ── Bursary Card ─────────────────────────── */
const BursaryCard = ({ bursary }: { bursary: (typeof PLACEHOLDER_BURSARIES)[number] }) => {
  const urgency = getDeadlineUrgency(bursary.deadline);
  return (
    <article className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="p-5 flex-1 space-y-3">
        {/* Provider pill */}
        <span className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full">
          <Coins className="w-3 h-3" />
          {bursary.provider}
        </span>

        <h3 className="font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {bursary.name}
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{bursary.eligibility}</p>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-50 bg-slate-50/50 px-5 py-3.5 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-600 font-medium">{formatDeadline(bursary.deadline)}</span>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${urgency.color}`}>
          {urgency.label}
        </span>
      </div>
    </article>
  );
};

/* ── University Card ──────────────────────── */
const LandingUniversityCard = ({ university }: { university: any }) => {
  const getLogoUrl = () => {
    if (university.logo) return university.logo;
    if (UNIVERSITY_LOGOS[university.name]) return UNIVERSITY_LOGOS[university.name];
    return null;
  };

  const logoUrl = getLogoUrl();
  const abbrev = university.abbreviation?.toUpperCase() || "";

  return (
    <Link
      to={`/university/${university.id}`}
      className="group relative bg-white border border-slate-100 hover:border-primary/20 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Header gradient band */}
      <div className="h-24 bg-gradient-to-br from-primary/10 via-primary/5 to-slate-50 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent opacity-60" />
        <div className="absolute text-4xl font-black text-slate-200/30 tracking-widest select-none pointer-events-none uppercase">
          {abbrev}
        </div>
      </div>

      {/* Floating logo */}
      <div className="relative px-5 -mt-8 flex-1 flex flex-col">
        <div className="w-14 h-14 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-md overflow-hidden transition-transform duration-300 group-hover:scale-105">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${university.name} logo`}
              className="w-10 h-10 object-contain"
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                img.style.display = "none";
                const fallback = img.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <span
            className={`w-10 h-10 ${logoUrl ? "hidden" : "flex"} items-center justify-center text-xs font-bold bg-primary text-primary-foreground rounded-lg`}
          >
            {abbrev || university.name?.substring(0, 3)?.toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="mt-3 flex-1">
          <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {university.name}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 text-[10px] font-medium text-slate-600 px-2 py-0.5 rounded-md">
              <MapPin className="w-2.5 h-2.5 text-slate-400" />
              {university.location || "SA"}
            </span>
            {university.student_population && (
              <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 text-[10px] font-medium text-slate-600 px-2 py-0.5 rounded-md">
                <Users className="w-2.5 h-2.5 text-slate-400" />
                {(university.student_population / 1000).toFixed(0)}K+
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-50 px-5 py-3 bg-slate-50/50 flex items-center justify-between mt-auto">
        <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-300">
          View guide <ChevronRight className="w-3 h-3" />
        </span>
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          {university.province || "SA"}
        </span>
      </div>
    </Link>
  );
};

/* ── Section Heading ──────────────────────── */
const SectionHeading = ({
  icon: Icon,
  label,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  label: string;
  title: string;
  subtitle: string;
}) => (
  <div className="space-y-2 mb-8">
    <span className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
    <p className="text-sm md:text-base text-slate-500 max-w-xl">{subtitle}</p>
  </div>
);

/* ─────────────────────────────────────────────
   Main Page Component
   ───────────────────────────────────────────── */

const CampusLanding = () => {
  useSEO({
    title: "ReBooked Campus — Bursaries, University Info & Campus News",
    description:
      "Your one-stop student hub for South African bursaries, university guides, and the latest campus news. Find funding, explore universities, and stay informed.",
    keywords:
      "South African bursaries 2026, NSFAS, university guide SA, campus news, student funding, ReBooked Campus",
    canonical: "/campus",
  });

  const carouselRef = useRef<HTMLDivElement>(null);

  // Fetch universities from Supabase
  const { data: universities, isLoading: unisLoading } = useQuery({
    queryKey: ["campus-landing-universities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("universities").select("*").order("name").limit(8);
      if (error) throw error;
      return data || [];
    },
  });

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = 360;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <Layout showFooter noPaddingTop>
      <div className="min-h-screen bg-slate-50/50">
        {/* ═══════════════════════════════════
            1. HERO
            ═══════════════════════════════════ */}
        <section className="relative overflow-hidden bg-white border-b border-slate-100">
          {/* Large background watermark */}
          <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
            <span className="text-[5rem] md:text-[9rem] lg:text-[13rem] font-black text-slate-100/50 uppercase tracking-tighter leading-none whitespace-nowrap">
              Campus
            </span>
          </div>

          {/* Decorative gradient blobs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

          <div className="relative container mx-auto px-4 py-24 md:py-36 z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                ReBooked Campus
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.95]">
                Your student life,{" "}
                <span className="text-primary">sorted</span>.
              </h1>

              {/* Supporting line */}
              <p className="text-base md:text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
                University info, bursaries, and campus news — all in one place.
              </p>

              {/* Single primary CTA */}
              <div className="pt-4">
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-xl font-semibold shadow-lg shadow-primary/20 text-base transition-all duration-200 hover:shadow-xl hover:shadow-primary/30"
                >
                  <a href="#bursaries">
                    <Coins className="w-5 h-5 mr-2" />
                    Explore Bursaries
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            2. LATEST CAMPUS NEWS — Carousel
            ═══════════════════════════════════ */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <SectionHeading
              icon={Newspaper}
              label="Campus News"
              title="Latest Campus News"
              subtitle="Stay on top of everything happening in SA higher education."
            />

            {/* Carousel */}
            <div className="relative">
              {/* Scroll buttons — desktop only */}
              <button
                onClick={() => scrollCarousel("left")}
                aria-label="Scroll left"
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                onClick={() => scrollCarousel("right")}
                aria-label="Scroll right"
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div
                ref={carouselRef}
                className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {PLACEHOLDER_NEWS.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* View all news CTA */}
            <div className="mt-8 text-center">
              <Button variant="outline" asChild className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-5 font-semibold">
                <Link to="/campus/news">
                  View all news
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            3. BURSARIES — Grid preview
            ═══════════════════════════════════ */}
        <section id="bursaries" className="py-16 md:py-24 bg-white border-y border-slate-100">
          <div className="container mx-auto px-4">
            <SectionHeading
              icon={Coins}
              label="Bursaries"
              title="Find Your Funding"
              subtitle="Preview top bursaries and scholarships open to South African students."
            />

            {/* Bursary grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PLACEHOLDER_BURSARIES.map((bursary) => (
                <BursaryCard key={bursary.id} bursary={bursary} />
              ))}
            </div>

            {/* View all CTA */}
            <div className="mt-10 text-center">
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-5 rounded-xl font-semibold shadow-md transition-all duration-200"
              >
                <Link to="/campus/bursaries">
                  <Sparkles className="w-4 h-4 mr-2" />
                  View all bursaries
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            4. UNIVERSITIES — Card grid
            ═══════════════════════════════════ */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <SectionHeading
              icon={Building2}
              label="Universities"
              title="Explore SA Universities"
              subtitle="Browse detailed guides for South Africa's top public universities."
            />

            {/* University grid */}
            {unisLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-56 animate-pulse bg-slate-100 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {(universities || []).map((university: any) => (
                  <LandingUniversityCard key={university.id} university={university} />
                ))}
              </div>
            )}

            {/* View all CTA */}
            <div className="mt-10 text-center">
              <Button variant="outline" asChild className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-5 font-semibold">
                <Link to="/campus-guide">
                  View all universities
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CampusLanding;
