"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, Loader2 } from "lucide-react";

export function LoginForm({ brand }: { brand: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("admin@kinetik.in");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const next = params.get("next");
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Login failed");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[420px]"
    >
      <form onSubmit={submit} className="relative overflow-hidden rounded-[18px] bg-white shadow-[0_30px_80px_-30px_rgba(11,13,23,.35)] ring-1 ring-line">
        {/* pass header */}
        <div className="flex items-center justify-between bg-ink px-5 py-3.5 text-white">
          <span className="board text-[15px] tracking-[0.12em]">Gate 01 · Admin access</span>
          <span className="board rounded-[4px] bg-signal px-1.5 py-0.5 text-[11px] tracking-[0.1em] text-ink">Pass</span>
        </div>

        <div className="px-5 pb-5 pt-5 sm:px-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <div>
              <div className="eyebrow text-muted">From</div>
              <div className="board text-4xl">WEB</div>
            </div>
            <div className="mb-3 h-px w-12 border-t-2 border-dashed border-ink/20" />
            <div className="text-right">
              <div className="eyebrow text-muted">To</div>
              <div className="board text-4xl text-accent">OPS</div>
            </div>
          </div>
          <div className="mt-1 text-[13px] text-muted">Passenger: {brand} control room</div>

          <div className="mt-6 space-y-3">
            <label className="block">
              <span className="eyebrow text-ink/60">Email</span>
              <input className="field mt-1.5 !rounded-[10px]" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="block">
              <span className="eyebrow text-ink/60">Password</span>
              <input
                className="field mt-1.5 !rounded-[10px]"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </div>
          {error && (
            <motion.p initial={{ x: -6 }} animate={{ x: [6, -4, 2, 0] }} className="board mt-3 text-[14px] tracking-[0.06em] text-red-600">
              ✕ {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group mt-5 flex h-12 w-full items-center justify-between rounded-[11px] bg-ink pl-5 pr-1.5 text-[15px] font-medium text-white transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Checking clearance…" : "Board the control room"}
            <span className="grid h-9 w-9 place-items-center rounded-[8px] bg-signal text-ink">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />}
            </span>
          </button>
        </div>

        {/* perforated stub */}
        <div className="relative border-t-2 border-dashed border-ink/15 px-5 py-4 sm:px-6">
          <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-bone" />
          <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-bone" />
          <button
            type="button"
            onClick={() => {
              setEmail("admin@kinetik.in");
              setPassword("kinetik@2026");
            }}
            className="flex w-full items-center gap-3 text-left text-[13px] text-muted transition hover:text-ink"
          >
            <KeyRound size={16} className="shrink-0 text-accent" />
            <span className="flex-1">
              <span className="font-medium text-ink">Demo access</span> — tap to fill
              <br />
              admin@kinetik.in · kinetik@2026
            </span>
            <span className="barcode h-8 w-16 shrink-0 text-ink/70" aria-hidden />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
