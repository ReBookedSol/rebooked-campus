import Layout from "@/components/Layout";
import { useSEO } from "@/hooks/useSEO";
import { FileText, ShieldAlert } from "lucide-react";

const Terms = () => {
  useSEO({
    title: "Terms & Conditions — ReBooked Living",
    description: "Terms and conditions for ReBooked Living.",
    canonical: "/terms"
  });

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary to-primary-hover text-white">
        <div className="container mx-auto max-w-5xl px-4 py-14 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur mb-5">
            <FileText className="w-3.5 h-3.5" /> Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3">Terms & Conditions</h1>
          <p className="text-white/90"><strong>Effective:</strong> June 14, 2026 · <strong>Operated by:</strong> ReBooked Solutions (Pty) Ltd (Reg: 2025/452062/07)</p>
        </div>
      </section>

      <article className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        {/* CPA Highlight Warning */}
        <div className="mb-10 rounded-xl border-l-4 border-destructive bg-destructive/5 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-destructive">IMPORTANT — PLEASE READ BEFORE CONTINUING</h2>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            These Terms limit our legal liability to you. They require you to indemnify us in certain circumstances. They contain an anti-fraud warning that places responsibility for verifying landlords and properties on you. These clauses are highlighted throughout this document and are brought to your attention in compliance with Section 49 of the Consumer Protection Act 68 of 2008. By registering or using this Platform you confirm you have read and understood them.
          </p>
        </div>

        {/* Long-form terms text */}
        <div className="space-y-8 text-foreground/90 leading-relaxed text-sm md:text-base">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">1. BINDING AGREEMENT</h2>
            <p className="mb-4">
              By accessing, browsing, registering on, or using the ReBooked Living platform ("the Platform"), whether via web browser, mobile device, or any other means, you ("the User", "you") enter into a legally binding agreement with ReBooked Solutions (Pty) Ltd ("the Company", "we", "us") governed by these Terms and Conditions ("Terms").
            </p>
            <p className="mb-4">
              If you do not agree to these Terms in full, you must immediately cease all use of the Platform. Accessing any part of the Platform after being presented with these Terms constitutes unambiguous acceptance.
            </p>
            <p className="mb-4">
              These Terms are governed by and enforceable under South African law, including the Electronic Communications and Transactions Act 25 of 2002 ("ECT Act"), the Consumer Protection Act 68 of 2008 ("CPA"), and the Protection of Personal Information Act 4 of 2013 ("POPIA").
            </p>
            <p className="font-semibold mb-2">Age Requirement</p>
            <p className="mb-4">
              By registering on this Platform, you confirm that you are 18 years of age or older. If you are under 18, you must not register or use this Platform. We do not knowingly collect personal information from persons under 18. If we become aware that a user is under 18, we will suspend the account and delete the associated personal information. Any misrepresentation of age at registration is solely the responsibility of the user.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">2. NATURE OF SERVICE — DISCOVERY PLATFORM ONLY</h2>
            <p className="mb-4">
              ReBooked Living is a digital accommodation discovery and listing platform. Its sole function is to present accommodation listings to students for informational and exploratory purposes.
            </p>
            <p className="font-bold text-destructive mb-4">
              ► This is not a letting agency. We are not your landlord. We are not your agent.
            </p>
            <p className="mb-4">
              ReBooked Solutions (Pty) Ltd is not, under any circumstances, a landlord, property owner, rental agent, housing broker, accommodation provider, property manager, or housing authority. We have no control over, ownership of, or responsibility for any property listed on the Platform.
            </p>
            <p className="mb-4">
              We do not physically inspect any listed property. We do not verify the condition, safety, habitability, security, or suitability of any listing. We do not verify the identity, licensing, credentials, or legitimacy of any landlord or property owner.
            </p>
            <p className="mb-4">
              Any rental agreement, lease, verbal agreement, deposit arrangement, or any other legal or financial relationship entered into as a result of a discovery made through this Platform is exclusively between you and the relevant landlord or property owner. ReBooked Solutions (Pty) Ltd is not a party to any such arrangement and accepts zero liability arising from it.
            </p>
            <p className="mb-4">
              Listings described as "university-accredited" or "NSFAS-approved" reflect information supplied by property owners or sourced from publicly available records at the time of listing. We do not independently verify, audit, confirm, or guarantee the ongoing accuracy of any accreditation or NSFAS eligibility claim. Accreditation status can be revoked or changed by an institution at any time without our knowledge. Users must verify all such claims directly and independently with their institution or NSFAS before making any housing commitment. No university, TVET college, or higher education institution is affiliated with, endorsed by, or in any way partnered with ReBooked Living.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/5">
            <h2 className="text-xl md:text-2xl font-bold text-destructive mb-4">3. ANTI-FRAUD WARNING AND NOTICE AND TAKEDOWN PROCEDURE</h2>
            <p className="font-bold text-destructive mb-4">
              ► THIS SECTION CONTAINS IMPORTANT WARNINGS AND IS BROUGHT TO YOUR ATTENTION IN TERMS OF SECTION 49 OF THE CPA.
            </p>
            <p className="mb-4">
              Accommodation and property rental fraud is serious and widespread in South Africa. By using this Platform you acknowledge the following without reservation:
            </p>
            <ul className="list-disc ml-5 mb-4 space-y-2">
              <li>
                <strong>Never</strong> transfer money, pay a deposit, advance rent, or make any payment to any landlord, agent, or third party without first visiting the property in person and independently verifying the identity of the person you are transacting with.
              </li>
              <li>
                ReBooked Living does not process, facilitate, hold, or receive any rental payments, deposits, or financial transfers between users and landlords. If anyone claims to be collecting payment on behalf of ReBooked Living for accommodation purposes, this is fraudulent — report it immediately to us and to the South African Police Service.
              </li>
              <li>
                <strong>ReBooked Solutions (Pty) Ltd will not investigate, mediate, arbitrate, or assist in recovering funds lost as a result of fraudulent listings, identity impersonation, or rental scams, regardless of whether those listings appeared on this Platform.</strong>
              </li>
              <li>
                You assume full and sole responsibility for conducting due diligence before entering into any housing arrangement discovered through this Platform.
              </li>
            </ul>
            <p className="font-semibold mb-2">Reporting a Fraudulent or Suspicious Listing:</p>
            <p className="mb-4">
              If you encounter a listing you believe to be fraudulent, misleading, or in violation of these Terms, you must report it using one of the following methods:
            </p>
            <ul className="list-disc ml-5 mb-4 space-y-2">
              <li>Using the "Report Listing" button available on every listing page on the Platform, or</li>
              <li>Emailing <a href="mailto:info@rebookedsolutions.co.za" className="text-primary hover:underline">info@rebookedsolutions.co.za</a> with the subject line "LISTING REPORT" and including the listing name, URL, and a description of your concern</li>
            </ul>
            <p className="font-semibold mb-2">Upon receiving a valid report, we commit to the following procedure:</p>
            <ul className="list-disc ml-5 space-y-2">
              <li><strong>Within 24 hours:</strong> Acknowledge receipt of the report</li>
              <li><strong>Within 48 hours:</strong> Review the reported listing and, where sufficient cause exists, temporarily freeze the listing pending investigation</li>
              <li><strong>Within 7 business days:</strong> Conclude our internal review and take appropriate action, which may include permanent removal of the listing and suspension of the associated lister account</li>
            </ul>
            <p className="mt-4">
              We reserve the right, but do not accept the obligation, to remove any listing at any time. Removal of a listing does not constitute an admission that fraud occurred or that we accept any liability in connection with it. We will cooperate fully with legitimate law enforcement requests and investigations.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">4. ACCESS TIERS AND SUBSCRIPTIONS</h2>
            <p className="mb-4">The Platform operates on a dual-access model:</p>
            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="font-bold mb-2">Free Tier:</p>
                <p className="text-sm">
                  Free users may access basic listing information including up to 3 photos per listing, 1 published review per listing, and a static map image. Advertisements are displayed to all free-tier users.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="font-bold text-primary mb-2">Living Pass (Paid Tier):</p>
                <p className="text-sm mb-2">Weekly Pass: R24.99 for one week</p>
                <p className="text-sm">Monthly Pass: R69.00 for one month</p>
              </div>
            </div>
            <p className="mb-4">
              The following features are restricted exclusively to Living Pass subscribers: full photo galleries, all reviews, landlord and property contact details, interactive maps, distance-to-campus calculations, route-to-campus visualisation, nearby amenities and points of interest data, and any additional premium features introduced at our discretion.
            </p>
            <p className="mb-4">
              The Living Pass is strictly personal and non-transferable. It is linked to a single registered account and may not be shared, sold, gifted, transferred, or used by any person other than the registered account holder. Account sharing is a material breach of these Terms and will result in immediate suspension without refund.
            </p>
            <p className="mb-4">
              Passes expire automatically at the end of the applicable billing period. Access to premium features is revoked immediately upon expiry. No grace period is guaranteed.
            </p>
            <p className="mb-4">
              Passes do not automatically renew. You must manually renew your pass to maintain uninterrupted access. You will not be charged without taking an affirmative action to repurchase.
            </p>
            <p className="mb-4">
              Any attempt — whether technical, automated, manual, or deceptive — to circumvent, bypass, replicate, or manipulate the Platform's access tier system constitutes a material breach of these Terms and will result in permanent account termination and may result in civil or criminal action.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">5. PAYMENTS, BILLING AND REFUND POLICY</h2>
            <p className="mb-4">
              All payments for the Living Pass are processed through BobPay, a third-party payment processor. By proceeding to payment you confirm that you have read and accepted these Terms and that you understand the no-refund policy set out below. A link to these Terms is displayed on the BobPay checkout page immediately before payment confirmation.
            </p>
            <p className="mb-4">
              ReBooked Solutions (Pty) Ltd does not directly store, access, or handle your payment card, bank account, or financial credentials. By making a payment you also agree to BobPay's applicable terms of service and privacy policy.
            </p>
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/10 mb-4">
              <p className="font-bold text-destructive mb-2">► ALL LIVING PASS PURCHASES ARE FINAL AND STRICTLY NON-REFUNDABLE. THIS CLAUSE IS BROUGHT TO YOUR ATTENTION IN TERMS OF SECTION 49 OF THE CPA.</p>
              <p className="text-sm mb-2">No refund, credit, or partial reimbursement will be issued under any of the following circumstances:</p>
              <ul className="list-disc ml-5 text-sm space-y-1">
                <li>Partial or unused portion of a pass period</li>
                <li>Account suspension or termination for breach of these Terms</li>
                <li>Change of mind or dissatisfaction with the Platform</li>
                <li>Failure to use the Platform during an active pass period</li>
                <li>Technical issues outside our reasonable control, including device failures, internet connectivity issues, or third-party service outages</li>
                <li>Duplicate purchases made in error — contact us immediately at info@rebookedsolutions.co.za and we will assess at our sole discretion</li>
              </ul>
            </div>
            <p className="mb-4">
              To the extent that the CPA provides a mandatory right that cannot lawfully be excluded, that right is not excluded. In all other respects, the no-refund policy applies in full.
            </p>
            <p className="mb-4">
              Pricing is subject to change at any time at our discretion. Pricing changes will be communicated via the Platform and will not affect the current active billing period of an existing subscriber. Continued use or repurchase after a pricing change constitutes acceptance of the new pricing.
            </p>
            <p className="mb-4">
              <strong>Disputed transactions:</strong> If you believe a charge was made in error, contact us at <a href="mailto:info@rebookedsolutions.co.za" className="text-primary hover:underline">info@rebookedsolutions.co.za</a> within 7 days of the charge. Initiating a chargeback or payment dispute through your bank or card provider without first contacting us constitutes a breach of these Terms. We reserve the right to permanently ban accounts associated with unwarranted chargebacks and to recover costs incurred as a result of such disputes.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">6. REWARDED ACCESS — ADVERTISEMENT VIEWING</h2>
            <p className="mb-4">
              The Platform may offer free-tier users the ability to unlock temporary access to certain restricted content by voluntarily watching a rewarded advertisement ("Rewarded Access"). Where this feature is available:
            </p>
            <ul className="list-disc ml-5 space-y-2">
              <li>Rewarded Access is temporary and limited to the specific listing or content unlocked at the time of viewing</li>
              <li>Rewarded Access does not constitute a subscription and confers no ongoing rights</li>
              <li>Rewarded Access periods are non-transferable and expire as specified at the time of unlock</li>
              <li>Completion of a rewarded ad is subject to successful delivery by the third-party ad network — we cannot guarantee ad availability at all times</li>
              <li>ReBooked Solutions (Pty) Ltd is not responsible for the content of advertisements served via third-party ad networks</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">7. USER ACCOUNTS</h2>
            <p className="mb-4">
              You are solely responsible for maintaining the security and confidentiality of your account login credentials. You must not disclose your password or access details to any other person.
            </p>
            <p className="mb-4">
              You accept full responsibility for all activity conducted under your account whether or not authorised by you. If you suspect unauthorised access to your account, notify us immediately at <a href="mailto:info@rebookedsolutions.co.za" className="text-primary hover:underline">info@rebookedsolutions.co.za</a>. We are not liable for losses resulting from unauthorised access where you failed to take reasonable steps to secure your credentials.
            </p>
            <p className="mb-4">
              You may hold only one registered account. Creating duplicate accounts to circumvent suspensions, bypass access restrictions, or abuse free-tier features is prohibited and will result in permanent termination of all associated accounts.
            </p>
            <p className="mb-4">
              You must ensure that all information provided at registration is accurate, current, and complete. Providing false registration information is a breach of these Terms and may constitute a violation of the ECT Act.
            </p>
            <p className="mb-4">
              We reserve the right to reclaim or deactivate usernames that we determine, at our sole discretion, to be misleading, offensive, or in violation of third-party rights.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">8. USER-GENERATED CONTENT</h2>
            <p className="mb-4">
              Users may submit reviews, ratings, comments, and photos to the Platform ("User Content"). By submitting User Content you represent, warrant, and agree that:
            </p>
            <ul className="list-disc ml-5 mb-4 space-y-2">
              <li>All content is accurate, truthful, and based on genuine personal experience with the relevant property or landlord</li>
              <li>You are the sole author or rights holder, or have obtained all necessary permissions</li>
              <li>The content does not infringe any copyright, trademark, privacy right, or other right of any third party</li>
              <li>The content does not contain defamatory, discriminatory, harassing, obscene, threatening, or unlawful material</li>
              <li>You will not post reviews for properties you have not personally visited or stayed at</li>
              <li>You will not post reviews in exchange for payment, incentives, or at the direction of any landlord or third party</li>
            </ul>
            <p className="mb-4">
              By submitting User Content you grant ReBooked Solutions (Pty) Ltd a perpetual, irrevocable, worldwide, royalty-free, non-exclusive licence to use, publish, display, reproduce, modify, distribute, and create derivative works from your User Content in connection with the operation and promotion of the Platform and the broader ReBooked ecosystem.
            </p>
            <p className="mb-4">
              We reserve the right to remove, edit, or reject any User Content at our sole discretion and without notice or liability. We do not verify the accuracy of reviews and accept no liability for User Content posted by third parties.
            </p>
            <p className="mb-4">
              Submitting false, fabricated, or manipulated reviews is strictly prohibited. Such conduct may result in account termination and, where it constitutes defamation or malicious publication under South African law, may expose the user to civil legal action.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">9. LANDLORD AND PROPERTY OWNER CONDUCT</h2>
            <p className="mb-4">
              Where a landlord, property owner, or accommodation provider ("Lister") creates or manages listings on the Platform:
            </p>
            <ul className="list-disc ml-5 mb-4 space-y-2">
              <li>The Lister warrants that all listing information is accurate, current, and not misleading in any material respect</li>
              <li>The Lister warrants that they have the legal right to advertise and list the property</li>
              <li>The Lister must not misrepresent accreditation status, NSFAS approval, pricing, availability, amenities, or any other material detail</li>
              <li>The Lister accepts sole and full responsibility for all interactions with prospective tenants originating from their listing</li>
              <li>The Lister may not use the Platform to facilitate illegal rental practices, unlawful discrimination, or any form of tenant exploitation</li>
              <li>The Lister may not list a property that they do not own or have authorisation to list</li>
              <li>ReBooked Solutions (Pty) Ltd reserves the right to remove any listing at any time without notice and without liability to the Lister</li>
            </ul>
            <p className="mb-4">
              Misrepresentation or misconduct by a Lister does not create any liability for ReBooked Solutions (Pty) Ltd. Users dealing with Listers do so entirely at their own risk.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">10. PROHIBITED CONDUCT</h2>
            <p className="mb-4">You agree that you will not:</p>
            <ul className="list-disc ml-5 mb-4 space-y-2">
              <li>Scrape, crawl, harvest, copy, or systematically extract data from the Platform by automated or manual means for any purpose</li>
              <li>Share, sell, lend, or transfer your account or Living Pass to any other person</li>
              <li>Reverse-engineer, decompile, disassemble, or attempt to extract the source code or underlying systems of the Platform</li>
              <li>Submit false, misleading, or fraudulent listings, reviews, or account information</li>
              <li>Manipulate listing rankings, review scores, or search results through artificial or deceptive means</li>
              <li>Use the Platform to transmit spam, phishing messages, malware, or unsolicited communications</li>
              <li>Create accounts under false identities or using another person's identity without authorisation</li>
              <li>Gain or attempt to gain unauthorised access to any restricted area of the Platform, its servers, databases, or connected systems</li>
              <li>Use the Platform in any manner that could damage, disable, overburden, or impair its infrastructure</li>
              <li>Engage in or facilitate harassment, intimidation, discrimination, or abuse of any user, landlord, or Platform representative</li>
              <li>Use the Platform for any purpose that violates any applicable South African law or regulation</li>
              <li>Attempt to interfere with or circumvent the Platform's security, access control, or subscription verification systems</li>
              <li>Use the Platform to facilitate any form of money laundering, fraud, or financial crime</li>
            </ul>
            <p className="mb-4">
              Breach of any prohibited conduct provision is a material breach of these Terms and will result in immediate account termination without refund, and without prejudice to any legal remedies available to ReBooked Solutions (Pty) Ltd.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">11. INTELLECTUAL PROPERTY</h2>
            <p className="mb-4">
              All content on the Platform that is not User Content — including but not limited to the platform design, interface, branding, logos, trademarks, text, layout, architecture, code, data compilations, and features — is the exclusive intellectual property of ReBooked Solutions (Pty) Ltd or its licensors and is protected by South African and international intellectual property law.
            </p>
            <p className="mb-4">
              Nothing in these Terms grants you any right, title, licence, or interest in any intellectual property owned by or licensed to us. You may not reproduce, distribute, publicly display, modify, or create derivative works from any Platform content without our prior express written consent.
            </p>
            <p className="mb-4">
              Any feedback, suggestions, or ideas you submit to us may be used freely and without obligation, compensation, or attribution to you.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">12. THIRD-PARTY SERVICES AND INTEGRATIONS</h2>
            <p className="mb-4">
              The Platform integrates various third-party services. We are not responsible for the performance, availability, accuracy, or conduct of any third-party service, including:
            </p>
            <ul className="list-disc ml-5 mb-4 space-y-2">
              <li><strong>BobPay</strong> — payment processing. Not liable for payment failures or processing delays.</li>
              <li><strong>Mapbox</strong> — mapping, routing, distance calculations, and nearby places data. All distances and routes are estimates only and may contain errors. Not liable for mapping inaccuracies.</li>
              <li><strong>Adsterra / Google AdSense</strong> — advertising for free-tier users. Not responsible for ad content or advertiser conduct.</li>
              <li><strong>Supabase</strong> — backend infrastructure. Not liable for data loss or outages beyond our reasonable control.</li>
            </ul>
            <p className="mb-4">
              Links to third-party websites are provided for convenience only. We do not endorse or accept responsibility for any third-party content, privacy practices, or services.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">13. PLATFORM AVAILABILITY</h2>
            <p className="mb-4">
              We do not warrant that the Platform will be available at all times, continuously, or without error. The Platform may be temporarily unavailable due to maintenance, technical failures, third-party outages, cyberattacks, load shedding, or circumstances beyond our reasonable control.
            </p>
            <p className="mb-4">
              We accept no liability for any loss or damage arising from Platform downtime or reduced functionality regardless of cause. No refund or credit will be issued for Living Pass periods affected by downtime unless the outage was continuous, extended, and entirely attributable to our fault, assessed at our sole discretion.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/5">
            <h2 className="text-xl md:text-2xl font-bold text-destructive mb-4">14. LIMITATION OF LIABILITY</h2>
            <p className="font-bold text-destructive mb-4">
              ► THIS SECTION LIMITS OUR LIABILITY TO YOU AND IS BROUGHT TO YOUR ATTENTION IN TERMS OF SECTION 49 OF THE CONSUMER PROTECTION ACT 68 OF 2008.
            </p>
            <p className="mb-4">
              To the fullest extent permitted by applicable South African law, ReBooked Solutions (Pty) Ltd, its directors, shareholders, officers, employees, contractors, agents, and affiliates expressly exclude liability for:
            </p>
            <ul className="list-disc ml-5 mb-4 space-y-2">
              <li>Any loss or damage arising from your reliance on listing information, landlord representations, or accreditation claims</li>
              <li>Financial loss of any kind including deposits, advance rent, or funds transferred to landlords or third parties</li>
              <li>Loss arising from rental disputes, lease breaches, property damage, eviction, uninhabitable conditions, or any landlord conduct</li>
              <li>Indirect, incidental, special, consequential, punitive, or exemplary damages of any nature</li>
              <li>Loss of data, income, opportunity, or goodwill</li>
              <li>Harm caused by third-party service failures</li>
              <li>Loss arising from unauthorised account access where reasonable security precautions were not taken by you</li>
              <li>Loss arising from scam activity, fraudulent listings, or impersonation by third parties</li>
            </ul>
            <p className="font-bold mb-4">
              Our total aggregate liability to any user, for any cause whatsoever, is strictly limited to the total amount paid by that user for their most recent Living Pass. Where the user is on the free tier, our total liability is R0.
            </p>
            <p className="mb-4">
              Nothing in this clause limits liability for gross negligence, wilful misconduct, or fraud by ReBooked Solutions (Pty) Ltd, or excludes any right that cannot lawfully be excluded under the CPA.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/5">
            <h2 className="text-xl md:text-2xl font-bold text-destructive mb-4">15. INDEMNIFICATION</h2>
            <p className="font-bold text-destructive mb-4">
              ► THIS CLAUSE REQUIRES YOU TO PROTECT US FROM CERTAIN CLAIMS AND IS BROUGHT TO YOUR ATTENTION IN TERMS OF SECTION 49 OF THE CPA.
            </p>
            <p className="mb-4">
              You agree to fully indemnify, defend, and hold harmless ReBooked Solutions (Pty) Ltd and its directors, officers, employees, contractors, and agents from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or related to:
            </p>
            <ul className="list-disc ml-5 space-y-2">
              <li>Your use of or access to the Platform</li>
              <li>Your breach of any provision of these Terms</li>
              <li>Any User Content you submit, post, or transmit</li>
              <li>Any rental agreement, dispute, or legal proceeding between you and a landlord or property owner</li>
              <li>Your violation of any applicable law, regulation, or third-party right</li>
              <li>Any misrepresentation made by you in connection with your use of the Platform</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">16. ACCOUNT SUSPENSION AND TERMINATION</h2>
            <p className="mb-4">
              We reserve the right to suspend, restrict, or permanently terminate your account at any time, with or without prior notice, for:
            </p>
            <ul className="list-disc ml-5 mb-4 space-y-2">
              <li>Breach of any provision of these Terms</li>
              <li>Suspected fraudulent, abusive, or unlawful activity</li>
              <li>Conduct harmful to the Platform, other users, landlords, or our business</li>
              <li>Failure to pay any outstanding amount</li>
              <li>Sustained inactivity combined with suspicious account activity</li>
            </ul>
            <p className="mb-4">Upon termination:</p>
            <ul className="list-disc ml-5 mb-4 space-y-2">
              <li>Your access ceases immediately and permanently</li>
              <li>No refund will be issued for any unused Living Pass period</li>
              <li>User Content you have submitted may remain on the Platform at our discretion</li>
              <li>Provisions that by their nature survive termination — including limitation of liability, indemnification, intellectual property, and governing law — remain in full force</li>
            </ul>
            <p className="mb-4">
              You may request account closure at any time by emailing <a href="mailto:info@rebookedsolutions.co.za" className="text-primary hover:underline">info@rebookedsolutions.co.za</a>. Closure does not entitle you to any refund. Closed accounts may be retained in our records for legal, compliance, and fraud prevention purposes for a period determined by our data retention policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">17. DISPUTE RESOLUTION</h2>
            <p className="mb-4">
              In the event of any dispute arising from or in connection with these Terms or your use of the Platform, the parties agree to first attempt resolution through good-faith negotiation. Submit a written description of your dispute to <a href="mailto:info@rebookedsolutions.co.za" className="text-primary hover:underline">info@rebookedsolutions.co.za</a> and allow us 14 business days to respond before escalating further.
            </p>
            <p className="mb-4">
              If unresolved through negotiation, either party may refer the matter to the appropriate South African court or relevant consumer protection authority, including the National Consumer Commission where the CPA applies.
            </p>
            <p className="mb-4">
              Nothing in this clause prevents either party from seeking urgent interim or interdict relief from a court of competent jurisdiction where circumstances require it.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">18. PRIVACY AND DATA PROTECTION</h2>
            <p className="mb-4">
              ReBooked Solutions (Pty) Ltd processes personal information in accordance with POPIA. Our Privacy Policy is published at <a href="/privacy" className="text-primary hover:underline">living.rebookedsolutions.co.za/privacy</a> and is incorporated into these Terms by reference.
            </p>
            <p className="mb-4">
              By using the Platform you consent to the collection, processing, and storage of your personal information as described in our Privacy Policy. You have the right to access, correct, and request deletion of your personal information subject to our legal retention obligations.
            </p>
            <p className="mb-4">
              We will not knowingly collect or process the personal information of any person under 18 without verifiable parental or guardian co-consent obtained through our registration flow.
            </p>
            <p className="mb-4">
              We will notify affected users of any personal information breach as required by POPIA and will report material breaches to the Information Regulator of South Africa.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">19. FORCE MAJEURE</h2>
            <p className="mb-4">
              ReBooked Solutions (Pty) Ltd shall not be liable for any failure or delay in performing its obligations where such failure results from circumstances beyond our reasonable control, including acts of God, natural disasters, load shedding, cyberattacks, government action, strikes, civil unrest, pandemic or public health emergencies, or failure of third-party infrastructure providers.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">20. CHANGES TO THESE TERMS</h2>
            <p className="mb-4">
              We may amend these Terms at any time. Updated Terms will be published on the Platform with a revised effective date. Where changes are material we will notify registered users via email or in-platform notification at least 7 days before the changes take effect.
            </p>
            <p className="mb-4">
              Continued use of the Platform after the effective date of updated Terms constitutes acceptance. If you do not accept updated Terms you must cease using the Platform immediately. No refund will be issued as a result.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">21. SEVERABILITY</h2>
            <p className="mb-4">
              If any provision of these Terms is found to be invalid, unlawful, or unenforceable, it shall be modified to the minimum extent necessary to render it enforceable, or severed entirely if modification is not possible. All remaining provisions remain in full force.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">22. NO WAIVER</h2>
            <p className="mb-4">
              Our failure to enforce any provision of these Terms on any occasion does not constitute a waiver of our right to enforce it subsequently. No waiver is effective unless made in writing and signed by an authorised representative of ReBooked Solutions (Pty) Ltd.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">23. ENTIRE AGREEMENT</h2>
            <p className="mb-4">
              These Terms, together with our Privacy Policy and any other policies published on the Platform, constitute the entire agreement between you and ReBooked Solutions (Pty) Ltd regarding your use of the Platform and supersede all prior agreements, representations, and understandings.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2">24. GOVERNING LAW AND JURISDICTION</h2>
            <p className="mb-4">
              These Terms are governed exclusively by the laws of the Republic of South Africa. Any dispute arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the High Court of South Africa, Gauteng Division, Johannesburg.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
          <p className="text-sm font-bold text-foreground">BY USING THE PLATFORM, YOU AGREE TO BE LEGALLY BOUND BY THESE TERMS.</p>
          <p className="text-xs text-muted-foreground mt-2">Last Updated: June 14, 2026</p>
        </div>
      </article>
    </Layout>
  );
};

export default Terms;
