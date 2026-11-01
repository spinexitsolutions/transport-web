"use client";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Faq as FaqT, SiteSettings } from "@/lib/types";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";

export function Faq({ faqs, settings }: { faqs: FaqT[]; settings: SiteSettings }) {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);
  return (
    <section data-nav-label="FAQ" className="wrap grid gap-12 py-20 sm:py-28 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <SectionLabel index="10">FAQ</SectionLabel>
        <h2 className="display mt-6 text-[clamp(2.6rem,6vw,5rem)]">
          <SplitWords text="Questions," /> <SplitWords text="answered." wordClassName="serif text-accent" delay={0.15} />
        </h2>
        <div className="mt-10 rounded-[28px] bg-ink p-6 text-white">
          <p className="text-lg tracking-tight">Still curious? Talk to a human — our control tower never sleeps.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-ink">
              Call {settings.phone}
            </a>
            <Link href="/contact" className="rounded-full bg-white/10 px-4 py-2.5 text-sm font-medium">
              Write to us
            </Link>
          </div>
        </div>
      </div>
      <div className="lg:col-span-7">
        {faqs.map((f, i) => {
          const isOpen = open === f.id;
          return (
            <div key={f.id} className="border-b border-line first:border-t">
              <button onClick={() => setOpen(isOpen ? null : f.id)} className="flex w-full items-center gap-5 py-6 text-left" aria-expanded={isOpen}>
                <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 text-lg font-medium tracking-tight sm:text-xl">{f.question}</span>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-500 ${isOpen ? "rotate-45 bg-accent text-accent-ink" : "bg-bone-2"}`}>
                  <Plus size={16} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-xl pb-6 pl-9 leading-relaxed text-muted">{f.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
