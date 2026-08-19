import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function CategoryCard({ href, image, name, tagline }: { href: string; image?: string; name: string; tagline?: string }) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#f8eee7] p-1.5 shadow-[0_16px_34px_-24px_rgba(61,7,91,.38)] transition duration-300 active:scale-[0.98] md:rounded-[1.75rem] md:hover:-translate-y-1 md:hover:shadow-elevated"
    >
      <div className="relative h-full w-full overflow-hidden rounded-[1.2rem] bg-muted md:rounded-[1.45rem]">
        {image ? <Image src={image} alt={tagline ? `${name} — ${tagline}` : name} fill loading="lazy" sizes="(min-width: 768px) 16vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="h-full w-full bg-gradient-brand" />}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/10 to-transparent" />
        <div className="absolute inset-x-2.5 bottom-2.5 flex h-16 items-center rounded-2xl border border-white/35 bg-white/90 px-3 text-primary shadow-lg backdrop-blur-md">
          <span className="pr-5 text-[13px] font-bold leading-[1.2] md:text-sm">{name}</span>
          <ArrowUpRight className="absolute right-3 h-4 w-4 text-accent transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
