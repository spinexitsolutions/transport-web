import Image from "next/image";
import type { FleetItem } from "@/lib/types";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";

const SPANS = [
  "sm:col-span-2 sm:row-span-2 min-h-[420px]",
  "min-h-[260px]",
  "min-h-[260px]",
  "min-h-[260px]",
  "min-h-[260px]",
];

export function Fleet({ fleet }: { fleet: FleetItem[] }) {
  return (
    <section data-nav-label="Fleet & assets" className="wrap py-20 sm:py-28">
      <SectionLabel index="07">Fleet & assets</SectionLabel>
      <h2 className="display mt-6 max-w-4xl text-[clamp(2.6rem,7vw,6rem)]">
        <SplitWords text="Owned assets." /> <SplitWords text="Zero excuses." wordClassName="serif text-accent" delay={0.15} />
      </h2>
      <div className="mt-12 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {fleet.map((f, i) => (
          <Reveal key={f.id} delay={i * 0.07} className={`group relative overflow-hidden rounded-[28px] bg-ink text-white ${SPANS[i % SPANS.length]}`}>
            <Image
              src={f.image}
              alt={f.name}
              fill
              sizes={i === 0 ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 100vw"}
              className="object-cover opacity-75 transition duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className={`display tabular-nums ${i === 0 ? "text-[clamp(4rem,9vw,8rem)]" : "text-5xl"}`}>
                <Counter value={f.count} suffix={f.count >= 1000 ? "" : "+"} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-lg font-medium tracking-tight">{f.name}</span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">{f.capacity}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
