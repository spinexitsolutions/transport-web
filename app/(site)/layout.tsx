import { get } from "@/lib/db";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Intro } from "@/components/site/Intro";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, intro, nav, services] = await Promise.all([get("settings"), get("intro"), get("nav"), get("services")]);
  return (
    <SmoothScroll>
      <Intro intro={intro} brand={settings.brandName} />
      <Navbar settings={settings} nav={nav} services={services.filter((s) => s.published).map((s) => ({ slug: s.slug, title: s.title, icon: s.icon }))} />
      <main className="relative">{children}</main>
      <Footer settings={settings} nav={nav} services={services.filter((s) => s.published).map((s) => ({ slug: s.slug, title: s.title }))} />
    </SmoothScroll>
  );
}
