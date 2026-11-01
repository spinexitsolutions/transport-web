"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Anchor,
  BarChart3,
  Briefcase,
  Building2,
  ExternalLink,
  FileText,
  Gauge,
  HelpCircle,
  Home,
  Inbox,
  Kanban,
  Layers,
  ListOrdered,
  LogOut,
  Menu,
  Navigation,
  Newspaper,
  Package,
  Palette,
  Quote,
  RotateCcw,
  Route,
  Sparkles,
  Truck,
  UserPlus,
  Users,
  X,
  Factory,
  Globe,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastProvider, useToast } from "./Toast";

type Item = { href: string; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> };

export const NAV: { group: string; items: Item[] }[] = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: Gauge }] },
  {
    group: "CRM",
    items: [
      { href: "/admin/leads", label: "Leads pipeline", icon: Kanban },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/shipments", label: "Shipments", icon: Package },
      { href: "/admin/applications", label: "Applications", icon: UserPlus },
      { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
    ],
  },
  {
    group: "CMS",
    items: [
      { href: "/admin/content/settings", label: "Site & brand", icon: Palette },
      { href: "/admin/content/intro", label: "Intro animation", icon: Sparkles },
      { href: "/admin/content/home", label: "Homepage", icon: Home },
      { href: "/admin/content/nav", label: "Navigation", icon: Navigation },
      { href: "/admin/content/services", label: "Services", icon: Truck },
      { href: "/admin/content/posts", label: "Blog posts", icon: Newspaper },
      { href: "/admin/content/testimonials", label: "Testimonials", icon: Quote },
      { href: "/admin/content/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/admin/content/jobs", label: "Jobs", icon: Briefcase },
      { href: "/admin/content/stats", label: "Stats", icon: BarChart3 },
      { href: "/admin/content/process", label: "Process steps", icon: ListOrdered },
      { href: "/admin/content/industries", label: "Industries", icon: Factory },
      { href: "/admin/content/fleet", label: "Fleet", icon: Layers },
      { href: "/admin/content/hubs", label: "Network hubs", icon: Globe },
      { href: "/admin/content/clients", label: "Clients", icon: Building2 },
    ],
  },
];

const isActive = (path: string, href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/"));

function Brand({ name }: { name: string }) {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-ink text-accent">
        <Route size={16} strokeWidth={2.4} />
      </span>
      <span className="leading-none">
        <span className="block text-[15px] font-semibold tracking-tight">{name}</span>
        <span className="eyebrow !text-[9px] text-muted">Control room</span>
      </span>
    </Link>
  );
}

function NavList({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-6">
      {NAV.map((g) => (
        <div key={g.group}>
          <div className="eyebrow mb-2 px-3 !text-[10px] text-ink/40">{g.group}</div>
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
                      "relative flex h-9 items-center gap-3 rounded-xl px-3 text-[14px] transition-colors",
                      active ? "font-medium text-white" : "text-ink/70 hover:bg-ink/[0.04] hover:text-ink",
                    )}
                  >
                    {active && (
                      <motion.span layoutId="admin-nav-pill" className="absolute inset-0 rounded-xl bg-ink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
                    )}
                    <span className={cn("relative", active && "text-accent")}>
                      <I size={16} strokeWidth={1.9} />
                    </span>
                    <span className="relative">{it.label}</span>
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

function FooterActions() {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };
  const reset = async () => {
    if (!confirm("Reset ALL content and CRM data back to the demo seed? This cannot be undone.")) return;
    setBusy(true);
    const res = await fetch("/api/admin/reset", { method: "POST" });
    setBusy(false);
    if (res.ok) {
      toast("Demo data restored");
      router.refresh();
      setTimeout(() => window.location.reload(), 500);
    } else toast("Reset failed", "error");
  };
  return (
    <div className="space-y-0.5 border-t border-line pt-3">
      <a href="/" target="_blank" rel="noreferrer" className="flex h-9 items-center gap-3 rounded-xl px-3 text-[14px] text-ink/70 hover:bg-ink/[0.04] hover:text-ink">
        <ExternalLink size={16} strokeWidth={1.9} /> View website
      </a>
      <button onClick={reset} disabled={busy} className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-[14px] text-ink/70 hover:bg-ink/[0.04] hover:text-ink">
        <RotateCcw size={16} strokeWidth={1.9} className={busy ? "animate-spin" : ""} /> Reset demo data
      </button>
      <button onClick={logout} className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-[14px] text-ink/70 hover:bg-red-50 hover:text-red-600">
        <LogOut size={16} strokeWidth={1.9} /> Log out
      </button>
    </div>
  );
}

const TABS: Item[] = [
  { href: "/admin", label: "Home", icon: Gauge },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/shipments", label: "Shipments", icon: Package },
  { href: "/admin/content/home", label: "Content", icon: FileText },
];

export function AdminShell({ brand, children }: { brand: string; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-bone">
        {/* desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-line bg-[#efece6] px-3 py-5 lg:flex">
          <div className="px-3 pb-6">
            <Brand name={brand} />
          </div>
          <div className="flex-1 overflow-y-auto pb-4 no-scrollbar" data-lenis-prevent>
            <NavList path={path} />
          </div>
          <FooterActions />
        </aside>

        {/* mobile top bar */}
        <header className="glass sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line px-4 lg:hidden">
          <Brand name={brand} />
          <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white" aria-label="Open menu">
            <Menu size={18} />
          </button>
        </header>

        {/* mobile sheet */}
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[70] lg:hidden">
              <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 36 }}
                className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[28px] bg-bone px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
              >
                <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink/15" />
                <div className="mb-3 flex items-center justify-between px-3">
                  <Brand name={brand} />
                  <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-bone-2" aria-label="Close menu">
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

        <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-[264px] lg:px-10 lg:pb-14 lg:pt-10">
          <div className="mx-auto max-w-[1280px]">{children}</div>
        </main>

        {/* mobile tab bar */}
        <nav className="glass fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-[22px] border border-line px-2 py-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,.25)] lg:hidden">
          {TABS.map((t) => {
            const active = t.href === "/admin/content/home" ? path.startsWith("/admin/content") : isActive(path, t.href);
            const I = t.icon;
            return (
              <Link key={t.href} href={t.href} className={cn("flex w-16 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-medium", active ? "text-ink" : "text-ink/45")}>
                <span className={cn("grid h-8 w-12 place-items-center rounded-full transition", active && "bg-ink text-accent")}>
                  <I size={17} strokeWidth={2} />
                </span>
                {t.label}
              </Link>
            );
          })}
          <button onClick={() => setOpen(true)} className="flex w-16 flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium text-ink/45">
            <span className="grid h-8 w-12 place-items-center">
              <Anchor size={17} strokeWidth={2} />
            </span>
            More
          </button>
        </nav>
      </div>
    </ToastProvider>
  );
}
