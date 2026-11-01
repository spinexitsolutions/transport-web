import type { Client } from "@/lib/types";
import { Marquee } from "@/components/ui/Marquee";

export function Clients({ clients }: { clients: Client[] }) {
  return (
    <section className="py-14 sm:py-20">
      <p className="wrap eyebrow mb-8 text-center text-muted">Trusted by 2,400+ shippers, from D2C startups to Fortune 500s</p>
      <Marquee duration={45}>
        {clients.map((c) => (
          <span key={c.id} className="flex items-center">
            <span className="px-6 text-[clamp(1.6rem,4vw,2.6rem)] font-semibold tracking-[-0.04em] text-ink/25 transition-colors duration-300 hover:text-ink sm:px-10">
              {c.name}
            </span>
            <span className="text-accent">✦</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
