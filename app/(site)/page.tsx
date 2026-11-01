import { getDB } from "@/lib/db";
import type { HomeSectionId } from "@/lib/types";
import { Hero } from "@/components/site/home/Hero";
import { Clients } from "@/components/site/home/Clients";
import { Statement } from "@/components/site/home/Statement";
import { Services } from "@/components/site/home/Services";
import { Stats } from "@/components/site/home/Stats";
import { Process } from "@/components/site/home/Process";
import { Network } from "@/components/site/home/Network";
import { Tracking } from "@/components/site/home/Tracking";
import { Industries } from "@/components/site/home/Industries";
import { Fleet } from "@/components/site/home/Fleet";
import { QuoteSection } from "@/components/site/home/QuoteSection";
import { Testimonials } from "@/components/site/home/Testimonials";
import { Faq } from "@/components/site/home/Faq";
import { Blog } from "@/components/site/home/Blog";
import { Cta } from "@/components/site/home/Cta";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = await getDB();
  const services = db.services.filter((s) => s.published);
  const posts = db.posts.filter((p) => p.published).sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const render: Record<HomeSectionId, () => React.ReactNode> = {
    hero: () => <Hero hero={db.hero} />,
    clients: () => <Clients clients={db.clients} />,
    statement: () => <Statement text={db.home.statement} />,
    services: () => <Services services={services} />,
    stats: () => <Stats stats={db.stats} />,
    process: () => (db.process.length ? <Process steps={db.process} /> : null),
    network: () => (db.hubs.length ? <Network hubs={db.hubs} /> : null),
    tracking: () => <Tracking />,
    industries: () => <Industries industries={db.industries} />,
    fleet: () => <Fleet fleet={db.fleet} />,
    quote: () => <QuoteSection services={services} />,
    testimonials: () => <Testimonials items={db.testimonials.filter((t) => t.published)} />,
    faq: () => <Faq faqs={db.faqs.filter((f) => f.published)} settings={db.settings} />,
    blog: () => (posts.length ? <Blog posts={posts} /> : null),
    cta: () => <Cta title={db.home.ctaTitle} subtitle={db.home.ctaSubtitle} phone={db.settings.phone} />,
  };

  const sections = db.home.sections.filter((s) => s.enabled);
  const hasHero = sections.some((s) => s.id === "hero");

  return (
    <>
      {!hasHero && <div className="h-24" />}
      {sections.map((s) => (
        <div key={s.id} id={s.id}>
          {render[s.id]?.()}
        </div>
      ))}
    </>
  );
}
