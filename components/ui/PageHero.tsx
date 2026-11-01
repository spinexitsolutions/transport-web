import { SectionLabel } from "./SectionLabel";
import { SplitWords } from "./SplitWords";

/** Shared header for inner pages. */
export function PageHero({ label, title, accent, subtitle, children }: { label: string; title: string; accent?: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <section className="wrap pt-36 pb-12 sm:pt-44 sm:pb-16">
      <SectionLabel>{label}</SectionLabel>
      <h1 className="display mt-6 max-w-5xl text-[clamp(2.75rem,9vw,7.5rem)]">
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
