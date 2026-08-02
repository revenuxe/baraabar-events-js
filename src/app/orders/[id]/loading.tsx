import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export default function OrderDetailLoading() {
  return (
    <div className="min-h-dvh animate-pulse bg-background">
      <TopBar />
      <main className="mx-auto max-w-md space-y-4 px-5 pb-28 pt-2">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-32 rounded-3xl bg-muted" />
        <div className="h-24 rounded-3xl bg-muted" />
        <div className="h-40 rounded-3xl bg-muted" />
      </main>
      <BottomNav />
    </div>
  );
}
