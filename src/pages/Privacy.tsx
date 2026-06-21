import Layout from "@/components/Layout";
import { useSEO } from "@/hooks/useSEO";
import { ShieldAlert } from "lucide-react";

const Privacy = () => {
  useSEO({
    title: "Privacy Policy — ReBooked Living",
    description: "Comprehensive privacy policy for ReBooked Living, compliant with POPIA.",
    canonical: "/privacy",
  });

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary to-primary-hover text-white">
        <div className="container mx-auto max-w-5xl px-4 py-14 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur mb-5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3">Privacy Policy</h1>
          <p className="text-white/90"><strong>Effective Date:</strong> June 14, 2026 · <strong>Operator:</strong> ReBooked Solutions (Pty) Ltd</p>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4 mt-12">
        <div className="rounded-xl border-l-4 border-destructive bg-destructive/5 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-destructive !m-0">IMPORTANT — PLEASE READ BEFORE CONTINUING</h2>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            This Privacy Policy outlines how we collect, use, and protect your personal information. Please read it carefully to understand your rights and our obligations.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16"><div className="space-y-8 text-foreground/90 leading-relaxed text-sm md:text-base">
        <h2>1. INTRODUCTION AND WHO WE ARE</h2>
        <p>ReBooked Solutions (Pty) Ltd ("we", "us", "our", "the Company") operates ReBooked Living, a digital student accommodation discovery platform accessible at <a href="https://living.rebookedsolutions.co.za" className="text-primary hover:underline">living.rebookedsolutions.co.za</a> ("the Platform").</p>
        <p>We are committed to protecting your personal information in accordance with the Protection of Personal Information Act 4 of 2013 ("POPIA"), the Electronic Communications and Transactions Act 25 of 2002 ("ECT Act"), and all other applicable South African data protection legislation.</p>
        <p>This Privacy Policy explains what personal information we collect, why we collect it, how we use and protect it, who we share it with, and what rights you have. It must be read together with our Terms and Conditions.</p>
        <h3>Information Officer</h3>
        <p>Email: <a href="mailto:legal@rebookedsolutions.co.za" className="text-primary hover:underline">legal@rebookedsolutions.co.za</a><br/>Platform: <a href="https://living.rebookedsolutions.co.za" className="text-primary hover:underline">living.rebookedsolutions.co.za</a></p>
        <h3>Information Regulator of South Africa</h3>
        <p>Website: <a href="https://inforegulator.org.za" target="_blank" rel="noreferrer" className="text-primary hover:underline">inforegulator.org.za</a><br/>Email: <a href="mailto:inforeg@justice.gov.za" className="text-primary hover:underline">inforeg@justice.gov.za</a></p>

        <h2>2. AGE REQUIREMENT</h2>
        <p>This Platform is intended for users who are 18 years of age or older. By registering on this Platform, you confirm that you are 18 or older. If you are under 18, you must not register or use this Platform.</p>
        <p>We do not knowingly collect personal information from persons under 18. If we become aware that a user is under 18, we will suspend the account and delete the associated personal information without notice. Any misrepresentation of age at registration is solely the responsibility of the user.</p>

        <h2>3. PERSONAL INFORMATION WE COLLECT</h2>
        <ul>
          <li><strong>Account and Registration Information</strong>: Full name, email address, university or institution affiliation, year of study (where provided), password (encrypted, hashed).</li>
          <li><strong>Profile and Preference Information</strong>: Saved or favourited listings, search history and filter preferences, subscription tier and pass status.</li>
          <li><strong>Payment and Billing Information</strong>: Transaction reference numbers, subscription type and billing dates, pass purchase history. (Payment data is processed exclusively by BobPay; we only receive confirmation references.)</li>
          <li><strong>Usage and Technical Data</strong>: IP address, browser type and version, device type and OS, pages visited, features accessed, time spent, session identifiers, authentication tokens, error logs.</li>
          <li><strong>Location Data</strong>: Approximate location derived from IP for relevant listings; precise location only if you explicitly grant permission for map features via Mapbox.</li>
          <li><strong>Communications and Support Data</strong>: Emails, support requests, listing reports you submit.</li>
          <li><strong>User‑Generated Content</strong>: Reviews, ratings, comments, uploaded photos.</li>
          <li><strong>Advertising and Tracking Data (Free‑Tier Users Only)</strong>: Advertising identifiers and cookie data collected by third‑party ad networks.</li>
          <li><strong>Landlord and Lister Information</strong>: Business name, property addresses, contact numbers when you register as a lister.</li>
        </ul>

        <h2>4. LAWFUL BASIS FOR PROCESSING</h2>
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left">Processing Activity</th>
              <th className="px-4 py-2 text-left">Lawful Basis</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-700">
              <td className="px-4 py-2">Account creation and authentication</td>
              <td className="px-4 py-2">Contractual necessity</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Payment processing and billing</td>
              <td className="px-4 py-2">Contractual necessity</td>
            </tr>
            <tr className="bg-gray-700">
              <td className="px-4 py-2">Displaying relevant listings</td>
              <td className="px-4 py-2">Contractual necessity</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Transactional emails</td>
              <td className="px-4 py-2">Contractual necessity</td>
            </tr>
            <tr className="bg-gray-700">
              <td className="px-4 py-2">Marketing communications</td>
              <td className="px-4 py-2">Consent – opt‑in only</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Serving ads to free users</td>
              <td className="px-4 py-2">Legitimate interest and cookie consent</td>
            </tr>
            <tr className="bg-gray-700">
              <td className="px-4 py-2">Analytics and platform improvement</td>
              <td className="px-4 py-2">Legitimate interest</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Fraud detection and prevention</td>
              <td className="px-4 py-2">Legitimate interest and legal obligation</td>
            </tr>
            <tr className="bg-gray-700">
              <td className="px-4 py-2">Legal compliance</td>
              <td className="px-4 py-2">Legal obligation</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Retaining records post‑closure</td>
              <td className="px-4 py-2">Legal obligation</td>
            </tr>
          </tbody>
        </table>

        <h2>5. HOW WE USE YOUR PERSONAL INFORMATION</h2>
        <ul>
          <li>Platform operation and account management</li>
          <li>Subscription and payment administration</li>
          <li>Personalisation and platform features</li>
          <li>Marketing and communications (opt‑in only)</li>
          <li>Advertising for free‑tier users</li>
          <li>Safety, security and fraud prevention</li>
          <li>Analytics and service improvement</li>
          <li>Legal compliance</li>
        </ul>

        <h2>6. SHARING YOUR PERSONAL INFORMATION</h2>
        <p>We do not sell, rent, or trade your personal information. We share it only in the following limited circumstances:</p>
        <h3>Service Providers</h3>
        <ul>
          <li><strong>BobPay</strong> – payment processing (transaction amount, email, reference)</li>
          <li><strong>Mapbox</strong> – maps and routing (location data you grant)</li>
          <li><strong>Supabase</strong> – backend infrastructure and data storage</li>
          <li><strong>Adsterra</strong> – advertising to free‑tier users (device identifiers, cookie data)</li>
          <li><strong>Google AdSense</strong> – advertising to free‑tier users (device identifiers, cookie data)</li>
        </ul>
        <h3>Legal and Regulatory Disclosure</h3>
        <p>We may disclose personal information to law enforcement, courts, or regulators where legally required or to protect safety, investigate fraud, or comply with legal obligations.</p>
        <h3>Business Transfers</h3>
        <p>In the event of a merger, acquisition, or sale of assets, your personal information may be transferred to the successor entity. You will be notified.</p>
        <h3>Aggregated and Anonymised Data</h3>
        <p>We may share aggregated, anonymised statistical data for research or business development purposes. This data cannot be used to identify any individual user.</p>

        <h2>7. COOKIES AND TRACKING TECHNOLOGIES</h2>
        <ul>
          <li><strong>Essential Cookies</strong> – required for authentication, session management, and security.</li>
          <li><strong>Analytics Cookies</strong> – collect aggregated usage data.</li>
          <li><strong>Advertising Cookies (Free‑Tier Users Only)</strong> – placed by third‑party ad networks to serve relevant ads.</li>
        </ul>
        <p>You can manage cookie preferences via your browser settings. Disabling essential cookies will impair core functionality.</p>

        <h2>8. DATA RETENTION</h2>
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left">Data Category</th>
              <th className="px-4 py-2 text-left">Retention Period</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-700"><td className="px-4 py-2">Account and profile data</td><td className="px-4 py-2">Duration of account + 5 years after closure</td></tr>
            <tr><td className="px-4 py-2">Transaction and billing records</td><td className="px-4 py-2">7 years (statutory)</td></tr>
            <tr className="bg-gray-700"><td className="px-4 py-2">Support and correspondence records</td><td className="px-4 py-2">3 years from last interaction</td></tr>
            <tr><td className="px-4 py-2">Usage and analytics data</td><td className="px-4 py-2">2 years identifiable, indefinite anonymised</td></tr>
            <tr className="bg-gray-700"><td className="px-4 py-2">User‑generated content</td><td className="px-4 py-2">Retained in anonymised form after account closure</td></tr>
            <tr><td className="px-4 py-2">Fraud investigation records</td><td className="px-4 py-2">Up to 7 years where legal proceedings are anticipated</td></tr>
          </tbody>
        </table>

        <h2>9. YOUR RIGHTS UNDER POPIA</h2>
        <ul>
          <li><strong>Right of Access</strong> – request a copy of your personal data.</li>
          <li><strong>Right to Correction</strong> – request inaccurate data be corrected.</li>
          <li><strong>Right to Deletion</strong> – request removal of your data where no longer necessary.</li>
          <li><strong>Right to Object</strong> – object to direct marketing communications.</li>
          <li><strong>Right to Withdraw Consent</strong> – withdraw consent for processing based on consent.</li>
          <li><strong>Right to Lodge a Complaint</strong> – with the Information Regulator of South Africa.</li>
        </ul>
        <p>To exercise any of these rights, contact us at <a href="mailto:legal@rebookedsolutions.co.za" className="text-primary hover:underline">legal@rebookedsolutions.co.za</a>. We will respond within 30 days and may request proof of identity.</p>

        <h2>10. DATA SECURITY</h2>
        <p>We implement reasonable technical and organisational measures, including TLS/HTTPS, encryption at rest, hashed passwords, role‑based access controls, regular security assessments, and secure Supabase hosting. No method is 100% secure; we accept no liability for breaches despite reasonable measures.</p>
        <p><strong>Data Breach Notification:</strong> In the event of a breach that poses a risk, we will notify the Information Regulator and affected users promptly.</p>

        <h2>11. CROSS‑BORDER TRANSFERS</h2>
        <p>Third‑party providers such as Supabase and Mapbox may process data on servers outside South Africa. We ensure adequate safeguards are in place in line with POPIA.</p>

        <h2>12. DIRECT MARKETING</h2>
        <p>We only send direct marketing communications where you have opted in. Each marketing email includes an "Unsubscribe" link. You may also email <a href="mailto:legal@rebookedsolutions.co.za" className="text-primary hover:underline">legal@rebookedsolutions.co.za</a> with the subject line "UNSUBSCRIBE". Withdrawal will be processed within 5 business days and does not affect transactional communications.</p>

        <h2>13. AUTOMATED DECISION‑MAKING</h2>
        <p>We use automated systems for personalisation (e.g., location‑based listings) but they do not produce legally significant decisions without human oversight.</p>

        <h2>14. CHANGES TO THIS POLICY</h2>
        <p>We may update this policy at any time. Material changes will be notified via email and a prominent notice on the Platform at least 7 days before they take effect. Continued use after the effective date constitutes acceptance.</p>

        <h2>15. CONTACT US</h2>
        <p>For any privacy‑related enquiries, contact our Information Officer:</p>
        <p className="text-sm">Email: <a href="mailto:legal@rebookedsolutions.co.za" className="text-primary hover:underline">legal@rebookedsolutions.co.za</a></p>
        <p>Registration No: 2025/452062/07</p>
        <p>Last Updated: June 14, 2026</p>
      </div></div>
    </Layout>
  );
};

export default Privacy;
