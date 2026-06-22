import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  GraduationCap,
  Building2,
  MapPin,
  Globe,
  Calculator,
  BookOpen,
  Users,
  Calendar,
  ChevronRight,
  Coins,
  Info,
  Award,
  TrendingUp,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  CreditCard,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { UNIVERSITY_LOGOS } from "@/constants/universityLogos";
import { useSEO } from "@/hooks/useSEO";

// APS Calculator Component
const APSCalculator = () => {
  const [subjects, setSubjects] = useState([
    { name: "Home Language", mark: "" },
    { name: "First Additional Language", mark: "" },
    { name: "Mathematics/Maths Literacy", mark: "" },
    { name: "Life Orientation", mark: "" },
    { name: "Subject 5", mark: "" },
    { name: "Subject 6", mark: "" },
    { name: "Subject 7", mark: "" },
  ]);
  const [apsScore, setApsScore] = useState<number | null>(null);

  const calculateAPSFromMark = (mark: number, isLifeOrientation = false): number => {
    if (isLifeOrientation) {
      return mark >= 50 ? 4 : 0;
    }
    if (mark >= 80) return 7;
    if (mark >= 70) return 6;
    if (mark >= 60) return 5;
    if (mark >= 50) return 4;
    if (mark >= 40) return 3;
    if (mark >= 30) return 2;
    if (mark >= 20) return 1;
    return 0;
  };

  const calculateAPS = () => {
    let total = 0;
    subjects.forEach((subject) => {
      const mark = parseInt(subject.mark) || 0;
      const isLifeOrientation = subject.name === "Life Orientation";
      const points = calculateAPSFromMark(mark, isLifeOrientation);
      total += points;
    });
    setApsScore(total);
  };

  const handleMarkChange = (index: number, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index].mark = value;
    setSubjects(newSubjects);
    setApsScore(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/5 to-slate-50 border border-slate-100 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          APS Score Calculator
        </h3>
        <p className="text-sm text-slate-600">
          Enter your matric marks to calculate your APS score and discover which programs you qualify for.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject, index) => (
          <div key={index}>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-2 text-slate-500">{subject.name}</label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="Enter mark (0-100)"
              value={subject.mark}
              onChange={(e) => handleMarkChange(index, e.target.value)}
              className="w-full bg-slate-50/50 focus-visible:ring-primary/20 border-slate-200"
            />
          </div>
        ))}
      </div>

      <Button onClick={calculateAPS} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md">
        <Calculator className="h-5 w-5 mr-2" />
        Calculate APS Score
      </Button>

      {apsScore !== null && (
        <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-white shadow-xl rounded-2xl">
          <CardContent className="pt-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/80 mb-2">Your APS Score</p>
            <p className="text-6xl font-black text-primary mb-3 leading-none">{apsScore}</p>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Use this score to check program requirements at universities. Click on a university to see which programs you qualify for.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// University Card Component
const UniversityCard = ({ university }: { university: any }) => {
  const navigate = useNavigate();

  const getLogoUrl = () => {
    if (university.logo) return university.logo;
    if (UNIVERSITY_LOGOS[university.name]) return UNIVERSITY_LOGOS[university.name];
    return null;
  };

  const logoUrl = getLogoUrl();
  const abbrev = university.abbreviation?.toUpperCase() || "";

  return (
    <div 
      onClick={() => navigate(`/university/${university.id}`)}
      className="group relative bg-white border border-slate-100 hover:border-primary/20 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
    >
      {/* Visual Header Accent (University Colors or Gradient Pattern) */}
      <div className="h-28 bg-gradient-to-br from-primary/10 via-primary/5 to-slate-50 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent opacity-60"></div>
        {/* Subtle Backdrop text (Abbreviation) */}
        <div className="absolute text-5xl font-black text-slate-200/30 tracking-widest select-none pointer-events-none uppercase">
          {abbrev}
        </div>
      </div>

      {/* Floating Logo Badge */}
      <div className="relative px-6 -mt-10 flex-1 flex flex-col">
        <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-md overflow-hidden transition-transform duration-300 group-hover:scale-105">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${university.name} logo`}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                const img = e.currentTarget;
                img.style.display = "none";
                const fallback = img.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <span
            className={`w-12 h-12 ${logoUrl ? "hidden" : "flex"} items-center justify-center text-sm font-bold bg-primary text-primary-foreground rounded-lg`}
          >
            {abbrev || university.name?.substring(0, 3)?.toUpperCase()}
          </span>
        </div>

        {/* University Info */}
        <div className="mt-4 flex-1">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
            {university.name}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1.5">
            <Building2 className="w-3.5 h-3.5 text-primary/70" />
            <span>{university.type || "University"}</span>
          </p>

          {/* Quick Tags row */}
          <div className="flex flex-wrap gap-2 mt-4 mb-2">
            <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-600 px-2 py-1 rounded-md">
              <MapPin className="w-3 h-3 text-slate-400" />
              {university.location || "SA"}
            </span>
            {university.student_population && (
              <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-600 px-2 py-1 rounded-md">
                <Users className="w-3 h-3 text-slate-400" />
                {(university.student_population / 1000).toFixed(0)}K+
              </span>
            )}
            {university.established_year && (
              <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-600 px-2 py-1 rounded-md">
                <Calendar className="w-3 h-3 text-slate-400" />
                Est. {university.established_year}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer / CTA row */}
      <div className="border-t border-slate-50 px-6 py-4 bg-slate-50/50 flex items-center justify-between mt-auto">
        <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-300">
          Explore Guide
          <ChevronRight className="w-3 h-3" />
        </span>
        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
          {university.province || "SA"}
        </span>
      </div>
    </div>
  );
};

const ReBookedCampus = () => {
  useSEO({
    title: "Campus Central — SA University Info, APS Calculator & Bursaries 2025",
    description:
      "Explore South African universities, calculate your APS score, discover NSFAS bursaries and find NSFAS-accredited student accommodation — all in one place. Your complete campus guide.",
    keywords:
      "APS calculator South Africa, South African universities, NSFAS bursaries 2025, student accommodation SA, UCT UJ Wits TUT UKZN admissions, matric APS score, university application guide",
    canonical: "/campus-guide",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showAllUniversities, setShowAllUniversities] = useState(false);
  const universitiesSectionRef = useRef<HTMLDivElement>(null);

  // Fetch universities
  const { data: universities, isLoading } = useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Filter universities based on search
  const filteredUniversities = useMemo(() => {
    if (!universities) return [];
    return universities.filter((uni: any) =>
      uni.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [universities, searchQuery]);

  const displayedUniversities = showAllUniversities
    ? filteredUniversities
    : filteredUniversities.slice(0, 6);

  const scrollToUniversities = () => {
    universitiesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout showFooter={true} noPaddingTop>
      <div className="min-h-screen bg-slate-50/50">
        {/* Stunning Backdrop Hero Section */}
        <div className="relative overflow-hidden bg-white border-b border-slate-100 py-20 md:py-32">
          {/* Faded Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
            <span className="text-[6rem] md:text-[10rem] lg:text-[14rem] font-black text-slate-100/60 uppercase tracking-tighter leading-none whitespace-nowrap">
              Campus Central
            </span>
          </div>

          <div className="relative container mx-auto px-4 z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                Comprehensive Student Portal
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
                Campus <span className="text-primary">Central</span>
              </h1>
              
              <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                Explore SA universities, calculate your APS score instantly, find student accommodation, and access premium guidebooks.
              </p>

              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <Button
                  onClick={() => { setActiveTab("universities"); scrollToUniversities(); }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-5 rounded-xl font-semibold shadow-md transition-all duration-200"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Browse Universities
                </Button>
                <Button
                  onClick={() => setActiveTab("apps")}
                  variant="outline"
                  className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 px-6 py-5 rounded-xl font-semibold transition-all duration-200"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  APS Calculator
                </Button>
              </div>

              <div className="pt-8">
                <button 
                  onClick={scrollToUniversities}
                  className="animate-bounce inline-flex flex-col items-center text-xs text-slate-400 font-semibold uppercase tracking-wider hover:text-slate-600 transition-colors"
                >
                  Scroll to universities
                  <ChevronDown className="w-4 h-4 mt-1" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Content Section */}
        <div ref={universitiesSectionRef} className="container mx-auto px-4 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Modern Tab Navigation */}
            <TabsList className="grid w-full grid-cols-4 gap-1.5 bg-slate-100 border border-slate-200/50 rounded-2xl mb-12 p-1.5 h-auto">
              <TabsTrigger
                value="overview"
                className="rounded-xl py-3 px-3 sm:px-4 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-semibold transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="apps"
                className="rounded-xl py-3 px-3 sm:px-4 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-semibold transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                <span>APS</span>
              </TabsTrigger>
              <TabsTrigger
                value="bursaries"
                className="rounded-xl py-3 px-3 sm:px-4 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-semibold transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Coins className="h-4 w-4" />
                <span className="hidden sm:inline">Bursaries</span>
                <span className="sm:hidden">Funding</span>
              </TabsTrigger>
              <TabsTrigger
                value="universities"
                className="rounded-xl py-3 px-3 sm:px-4 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-semibold transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Universities</span>
                <span className="sm:hidden">Unis</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8 focus-visible:outline-none">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-2">Welcome to Campus Central</h2>
                  <p className="text-slate-600 text-sm md:text-base">Your complete guide to South African higher education</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div 
                    className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    onClick={() => setActiveTab("universities")}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-800 mb-2">Explore Universities</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-6">
                        Browse profiles of all South African universities with detailed information about programs, facilities, and admissions.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full justify-between rounded-lg">
                      View Universities
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <div 
                    className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    onClick={() => setActiveTab("apps")}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-800 mb-2">Calculate APS</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-6">
                        Enter your matric marks to calculate your APS score and see which programs you qualify for.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full justify-between rounded-lg">
                      Calculate Now
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <div 
                    className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    onClick={() => setActiveTab("bursaries")}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-800 mb-2">Find Funding</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-6">
                        Discover bursaries, scholarships, and financial aid programs available to South African students.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full justify-between rounded-lg">
                      Explore Bursaries
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    About ReBooked Campus
                  </h3>
                  <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                    <p>
                      ReBooked Campus is your one-stop platform for everything related to student life in South Africa. Whether you're exploring universities, calculating your APS score, searching for bursaries, or looking for student accommodation, we've got you covered.
                    </p>
                    <p>
                      Our mission is to make it easier for students to access verified, NSFAS-accredited accommodation while providing essential information about applying to and studying at South African institutions.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Apps & APS Tab */}
            <TabsContent value="apps" className="space-y-6 focus-visible:outline-none">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-2">APS Score Calculator</h2>
                <p className="text-slate-600 text-sm md:text-base">Calculate your Admission Point Score from your matric marks</p>
              </div>
              <div className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-2xl shadow-sm p-6 md:p-8">
                <APSCalculator />
              </div>
            </TabsContent>

            {/* Bursaries Tab */}
            <TabsContent value="bursaries" className="space-y-6 focus-visible:outline-none">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-2">Student Bursaries & Financial Aid</h2>
                <p className="text-slate-600 text-sm md:text-base">Discover funding opportunities for your studies</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm py-20 text-center space-y-4 max-w-3xl mx-auto">
                <div className="text-5xl">🎓</div>
                <h3 className="text-xl font-bold text-slate-800">Coming Soon</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  We're working hard to bring you a comprehensive bursary and funding directory. Stay tuned for updates!
                </p>
                <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">Under Development</Badge>
              </div>
            </TabsContent>

            {/* Universities Tab */}
            <TabsContent value="universities" className="space-y-6 focus-visible:outline-none">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-2">South African Universities</h2>
                  <p className="text-slate-600 text-sm md:text-base">Explore universities, criteria and courses</p>
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl bg-white border-slate-200 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              {/* Universities Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 animate-pulse bg-slate-100 border-0 rounded-2xl" />
                  ))}
                </div>
              ) : displayedUniversities.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedUniversities.map((university: any) => (
                      <UniversityCard key={university.id} university={university} />
                    ))}
                  </div>

                  {/* View More Button */}
                  {filteredUniversities.length > 6 && (
                    <div className="text-center pt-8">
                      <Button
                        onClick={() => setShowAllUniversities(!showAllUniversities)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-md"
                        size="lg"
                      >
                        {showAllUniversities ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            View Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-2" />
                            View All ({filteredUniversities.length} universities)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm text-center py-16 max-w-xl mx-auto">
                  <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-bold text-slate-800 mb-2">No universities found</h3>
                  <p className="text-sm text-slate-500">
                    {searchQuery ? "Try adjusting your search terms." : "Universities will be listed here soon."}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ReBookedCampus;
