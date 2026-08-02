import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export default function OrdersLoading() {
  return (
    <div className="min-h-dvh animate-pulse bg-background">
      <TopBar />
      <main className="mx-auto max-w-md px-5 pb-28 pt-2">
        <div className="h-9 w-40 rounded-lg bg-muted" />
        <div className="mt-2 h-4 w-56 rounded bg-muted" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[104px] rounded-3xl bg-muted" />
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
