import type { Stat } from "@/lib/types";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";

export function Stats({ stats }: { stats: Stat[] }) {
  return (
    <section data-nav-label="By the numbers" className="wrap py-20 sm:py-28">
      <div className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.08} className={`border-b border-line py-10 sm:py-12 ${i % 2 === 0 ? "border-r pr-4" : "pl-4"} lg:px-8 ${i === 0 ? "lg:pl-0" : ""} ${i < stats.length - 1 ? "lg:border-r" : "lg:border-r-0"}`}>
            <div className="display text-[clamp(3rem,8vw,6.5rem)] tabular-nums">
              <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
            </div>
            <p className="mt-3 max-w-[16rem] text-[15px] text-muted">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
