import type { Metadata } from "next";
import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { get } from "@/lib/db";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/pages/ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const s = await get("settings");
  const wa = s.whatsapp.replace(/[^\d]/g, "");
  const cards = [
    { icon: Phone, k: "Call us", v: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
    { icon: Mail, k: "Email", v: s.email, href: `mailto:${s.email}` },
    { icon: MessageCircle, k: "WhatsApp", v: s.whatsapp, href: `https://wa.me/${wa}` },
    { icon: Clock, k: "Hours", v: s.hours },
  ];
  return (
    <>
      <PageHero label="Contact" title="Let's talk" accent="freight." subtitle="Whether it's one pallet or a thousand containers, a real human will get back to you within the hour." />

      <section className="wrap grid gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: I, k, v, href }, i) => {
          const inner = (
            <>
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-bone transition-colors duration-500 group-hover:bg-accent group-hover:text-accent-ink">
                  <I size={19} />
                </span>
                {href && <ArrowUpRight size={18} className="text-muted transition-transform duration-500 group-hover:rotate-45" />}
              </div>
              <div className="mt-8 text-sm text-muted">{k}</div>
              <div className="mt-1 font-medium break-words">{v}</div>
            </>
          );
          return (
            <Reveal key={k} delay={i * 0.06}>
              {href ? (
                <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group block h-full rounded-[20px] bg-white p-6 ring-1 ring-line transition-shadow hover:shadow-[0_30px_60px_-35px_rgba(0,0,0,.35)]">
                  {inner}
                </a>
              ) : (
                <div className="group h-full rounded-[20px] bg-white p-6 ring-1 ring-line">{inner}</div>
              )}
            </Reveal>
          );
        })}
      </section>

      <section className="wrap grid gap-4 pb-28 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <ContactForm />
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col overflow-hidden rounded-[20px] bg-ink text-white">
          <iframe
            title="Office location map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=72.855%2C19.055%2C72.880%2C19.075&layer=mapnik&marker=19.0650%2C72.8680"
            className="h-72 w-full grayscale-[0.6] sm:h-auto sm:min-h-[360px] sm:flex-1"
            loading="lazy"
          />
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-1 shrink-0 text-accent" />
              <div>
                <div className="eyebrow text-white/45">Headquarters</div>
                <p className="mt-2 text-lg">{s.address}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
