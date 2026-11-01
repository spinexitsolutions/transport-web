import type { Metadata } from "next";
import { Coffee, GraduationCap, HeartPulse, Laptop, Plane, Wallet } from "lucide-react";
import { get } from "@/lib/db";
import { img } from "@/lib/seed";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { JobsBoard } from "@/components/pages/JobsBoard";
import { ImageReveal } from "@/components/pages/ImageReveal";

export const metadata: Metadata = { title: "Careers" };

const PERKS = [
  { icon: HeartPulse, t: "Family health cover", d: "₹10L cover for you, partner, kids and parents." },
  { icon: Wallet, t: "ESOPs for everyone", d: "Every full-time teammate owns a piece of Kinetik." },
  { icon: GraduationCap, t: "₹1L learning budget", d: "Courses, conferences, certifications — your call." },
  { icon: Laptop, t: "Hybrid by default", d: "Work where you do your best work, meet when it matters." },
  { icon: Plane, t: "Ship-it trips", d: "Ride along on a container ship or a cargo flight. Seriously." },
  { icon: Coffee, t: "Great people", d: "Kind, curious, ridiculously competent colleagues." },
];

export default async function CareersPage() {
  const jobs = (await get("jobs")).filter((j) => j.published);
  return (
    <>
      <PageHero label="Careers" title="Build the network" accent="that moves India." subtitle={`${jobs.length} open roles across operations, technology, sales and sustainability.`} />

      <section className="grid grid-cols-2 gap-2 px-2 sm:grid-cols-[1.4fr_1fr] sm:gap-4 sm:px-4">
        <ImageReveal src={img("1556761175-b413da4baf72", 1800)} alt="Team collaborating" priority className="col-span-2 aspect-[16/10] rounded-[20px] sm:col-span-1 sm:aspect-auto sm:min-h-[460px] sm:rounded-[20px]" />
        <div className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-1 sm:grid-cols-1 sm:gap-4">
          <ImageReveal src={img("1553413077-190dd305871c", 1000)} alt="Warehouse aisles" className="aspect-square rounded-[16px] sm:aspect-auto sm:min-h-[222px] sm:rounded-[20px]" />
          <ImageReveal src={img("1551434678-e076c223a692", 1000)} alt="Engineers at work" className="aspect-square rounded-[16px] sm:aspect-auto sm:min-h-[222px] sm:rounded-[20px]" />
        </div>
      </section>

      <section className="wrap py-20 sm:py-28">
        <SectionLabel index="01">Why Kinetik</SectionLabel>
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {PERKS.map(({ icon: I, t, d }, i) => (
            <Reveal key={t} delay={(i % 3) * 0.07} className="border-t border-line pt-6">
              <I size={22} className="text-accent" />
              <h3 className="mt-5 text-xl font-medium tracking-tight">{t}</h3>
              <p className="mt-2 text-muted">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap pb-28">
        <SectionLabel index="02">Open roles</SectionLabel>
        <h2 className="display mt-5 text-[clamp(2.25rem,6vw,4.5rem)]">
          Find your <span className="hl">seat.</span>
        </h2>
        <div className="mt-10">
          <JobsBoard jobs={jobs} />
        </div>
      </section>
    </>
  );
}
