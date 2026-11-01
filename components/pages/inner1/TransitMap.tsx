"use client";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";

type Station = { slug: string; title: string; icon: string; transitTime: string };

/** Horizontal metro-map style line: every service is a station that scrolls to its band. */
export function TransitMap({ stations }: { stations: Station[] }) {
  const go = (slug: string) => {
    const el = document.getElementById(`svc-${slug}`);
    if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { duration: 1.6, offset: -10 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <div className="relative min-w-[880px] pt-2">
        {/* the line */}
        <svg className="absolute left-0 right-0 top-[30px] h-[4px] w-full overflow-visible" preserveAspectRatio="none" aria-hidden>
          <line x1="0" y1="2" x2="100%" y2="2" stroke="rgba(255,255,255,.12)" strokeWidth="4" />
          <motion.line
            x1="0"
            y1="2"
            x2="100%"
            y2="2"
            stroke="var(--signal)"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1], delay: 0.3 }}
          />
        </svg>
        <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${stations.length}, minmax(0,1fr))` }}>
          {stations.map((s, i) => (
            <motion.li
              key={s.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.09, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <button onClick={() => go(s.slug)} className="group flex w-full flex-col items-start text-left">
                <span className="relative grid h-[60px] w-[60px] place-items-center">
                  <span className="absolute h-7 w-7 rounded-full border-4 border-signal bg-ink transition-all duration-500 group-hover:h-14 group-hover:w-14 group-hover:bg-signal" />
                  <Icon name={s.icon} size={18} className="relative text-transparent transition-colors duration-500 group-hover:text-ink" />
                </span>
                <span className="board mt-1 text-sm text-white/40">{String(i + 1).padStart(2, "0")}</span>
                <span className="mt-1 pr-3 text-[15px] font-medium leading-tight text-white transition-colors group-hover:text-signal">{s.title}</span>
                <span className="mt-1 text-xs text-white/40">{s.transitTime}</span>
              </button>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}
