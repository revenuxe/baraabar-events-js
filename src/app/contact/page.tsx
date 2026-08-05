import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft, Clock, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { CONTACT, CONTACT_ADDRESS_FULL, CONTACT_MAPS_URL } from "@/lib/site";

const TITLE = "Contact Us | Baraabar";
const DESCRIPTION =
  "Get in touch with Baraabar — call or email us, or find our Bengaluru studio at Shampura. We're happy to help with bookings and events.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/contact",
  },
};

const CHANNELS = [
  {
    icon: Phone,
    label: "Call us",
    value: CONTACT.phone,
    href: CONTACT.phoneHref,
    cta: "Call now",
  },
  {
    icon: Mail,
    label: "Email us",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    cta: "Send an email",
  },
  {
    icon: MapPin,
    label: "Visit our studio",
    value: CONTACT_ADDRESS_FULL,
    href: CONTACT_MAPS_URL,
    cta: "Get directions",
  },
];

export default function ContactPage() {
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

        <div className="mx-auto mt-6 w-full max-w-md px-5 md:max-w-3xl md:px-8">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
            Contact
          </span>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
            We&apos;d love to hear from you
          </h1>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground md:text-base">
            Questions about a booking, an event in progress, or a custom decoration
            request? Reach the Baraabar team directly — we usually reply within a
            few hours.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {CHANNELS.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.icon === MapPin ? "_blank" : undefined}
                rel={c.icon === MapPin ? "noopener noreferrer" : undefined}
                className="group flex flex-col rounded-[1.75rem] border border-border bg-card p-6 shadow-card transition-transform active:scale-[0.98]"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
                  <c.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {c.label}
                </p>
                <p className="mt-1 text-base font-semibold">{c.value}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  {c.cta}
                  <ArrowLeft className="h-3.5 w-3.5 rotate-180 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-[1.75rem] border border-border bg-card/60 p-6">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/20 text-accent-foreground">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold">Studio hours</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Monday – Saturday, 10:00 AM – 7:00 PM IST. Decoration bookings are
                made separately online, any day of the week.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow"
            >
              <Sparkles className="h-4 w-4" />
              Browse decorations
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
