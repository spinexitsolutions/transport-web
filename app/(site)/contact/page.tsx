import type { Metadata } from "next";
import { ArrowUpRight, MapPin } from "lucide-react";
import { get } from "@/lib/db";
import { Reveal } from "@/components/ui/Reveal";
import { SplitWords } from "@/components/ui/SplitWords";
import { ContactForm } from "@/components/pages/ContactForm";
import { OpenNow } from "@/components/pages/inner2/OpenNow";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const s = await get("settings");
  const wa = s.whatsapp.replace(/[^\d]/g, "");
  const channels = [
    { code: "CALL", k: "Speak to dispatch", v: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
    { code: "WAPP", k: "WhatsApp the tower", v: s.whatsapp, href: `https://wa.me/${wa}` },
    { code: "MAIL", k: "Write to us", v: s.email, href: `mailto:${s.email}` },
    { code: "VISIT", k: "Headquarters", v: s.address, href: "#map" },
  ];
  return (
    <>
      <section data-nav-label="Dispatch desk" className="grid lg:grid-cols-2">
        {/* left: lime desk */}
        <div className="relative overflow-hidden bg-signal text-ink">
          <div className="wrap flex h-full flex-col gap-10 pb-12 pt-10 sm:pt-16 lg:max-w-none lg:pb-16 lg:pr-10 lg:pt-24">
            <span className="eyebrow flex items-center gap-3 text-ink/70">
              <span className="cross text-accent" /> Contact · dispatch desk
            </span>
            <h1 className="display text-[clamp(3rem,9vw,6.6rem)]">
              <SplitWords text="Let's talk" animateOnMount />
              <br />
              <SplitWords text="freight." wordClassName="text-accent" animateOnMount delay={0.15} />
            </h1>
            <OpenNow />
            <ul className="border-t-2 border-ink">
              {channels.map((c, i) => (
                <Reveal key={c.code} delay={0.1 + i * 0.06}>
                  <li className="border-b border-ink/20">
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="group grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 py-4 transition-colors sm:grid-cols-[6rem_1fr_auto]"
                    >
                      <span className="board text-3xl transition-colors group-hover:text-accent sm:text-4xl">{c.code}</span>
                      <span className="min-w-0">
                        <span className="eyebrow block text-ink/60">{c.k}</span>
                        <span className="mt-1 block truncate text-[17px] font-medium sm:text-lg">{c.v}</span>
                      </span>
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-white transition-all duration-500 group-hover:rotate-45 group-hover:bg-accent">
                        <ArrowUpRight size={18} />
                      </span>
                    </a>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>

        {/* right: ticket */}
        <div className="bg-bone">
          <div className="wrap py-10 sm:py-16 lg:max-w-none lg:pl-10 lg:pt-24">
            <p className="mb-6 max-w-md text-muted">
              Whether it&apos;s one pallet or a thousand containers — fill the ticket and a real human from the control tower replies within the hour.
            </p>
            <Reveal>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>

      <section id="map" data-nav-label="Find us" className="bg-ink py-12 text-white sm:py-16">
        <div className="wrap grid gap-6 lg:grid-cols-12 lg:items-stretch">
          <div className="flex flex-col justify-between gap-6 lg:col-span-4">
            <div>
              <span className="eyebrow flex items-center gap-3 text-white/60">
                <span className="cross text-signal" /> Headquarters
              </span>
              <div className="board mt-4 text-[clamp(4rem,10vw,7rem)] text-signal">BOM · HQ</div>
              <p className="mt-4 flex items-start gap-2 text-lg text-white/80">
                <MapPin size={18} className="mt-1.5 shrink-0 text-signal" />
                {s.address}
              </p>
            </div>
            <div className="text-white/50">{s.hours}</div>
          </div>
          <div className="relative overflow-hidden rounded-[16px] bg-deep ring-1 ring-white/10 lg:col-span-8">
            <iframe
              title="Office location map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=72.855%2C19.055%2C72.880%2C19.075&layer=mapnik&marker=19.0650%2C72.8680"
              className="h-72 w-full grayscale-[0.7] sm:h-[420px]"
              loading="lazy"
            />
            <span className="eyebrow pointer-events-none absolute left-3 top-3 rounded-md bg-ink/85 px-2.5 py-1.5 text-white">19.065° N · 72.868° E</span>
          </div>
        </div>
      </section>
    </>
  );
}
