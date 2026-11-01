import { Suspense } from "react";
import { get } from "@/lib/db";
import { img } from "@/lib/seed";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const s = await get("settings");
  return (
    <div className="grid min-h-dvh bg-bone lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-night lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img("1494412574643-ff11b0a5c1c3", 1800)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-night/10" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="eyebrow text-white/60">{s.brandName} · Control room</div>
          <div>
            <h2 className="display text-[clamp(3rem,5vw,5rem)]">
              Every shipment,
              <br />
              every lead, <span className="hl">one place.</span>
            </h2>
            <p className="mt-5 max-w-md text-white/65">Run the CRM, publish content and steer the whole website from a single, calm dashboard.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <Suspense>
          <LoginForm brand={`${s.brandName} ${s.brandSuffix}`} />
        </Suspense>
      </div>
    </div>
  );
}
