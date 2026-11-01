import { SectionLabel } from "./SectionLabel";
import { SplitWords } from "./SplitWords";

/** Shared header for inner pages: ticket-stub style with a big signage index. */
export function PageHero({ label, title, accent, subtitle, children }: { label: string; title: string; accent?: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <section className="wrap relative pb-12 pt-12 sm:pb-16 sm:pt-20 lg:pt-28">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <SectionLabel>{label}</SectionLabel>
        <span className="barcode hidden h-6 w-24 text-ink/70 sm:block" aria-hidden />
      </div>
      <h1 className="display mt-8 max-w-5xl text-[clamp(2.6rem,8.4vw,7rem)]">
        <SplitWords text={title} animateOnMount />
        {accent && (
          <>
            {" "}
            <SplitWords text={accent} wordClassName="hl" animateOnMount delay={0.25} />
          </>
        )}
      </h1>
      {subtitle && <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">{subtitle}</p>}
      {children}
    </section>
  );
}
