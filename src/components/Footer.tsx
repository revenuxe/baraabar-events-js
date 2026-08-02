import logo from "@/assets/baraabar tailor logo-webpg.webp";
import { InstagramIcon, YoutubeIcon, TwitterIcon } from "@/components/SocialIcons";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-md px-5 pt-8 pb-28 md:max-w-6xl md:px-8 md:pb-16">
      <div className="rounded-[2rem] bg-gradient-brand p-6 text-primary-foreground shadow-elevated md:flex md:items-center md:justify-between md:gap-10 md:rounded-[3rem] md:p-12">
        <h2 className="font-display text-3xl leading-tight md:text-5xl">
          Ready to wear something<br />
          <span className="italic">truly yours</span>?
        </h2>
        <button className="mt-5 w-full rounded-full bg-white py-3.5 text-sm font-bold text-primary shadow-glow active:scale-[0.98] md:mt-0 md:w-auto md:px-10 md:py-4 md:text-base">
          Start designing — it's free
        </button>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <img
          src={logo.src}
          alt="Baraabar — Custom Clothing. Your Style. Your Fit."
          width={200}
          height={56}
          className="h-8 w-auto object-contain"
        />
        <div className="flex gap-2">
          {[InstagramIcon, YoutubeIcon, TwitterIcon].map((Icon, i) => (
            <a
              key={i}
              href="#"
              aria-label="Social"
              className="glass grid h-10 w-10 place-items-center rounded-full"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        Made with ❤️ in India · © {new Date().getFullYear()} Baraabar
      </p>
    </footer>
  );
}
