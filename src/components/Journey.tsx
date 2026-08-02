import { Palette, Ruler, Scissors, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Step = { icon: LucideIcon; title: string; sub: string };

const STEPS: Step[] = [
  { icon: Palette, title: "Design", sub: "Pick fabric, colors, details" },
  { icon: Ruler, title: "Measure", sub: "AI scan or home visit" },
  { icon: Scissors, title: "Stitch", sub: "By master tailors" },
  { icon: ShieldCheck, title: "Quality", sub: "3-point inspection" },
  { icon: Truck, title: "Delivery", sub: "At your door, on time" },
];

export function Journey() {
  return (
    <section className="mx-auto w-full max-w-md px-5 py-10 md:max-w-6xl md:px-8 md:py-16">
      <p className="text-xs font-bold uppercase tracking-widest text-accent">The Baraabar way</p>
      <h2 className="mt-1 font-display text-3xl md:text-5xl">Your order, orchestrated</h2>

      <ol className="relative mt-6 space-y-4 pl-2">
        <span
          aria-hidden
          className="absolute left-[27px] top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-primary via-accent to-primary opacity-40"
        />
        {STEPS.map(({ icon: Icon, title, sub }, i) => (
          <li key={title} className="relative flex items-center gap-4">
            <div className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 rounded-2xl bg-card p-3 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">
                  {i + 1}. {title}
                </h3>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Day {[1, 2, "3–8", 9, 10][i]}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground">{sub}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
