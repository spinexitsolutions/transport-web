import type { Metadata } from "next";
import { LostShipment } from "@/components/pages/inner3/LostShipment";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return <LostShipment />;
}
