"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { unsplash } from "@/data/images";
import { SearchBar } from "@/components/SearchBar";

const slides = [
  { image: unsplash("balloonArch", 1400, 900), kicker: "Last minute party?", title: "We've got you covered.", copy: "Trained decorators, premium props and a clean setup at your venue.", action: "Book a setup" },
  { image: unsplash("marigold", 1400, 900), kicker: "Festive décor", title: "Make every celebration shine.", copy: "Thoughtful festive decoration for intimate gatherings and grand occasions.", action: "Explore festive" },
  { image: unsplash("heartFloral", 1400, 900), kicker: "Special moments", title: "Celebrate love, beautifully.", copy: "Romantic décor that turns your favourite moments into lasting memories.", action: "Explore romance" },
];

export function Hero() {
  const [active, setActive] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 6000); return () => window.clearInterval(id); }, []);
  const slide = slides[active];
  const previous = () => setActive((value) => (value + slides.length - 1) % slides.length);
  const next = () => setActive((value) => (value + 1) % slides.length);

  return (
    <section className="bg-white px-4 pb-12 pt-3 md:px-8 md:pb-20 md:pt-[154px]">
      <div className="relative mx-auto h-[510px] max-w-7xl overflow-hidden rounded-[2rem] bg-[#fff0f5] md:h-[470px] md:rounded-[1.4rem]">
        <div className="absolute inset-y-0 right-0 w-[62%]"><Image key={slide.image} src={slide.image} alt="Decor Eventz event decoration" priority fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover object-center" /><div className="absolute inset-0 bg-[linear-gradient(90deg,#fff0f5_0%,rgba(255,240,245,.28)_55%,transparent_100%)]" /></div>
        <div className="absolute inset-x-5 top-5 z-10 md:hidden"><SearchBar square placeholder="Search decorations..." /></div>
        <div className="relative flex h-full max-w-md items-center px-6 py-12 md:max-w-[58%] md:px-16">
          <div>
            <p className="text-[clamp(2rem,4vw,3.8rem)] font-bold leading-none tracking-tight text-[#e61b68]">{slide.kicker}</p>
            <h1 className="mt-2 text-[clamp(2.35rem,5vw,4.6rem)] font-extrabold leading-[.98] tracking-tight text-primary">{slide.title}</h1>
            <div className="my-5 h-1 w-20 rounded-full bg-[#e61b68]" />
            <p className="max-w-md text-base leading-relaxed text-primary/75 md:text-xl">{slide.copy}</p>
            <Link href="/categories" className="mt-7 inline-flex items-center gap-3 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#103d7a]">{slide.action}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">{slides.map((item, index) => <button key={item.title} onClick={() => setActive(index)} aria-label={`Go to campaign ${index + 1}`} className={`h-2.5 rounded-full ${active === index ? "w-7 bg-[#e61b68]" : "w-2.5 bg-primary/25"}`} />)}</div>
        <div className="absolute bottom-5 right-5 hidden gap-2 md:flex"><button onClick={previous} className="grid h-9 w-9 place-items-center rounded-full bg-white text-primary shadow"><ArrowLeft className="h-4 w-4" /></button><button onClick={next} className="grid h-9 w-9 place-items-center rounded-full bg-white text-primary shadow"><ArrowRight className="h-4 w-4" /></button></div>
      </div>
    </section>
  );
}
