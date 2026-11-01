"use client";
import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export function NewsletterStrip() {
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
    <section data-nav-label="Subscribe" className="bg-signal text-ink">
      <div className="wrap grid items-center gap-8 py-14 sm:py-20 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="eyebrow flex items-center gap-3">
            <span className="cross" /> Subscription desk
          </div>
          <h2 className="display mt-4 text-[clamp(2.2rem,5.5vw,4.5rem)]">Get the Dispatch, monthly.</h2>
          <p className="mt-3 max-w-md text-ink/70">One email. Freight trends, playbooks and lane updates. No spam, unsubscribe in one tap.</p>
        </div>
        <form onSubmit={submit} className="lg:col-span-6">
          <div className="flex items-center gap-2 border-b-2 border-ink pb-2">
            <label htmlFor="dispatch-email" className="sr-only">
              Email address
            </label>
            <input
              id="dispatch-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full min-w-0 bg-transparent py-2 text-[clamp(1.2rem,3vw,2rem)] font-medium placeholder:text-ink/35 focus:outline-none"
            />
            <button className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink text-signal transition-transform hover:scale-105" aria-label="Subscribe">
              {state === "loading" ? <Loader2 className="animate-spin" /> : state === "done" ? <Check /> : <ArrowRight />}
            </button>
          </div>
          {state === "done" && <p className="mt-3 text-sm font-medium">You&apos;re on the list. See you next issue.</p>}
          {state === "error" && <p className="mt-3 text-sm font-medium text-red-700">{msg}</p>}
        </form>
      </div>
    </section>
  );
}
