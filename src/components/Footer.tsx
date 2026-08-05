import logo from "@/assets/baraabar tailor logo-webpg.webp";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon, YoutubeIcon, TwitterIcon, LinkedinIcon } from "@/components/SocialIcons";
import { CONTACT, CONTACT_ADDRESS_FULL, CONTACT_MAPS_URL } from "@/lib/site";

const LEGAL_LINKS = [
  { href: "/contact", label: "Contact Us" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
];

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-md px-5 pt-8 pb-28 md:max-w-6xl md:px-8 md:pb-16">
      <div className="rounded-[2rem] bg-gradient-brand p-6 text-primary-foreground shadow-elevated md:flex md:items-center md:justify-between md:gap-10 md:rounded-[3rem] md:p-12">
        <h2 className="font-display text-3xl leading-tight md:text-5xl">
          Ready to wear something<br />
          <span className="italic">truly yours</span>?
        </h2>
        <Link
          href="/book"
          className="mt-5 flex w-full items-center justify-center rounded-full bg-white py-3.5 text-sm font-bold text-primary shadow-glow active:scale-[0.98] md:mt-0 md:w-auto md:px-10 md:py-4 md:text-base"
        >
          Claim Free Delivery
        </Link>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Image
          src={logo}
          alt="Baraabar — Custom Clothing. Your Style. Your Fit."
          className="h-8 w-auto object-contain"
        />
        <div className="flex gap-2">
          {[
            { Icon: InstagramIcon, href: "https://www.instagram.com/baraabarmade/", label: "Instagram" },
            { Icon: LinkedinIcon, href: "https://www.linkedin.com/company/baraabar", label: "LinkedIn" },
            { Icon: YoutubeIcon, href: "#", label: "YouTube" },
            { Icon: TwitterIcon, href: "#", label: "Twitter" },
          ].map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target={href !== "#" ? "_blank" : undefined}
              rel={href !== "#" ? "noopener noreferrer" : undefined}
              aria-label={label}
              className="glass grid h-10 w-10 place-items-center rounded-full"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-start md:justify-between md:gap-4">
        <address className="not-italic">
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <a
                href={CONTACT_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="leading-relaxed hover:text-foreground"
              >
                {CONTACT_ADDRESS_FULL}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <a href={CONTACT.phoneHref} className="hover:text-foreground">
                {CONTACT.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <a href={`mailto:${CONTACT.email}`} className="hover:text-foreground">
                {CONTACT.email}
              </a>
            </li>
          </ul>
        </address>

        <nav className="flex flex-wrap gap-x-5 gap-y-2.5 md:flex-col md:items-end md:text-right">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        Made with ❤️ in India · © {new Date().getFullYear()} Baraabar
      </p>
    </footer>
  );
}
