"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Lock, Route } from "lucide-react";

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
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm"
    >
      <div className="mb-10 flex items-center gap-2.5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-accent">
          <Route size={18} strokeWidth={2.4} />
        </span>
        <span className="font-semibold tracking-tight">{brand}</span>
      </div>
      <h1 className="text-[34px] font-semibold tracking-[-0.04em]">Welcome back.</h1>
      <p className="mt-1.5 text-muted">Sign in to the control room.</p>

      <div className="mt-8 space-y-3">
        <input className="field" type="email" autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="field" type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-medium text-white transition active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? <Loader2 size={17} className="animate-spin" /> : <>Sign in <ArrowRight size={16} className="transition group-hover:translate-x-0.5" /></>}
      </button>

      <button
        type="button"
        onClick={() => {
          setEmail("admin@kinetik.in");
          setPassword("kinetik@2026");
        }}
        className="mt-6 flex w-full items-start gap-3 rounded-2xl border border-dashed border-ink/15 p-4 text-left text-[13px] text-muted transition hover:border-ink/30"
      >
        <Lock size={15} className="mt-0.5 shrink-0" />
        <span>
          <span className="font-medium text-ink">Demo access</span> — tap to fill
          <br />
          admin@kinetik.in · kinetik@2026
        </span>
      </button>
    </motion.form>
  );
}
