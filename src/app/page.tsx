import dynamic from "next/dynamic";
import { TopBar } from "@/components/TopBar";
import { Hero } from "@/components/Hero";
import { PickupCta } from "@/components/PickupCta";
import { CategoryStrip } from "@/components/CategoryStrip";
import { Journey } from "@/components/Journey";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";

// Below-the-fold and non-critical for first paint — split into its own
// chunk instead of the initial homepage bundle.
const Reviews = dynamic(() => import("@/components/Reviews").then((m) => m.Reviews));

export default function Home() {
  return (
    <div className="min-h-dvh bg-background">
      <TopBar />
      <main>
        <Hero />
        <CategoryStrip />
        <PickupCta />
        <Journey />
        <Reviews />
        <Footer />
      </main>
      <BottomNav />
    </div>
  );
}
