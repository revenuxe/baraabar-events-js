import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, Truck } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { CONTACT } from "@/lib/site";
import { unsplash } from "@/data/images";

const heroImg = unsplash("balloonArch", 1200, 1400);

export function Hero() {
  return (
    <section className="relative -mt-[104px] overflow-hidden md:-mt-[112px]">
      <div aria-hidden className="absolute inset-0 bg-aurora animate-gradient-drift" />
      <div className="relative mx-auto w-full max-w-md px-5 pt-[120px] pb-10 md:max-w-6xl md:px-8 md:pt-[160px] md:pb-20">
        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-14">
          {/* copy + CTAs */}
          <div className="flex flex-col">
            <h1 className="animate-rise-in font-display text-[52px] leading-[1.15] tracking-tight md:text-[84px]">
              Celebrations <span className="text-gradient-brand italic">Made</span>
              <br />
              <span className="text-gradient-brand italic">Easy</span> in{" "}
              <span className="text-gradient-brand italic">Bangalore</span>
            </h1>
            <p
              className="animate-rise-in mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground md:text-lg"
              style={{ animationDelay: "0.1s" }}
            >
              Balloon arches, theme decor and full event styling — designed by pros and set up
              at your venue, right on time.
            </p>

            <div className="mt-6">
              <SearchBar />
            </div>

            {/* Image (mobile shows here, desktop hidden — desktop uses right column) */}
            <div className="relative mt-6 md:hidden">
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[3rem] bg-gradient-brand opacity-25 blur-3xl"
              />
              <Link
                href="/categories/birthday"
                className="relative block animate-float-slow overflow-hidden rounded-[2rem] shadow-elevated transition-transform active:scale-[0.98]"
              >
                <Image
                  src={heroImg}
                  alt="A balloon arch decoration set up for a birthday party"
                  priority
                  sizes="100vw"
                  fill={false}
                  width={1200}
                  height={1400}
                  className="h-[400px] w-full object-cover"
                />
                <div className="glass-dark absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-primary-foreground">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-green-400" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  <span className="text-[11px] font-bold">Trusted Event Decorators</span>
                </div>
                <div className="glass-dark absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl px-4 py-3 text-primary-foreground">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest opacity-80">Popular</p>
                    <p className="font-semibold">Balloon Arch Decoration</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-widest opacity-80">from</p>
                    <p className="font-semibold">₹3,499</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Secondary CTA */}
            <div className="mt-4 flex flex-col gap-3 md:mt-5 md:flex-row md:items-center">
              <Link
                href="/categories"
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-4 text-base font-semibold text-primary-foreground shadow-glow transition-transform active:scale-[0.98] md:w-fit md:px-8"
              >
                Explore Decorations
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={CONTACT.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-4 text-base font-semibold text-foreground shadow-card transition-transform active:scale-[0.98] md:w-fit md:px-8"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp Us
              </a>
            </div>

            <ul className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] font-medium text-muted-foreground md:max-w-md md:text-xs">
              <li className="glass rounded-2xl p-3">
                <Clock className="mx-auto mb-1 h-4 w-4 text-primary" />
                Same-week slots
              </li>
              <li className="glass rounded-2xl p-3">
                <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-primary" />
                Trained decorators
              </li>
              <li className="glass rounded-2xl p-3">
                <Truck className="mx-auto mb-1 h-4 w-4 text-primary" />
                Setup & teardown
              </li>
            </ul>
          </div>

          {/* Right column: desktop image */}
          <div className="relative hidden md:block">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[3rem] bg-gradient-brand opacity-30 blur-3xl"
            />
            <Link
              href="/categories/birthday"
              className="relative block animate-float-slow overflow-hidden rounded-[3rem] shadow-elevated transition-transform hover:-translate-y-1 hover:shadow-elevated"
            >
              <Image
                src={heroImg}
                alt="A balloon arch decoration set up for a birthday party"
                priority
                sizes="50vw"
                width={1200}
                height={1400}
                className="h-[680px] w-full object-cover"
              />
              <div className="glass-dark absolute left-4 top-4 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-primary-foreground">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-green-400" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <span className="text-xs font-bold">Trusted Event Decorators</span>
              </div>
              <div className="glass-dark absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl px-4 py-3 text-primary-foreground">
                <div>
                  <p className="text-[11px] uppercase tracking-widest opacity-80">Popular</p>
                  <p className="font-semibold">Balloon Arch Decoration</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-widest opacity-80">from</p>
                  <p className="font-semibold">₹3,499</p>
                </div>
              </div>
              <span aria-hidden className="absolute right-4 top-4 flex h-3 w-3">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-accent" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
