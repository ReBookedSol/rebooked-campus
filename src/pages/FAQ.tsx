import Layout from "@/components/Layout";
import { useSEO } from "@/hooks/useSEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const faqs = [
  {
    q: "Is ReBooked Living free to use?",
    a: "Yes! Browsing listings, viewing basic details, and searching for accommodation is completely free. We offer optional Living Passes (weekly R24.99, monthly R69) that unlock premium features like all photos, all reviews, full interactive maps with satellite view, and an ad-free experience.",
  },
  {
    q: "What does 'accredited' mean?",
    a: "Accredited means a property has been approved by a specific university's housing office as meeting their standards for off-campus student accommodation. This typically involves safety inspections, proximity requirements, and facility standards. Always verify accreditation directly with your university's housing office before signing any agreement.",
  },
  {
    q: "How do I know if a place is safe?",
    a: "We display security-related amenities like 24/7 security, CCTV surveillance, and fire safety equipment on each listing. However, we strongly recommend: (1) Always visit the property in person before paying any deposit. (2) Check the area during both day and night. (3) Ask current tenants about their experience. (4) Verify the landlord's identity documents. ReBooked Living is a discovery platform — we do not physically inspect properties.",
  },
  {
    q: "Does ReBooked Living book the accommodation for me?",
    a: "No. ReBooked Living is a directory and discovery platform only. We help you find and compare accommodation options, but any agreement you make is directly between you and the landlord. We are not a letting agent, broker, or property manager.",
  },
  {
    q: "How do I know if a property is NSFAS accredited?",
    a: "Listings marked with the NSFAS badge have been flagged as NSFAS accredited based on data provided at the time of listing. However, NSFAS accreditation status can change. You must always confirm current NSFAS accreditation directly with NSFAS or your university's housing office before relying on this for funding purposes.",
  },
  {
    q: "Can I get a refund on my Living Pass?",
    a: "All sales are final. Because the Living Pass is a digital service that activates immediately upon payment, no refunds are issued. Please see our Terms & Conditions for full details.",
  },
  {
    q: "How do I report a suspicious listing?",
    a: "Every listing has a 'Report' button. You can also email us at support@rebookedsolutions.co.za with details about the listing and your concern. We take reports seriously and will investigate promptly.",
  },
  {
    q: "Is my personal information safe?",
    a: "We take privacy seriously and comply with South Africa's POPIA. We don't store card details (payments go through Paystack), and we never sell your personal information. Read our full Privacy Policy for details.",
  },
  {
    q: "Can landlords list their properties on ReBooked Living?",
    a: "Yes! Landlords can create an account and submit their properties for review. Once approved, listings go live on the platform. Visit the landlord section for more information.",
  },
];

const FAQ = () => {
  useSEO({
    title: "FAQ — Student Accommodation Questions",
    description: "Answers about NSFAS accreditation, safety, Living Pass pricing, refunds, and how ReBooked Living's directory works.",
    keywords: "student accommodation FAQ, NSFAS questions, ReBooked Living help",
    canonical: "/faq",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  });

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-20">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Frequently Asked Questions</h1>
        <p className="mb-10 text-muted-foreground">Everything you need to know about using ReBooked Living to find student accommodation in South Africa.</p>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border px-5">
              <AccordionTrigger className="text-left font-semibold text-sm md:text-base py-4 hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 rounded-xl border bg-muted/30 p-6 text-center">
          <p className="font-semibold">Still have questions?</p>
          <p className="mt-1 text-sm text-muted-foreground">Reach out to our team and we'll get back to you as soon as possible.</p>
          <Link to="/contact" className="mt-4 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
