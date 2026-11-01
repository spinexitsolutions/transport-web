import type { Client } from "@/lib/types";
import { Marquee } from "@/components/ui/Marquee";

/** Lime colour block: a giant board-font count beside two counter-moving client rows. */
export function Clients({ clients }: { clients: Client[] }) {
  const half = Math.ceil(clients.length / 2);
  const rows = [clients.slice(0, half), clients.slice(half).length ? clients.slice(half) : clients];
  return (
    <section className="relative overflow-hidden bg-signal text-ink">
      <div className="wrap grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div className="eyebrow flex items-center gap-2 text-ink/60">
            <span className="cross" /> Verified shippers
          </div>
          <div className="board mt-3 text-[clamp(5.5rem,22vw,11rem)]">2,400+</div>
          <p className="mt-2 max-w-xs text-[15px] font-medium leading-snug text-ink/75">
            shippers trust us — from D2C startups to Fortune 500 manufacturers.
          </p>
        </div>
        <div className="-mx-4 flex flex-col gap-2 sm:mx-0 lg:col-span-8">
          {rows.map((row, r) => (
            <Marquee key={r} reverse={r === 1} duration={r === 1 ? 38 : 32} className="border-y border-ink/15 py-3 sm:py-4">
              {row.map((c) => (
                <span key={c.id} className="flex items-center">
                  <span className="display px-5 text-[clamp(1.6rem,4.4vw,3rem)] sm:px-8">{c.name}</span>
                  <span className="cross text-ink/50" />
                </span>
              ))}
            </Marquee>
          ))}
        </div>
      </div>
    </section>
  );
}
