import React, { useState, useEffect, useCallback } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  BookOpen,
  Calculator,
  BarChart3,
  Users,
  Calendar,
  Building2,
  GraduationCap,
  Globe,
  TrendingUp,
  Award,
  Heart,
  Info,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  Home,
  ChevronRight,
} from "lucide-react";
import Layout from "@/components/Layout";
import ProgramDetailModal from "@/components/ProgramDetailModal";
import { UNIVERSITY_LOGOS } from "@/constants/universityLogos";

interface Program {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  aps_requirement?: number;
  faculty_name?: string;
  career_prospects?: any;
  subjects?: any;
  skills_developed?: any;
  salary_range?: string;
  employment_rate?: number;
  application_details?: any;
}

interface University {
  id: string;
  name: string;
  fullName?: string;
  full_name?: string;
  abbreviation?: string;
  location: string;
  province: string;
  logo?: string;
  overview?: string;
  type?: string;
  website?: string;
  studentPopulation?: number;
  student_population?: number;
  establishedYear?: number;
  established_year?: number;
  faculties?: any[];
}

const UniversityProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("programs");
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);
  const [expandedFaculties, setExpandedFaculties] = useState<Set<string>>(new Set());
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);

  // Get APS from URL parameters
  const fromAPS = searchParams.get("fromAPS") === "true";
  const userAPS = parseInt(searchParams.get("aps") || "0");

  // Fetch university data
  const { data: university, isLoading: universityLoading, error: universityError } = useQuery({
    queryKey: ["university", id],
    queryFn: async () => {
      const { data, error: dbError } = await supabase
        .from("universities")
        .select("*")
        .eq("id", id)
        .single();

      if (dbError) throw dbError;

      // Transform to our University interface
      return {
        id: data.id,
        name: data.name,
        fullName: data.full_name || data.name,
        full_name: data.full_name,
        abbreviation: data.abbreviation,
        location: data.location || "",
        province: data.province || "",
        logo: data.logo,
        overview: data.overview,
        type: data.type,
        website: data.website,
        studentPopulation: data.student_population,
        student_population: data.student_population,
        establishedYear: data.established_year,
        established_year: data.established_year,
      } as University;
    },
  });

  // Fetch programs from programs table
  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ["programs", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("university_id", id)
        .eq("is_active", true)
        .order("faculty_name", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []) as Program[];
    },
    enabled: !!id,
  });

  // Fetch related accommodations
  const { data: accommodations = [] } = useQuery({
    queryKey: ["university-accommodations", university?.name],
    queryFn: async () => {
      if (!university?.name) return [];
      
      const { data, error } = await supabase
        .from("accommodations")
        .select("id, property_name, address, city, monthly_cost, rating, image_urls, nsfas_accredited, distance_from_university_km, rooms_available")
        .or(`university.ilike.%${university.name}%,city.ilike.%${university.location}%`)
        .eq("status", "active")
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!university?.name,
  });

  // Group programs by faculty
  const programsByFaculty = programs.reduce((acc, program) => {
    const faculty = program.faculty_name || "Other Programs";
    if (!acc[faculty]) acc[faculty] = [];
    acc[faculty].push(program);
    return acc;
  }, {} as Record<string, Program[]>);

  const facultyNames = Object.keys(programsByFaculty).sort();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      const params = new URLSearchParams(searchParams);
      params.set("tab", value);
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (fromAPS && userAPS > 0) {
      setShowEligibleOnly(true);
    }
  }, [id, fromAPS, userAPS]);

  const toggleFacultyExpansion = (faculty: string) => {
    setExpandedFaculties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(faculty)) {
        newSet.delete(faculty);
      } else {
        newSet.add(faculty);
      }
      return newSet;
    });
  };

  const handleAPSCalculator = () => {
    navigate("/campus-guide?tab=apps");
  };

  const isEligibleForProgram = (program: Program): boolean => {
    if (!userAPS || userAPS === 0) return true;
    const requiredAPS = program.aps_requirement || 0;
    return userAPS >= requiredAPS;
  };

  const filterPrograms = (progs: Program[]): Program[] => {
    if (!showEligibleOnly || !userAPS) return progs;
    return progs.filter(isEligibleForProgram);
  };

  // Get logo URL from shared mapping
  const getLogoUrl = () => {
    if (!university) return undefined;
    if (university.logo) return university.logo;
    if (UNIVERSITY_LOGOS[university.name]) return UNIVERSITY_LOGOS[university.name];
    return undefined;
  };

  const logoUrl = getLogoUrl();

  if (universityLoading) {
    return (
      <Layout showFooter={false}>
        <div className="bg-background min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading university profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (universityError || !university) {
    return (
      <Layout showFooter={false}>
        <div className="bg-background min-h-screen">
          <div className="container mx-auto px-6 py-16 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">University Not Found</h1>
            <p className="text-muted-foreground mb-8">The university you're looking for could not be found.</p>
            <Button onClick={() => navigate("/campus-guide?tab=universities")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Back to Universities
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const totalPrograms = programs.length;
  const studentCount = university.studentPopulation
    ? university.studentPopulation > 1000
      ? `${Math.round(university.studentPopulation / 1000)}k+`
      : university.studentPopulation.toString()
    : "N/A";

  return (
    <Layout showFooter={true}>
      <div className="bg-slate-50/50 min-h-screen">
        {/* Header - Premium Neutral/Slate backdrop */}
        <div className="bg-white border-b border-slate-100">
          <div className="container mx-auto px-6 py-8">
            {/* Back Navigation */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => navigate("/campus-guide?tab=universities")}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Back to Campus Central</span>
              </button>
            </div>

            {/* University Header */}
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                  {/* Logo Container */}
                  <div className="relative mx-auto sm:mx-0 flex-shrink-0">
                    <div className="w-20 h-20 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-md overflow-hidden">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={`${university.name} logo`}
                          className="w-16 h-16 object-contain"
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.style.display = "none";
                            const fallback = img.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        className={`w-16 h-16 ${logoUrl ? "hidden" : "flex"} items-center justify-center text-2xl font-bold bg-primary text-primary-foreground rounded-xl`}
                      >
                        {university.abbreviation || university.name.substring(0, 3).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Name, Type & Location */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 font-semibold text-[10px] uppercase tracking-wider rounded-md">
                        {university.type || "University"}
                      </Badge>
                      <Badge className="bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200/80 font-medium text-[10px] uppercase tracking-wider rounded-md">
                        {university.province}
                      </Badge>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                      {university.fullName || university.name}
                    </h1>
                    <div className="flex items-center justify-center sm:justify-start text-sm text-slate-500">
                      <MapPin className="h-4 w-4 mr-1.5 text-slate-400" />
                      <span>{university.location}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {university.overview || "A prestigious South African institution dedicated to academic excellence, research innovation, and developing leaders who shape the future."}
                </p>

                {/* Call to Actions */}
                <div className="flex flex-wrap gap-2.5">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm px-5 py-4 font-semibold text-xs" asChild>
                    <a href="https://www.rebookedsolutions.co.za/" target="_blank" rel="noopener noreferrer">
                      <BookOpen className="h-4 w-4 mr-1.5" />
                      Find Textbooks
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-5 py-4 font-semibold text-xs" onClick={handleAPSCalculator}>
                    <Calculator className="h-4 w-4 mr-1.5 text-primary" />
                    APS Calculator
                  </Button>
                  {university.website && (
                    <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-5 py-4 font-semibold text-xs" asChild>
                      <a href={university.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-1.5 text-primary" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats Panel */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-1.5 text-primary" />
                    Quick Facts
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                      <span className="text-slate-500">Students</span>
                      <span className="font-bold text-slate-800">{studentCount}</span>
                    </div>
                    {university.establishedYear && (
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                        <span className="text-slate-500">Founded</span>
                        <span className="font-bold text-slate-800">{university.establishedYear}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                      <span className="text-slate-500">Faculties</span>
                      <span className="font-bold text-slate-800">{facultyNames.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-500">Programs</span>
                      <span className="font-bold text-slate-800">{totalPrograms}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* APS Banner */}
        {fromAPS && userAPS > 0 && (
          <div className="bg-amber-50/50 border-b border-amber-100">
            <div className="container mx-auto px-6 py-3.5">
              <Alert className="border-amber-200 bg-white rounded-xl shadow-sm">
                <Calculator className="h-5 w-5 text-amber-600" />
                <AlertDescription className="text-slate-700 text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <strong>Your APS Score: {userAPS}</strong> — 
                      {(() => {
                        const eligibleCount = programs.filter(isEligibleForProgram).length;
                        return (
                          <span className="ml-1.5">
                            You qualify for <strong>{eligibleCount}</strong> out of <strong>{totalPrograms}</strong> programs.
                          </span>
                        );
                      })()}
                    </div>
                    <Button
                      size="sm"
                      variant={showEligibleOnly ? "default" : "outline"}
                      onClick={() => setShowEligibleOnly(!showEligibleOnly)}
                      className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold h-8"
                    >
                      <Filter className="h-3.5 w-3.5 mr-1.5" />
                      {showEligibleOnly ? "Show All Programs" : "Show Eligible Only"}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <div className="container mx-auto px-6 py-10">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Navigation Tabs */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm mb-8 p-1.5">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-1 w-full bg-transparent h-auto">
                <TabsTrigger value="programs" className="rounded-xl py-3 data-[state=active]:bg-slate-50 data-[state=active]:text-primary font-semibold text-xs flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Academic Programs
                </TabsTrigger>
                <TabsTrigger value="admissions" className="rounded-xl py-3 data-[state=active]:bg-slate-50 data-[state=active]:text-primary font-semibold text-xs flex items-center justify-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Admissions
                </TabsTrigger>
                <TabsTrigger value="student-life" className="rounded-xl py-3 data-[state=active]:bg-slate-50 data-[state=active]:text-primary font-semibold text-xs flex items-center justify-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Campus Life
                </TabsTrigger>
                <TabsTrigger value="resources" className="rounded-xl py-3 data-[state=active]:bg-slate-50 data-[state=active]:text-primary font-semibold text-xs flex items-center justify-center">
                  <Info className="h-4 w-4 mr-2" />
                  Resources
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Programs Content */}
            <TabsContent value="programs" className="space-y-6 focus-visible:outline-none">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800">Academic Programs</h2>
                  <p className="text-slate-500 text-xs md:text-sm">Explore courses across {facultyNames.length} faculties</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm text-xs font-semibold h-9" onClick={handleAPSCalculator}>
                  <Calculator className="h-4 w-4 mr-1.5" />
                  Check APS requirements
                </Button>
              </div>

              {programsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : facultyNames.length > 0 ? (
                <div className="grid gap-6">
                  {facultyNames.map((facultyName) => {
                    const facultyPrograms = programsByFaculty[facultyName];
                    const filteredPrograms = filterPrograms(facultyPrograms);

                    if (showEligibleOnly && filteredPrograms.length === 0) return null;

                    return (
                      <div key={facultyName} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                          <h3 className="font-bold text-slate-800 flex items-center text-sm md:text-base">
                            <Building2 className="h-4 w-4 mr-2.5 text-primary" />
                            {facultyName}
                          </h3>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-md font-medium text-[10px]">
                            {filteredPrograms.length} courses
                          </Badge>
                        </div>

                        {filteredPrograms.length > 0 && (
                          <div className="p-6 divide-y divide-slate-100">
                            {filteredPrograms
                              .slice(0, showEligibleOnly || expandedFaculties.has(facultyName) ? filteredPrograms.length : 3)
                              .map((program) => {
                                const isEligible = isEligibleForProgram(program);
                                return (
                                  <div key={program.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {fromAPS && userAPS > 0 && (
                                          isEligible ? (
                                            <CheckCircle className="h-4.5 w-4.5 text-green-600 flex-shrink-0" />
                                          ) : (
                                            <XCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0" />
                                          )
                                        )}
                                        <h4 className="font-bold text-slate-800 text-sm md:text-base">{program.name}</h4>
                                      </div>
                                      {program.description && (
                                        <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-2xl">{program.description}</p>
                                      )}
                                      {program.duration && (
                                        <span className="inline-flex items-center text-xs text-slate-400">
                                          <Calendar className="h-3.5 w-3.5 mr-1" />
                                          {program.duration}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex sm:flex-col items-start sm:items-end gap-2 justify-between flex-shrink-0">
                                      <Badge className={`rounded-md font-semibold text-[10px] uppercase tracking-wider ${
                                        fromAPS && userAPS > 0
                                          ? isEligible
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-red-50 text-red-700 border-red-200"
                                          : "bg-primary/10 text-primary border-transparent"
                                      }`}>
                                        APS: {program.aps_requirement || "N/A"}
                                      </Badge>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-primary hover:text-primary/80 hover:bg-slate-50 rounded-lg text-xs font-semibold h-8"
                                        onClick={() => {
                                          setSelectedProgram({
                                            ...program,
                                            name: program.name,
                                            apsRequirement: program.aps_requirement,
                                            faculty: program.faculty_name,
                                            careerProspects: program.career_prospects,
                                            subjects: program.subjects,
                                          });
                                          setIsProgramModalOpen(true);
                                        }}
                                      >
                                        <Eye className="h-4 w-4 mr-1" />
                                        Details
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}

                            {!showEligibleOnly && filteredPrograms.length > 3 && !expandedFaculties.has(facultyName) && (
                              <div className="text-center pt-4">
                                <Button
                                  variant="ghost"
                                  className="text-primary hover:text-primary/80 hover:bg-slate-50 rounded-lg text-xs font-semibold"
                                  onClick={() => toggleFacultyExpansion(facultyName)}
                                >
                                  Show {filteredPrograms.length - 3} more programs
                                </Button>
                              </div>
                            )}
                            {!showEligibleOnly && filteredPrograms.length > 3 && expandedFaculties.has(facultyName) && (
                              <div className="text-center pt-4">
                                <Button
                                  variant="ghost"
                                  className="text-primary hover:text-primary/80 hover:bg-slate-50 rounded-lg text-xs font-semibold"
                                  onClick={() => toggleFacultyExpansion(facultyName)}
                                >
                                  Show Less
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm text-center py-16">
                  <GraduationCap className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="font-bold text-slate-800 mb-2">No Programs Available</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    Program information for this university is not yet available. Please check back later or contact the university directly.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Admissions Content */}
            <TabsContent value="admissions" className="space-y-6 focus-visible:outline-none">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Admissions Information</h2>
                <p className="text-slate-500 text-xs md:text-sm">Applications guidelines for {university.name}</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-amber-900 text-sm md:text-base">Ready to apply?</h4>
                    <p className="text-slate-600 text-xs md:text-sm">
                      Check application dates and submit your forms online directly.
                    </p>
                  </div>
                  {university.website && (
                    <a
                      href={university.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition-all"
                    >
                      Visit Admissions Portal
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Campus Life Content */}
            <TabsContent value="student-life" className="space-y-6 focus-visible:outline-none">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Campus Life</h2>
                <p className="text-slate-500 text-xs md:text-sm">Facilities and accommodation near {university.name}</p>
              </div>

              {/* Accommodations Grid */}
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
                <h3 className="font-bold text-slate-800 flex items-center text-sm md:text-base">
                  <Home className="h-4.5 w-4.5 mr-2.5 text-primary" />
                  Student Accommodation
                </h3>

                {accommodations.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {accommodations.map((acc: any) => (
                        <Link key={acc.id} to={`/listing/${acc.id}`} className="group block">
                          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full">
                            <div className="relative h-40 overflow-hidden">
                              <img
                                src={acc.image_urls?.[0] || "/placeholder.svg"}
                                alt={acc.property_name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                              {acc.nsfas_accredited && (
                                <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5">
                                  NSFAS
                                </Badge>
                              )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div>
                                <h5 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-primary transition-colors">{acc.property_name}</h5>
                                <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">{acc.address}</p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                                  {acc.distance_from_university_km !== null && acc.distance_from_university_km !== undefined && (
                                    <Badge variant="secondary" className="text-[10px] font-medium bg-slate-50 text-slate-600 border-slate-100">
                                      {acc.distance_from_university_km}km from campus
                                    </Badge>
                                  )}
                                  {acc.rooms_available !== null && acc.rooms_available !== undefined && acc.rooms_available > 0 && (
                                    <Badge variant="secondary" className="text-[10px] font-semibold bg-amber-50 text-amber-700 border-amber-100">
                                      {acc.rooms_available} rooms left
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                                <span className="text-primary font-bold text-sm">
                                  {acc.monthly_cost ? `R${acc.monthly_cost.toLocaleString()}/mo` : "Contact"}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">★ {(acc.rating || 0).toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    <Link to={`/accommodation/all/${encodeURIComponent(university.name)}`.toLowerCase().replace(/[^a-z0-9/]+/g, '-')}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm text-xs font-semibold py-5">
                        Explore All Student Accommodations
                        <ChevronRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <Home className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm text-slate-500 mb-4">No accommodation listings found near {university.name} yet.</p>
                    <Link to="/student-accommodation">
                      <Button variant="outline" className="rounded-xl text-xs font-semibold">
                        Browse All Listings
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Resources Content */}
            <TabsContent value="resources" className="space-y-6 focus-visible:outline-none">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Support & Resources</h2>
                <p className="text-slate-500 text-xs md:text-sm">Student resources for {university.name}</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm md:text-base">Support & Contact details</h4>
                    <p className="text-slate-500 text-xs md:text-sm">
                      Access campus orientation guides, student handbooks and essential forms.
                    </p>
                  </div>
                  {university.website && (
                    <a
                      href={university.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition-all"
                    >
                      Visit Support Desk
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <ProgramDetailModal
          program={selectedProgram}
          university={university}
          isOpen={isProgramModalOpen}
          onClose={() => setIsProgramModalOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default UniversityProfile;
