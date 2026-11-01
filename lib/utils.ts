import clsx, { type ClassValue } from "clsx";

export const cn = (...c: ClassValue[]) => clsx(c);

export const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

export const compactInr = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${n}`;
};

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  new Date(iso).toLocaleDateString("en-IN", opts);

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Simple, transparent price estimator used by the quote tool (shared client/server). */
export function estimatePrice(opts: { ratePerKg: number; weight: number; distanceKm: number; express: boolean; insurance: boolean }) {
  const base = Math.max(opts.weight, 1) * opts.ratePerKg;
  const distanceFactor = 1 + Math.min(opts.distanceKm, 8000) / 4000;
  let total = base * distanceFactor;
  if (opts.express) total *= 1.35;
  if (opts.insurance) total += total * 0.018;
  const gst = total * 0.18;
  return { base: Math.round(base), subtotal: Math.round(total), gst: Math.round(gst), total: Math.round(total + gst) };
}

export const CITY_DISTANCE: Record<string, [number, number]> = {
  // lat, lon (for a quick great-circle estimate)
  Mumbai: [19.07, 72.88],
  "Delhi NCR": [28.61, 77.21],
  Bengaluru: [12.97, 77.59],
  Chennai: [13.08, 80.27],
  Kolkata: [22.57, 88.36],
  Hyderabad: [17.38, 78.48],
  Pune: [18.52, 73.85],
  Ahmedabad: [23.02, 72.57],
  Jaipur: [26.91, 75.79],
  Kochi: [9.93, 76.26],
  Ludhiana: [30.9, 75.85],
  Dubai: [25.2, 55.27],
  Singapore: [1.35, 103.82],
  Rotterdam: [51.92, 4.48],
  London: [51.5, -0.13],
  "New York": [40.71, -74.0],
  Shanghai: [31.23, 121.47],
};

export function distanceKm(a: string, b: string) {
  const A = CITY_DISTANCE[a];
  const B = CITY_DISTANCE[b];
  if (!A || !B) return 800;
  const R = 6371;
  const dLat = ((B[0] - A[0]) * Math.PI) / 180;
  const dLon = ((B[1] - A[1]) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((A[0] * Math.PI) / 180) * Math.cos((B[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.max(Math.round(2 * R * Math.asin(Math.sqrt(h)) * 1.2), 30);
}
