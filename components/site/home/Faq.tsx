"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, Send } from "lucide-react";
import type { Faq as FaqT, SiteSettings } from "@/lib/types";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";

type Msg = { id: string; from: "me" | "bot"; text: string };

/** FAQ as a conversation with the control tower. */
export function Faq({ faqs, settings }: { faqs: FaqT[]; settings: SiteSettings }) {
  const first = faqs[0];
  const [msgs, setMsgs] = useState<Msg[]>(
    first ? [{ id: `q-${first.id}`, from: "me", text: first.question }, { id: `a-${first.id}`, from: "bot", text: first.answer }] : [],
  );
  const [asked, setAsked] = useState<string[]>(first ? [first.id] : []);
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const ask = (f: FaqT) => {
    if (typing) return;
    setAsked((a) => [...a, f.id]);
    setMsgs((m) => [...m, { id: `q-${f.id}`, from: "me", text: f.question }]);
    setTyping(true);
    timer.current = setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { id: `a-${f.id}`, from: "bot", text: f.answer }]);
    }, 900);
  };

  const remaining = faqs.filter((f) => !asked.includes(f.id));

  return (
    <section data-nav-label="FAQ" className="wrap grid gap-12 py-20 sm:py-28 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <SectionLabel index="10">FAQ</SectionLabel>
        <h2 className="display mt-6 text-[clamp(2.4rem,5.5vw,4.6rem)]">
          <SplitWords text="Ask the" /> <SplitWords text="control tower." wordClassName="hl" delay={0.15} />
        </h2>
        <p className="mt-6 max-w-sm text-lg text-muted">Tap a question — our answers come back faster than most carriers pick up the phone.</p>
        <div className="mt-8 flex flex-wrap gap-2">
          <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">
            <Phone size={15} /> {settings.phone}
          </a>
          <Link href="/contact" className="rounded-full px-5 py-3 text-sm font-medium ring-1 ring-line hover:bg-white">
            Write to us
          </Link>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_30px_80px_-40px_rgba(11,13,23,.35)] ring-1 ring-line">
          {/* header */}
          <div className="flex items-center gap-3 border-b border-line px-5 py-4">
            <span className="relative grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-ink">
              <span className="board text-lg">K</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-signal ring-2 ring-white" />
            </span>
            <div>
              <div className="text-[15px] font-semibold tracking-tight">{settings.brandName} control tower</div>
              <div className="text-xs text-muted">{typing ? "typing…" : "online · replies instantly"}</div>
            </div>
          </div>

          {/* thread */}
          <div ref={scroller} data-lenis-prevent className="h-[380px] space-y-3 overflow-y-auto bg-tint/60 px-4 py-5 sm:h-[420px] sm:px-5">
            <AnimatePresence initial={false}>
              {msgs.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 text-[15px] leading-relaxed ${
                      m.from === "me" ? "rounded-[18px_18px_4px_18px] bg-accent text-accent-ink" : "rounded-[18px_18px_18px_4px] bg-white text-ink ring-1 ring-line"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex">
                  <div className="flex gap-1 rounded-[18px_18px_18px_4px] bg-white px-4 py-3.5 ring-1 ring-line">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="h-2 w-2 rounded-full bg-ink/40"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.12 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* quick replies */}
          <div className="border-t border-line p-4">
            {remaining.length ? (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {remaining.map((f) => (
                    <motion.button
                      key={f.id}
                      layout
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => ask(f)}
                      disabled={typing}
                      className="rounded-full bg-bone px-3.5 py-2 text-left text-[13px] font-medium ring-1 ring-line transition hover:bg-ink hover:text-white disabled:opacity-50"
                    >
                      {f.question}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/contact" className="flex items-center justify-between rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">
                That&apos;s everything — still curious? Message a human
                <Send size={15} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
