import { get } from "@/lib/db";
import { AdminShell } from "@/components/admin/Shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const settings = await get("settings");
  return <AdminShell brand={settings.brandName}>{children}</AdminShell>;
}
