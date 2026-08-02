import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export default function MeasurementsLoading() {
  return (
    <div className="min-h-dvh animate-pulse bg-background">
      <TopBar />
      <main className="mx-auto max-w-md space-y-3 px-5 pb-28 pt-2">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-3xl bg-muted" />
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
