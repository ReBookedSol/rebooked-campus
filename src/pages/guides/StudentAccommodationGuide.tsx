import Layout from "@/components/Layout";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Wallet, Building2, CheckCircle2, ShieldAlert, ClipboardList, Search, Home } from "lucide-react";

const StudentAccommodationGuide = () => {
  useSEO({
    title: "How to Find Student Accommodation in South Africa — Complete Guide 2025",
    description: "The ultimate guide to finding safe, affordable student accommodation in South Africa. Tips for NSFAS students, first-years, and anyone looking for off-campus housing.",
    keywords: "student accommodation South Africa, find student housing, off-campus accommodation guide, NSFAS accommodation",
    canonical: "/guides/how-to-find-student-accommodation-in-south-africa",
  });

  const sections = [
    {
      icon: Calendar,
      title: "1. Start Early",
      body: (
        <p>The biggest mistake students make is waiting until January to look for accommodation. Most quality, affordable places are taken by October–November the year before. Start your search as early as possible — ideally right after you receive your acceptance letter or while you're still applying.</p>
      ),
    },
    {
      icon: Wallet,
      title: "2. Know Your Budget",
      body: (
        <>
          <p className="mb-3">Before you start browsing, be honest about what you can afford. Consider:</p>
          <ul className="space-y-2 ml-4 list-disc marker:text-primary">
            <li><strong>Monthly rent</strong> — typically R1,500 to R6,000 depending on the city and type</li>
            <li><strong>Deposit</strong> — usually one month's rent</li>
            <li><strong>Utilities</strong> — electricity, water, internet (sometimes included)</li>
            <li><strong>Transport</strong> — how far is the place from campus?</li>
            <li><strong>Food</strong> — does the place include meals or have cooking facilities?</li>
          </ul>
          <p className="mt-3">If you're funded by NSFAS, check exactly what your accommodation allowance covers. NSFAS typically pays directly to accredited accommodation providers.</p>
        </>
      ),
    },
    {
      icon: Building2,
      title: "3. Types of Student Accommodation",
      body: (
        <ul className="space-y-2 ml-4 list-disc marker:text-primary">
          <li><strong>University residences</strong> — on-campus, managed by the university. Limited spots, apply early.</li>
          <li><strong>Purpose-built student accommodation (PBSA)</strong> — private residences designed for students, often near campus.</li>
          <li><strong>Private rentals</strong> — apartments, rooms, or houses rented from private landlords.</li>
          <li><strong>Sharing</strong> — splitting a flat or house with other students to reduce costs.</li>
          <li><strong>Homestays</strong> — living with a family near campus.</li>
        </ul>
      ),
    },
    {
      icon: CheckCircle2,
      title: "4. What to Look For",
      body: (
        <>
          <p className="mb-3">When evaluating accommodation, check for:</p>
          <ul className="space-y-2 ml-4 list-disc marker:text-primary">
            <li><strong>Safety and security</strong> — 24/7 security, CCTV, secure access, fire equipment</li>
            <li><strong>Proximity to campus</strong> — walking distance or reliable transport routes</li>
            <li><strong>Amenities</strong> — WiFi, study rooms, laundry, furnished rooms</li>
            <li><strong>Lease terms</strong> — minimum period and early-exit policy</li>
            <li><strong>Reviews from other students</strong> — check what current and past tenants say</li>
            <li><strong>Accreditation status</strong> — is it approved by your university?</li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-hover text-white">
        <div className="container mx-auto max-w-5xl px-4 py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur mb-5">
            <Home className="w-3.5 h-3.5" /> Student Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">How to Find Student Accommodation in South Africa</h1>
          <p className="text-lg text-white/90 max-w-2xl mb-8">A complete guide for students searching for safe, affordable off-campus housing in 2025/2026.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/student-accommodation"><Button className="bg-white text-primary hover:bg-white/90"><Search className="w-4 h-4" /> Browse Listings</Button></Link>
            <Link to="/nsfas-accommodation-guide"><Button variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">NSFAS Guide</Button></Link>
          </div>
        </div>
      </section>

      <article className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="grid gap-5 md:grid-cols-2">
          {sections.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary"><Icon className="w-5 h-5" /></div>
                <h2 className="text-lg font-bold">{title}</h2>
              </div>
              <div className="text-sm text-foreground/85 leading-relaxed">{body}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border-l-4 border-destructive bg-destructive/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive"><ShieldAlert className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold">5. Avoid Scams</h2>
          </div>
          <p className="text-sm text-foreground/85 mb-3">Accommodation scams targeting students are unfortunately common. Protect yourself:</p>
          <ul className="space-y-2 ml-4 list-disc marker:text-destructive text-sm text-foreground/85">
            <li><strong>Never pay a deposit without visiting the property in person</strong></li>
            <li>Verify the landlord's ID — ask to see their South African identity document</li>
            <li>Be suspicious of prices that are too good to be true</li>
            <li>Don't send money via informal channels like personal bank accounts</li>
            <li>Get a proper lease agreement in writing before paying anything</li>
            <li>Check if the property actually exists at the stated address</li>
          </ul>
        </div>

        <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary"><Search className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold">6. Use ReBooked Living to Compare</h2>
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed">ReBooked Living lets you search, compare, and review student accommodation across South Africa. Filter by university, city, price, NSFAS accreditation, and amenities — all in one place. Free to browse, with premium features on the Living Pass.</p>
        </div>

        <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/10 text-accent"><ClipboardList className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold">7. Your Checklist Before Signing</h2>
          </div>
          <ol className="space-y-2 ml-5 list-decimal marker:text-primary text-sm text-foreground/85">
            <li>Visit the property in person</li>
            <li>Verify the landlord's identity</li>
            <li>Confirm accreditation with your university housing office</li>
            <li>Read the full lease agreement</li>
            <li>Understand cancellation terms and deposit refund policy</li>
            <li>Take photos of the property's condition before moving in</li>
            <li>Get emergency contact numbers for maintenance issues</li>
          </ol>
        </div>

        <div className="mt-10 rounded-xl bg-gradient-to-r from-accent to-primary p-8 text-white shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Ready to find your place?</h2>
              <p className="text-sm text-white/90">Browse thousands of verified student accommodation listings across South Africa.</p>
            </div>
            <Link to="/student-accommodation"><Button className="bg-white text-primary hover:bg-white/90">Browse Accommodation</Button></Link>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default StudentAccommodationGuide;
