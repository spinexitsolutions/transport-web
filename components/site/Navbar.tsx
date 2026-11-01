"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Search, X } from "lucide-react";
import type { NavLink, SiteSettings } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

type Svc = { slug: string; title: string; icon: string };
type Stop = { label: string; frac: number; el: HTMLElement };

const E = [0.76, 0, 0.24, 1] as const;

const DEPARTURES = [
  { id: "KNT-482019", from: "BLR", to: "DXB", mode: "Air", status: "Out for delivery" },
  { id: "KNT-730551", from: "BOM", to: "DEL", mode: "Road", status: "In transit" },
  { id: "KNT-219874", from: "MUN", to: "JEA", mode: "Sea", status: "Customs" },
  { id: "KNT-118230", from: "COK", to: "BOM", mode: "Cold", status: "Delivered" },
];

/**
 * "Route Rail" navigation.
 * Desktop: a dark vertical rail on the left — the page's sections are stops on a route
 * and a vehicle marker travels down it as you scroll.
 * Mobile: a thumb-reach bottom bar. The menu is a full-screen "departures" overlay.
 */
export function Navbar({ settings, nav, services }: { settings: SiteSettings; nav: NavLink[]; services: Svc[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [stops, setStops] = useState<Stop[]>([]);
  const [section, setSection] = useState("");
  const [hoverStop, setHoverStop] = useState<number | null>(null);
  const [trackId, setTrackId] = useState("");
  const [down, setDown] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26 });
  const markerTop = useTransform(progress, (v) => `${v * 100}%`);
  const barWidth = useTransform(progress, (v) => `${v * 100}%`);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (Math.abs(y - prev) > 4) setDown(y > prev && y > 200);
  });

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  // collect section stops + active section
  useEffect(() => {
    const page = nav.find((n) => n.href !== "/" && pathname.startsWith(n.href))?.label ?? "Home";
    setSection(page);
    const collect = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-label]"));
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setStops(
        els.map((el) => ({
          label: el.dataset.navLabel || "",
          frac: Math.min(1, Math.max(0, (el.getBoundingClientRect().top + window.scrollY) / max)),
          el,
        })),
      );
    };
    const t = setTimeout(collect, 400);
    const ro = new ResizeObserver(() => collect());
    ro.observe(document.body);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSection((e.target as HTMLElement).dataset.navLabel || page)),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-nav-label]").forEach((el) => io.observe(el));
    return () => {
      clearTimeout(t);
      ro.disconnect();
      io.disconnect();
    };
  }, [pathname, nav]);

  const goTo = useCallback((el: HTMLElement) => {
    if (window.__lenis) window.__lenis.scrollTo(el, { duration: 1.6 });
    else el.scrollIntoView({ behavior: "smooth" });
  }, []);

  const submitTrack = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/track${trackId.trim() ? `?id=${encodeURIComponent(trackId.trim())}` : ""}`);
    setOpen(false);
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {/* ───────── Desktop rail ───────── */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[var(--rail)] flex-col items-center bg-ink py-4 text-white lg:flex">
        <Link href="/" aria-label={`${settings.brandName} home`} className="group">
          <Logo className="transition-transform duration-500 group-hover:rotate-[-8deg]" />
        </Link>
        <span className="board mt-2 text-[11px] tracking-[0.2em] text-white/40">{settings.brandName.slice(0, 3)}</span>

        {/* route */}
        <div className="relative my-6 w-full flex-1">
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,.25)_0_4px,transparent_4px_9px)]" />
          <motion.div className="absolute left-1/2 top-0 w-[2px] -translate-x-1/2 bg-signal" style={{ height: markerTop }} />
          {stops.map((s, i) => {
            const current = s.label === section;
            return (
              <button
                key={`${s.label}-${i}`}
                onClick={() => goTo(s.el)}
                onMouseEnter={() => setHoverStop(i)}
                onMouseLeave={() => setHoverStop(null)}
                className="absolute left-1/2 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center"
                style={{ top: `${s.frac * 100}%` }}
                aria-label={`Go to ${s.label}`}
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-300",
                    current ? "h-2.5 w-2.5 bg-signal ring-4 ring-signal/20" : "h-1.5 w-1.5 bg-white/45",
                  )}
                />
                <AnimatePresence>
                  {hoverStop === i && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      className="eyebrow pointer-events-none absolute left-8 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-white shadow-xl ring-1 ring-white/10"
                    >
                      <span className="board mr-2 text-sm text-signal">{String(i + 1).padStart(2, "0")}</span>
                      {s.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
          {/* vehicle marker */}
          <motion.div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: markerTop }}>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-white shadow-[0_0_0_4px_var(--ink)]">
              <Icon name="Truck" size={13} strokeWidth={2.2} />
            </span>
          </motion.div>
        </div>

        {/* current section, vertical */}
        <div className="relative mb-5 h-36 w-6 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={section}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="eyebrow absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-white/70 [writing-mode:vertical-rl] rotate-180"
            >
              {section}
            </motion.span>
          </AnimatePresence>
        </div>

        <MenuButton open={open} onClick={() => setOpen((o) => !o)} />
      </aside>

      {/* ───────── Desktop top-right cluster ───────── */}
      <div className="fixed right-4 top-4 z-40 hidden items-center gap-2 lg:flex">
        <AnimatePresence initial={false}>
          {!down && settings.announcement && (
            <motion.span
              key="ann"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="glass hidden items-center gap-2 rounded-full px-4 py-2.5 text-[13px] text-ink ring-1 ring-line xl:flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {settings.announcement}
            </motion.span>
          )}
        </AnimatePresence>
        <Link href="/track" className="glass flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-medium text-ink ring-1 ring-line transition hover:ring-ink/30">
          <Search size={15} /> Track
        </Link>
        <Link href="/quote" className="group flex h-11 items-center gap-2 rounded-full bg-accent pl-5 pr-1.5 text-[14px] font-medium text-accent-ink">
          Get a quote
          <span className="grid h-8 w-8 place-items-center rounded-full bg-signal text-ink transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight size={15} />
          </span>
        </Link>
      </div>

      {/* ───────── Mobile bottom bar ───────── */}
      <nav className="fixed inset-x-2.5 bottom-2.5 z-50 lg:hidden">
        <div className="relative flex h-16 items-center gap-2 overflow-hidden rounded-[18px] bg-ink pl-2 pr-2 text-white shadow-[0_18px_50px_-12px_rgba(0,0,0,.5)]">
          <motion.span className="absolute left-0 top-0 h-[2px] bg-signal" style={{ width: barWidth }} />
          <Link href="/" aria-label="Home">
            <Logo />
          </Link>
          <div className="min-w-0 flex-1 pl-1">
            <div className="eyebrow text-[9px] text-white/40">{settings.brandName} · now viewing</div>
            <div className="relative h-5 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={section}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -18, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="truncate text-[14px] font-medium leading-5"
                >
                  {section}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <Link href="/quote" className="flex h-11 items-center rounded-[12px] bg-signal px-4 text-[14px] font-semibold text-ink">
            Quote
          </Link>
          <MenuButton open={open} onClick={() => setOpen((o) => !o)} />
        </div>
      </nav>

      {/* ───────── Full-screen menu ───────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            className="fixed inset-0 z-[60] overflow-y-auto bg-accent text-white lg:left-[var(--rail)]"
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.85, ease: E }}
            data-lenis-prevent
          >
            <div className="noise absolute inset-0" />
            <div className="wrap relative flex min-h-full flex-col pb-28 pt-5 lg:pb-10 lg:pt-8">
              <div className="flex items-center justify-between">
                <span className="eyebrow flex items-center gap-3 text-white/70">
                  <span className="cross text-signal" /> Menu · {settings.brandName} {settings.brandSuffix}
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-11 w-11 place-items-center rounded-full bg-white/15 transition hover:rotate-90 hover:bg-white/25"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-8 grid flex-1 gap-10 lg:mt-12 lg:grid-cols-12">
                {/* links */}
                <ul className="lg:col-span-7">
                  {[{ id: "home", label: "Home", href: "/" }, ...nav].map((n, i) => (
                    <li key={n.id} className="overflow-hidden border-b border-white/15">
                      <motion.div initial={{ y: "100%" }} animate={{ y: "0%" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.05 }}>
                        <Link href={n.href} className="group flex items-baseline gap-4 py-3 sm:py-4">
                          <span className="board w-8 text-xl text-white/45 transition-colors group-hover:text-signal">{String(i + 1).padStart(2, "0")}</span>
                          <span
                            className={cn(
                              "display text-[clamp(2.1rem,6.2vw,4.6rem)] transition-all duration-500 group-hover:translate-x-3 group-hover:text-signal",
                              isActive(n.href) && "text-signal",
                            )}
                          >
                            {n.label}
                          </span>
                          <ArrowUpRight className="ml-auto self-center opacity-0 transition-all duration-500 group-hover:rotate-45 group-hover:opacity-100" />
                        </Link>
                      </motion.div>
                    </li>
                  ))}
                </ul>

                {/* departures board */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-4 lg:col-span-5"
                >
                  <div className="rounded-[18px] bg-deep p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <span className="board text-2xl text-signal">Departures</span>
                      <span className="eyebrow text-white/50">Live</span>
                    </div>
                    <div className="mt-3 divide-y divide-white/10">
                      {DEPARTURES.map((d) => (
                        <Link key={d.id} href={`/track?id=${d.id}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2.5 transition hover:bg-white/5">
                          <span className="board text-lg tracking-wide">
                            {d.from} <span className="text-white/40">→</span> {d.to}
                            <span className="ml-2 align-middle font-sans text-[11px] font-normal normal-case text-white/45">{d.id}</span>
                          </span>
                          <span className="eyebrow text-white/50">{d.mode}</span>
                          <span className={cn("board text-sm", d.status === "Delivered" ? "text-white/50" : "text-signal")}>{d.status}</span>
                        </Link>
                      ))}
                    </div>
                    <form onSubmit={submitTrack} className="mt-4 flex items-center rounded-[12px] bg-white/10 p-1.5">
                      <Search size={16} className="ml-2 shrink-0 text-white/50" />
                      <input
                        value={trackId}
                        onChange={(e) => setTrackId(e.target.value)}
                        placeholder="Tracking ID"
                        className="w-full min-w-0 bg-transparent px-3 text-[15px] placeholder:text-white/40 focus:outline-none"
                        aria-label="Tracking ID"
                      />
                      <button className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-signal text-ink" aria-label="Track">
                        <ArrowRight size={16} />
                      </button>
                    </form>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {services.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/services/${s.slug}`}
                        className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-[13px] transition hover:bg-white hover:text-ink"
                      >
                        <Icon name={s.icon} size={14} /> {s.title}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-4 pt-4 text-[14px]">
                    <div>
                      <div className="eyebrow text-white/50">Call</div>
                      <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="mt-1 block font-medium">
                        {settings.phone}
                      </a>
                    </div>
                    <div>
                      <div className="eyebrow text-white/50">Write</div>
                      <a href={`mailto:${settings.email}`} className="mt-1 block font-medium">
                        {settings.email}
                      </a>
                    </div>
                    <div className="col-span-2 flex flex-wrap gap-4 text-white/70">
                      {settings.socials.map((s) => (
                        <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="hover:text-white">
                          {s.label} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className="grid h-11 w-11 place-items-center rounded-[12px] bg-white/10 transition hover:bg-white/20"
    >
      <span className="flex flex-col gap-[5px]">
        <motion.span className="block h-[2px] w-5 rounded bg-white" animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} />
        <motion.span className="block h-[2px] w-5 rounded bg-white" animate={open ? { opacity: 0 } : { opacity: 1 }} />
        <motion.span className="block h-[2px] w-3 rounded bg-signal" animate={open ? { rotate: -45, y: -7, width: 20 } : { rotate: 0, y: 0, width: 12 }} />
      </span>
    </button>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid h-10 w-10 place-items-center rounded-[12px] bg-accent text-white", className)}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4v16" />
        <path d="M18 4l-8 8 8 8" />
      </svg>
      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-signal ring-2 ring-ink" />
    </span>
  );
}
