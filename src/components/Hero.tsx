import heroImg from "@/assets/hero section image baraabar.webp";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, Truck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-aurora animate-gradient-drift" />
      <div className="relative mx-auto w-full max-w-md px-5 pt-4 pb-10 md:max-w-6xl md:px-8 md:pt-12 md:pb-20">
        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-14">
          {/* copy + CTAs */}
          <div className="flex flex-col">
            <h1 className="animate-rise-in font-display text-[52px] leading-[0.95] tracking-tight md:text-[84px]">
              Wear clothes
              <br />
              <span className="text-gradient-brand italic">designed by you</span>.
            </h1>
            <p
              className="animate-rise-in mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground md:text-lg"
              style={{ animationDelay: "0.1s" }}
            >
              Bring your own fabric. We pick it up, measure you at home, and stitch it
              to a fit you'll never want to take off.
            </p>

            {/* Primary CTA */}
            <Link
              href="/book"
              className="mt-6 flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-4 text-base font-semibold text-primary-foreground shadow-glow transition-transform active:scale-[0.98] md:w-fit md:px-8"
            >
              Start Designing
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Image (mobile shows here, desktop hidden — desktop uses right column) */}
            <div className="relative mt-6 md:hidden">
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[3rem] bg-gradient-brand opacity-25 blur-3xl"
              />
              <div className="relative animate-float-slow overflow-hidden rounded-[2rem] shadow-elevated">
                <img
                  src={heroImg.src}
                  alt="Woman wearing a custom-tailored purple lehenga by Baraabar"
                  width={1200}
                  height={1600}
                  className="h-[400px] w-full object-cover"
                />
                <div className="glass-dark absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl px-4 py-3 text-primary-foreground">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest opacity-80">Design #A1</p>
                    <p className="font-semibold">Ladies Suit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-widest opacity-80">from</p>
                    <p className="font-semibold">₹699</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary CTA */}
            <a
              href="#services"
              className="mt-4 flex items-center justify-center rounded-full border border-border bg-card px-6 py-4 text-base font-semibold shadow-card md:mt-5 md:w-fit md:px-8"
            >
              Explore Services
            </a>

            <ul className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] font-medium text-muted-foreground md:max-w-md md:text-xs">
              <li className="glass rounded-2xl p-3">
                <Clock className="mx-auto mb-1 h-4 w-4 text-primary" />
                3-min booking
              </li>
              <li className="glass rounded-2xl p-3">
                <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-primary" />
                Perfect fit
              </li>
              <li className="glass rounded-2xl p-3">
                <Truck className="mx-auto mb-1 h-4 w-4 text-primary" />
                Free pickup
              </li>
            </ul>
          </div>

          {/* Right column: desktop image */}
          <div className="relative hidden md:block">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[3rem] bg-gradient-brand opacity-30 blur-3xl"
            />
            <div className="relative animate-float-slow overflow-hidden rounded-[3rem] shadow-elevated">
              <img
                src={heroImg.src}
                alt="Woman wearing a custom-tailored purple lehenga by Baraabar"
                width={1200}
                height={1600}
                className="h-[680px] w-full object-cover"
              />
              <div className="glass-dark absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl px-4 py-3 text-primary-foreground">
                <div>
                  <p className="text-[11px] uppercase tracking-widest opacity-80">Design #A1</p>
                  <p className="font-semibold">Ladies Suit</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-widest opacity-80">from</p>
                  <p className="font-semibold">₹699</p>
                </div>
              </div>
              <span aria-hidden className="absolute right-4 top-4 flex h-3 w-3">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-accent" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
