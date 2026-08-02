import { TopBar } from "@/components/TopBar";
import { Hero } from "@/components/Hero";
import { PickupCta } from "@/components/PickupCta";
import { CategoryStrip } from "@/components/CategoryStrip";
import { Journey } from "@/components/Journey";
import { Reviews } from "@/components/Reviews";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";

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
