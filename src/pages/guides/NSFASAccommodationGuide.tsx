import Layout from "@/components/Layout";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Wallet, Search, CheckCircle2, ShieldAlert, AlertTriangle, Phone } from "lucide-react";

const NSFASAccommodationGuide = () => {
  useSEO({
    title: "NSFAS Accommodation Guide — How to Find Approved Student Housing",
    description: "Everything NSFAS students need to know about finding accredited accommodation, what NSFAS covers, and how to avoid common mistakes.",
    keywords: "NSFAS accommodation, NSFAS accredited housing, NSFAS student accommodation guide, NSFAS allowance",
    canonical: "/nsfas-accommodation-guide",
  });

  const cards = [
    {
      icon: GraduationCap,
      title: "What Is NSFAS Accommodation?",
      body: "The National Student Financial Aid Scheme (NSFAS) provides funding for eligible South African students at public universities and TVET colleges. Part of this funding covers accommodation — but only at properties that are accredited by your university and approved by NSFAS.",
    },
    {
      icon: Wallet,
      title: "How NSFAS Pays Rent",
      body: (
        <>
          <p className="mb-2">NSFAS typically pays your accommodation directly to the accredited provider. You don't receive the money in your personal account.</p>
          <ul className="space-y-1.5 ml-4 list-disc marker:text-primary">
            <li>You must stay in an NSFAS-accredited property</li>
            <li>The university housing office manages the accreditation list</li>
            <li>Non-accredited property = NSFAS won't cover your rent</li>
          </ul>
        </>
      ),
    },
    {
      icon: Search,
      title: "How to Find NSFAS-Accredited Accommodation",
      body: (
        <ol className="space-y-1.5 ml-4 list-decimal marker:text-primary">
          <li><strong>Check your university's housing office</strong> for the official list</li>
          <li><strong>Use ReBooked Living</strong> — filter by "NSFAS Accredited"</li>
          <li><strong>Apply early</strong> — accredited spots fill up fast</li>
          <li><strong>Always verify</strong> directly with the housing office before signing</li>
        </ol>
      ),
    },
    {
      icon: CheckCircle2,
      title: "What to Look For",
      body: (
        <ul className="space-y-1.5 ml-4 list-disc marker:text-primary">
          <li>Verified NSFAS accreditation (confirmed by the university)</li>
          <li>Safe environment — security, CCTV, fire safety</li>
          <li>Study-friendly — quiet, WiFi, study rooms</li>
          <li>Close to campus or reliable transport</li>
          <li>Clean and well-maintained — always visit first</li>
        </ul>
      ),
    },
  ];

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary to-primary-hover text-white">
        <div className="container mx-auto max-w-5xl px-4 py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur mb-5">
            <GraduationCap className="w-3.5 h-3.5" /> NSFAS Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">NSFAS Student Accommodation Guide</h1>
          <p className="text-lg text-white/90 max-w-2xl mb-8">Everything you need to know about finding NSFAS-accredited accommodation and using your allowance wisely.</p>
          <Link to="/student-accommodation?nsfas=true"><Button className="bg-white text-primary hover:bg-white/90"><Search className="w-4 h-4" /> Browse NSFAS Listings</Button></Link>
        </div>
      </section>

      <article className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="grid gap-5 md:grid-cols-2">
          {cards.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary"><Icon className="w-5 h-5" /></div>
                <h2 className="text-lg font-bold">{title}</h2>
              </div>
              <div className="text-sm text-foreground/85 leading-relaxed">{body}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border-l-4 border-primary bg-primary/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary"><CheckCircle2 className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold">What Does NSFAS Cover?</h2>
          </div>
          <ul className="space-y-1.5 ml-4 list-disc marker:text-primary text-sm text-foreground/85">
            <li>Monthly rent at accredited off-campus accommodation</li>
            <li>Sometimes includes meals in catering residences</li>
            <li>Does NOT usually cover deposits — confirm with financial aid</li>
            <li>Does NOT cover holiday periods unless specified</li>
          </ul>
        </div>

        <div className="mt-6 rounded-xl border-l-4 border-accent bg-accent/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent/10 text-accent"><AlertTriangle className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold">Common Mistakes to Avoid</h2>
          </div>
          <ul className="space-y-1.5 ml-4 list-disc marker:text-accent text-sm text-foreground/85">
            <li>Paying a deposit before verifying accreditation</li>
            <li>Signing a lease at a non-accredited property</li>
            <li>Not reading the lease agreement carefully</li>
            <li>Sending money before visiting and verifying the landlord</li>
          </ul>
        </div>

        <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary"><Phone className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold">Need Help?</h2>
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed">Contact your university's financial aid or housing office, or reach out to the NSFAS contact centre at <strong>08000 67327</strong>.</p>
        </div>

        <div className="mt-10 rounded-xl bg-gradient-to-r from-accent to-primary p-8 text-white shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Ready to Browse NSFAS Properties?</h2>
              <p className="text-sm text-white/90">Filter verified NSFAS-accredited properties on ReBooked Living.</p>
            </div>
            <Link to="/student-accommodation?nsfas=true"><Button className="bg-white text-primary hover:bg-white/90">Browse NSFAS Accommodation</Button></Link>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default NSFASAccommodationGuide;
