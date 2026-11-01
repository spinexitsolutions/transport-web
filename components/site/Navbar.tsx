"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import type { NavLink, SiteSettings } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

type Svc = { slug: string; title: string; icon: string };

const SPRING = { type: "spring", stiffness: 380, damping: 34, mass: 0.9 } as const;

/**
 * "Dynamic Island" navigation.
 * A single black capsule that morphs: compact while scrolling, expanded at rest,
 * grows into a services mega-panel on hover and into a full-screen sheet on mobile.
 */
export function Navbar({ settings, nav, services }: { settings: SiteSettings; nav: NavLink[]; services: Svc[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false); // mobile / compact sheet
  const [mega, setMega] = useState(false); // desktop services panel
  const [compact, setCompact] = useState(false);
  const [hoverIsland, setHoverIsland] = useState(false);
  const [section, setSection] = useState<string>("");
  const [hovered, setHovered] = useState<string | null>(null);
  const [trackId, setTrackId] = useState("");
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const lastY = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const down = y > lastY.current;
    if (Math.abs(y - lastY.current) > 6) setCompact(y > 140 && down);
    lastY.current = y;
  });

  // Close everything on navigation
  useEffect(() => {
    setOpen(false);
    setMega(false);
  }, [pathname]);

  // Lock scroll when the sheet is open
  useEffect(() => {
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  // Track which [data-nav-label] section is in the middle of the viewport
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-label]"));
    const page = nav.find((n) => n.href !== "/" && pathname.startsWith(n.href))?.label ?? "";
    setSection(page);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setSection((e.target as HTMLElement).dataset.navLabel || ""));
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname, nav]);

  const expanded = !compact || hoverIsland;
  const label = section || settings.announcement;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const submitTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    router.push(`/track?id=${encodeURIComponent(trackId.trim())}`);
    setOpen(false);
  };

  return (
    <>
      {/* dim backdrop for sheet & mega panel */}
      <AnimatePresence>
        {(open || mega) && (
          <motion.div
            key="scrim"
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setOpen(false);
              setMega(false);
            }}
          />
        )}
      </AnimatePresence>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-2.5 pt-2.5 sm:px-4 sm:pt-4">
        <LayoutGroup>
          <motion.nav
            layout
            transition={SPRING}
            onMouseEnter={() => setHoverIsland(true)}
            onMouseLeave={() => {
              setHoverIsland(false);
              setMega(false);
              setHovered(null);
            }}
            style={{ borderRadius: open ? 30 : 26 }}
            className={cn(
              "pointer-events-auto relative overflow-hidden bg-[#0c0c0e]/[0.92] text-white shadow-[0_20px_60px_-20px_rgba(0,0,0,.55),inset_0_0_0_1px_rgba(255,255,255,.07)] backdrop-blur-2xl",
              open ? "h-[calc(100svh-20px)] w-full max-w-xl sm:h-auto sm:max-h-[calc(100svh-32px)]" : "w-auto",
            )}
          >
            {/* ── top bar ── */}
            <motion.div layout="position" className="flex h-[52px] items-center gap-1 pl-2 pr-2">
              <Link href="/" className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2" aria-label={`${settings.brandName} home`}>
                <Logo />
                <AnimatePresence initial={false}>
                  {(expanded || open) && (
                    <motion.span
                      key="brand"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={SPRING}
                      className="overflow-hidden whitespace-nowrap text-[15px] font-semibold tracking-tight"
                    >
                      {settings.brandName}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* desktop links */}
              <AnimatePresence initial={false}>
                {expanded && !open && (
                  <motion.ul
                    key="links"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={SPRING}
                    className="hidden items-center overflow-hidden lg:flex"
                    onMouseLeave={() => setHovered(null)}
                  >
                    {nav.map((n) => {
                      const isServices = n.href === "/services";
                      return (
                        <li key={n.id} className="relative" onMouseEnter={() => { setHovered(n.id); setMega(isServices); }}>
                          {hovered === n.id && (
                            <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-white/10" transition={SPRING} />
                          )}
                          <Link
                            href={n.href}
                            className={cn(
                              "relative block whitespace-nowrap rounded-full px-3.5 py-2 text-[14px] tracking-tight transition-colors",
                              isActive(n.href) ? "text-white" : "text-white/60 hover:text-white",
                            )}
                          >
                            {n.label}
                            {isActive(n.href) && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />}
                          </Link>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>

              {/* live label (section / announcement) — shown when compact or on mobile */}
              <AnimatePresence initial={false} mode="popLayout">
                {!open && (
                  <motion.div
                    key="label"
                    layout="position"
                    className={cn("relative flex min-w-0 items-center gap-2 px-2", expanded && "lg:hidden")}
                  >
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="pulse-ring absolute inset-0 rounded-full bg-accent" />
                      <span className="relative h-2 w-2 rounded-full bg-accent" />
                    </span>
                    <div className="relative h-5 max-w-[42vw] overflow-hidden sm:max-w-[260px]">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={label}
                          initial={{ y: 18, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -18, opacity: 0 }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                          className="block truncate text-[13px] leading-5 text-white/75"
                        >
                          {label}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="ml-auto flex items-center gap-1 pl-1">
                {/* progress ring */}
                {!open && (
                  <motion.div layout="position" className="relative hidden sm:block">
                    <Link href="/track" className="relative grid h-9 w-9 place-items-center" aria-label="Track a shipment">
                    <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" />
                      <motion.circle cx="18" cy="18" r="15" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" style={{ pathLength: progress }} />
                    </svg>
                    <Search size={14} className="text-white/60" />
                    </Link>
                  </motion.div>
                )}
                <AnimatePresence initial={false}>
                  {expanded && !open && (
                    <motion.div
                      key="cta"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={SPRING}
                      className="hidden overflow-hidden sm:block"
                    >
                      <Link
                        href="/quote"
                        className="group ml-1 flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-accent pl-4 pr-3 text-[13.5px] font-medium text-accent-ink"
                      >
                        Get a quote
                        <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:rotate-45" />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setOpen((o) => !o)}
                  aria-label={open ? "Close menu" : "Open menu"}
                  aria-expanded={open}
                  className={cn("grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/15", expanded && !open && "lg:hidden")}
                >
                  <span className="relative block h-3 w-4">
                    <motion.span
                      className="absolute left-0 top-0 h-[1.5px] w-4 rounded bg-white"
                      animate={open ? { rotate: 45, y: 5.25 } : { rotate: 0, y: 0 }}
                      transition={SPRING}
                    />
                    <motion.span
                      className="absolute bottom-0 left-0 h-[1.5px] w-4 rounded bg-white"
                      animate={open ? { rotate: -45, y: -5.25, width: 16 } : { rotate: 0, y: 0, width: 10 }}
                      transition={SPRING}
                    />
                  </span>
                </button>
              </div>
            </motion.div>

            {/* ── desktop services mega panel ── */}
            <AnimatePresence initial={false}>
              {mega && !open && expanded && (
                <motion.div
                  key="mega"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={SPRING}
                  className="hidden lg:block"
                  onMouseLeave={() => setMega(false)}
                >
                  <div className="grid grid-cols-[1fr_220px] gap-3 p-3 pt-1">
                    <div className="grid grid-cols-2 gap-1">
                      {services.map((s, i) => (
                        <motion.div key={s.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
                          <Link href={`/services/${s.slug}`} className="group flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-white/[0.07]">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.08] text-white/80 transition group-hover:bg-accent group-hover:text-accent-ink">
                              <Icon name={s.icon} size={17} strokeWidth={1.8} />
                            </span>
                            <span className="text-[14px] tracking-tight text-white/85">{s.title}</span>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                    <form onSubmit={submitTrack} className="flex flex-col justify-between rounded-2xl bg-accent p-4 text-accent-ink">
                      <div>
                        <div className="eyebrow opacity-70">Track</div>
                        <p className="mt-2 text-[17px] font-medium leading-tight tracking-tight">Where&apos;s my shipment?</p>
                      </div>
                      <div className="mt-4 flex items-center rounded-full bg-white/15 p-1">
                        <input
                          value={trackId}
                          onChange={(e) => setTrackId(e.target.value)}
                          placeholder="KNT-482019"
                          className="w-full min-w-0 bg-transparent px-3 text-[13px] placeholder:text-white/55 focus:outline-none"
                          aria-label="Tracking ID"
                        />
                        <button className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-white" aria-label="Track">
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── full sheet (mobile / compact) ── */}
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="sheet"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.12 } }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  className="flex h-[calc(100%-52px)] flex-col overflow-y-auto px-5 pb-5 pt-4 sm:h-auto"
                  data-lenis-prevent
                >
                  <ul className="flex flex-col">
                    {[{ id: "home", label: "Home", href: "/" }, ...nav].map((n, i) => (
                      <motion.li
                        key={n.id}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.12 + i * 0.045, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="border-b border-white/[0.08]"
                      >
                        <Link href={n.href} className="group flex items-center justify-between py-3.5">
                          <span className={cn("display text-[2.1rem] sm:text-[2.4rem]", isActive(n.href) ? "text-white" : "text-white/70 group-hover:text-white")}>
                            {n.label}
                            {isActive(n.href) && <span className="hl">.</span>}
                          </span>
                          <span className="font-mono text-xs text-white/30">0{i + 1}</span>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.form
                    onSubmit={submitTrack}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 flex items-center rounded-full bg-white/[0.08] p-1.5"
                  >
                    <Search size={16} className="ml-3 shrink-0 text-white/50" />
                    <input
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value)}
                      placeholder="Enter tracking ID"
                      className="w-full min-w-0 bg-transparent px-3 text-[15px] placeholder:text-white/35 focus:outline-none"
                      aria-label="Tracking ID"
                    />
                    <button className="h-10 shrink-0 rounded-full bg-white px-4 text-sm font-medium text-ink">Track</button>
                  </motion.form>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-auto pt-8">
                    <Link href="/quote" className="flex h-14 items-center justify-between rounded-full bg-accent pl-6 pr-2 font-medium text-accent-ink">
                      Get an instant quote
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white">
                        <ArrowUpRight size={18} />
                      </span>
                    </Link>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[13px] text-white/50">
                      <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a>
                      <div className="flex gap-4">
                        {settings.socials.map((s) => (
                          <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="hover:text-white">
                            {s.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        </LayoutGroup>
      </header>
    </>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid h-8 w-8 place-items-center rounded-[10px] bg-accent text-accent-ink", className)}>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4v16" />
        <path d="M18 4l-8 8 8 8" />
      </svg>
    </span>
  );
}
