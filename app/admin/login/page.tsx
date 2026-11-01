import { Suspense } from "react";
import { get } from "@/lib/db";
import { LoginForm } from "@/components/admin/LoginForm";
import { FlapWord } from "@/components/admin/os/FlapWord";
import { IstClock } from "@/components/admin/os/IstClock";

export const dynamic = "force-dynamic";

const TILE =
  "board relative mr-[3px] inline-grid h-[1.15em] w-[0.78em] place-items-center rounded-[6px] bg-[#1d17b8] text-white shadow-[inset_0_-3px_0_rgba(0,0,0,.25)] sm:mr-1";

export default async function LoginPage() {
  const s = await get("settings");
  return (
    <div className="grid min-h-dvh bg-bone lg:grid-cols-[1.1fr_1fr]">
      {/* left — the board */}
      <div className="relative overflow-hidden bg-accent px-5 pb-10 pt-6 text-white sm:px-10 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-10">
        <div className="noise absolute inset-0" />
        {/* faint route line */}
        <svg viewBox="0 0 600 400" className="pointer-events-none absolute inset-0 h-full w-full opacity-25" preserveAspectRatio="none" aria-hidden>
          <path d="M -20 330 C 120 250, 200 360, 320 240 S 520 90, 640 120" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 10" />
          <circle cx="320" cy="240" r="5" fill="var(--signal)" />
        </svg>

        <div className="relative flex items-center justify-between">
          <span className="eyebrow flex items-center gap-2 text-white/70">
            <span className="cross text-signal" /> {s.brandName} {s.brandSuffix}
          </span>
          <span className="flex items-baseline gap-1">
            <IstClock seconds className="board text-2xl tabular-nums" />
            <span className="board text-xs text-white/60">IST</span>
          </span>
        </div>

        <div className="relative mt-10 lg:mt-0">
          <div className="board text-[13px] tracking-[0.18em] text-signal">Departures · Admin terminal</div>
          <h1 className="mt-4 text-[clamp(2.4rem,7.5vw,5.6rem)] leading-none">
            <FlapWord text="CONTROL" tileClassName={TILE} className="block" />
            <FlapWord text="ROOM" tileClassName={TILE} className="mt-[4px] block" delay={250} />
          </h1>
          <p className="mt-6 max-w-md text-white/75">Run the CRM, publish content and steer the whole website — every lead, every shipment, one console.</p>
        </div>

        <div className="relative mt-10 hidden grid-cols-3 gap-4 border-t border-white/20 pt-5 lg:grid">
          {[
            ["Gate", "01"],
            ["Status", "Boarding"],
            ["Clearance", "Admin"],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="eyebrow text-white/50">{k}</div>
              <div className="board mt-1 text-2xl">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* right — gate pass */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:py-16">
        <Suspense>
          <LoginForm brand={`${s.brandName} ${s.brandSuffix}`} />
        </Suspense>
      </div>
    </div>
  );
}
