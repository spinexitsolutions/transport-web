import type { Metadata } from "next";
import { Coffee, GraduationCap, HeartPulse, Laptop, Plane, Wallet } from "lucide-react";
import { get } from "@/lib/db";
import { img } from "@/lib/seed";
import { Reveal } from "@/components/ui/Reveal";
import { SplitWords } from "@/components/ui/SplitWords";
import { JobsBoard } from "@/components/pages/JobsBoard";
import { BoardingBoard } from "@/components/pages/inner2/BoardingBoard";

export const metadata: Metadata = { title: "Careers" };

const PERKS = [
  { icon: HeartPulse, t: "Family health cover", d: "₹10L cover for you, partner, kids and parents.", code: "MED" },
  { icon: Wallet, t: "ESOPs for everyone", d: "Every full-time teammate owns a piece of Kinetik.", code: "OWN" },
  { icon: GraduationCap, t: "₹1L learning budget", d: "Courses, conferences, certifications — your call.", code: "LRN" },
  { icon: Laptop, t: "Hybrid by default", d: "Work where you do your best work, meet when it matters.", code: "HYB" },
  { icon: Plane, t: "Ship-it trips", d: "Ride along on a container ship or a cargo flight. Seriously.", code: "TRP" },
  { icon: Coffee, t: "Great people", d: "Kind, curious, ridiculously competent colleagues.", code: "CRW" },
];

export default async function CareersPage() {
  const jobs = (await get("jobs")).filter((j) => j.published);
  return (
    <>
      {/* ── HERO: departures ── */}
      <section data-nav-label="Now boarding" className="relative overflow-hidden bg-ink text-white">
        <div className="noise absolute inset-0" />
        <div className="wrap relative grid gap-10 pb-14 pt-10 sm:pt-16 lg:grid-cols-12 lg:pb-20 lg:pt-24">
          <div className="flex flex-col justify-between gap-8 lg:col-span-5">
            <div>
              <span className="eyebrow flex items-center gap-3 text-white/60">
                <span className="cross text-signal" /> Careers · Terminal K
              </span>
              <h1 className="display mt-6 text-[clamp(2.6rem,7vw,5.6rem)]">
                <SplitWords text="Your next" animateOnMount /> <SplitWords text="departure." wordClassName="hl" animateOnMount delay={0.15} />
              </h1>
              <p className="mt-6 max-w-md text-lg text-white/65">
                {jobs.length} roles boarding now across operations, technology, sales and sustainability. Pick a row to check in.
              </p>
            </div>
            <div className="flex gap-2">
              {[img("1556761175-b413da4baf72", 600), img("1553413077-190dd305871c", 600), img("1551434678-e076c223a692", 600)].map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className={`h-24 w-full rounded-[10px] object-cover grayscale sm:h-32 ${i === 1 ? "translate-y-4" : ""}`} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-7">
            <BoardingBoard jobs={jobs} />
          </div>
        </div>
      </section>

      {/* ── perks: ticket stubs ── */}
      <section data-nav-label="Perks" className="bg-tint py-16 sm:py-24">
        <div className="wrap">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="display text-[clamp(2.2rem,5.5vw,4.4rem)]">
              Included in <span className="hl">every ticket.</span>
            </h2>
            <span className="board text-3xl text-accent">6 perks · 0 fine print</span>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map(({ icon: I, t, d, code }, i) => (
              <Reveal key={t} delay={(i % 3) * 0.07}>
                <div className="group flex h-full transition-transform duration-500 hover:-rotate-1 hover:-translate-y-1">
                  <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-2 rounded-l-[14px] bg-accent text-white">
                    <I size={22} />
                    <span className="board text-xl">{code}</span>
                  </div>
                  <div className="relative flex-1 rounded-r-[14px] bg-white p-5 ring-1 ring-line">
                    <span className="absolute inset-y-3 left-0 border-l-2 border-dashed border-tint" />
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="display text-xl [font-stretch:105%]">{t}</h3>
                      <span className="board text-lg text-ink/25">0{i + 1}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted">{d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── open roles: boarding passes ── */}
      <section data-nav-label="Open roles" className="wrap py-16 sm:py-24">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b-2 border-ink pb-6 sm:flex-row sm:items-end">
          <h2 className="display text-[clamp(2.2rem,5.5vw,4.4rem)]">
            Find your <span className="hl">seat.</span>
          </h2>
          <span className="eyebrow text-muted">Tap a pass to check in</span>
        </div>
        <JobsBoard jobs={jobs} />
      </section>
    </>
  );
}
