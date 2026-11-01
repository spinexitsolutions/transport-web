"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUp, ArrowUpRight, Check, Loader2 } from "lucide-react";
import type { NavLink, SiteSettings } from "@/lib/types";
import { Logo } from "./Navbar";

export function Footer({ settings, nav, services }: { settings: SiteSettings; nav: NavLink[]; services: { slug: string; title: string }[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const letters = settings.brandName.split("");

  return (
    <footer ref={ref} className="relative overflow-hidden bg-night pb-24 text-white lg:pb-0" data-nav-label="Contact">
      <div className="noise absolute inset-0" />
      <motion.div style={{ y }} className="relative">
        <div className="wrap grid gap-14 pb-10 pt-20 sm:pt-28 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="display text-[clamp(2rem,5vw,3.5rem)]">
              {settings.footerNote.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="hl">{settings.footerNote.split(" ").slice(-2).join(" ")}</span>
            </p>
            <Newsletter />
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
            <FooterCol title="Company">
              {nav.map((n) => (
                <FooterLink key={n.id} href={n.href}>
                  {n.label}
                </FooterLink>
              ))}
              <FooterLink href="/quote">Get a quote</FooterLink>
            </FooterCol>
            <FooterCol title="Services">
              {services.slice(0, 7).map((s) => (
                <FooterLink key={s.slug} href={`/services/${s.slug}`}>
                  {s.title}
                </FooterLink>
              ))}
            </FooterCol>
            <FooterCol title="Reach us" className="col-span-2 sm:col-span-1">
              <a href={`mailto:${settings.email}`} className="block text-white/80 hover:text-white">
                {settings.email}
              </a>
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="block text-white/80 hover:text-white">
                {settings.phone}
              </a>
              <p className="text-white/45">{settings.address}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                {settings.socials.map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 text-white/70 hover:text-white">
                    {s.label}
                    <ArrowUpRight size={13} className="opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </a>
                ))}
              </div>
            </FooterCol>
          </div>
        </div>

        <div className="wrap flex flex-col gap-4 border-t border-white/10 py-6 text-[13px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-6 w-6 rounded-md" />
            <span>
              © {new Date().getFullYear()} {settings.brandName} {settings.brandSuffix}. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span className="font-mono tabular-nums">Mumbai {time} IST</span>
            <span className="hidden items-center gap-2 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> All systems normal
            </span>
            <button
              onClick={() => (window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" }))}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-accent hover:text-accent-ink"
              aria-label="Back to top"
            >
              <ArrowUp size={15} />
            </button>
          </div>
        </div>

        {/* giant wordmark */}
        <div className="relative select-none overflow-hidden px-2 pb-2" aria-hidden>
          <motion.div
            className="board flex justify-center leading-[0.78] tracking-[0.01em]"
            style={{ fontSize: `min(${(100 / (letters.length * 0.47)).toFixed(2)}vw, 30rem)` }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.15 }}
          >
            {letters.map((l, i) => (
              <motion.span
                key={i}
                variants={{ hidden: { y: "100%" }, show: { y: "0%", transition: { duration: 1.1, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] } } }}
                className={i === letters.length - 1 ? "text-signal" : "text-white/[0.92]"}
              >
                {l}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
}

function FooterCol({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="eyebrow mb-5 text-white/35">{title}</div>
      <div className="flex flex-col gap-2.5 text-[15px]">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group relative w-fit text-white/75 transition-colors hover:text-white">
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-accent transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
    </Link>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    if (r.ok) {
      setState("done");
      setEmail("");
    } else {
      setState("error");
      setMsg((await r.json().catch(() => ({}))).error || "Something went wrong");
    }
  };
  return (
    <form onSubmit={submit} className="mt-10 max-w-md">
      <label htmlFor="nl" className="eyebrow text-white/40">
        Freight notes — monthly, no spam
      </label>
      <div className="mt-3 flex items-center rounded-full bg-white/[0.07] p-1.5 ring-1 ring-white/10 focus-within:ring-white/30">
        <input
          id="nl"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full min-w-0 bg-transparent px-4 text-[15px] placeholder:text-white/30 focus:outline-none"
        />
        <button className="grid h-10 min-w-24 shrink-0 place-items-center rounded-full bg-white px-4 text-sm font-medium text-ink transition hover:bg-signal">
          {state === "loading" ? <Loader2 size={16} className="animate-spin" /> : state === "done" ? <Check size={16} /> : "Subscribe"}
        </button>
      </div>
      {state === "done" && <p className="mt-2 text-sm text-emerald-400">You&apos;re in. Welcome aboard.</p>}
      {state === "error" && <p className="mt-2 text-sm text-red-400">{msg}</p>}
    </form>
  );
}
