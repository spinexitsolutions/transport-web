"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Briefcase,
  Building2,
  Command as CommandIcon,
  ExternalLink,
  Factory,
  FileText,
  Gauge,
  Globe,
  HelpCircle,
  Home,
  Inbox,
  Kanban,
  Layers,
  ListOrdered,
  LogOut,
  Mail,
  Menu,
  Navigation,
  Newspaper,
  Package,
  Palette,
  Quote,
  RotateCcw,
  Sparkles,
  Truck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastProvider, useToast } from "./Toast";
import { CommandPalette, type Command } from "./os/CommandPalette";
import { IstClock } from "./os/IstClock";

type Item = { href: string; label: string; code: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> };

export const NAV: { group: string; items: Item[] }[] = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", code: "OPS", icon: Gauge }] },
  {
    group: "CRM",
    items: [
      { href: "/admin/leads", label: "Leads pipeline", code: "LDS", icon: Kanban },
      { href: "/admin/customers", label: "Customers", code: "CUS", icon: Users },
      { href: "/admin/shipments", label: "Shipments", code: "SHP", icon: Package },
      { href: "/admin/applications", label: "Applications", code: "APP", icon: UserPlus },
      { href: "/admin/subscribers", label: "Subscribers", code: "SUB", icon: Mail },
    ],
  },
  {
    group: "CMS",
    items: [
      { href: "/admin/content/settings", label: "Site & brand", code: "BRD", icon: Palette },
      { href: "/admin/content/intro", label: "Intro animation", code: "INT", icon: Sparkles },
      { href: "/admin/content/home", label: "Homepage", code: "HOM", icon: Home },
      { href: "/admin/content/nav", label: "Navigation", code: "NAV", icon: Navigation },
      { href: "/admin/content/services", label: "Services", code: "SVC", icon: Truck },
      { href: "/admin/content/posts", label: "Blog posts", code: "BLG", icon: Newspaper },
      { href: "/admin/content/testimonials", label: "Testimonials", code: "TST", icon: Quote },
      { href: "/admin/content/faqs", label: "FAQs", code: "FAQ", icon: HelpCircle },
      { href: "/admin/content/jobs", label: "Jobs", code: "JOB", icon: Briefcase },
      { href: "/admin/content/stats", label: "Stats", code: "STA", icon: BarChart3 },
      { href: "/admin/content/process", label: "Process steps", code: "PRC", icon: ListOrdered },
      { href: "/admin/content/industries", label: "Industries", code: "IND", icon: Factory },
      { href: "/admin/content/fleet", label: "Fleet", code: "FLT", icon: Layers },
      { href: "/admin/content/hubs", label: "Network hubs", code: "HUB", icon: Globe },
      { href: "/admin/content/clients", label: "Clients", code: "CLI", icon: Building2 },
    ],
  },
];

const ALL = NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group })));

