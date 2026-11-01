import Link from "next/link";
import { ArrowLeft, PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="display text-[clamp(10rem,40vw,30rem)] text-ink/[0.04] select-none">404</span>
      </div>
      <div className="relative">
        <span className="mx-auto grid h-20 w-20 animate-bounce place-items-center rounded-3xl bg-accent text-accent-ink">
          <PackageX size={34} />
        </span>
        <div className="eyebrow mt-8 text-muted">Tracking ID · KNT-404000</div>
        <h1 className="display mt-4 text-[clamp(2.5rem,8vw,6rem)]">
          This page took a <span className="hl">wrong turn.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-muted">
          Our control tower has looked everywhere. The shipment you&apos;re after isn&apos;t on this route — let&apos;s get you back on the highway.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-medium text-white transition-transform active:scale-95">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <Link href="/track" className="inline-flex h-12 items-center rounded-full px-6 font-medium ring-1 ring-line transition-colors hover:bg-white">
            Track a shipment
          </Link>
        </div>
      </div>
    </main>
  );
}
