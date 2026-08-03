import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft } from "lucide-react";
import { CONTACT, CONTACT_ADDRESS_FULL, SITE_NAME } from "@/lib/site";

const TITLE = "Terms & Conditions | Baraabar";
const DESCRIPTION =
  "The terms and conditions governing fabric pickup, home measurement, made-to-order stitching, delivery, cancellations and refunds on Baraabar.";
const LAST_UPDATED = "August 3, 2026";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/terms" },
};

const SECTIONS: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "1. Acceptance of terms",
    body: (
      <>
        <p>
          These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use
          of the {SITE_NAME} website, mobile experience, and tailoring services
          (together, the &quot;Service&quot;), operated by {SITE_NAME} (&quot;{SITE_NAME}
          &quot;, &quot;we&quot;, &quot;us&quot; or &quot;our&quot;) from our studio at{" "}
          {CONTACT_ADDRESS_FULL}.
        </p>
        <p>
          By booking a fabric pickup, creating an account, or otherwise using the
          Service, you agree to be bound by these Terms. If you do not agree, please
          do not use the Service.
        </p>
      </>
    ),
  },
  {
    heading: "2. Our services",
    body: (
      <p>
        {SITE_NAME} offers made-to-order tailoring: you supply the fabric (or select
        one we source on your behalf where available), we collect it via free
        doorstep pickup, take your measurements at home or use measurements you
        provide, and our master tailors stitch your garment to those specifications
        for delivery — typically within 10–14 days of pickup, though this window is
        an estimate and not a guaranteed delivery date.
      </p>
    ),
  },
  {
    heading: "3. Accounts & eligibility",
    body: (
      <p>
        You must be at least 18 years old, or using the Service under the
        supervision of a parent or guardian, to create an account and place an
        order. You are responsible for maintaining the confidentiality of your
        account credentials and for all activity that occurs under your account.
      </p>
    ),
  },
  {
    heading: "4. Orders, fabric & measurements",
    body: (
      <>
        <p>
          When you bring your own fabric, you confirm that you have the right to use
          it and that it is provided in sufficient quantity and condition for the
          garment ordered. {SITE_NAME} is not responsible for defects in
          customer-supplied fabric (shrinkage, colour bleed, insufficient yardage,
          or flaws present before pickup).
        </p>
        <p>
          Garments are cut and stitched to the measurements recorded at the time of
          your home-measurement appointment or the measurements you submit through
          your profile. Please review your measurements carefully before confirming
          an order — because each garment is made to order, incorrect measurements
          supplied by you are not treated as a manufacturing defect for refund
          purposes, though we will always try to help with a paid alteration.
        </p>
      </>
    ),
  },
  {
    heading: "5. Pricing & payment",
    body: (
      <p>
        All prices are displayed in Indian Rupees (INR) and are inclusive of
        applicable taxes unless stated otherwise. Payment is collected through our
        secure third-party payment processor; {SITE_NAME} does not store your full
        card or payment credentials. Prices may change from time to time, but the
        price shown to you at the time of order confirmation is the price you pay
        for that order.
      </p>
    ),
  },
  {
    heading: "6. Cancellations, returns & refunds",
    body: (
      <>
        <p>
          You may cancel an order free of charge before fabric pickup is completed.
          Once your fabric has been picked up and cutting has begun, the order enters
          production and can no longer be cancelled, as it is a made-to-order,
          non-inventory garment cut specifically for you.
        </p>
        <p>
          Because every garment is custom-made, we are unable to offer size- or
          preference-based returns. If a delivered garment has a genuine
          manufacturing or stitching defect, contact us within 7 days of delivery
          with photos of the issue and we will repair, re-stitch, or refund the
          affected order at our discretion, free of charge.
        </p>
      </>
    ),
  },
  {
    heading: "7. Alterations",
    body: (
      <p>
        We offer one round of complimentary fit alterations within 15 days of
        delivery for fit issues arising from our stitching, provided the garment
        has not been altered by a third party. Alterations required due to weight
        or body changes after measurement, or due to customer-supplied incorrect
        measurements, may be chargeable.
      </p>
    ),
  },
  {
    heading: "8. Delivery",
    body: (
      <p>
        We deliver to the address on file for your order. Please ensure someone is
        available to receive the garment, or provide delivery instructions where
        supported. Risk of loss or damage passes to you on delivery. Delivery
        timelines may be affected by fabric availability, courier delays, or
        circumstances beyond our reasonable control.
      </p>
    ),
  },
  {
    heading: "9. Intellectual property",
    body: (
      <p>
        All content on the Service — including the {SITE_NAME} name, logo, designs,
        photography, and website code — is owned by or licensed to {SITE_NAME} and
        is protected by applicable intellectual property laws. You may not copy,
        reproduce, or use it commercially without our written permission.
      </p>
    ),
  },
  {
    heading: "10. Limitation of liability",
    body: (
      <p>
        To the maximum extent permitted by law, {SITE_NAME}&apos;s total liability
        arising out of or relating to an order is limited to the amount you paid for
        that order. We are not liable for indirect, incidental, or consequential
        damages arising from use of the Service.
      </p>
    ),
  },
  {
    heading: "11. Changes to these terms",
    body: (
      <p>
        We may update these Terms from time to time to reflect changes in our
        services or applicable law. The &quot;Last updated&quot; date at the top of
        this page will reflect the most recent revision, and continued use of the
        Service after changes take effect constitutes acceptance of the revised
        Terms.
      </p>
    ),
  },
  {
    heading: "12. Governing law",
    body: (
      <p>
        These Terms are governed by the laws of India. Any dispute arising out of or
        in connection with these Terms shall be subject to the exclusive
        jurisdiction of the courts of Bengaluru, Karnataka.
      </p>
    ),
  },
  {
    heading: "13. Contact us",
    body: (
      <p>
        Questions about these Terms can be sent to{" "}
        <a href={`mailto:${CONTACT.email}`} className="font-semibold text-primary">
          {CONTACT.email}
        </a>{" "}
        or {CONTACT.phone}, or by post to {CONTACT_ADDRESS_FULL}.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-background pb-24">
      <TopBar />
      <main>
        <div className="mx-auto max-w-md px-5 pt-2 md:max-w-3xl md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>

        <div className="mx-auto mt-6 w-full max-w-md px-5 pb-16 md:max-w-3xl md:px-8">
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="mt-8 space-y-8">
            {SECTIONS.map((s) => (
              <section key={s.heading}>
                <h2 className="font-display text-xl md:text-2xl">{s.heading}</h2>
                <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {s.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