const isActive = (path: string, href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/"));

function Brand({ name, dark = true }: { name: string; dark?: boolean }) {
  return (
    <Link href="/admin" className="flex items-center gap-3">
      <span className="relative grid h-10 w-10 place-items-center rounded-[11px] bg-accent text-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4v16" />
          <path d="M18 4l-8 8 8 8" />
        </svg>
        <span className={cn("absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-signal ring-2", dark ? "ring-ink" : "ring-bone")} />
      </span>
      <span className="leading-none">
        <span className={cn("block text-[15px] font-semibold tracking-tight", dark ? "text-white" : "text-ink")}>{name}</span>
        <span className={cn("board mt-1 block text-[13px] tracking-[0.14em]", dark ? "text-signal" : "text-accent")}>Control room</span>
      </span>
    </Link>
  );
}

function NavList({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-6">
      {NAV.map((g, gi) => (
        <div key={g.group}>
          <div className="mb-2 flex items-center gap-2 px-3">
            <span className="board text-[13px] tracking-[0.16em] text-white/40">{g.group}</span>
            <span className="h-px flex-1 bg-white/10" />
            <span className="board text-[11px] text-white/25">{String(gi + 1).padStart(2, "0")}</span>
          </div>
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const active = isActive(path, it.href);
              const I = it.icon;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex h-9 items-center gap-3 rounded-[9px] px-3 text-[14px] transition-colors",
                      active ? "font-medium text-ink" : "text-white/65 hover:bg-white/[0.06] hover:text-white",
                    )}
                  >
                    {active && (
                      <motion.span layoutId="admin-nav-pill" className="absolute inset-0 rounded-[9px] bg-signal" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
                    )}
                    <span className={cn("board relative w-8 text-[12px] tracking-[0.08em]", active ? "text-ink/55" : "text-white/30 group-hover:text-signal")}>{it.code}</span>
                    <span className="relative flex-1">{it.label}</span>
                    <span className="relative opacity-60">
                      <I size={15} strokeWidth={1.9} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function useAdminActions() {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }, [router]);
  const reset = useCallback(async () => {
    if (!confirm("Reset ALL content and CRM data back to the demo seed? This cannot be undone.")) return;
    setBusy(true);
    const res = await fetch("/api/admin/reset", { method: "POST" });
    setBusy(false);
    if (res.ok) {
      toast("Demo data restored");
      router.refresh();
      setTimeout(() => window.location.reload(), 500);
    } else toast("Reset failed", "error");
  }, [router, toast]);
  return { logout, reset, busy };
}

function FooterActions() {
  const { logout, reset, busy } = useAdminActions();
  const row = "flex h-9 w-full items-center gap-3 rounded-[9px] px-3 text-[14px] text-white/65 transition hover:bg-white/[0.06] hover:text-white";
  return (
    <div className="space-y-0.5 border-t border-dashed border-white/15 pt-3">
      <a href="/" target="_blank" rel="noreferrer" className={row}>
        <ExternalLink size={15} strokeWidth={1.9} /> View website
      </a>
      <button onClick={reset} disabled={busy} className={row}>
        <RotateCcw size={15} strokeWidth={1.9} className={busy ? "animate-spin" : ""} /> Reset demo data
      </button>
      <button onClick={logout} className={cn(row, "hover:bg-red-500/15 hover:text-red-300")}>
        <LogOut size={15} strokeWidth={1.9} /> Log out
      </button>
    </div>
  );
}

const TABS: (Item & { match?: string })[] = [
  { href: "/admin", label: "Ops", code: "OPS", icon: Gauge },
  { href: "/admin/leads", label: "Leads", code: "LDS", icon: Inbox },
  { href: "/admin/shipments", label: "Ship", code: "SHP", icon: Package },
  { href: "/admin/content/home", label: "Content", code: "CMS", icon: FileText, match: "/admin/content" },
];

function StatusStrip({ onCommand, onMenu }: { onCommand: () => void; onMenu: () => void }) {
  const path = usePathname();
  const current = ALL.find((i) => isActive(path, i.href));
  return (
    <div className="sticky top-0 z-30 border-b border-line bg-bone/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="board rounded-[5px] bg-ink px-1.5 py-0.5 text-[12px] tracking-[0.1em] text-signal">{current?.code ?? "OPS"}</span>
          <span className="truncate text-[14px] font-medium">{current?.label ?? "Control room"}</span>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-2 rounded-[8px] bg-white px-2.5 py-1.5 ring-1 ring-line md:flex">
            <span className="relative flex h-2 w-2">
              <span className="pulse-ring absolute inset-0 rounded-full bg-emerald-500" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="board text-[12px] tracking-[0.1em]">Systems nominal</span>
          </span>
          <span className="hidden items-baseline gap-1 sm:flex">
            <IstClock seconds className="board text-[20px] tabular-nums tracking-[0.02em]" />
            <span className="board text-[11px] text-muted">IST</span>
          </span>
          <button
            onClick={onCommand}
            className="flex h-9 items-center gap-2 rounded-[9px] bg-ink pl-3 pr-1.5 text-[13px] text-white transition hover:bg-ink-2"
            aria-label="Open command palette"
          >
            <CommandIcon size={14} className="text-signal" />
            <span className="hidden sm:inline">Command</span>
            <kbd className="board rounded-[5px] bg-white/10 px-1.5 py-0.5 text-[11px] tracking-[0.06em] text-white/70">⌘K</kbd>
          </button>
          <button onClick={onMenu} className="grid h-9 w-9 place-items-center rounded-[9px] bg-white ring-1 ring-line lg:hidden" aria-label="Open menu">
            <Menu size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ShellInner({ brand, children }: { brand: string; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const { logout, reset } = useAdminActions();

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commands = useMemo<Command[]>(
    () => [
      ...ALL.map((i) => ({ id: i.href, label: i.label, group: i.group, code: i.code, hint: i.href.replace("/admin", "") || "/", run: () => router.push(i.href) })),
      { id: "view", label: "View website", group: "Actions", code: "WEB", hint: "new tab", run: () => window.open("/", "_blank") },
      { id: "track", label: "Open public tracking page", group: "Actions", code: "TRK", run: () => window.open("/track", "_blank") },
      { id: "reset", label: "Reset demo data", group: "Actions", code: "RST", hint: "asks first", run: () => void reset() },
      { id: "logout", label: "Log out", group: "Actions", code: "OUT", run: () => void logout() },
    ],
    [router, reset, logout],
  );

  return (
    <div className="min-h-dvh bg-bone">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col bg-ink px-3 py-5 text-white lg:flex">
        <div className="px-3 pb-5">
          <Brand name={brand} />
        </div>
        <button
          onClick={() => setPalette(true)}
          className="mx-1 mb-5 flex h-10 items-center gap-2 rounded-[10px] bg-white/[0.07] px-3 text-left text-[13px] text-white/50 ring-1 ring-white/10 transition hover:text-white"
        >
          <span className="board text-signal">&gt;_</span>
          <span className="flex-1">Jump to…</span>
          <kbd className="board text-[11px] tracking-[0.06em] text-white/40">⌘K</kbd>
        </button>
        <div className="flex-1 overflow-y-auto pb-4 no-scrollbar" data-lenis-prevent>
          <NavList path={path} />
        </div>
        <FooterActions />
        <div className="mt-3 flex items-center justify-between px-3">
          <span className="barcode h-4 w-20 text-white/30" aria-hidden />
          <span className="board text-[11px] tracking-[0.12em] text-white/30">OS v2.6</span>
        </div>
      </aside>

      {/* mobile sheet */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <motion.div className="absolute inset-0 bg-night/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
              className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[22px] bg-ink px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 text-white"
            >
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/20" />
              <div className="mb-4 flex items-center justify-between px-3">
                <Brand name={brand} />
                <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-[9px] bg-white/10" aria-label="Close menu">
                  <X size={17} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pb-3" data-lenis-prevent>
                <NavList path={path} onNavigate={() => setOpen(false)} />
              </div>
              <FooterActions />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:ml-[260px]">
        <StatusStrip onCommand={() => setPalette(true)} onMenu={() => setOpen(true)} />
        <main className="px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-14 lg:pt-8">
          <div className="mx-auto max-w-[1280px]">{children}</div>
        </main>
      </div>

      {/* mobile tab bar */}
      <nav className="fixed inset-x-2.5 bottom-2.5 z-40 flex items-center justify-around rounded-[16px] bg-ink px-1.5 py-1.5 text-white shadow-[0_18px_50px_-12px_rgba(0,0,0,.5)] lg:hidden">
        {TABS.map((t) => {
          const active = t.match ? path.startsWith(t.match) : isActive(path, t.href);
          const I = t.icon;
          return (
            <Link key={t.href} href={t.href} className="relative flex flex-1 flex-col items-center gap-0.5 rounded-[12px] py-1.5">
              {active && <motion.span layoutId="admin-tab" className="absolute inset-0 rounded-[12px] bg-signal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className={cn("relative", active ? "text-ink" : "text-white/55")}>
                <I size={17} strokeWidth={2} />
              </span>
              <span className={cn("board relative text-[11px] tracking-[0.08em]", active ? "text-ink" : "text-white/45")}>{t.label}</span>
            </Link>
          );
        })}
        <button onClick={() => setOpen(true)} className="flex flex-1 flex-col items-center gap-0.5 py-1.5 text-white/55">
          <Menu size={17} strokeWidth={2} />
          <span className="board text-[11px] tracking-[0.08em] text-white/45">More</span>
        </button>
      </nav>

      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={commands} />
    </div>
  );
}

export function AdminShell({ brand, children }: { brand: string; children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ShellInner brand={brand}>{children}</ShellInner>
    </ToastProvider>
  );
}
