import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";

export function PickupCta() {
  return (
    <section className="mx-auto w-full max-w-md px-5 pt-2 md:max-w-6xl md:px-8">
      <Link
        href="/book"
        className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-brand p-4 shadow-elevated md:p-6"
      >
        <div aria-hidden className="absolute inset-0 opacity-30 bg-mesh" />
        <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-primary-foreground md:h-14 md:w-14">
          <Truck className="h-6 w-6" />
        </div>
        <div className="relative min-w-0 flex-1 text-primary-foreground">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">
            Already have fabric?
          </p>
          <p className="font-display text-xl leading-tight md:text-2xl">
            Book your fabric pickup — free
          </p>
          <p className="mt-0.5 text-[12px] opacity-90 md:text-sm">
            Doorstep pickup, home measurement, master-stitched delivery in 10–14 days.
          </p>
        </div>
        <ArrowRight className="relative h-5 w-5 shrink-0 text-primary-foreground" />
      </Link>
    </section>
  );
}
