// ───────────────────────────── CMS ─────────────────────────────

export type SiteSettings = {
  brandName: string;
  brandSuffix: string; // e.g. "Logistics"
  tagline: string;
  accent: string; // hex
  accentInk: string; // text colour on accent
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  socials: { label: string; url: string }[];
  seoTitle: string;
  seoDescription: string;
  announcement: string; // shown in navbar island, empty = hidden
  footerNote: string;
};

export type IntroSettings = {
  enabled: boolean;
  style: "counter" | "wordmark" | "route";
  words: string[]; // flashed during the intro
  duration: number; // seconds
  oncePerSession: boolean;
};

export type HeroContent = {
  eyebrow: string;
  titleLine1: string;
  titleAccent: string; // serif italic word
  titleLine2: string;
  subtitle: string;
  image: string;
  primaryCta: string;
  secondaryCta: string;
  modes: string[]; // rotating words in the headline (road, air, sea…)
  modeImages: string[]; // one image per mode, shown in the headline capsule
};

export type HomeSectionId =
  | "hero"
  | "clients"
  | "statement"
  | "services"
  | "stats"
  | "process"
  | "network"
  | "tracking"
  | "industries"
  | "fleet"
  | "quote"
  | "testimonials"
  | "faq"
  | "blog"
  | "cta";

export type HomeSection = { id: HomeSectionId; label: string; enabled: boolean };

export type HomeContent = {
  statement: string;
  sections: HomeSection[];
  ctaTitle: string;
  ctaSubtitle: string;
};

export type Service = {
  id: string;
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: string; // lucide name
  image: string;
  features: string[];
  startingPrice: number; // INR per priceUnit
  priceUnit: string; // "kg" | "shipment" | "sq ft / mo" … (quote calculator uses "kg" services)
  transitTime: string;
  published: boolean;
};

export type Stat = { id: string; value: number; suffix: string; label: string; prefix: string };

export type ProcessStep = { id: string; title: string; text: string; image: string };

export type Industry = { id: string; name: string; text: string; image: string };

export type FleetItem = { id: string; name: string; count: number; capacity: string; image: string };

export type Hub = { id: string; city: string; country: string; x: number; y: number; primary: boolean };

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
  rating: number;
  published: boolean;
};

export type Faq = { id: string; question: string; answer: string; published: boolean };

export type Client = { id: string; name: string };

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string; // paragraphs separated by blank line
  cover: string;
  category: string;
  author: string;
  date: string; // ISO
  readTime: number;
  published: boolean;
};

export type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  published: boolean;
};

export type NavLink = { id: string; label: string; href: string };

// ───────────────────────────── CRM ─────────────────────────────

export type LeadStatus = "new" | "contacted" | "quoted" | "negotiation" | "won" | "lost";

export type Note = { id: string; text: string; at: string; by: string };

export type Lead = {
  id: string;
  source: "quote" | "contact" | "newsletter" | "manual";
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  origin: string;
  destination: string;
  weight: number;
  message: string;
  estimate: number;
  value: number;
  status: LeadStatus;
  owner: string;
  createdAt: string;
  notes: Note[];
};

export type Customer = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  tier: "Standard" | "Priority" | "Enterprise";
  totalShipments: number;
  revenue: number;
  since: string;
};

export type ShipmentStatus =
  | "booked"
  | "picked"
  | "in_transit"
  | "customs"
  | "out_for_delivery"
  | "delivered"
  | "exception";

export type ShipmentEvent = { id: string; status: ShipmentStatus; location: string; note: string; at: string };

export type Shipment = {
  id: string; // tracking number
  customer: string;
  service: string;
  origin: string;
  destination: string;
  weight: number;
  pieces: number;
  status: ShipmentStatus;
  eta: string;
  createdAt: string;
  events: ShipmentEvent[];
};

export type Application = {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  link: string;
  message: string;
  status: "new" | "screening" | "interview" | "offer" | "rejected";
  createdAt: string;
};

export type Subscriber = { id: string; email: string; createdAt: string };

// ───────────────────────────── DB ─────────────────────────────

export type DB = {
  settings: SiteSettings;
  intro: IntroSettings;
  hero: HeroContent;
  home: HomeContent;
  nav: NavLink[];
  services: Service[];
  stats: Stat[];
  process: ProcessStep[];
  industries: Industry[];
  fleet: FleetItem[];
  hubs: Hub[];
  testimonials: Testimonial[];
  faqs: Faq[];
  clients: Client[];
  posts: Post[];
  jobs: Job[];
  leads: Lead[];
  customers: Customer[];
  shipments: Shipment[];
  applications: Application[];
  subscribers: Subscriber[];
};

export type DBKey = keyof DB;

export const DB_KEYS: DBKey[] = [
  "settings",
  "intro",
  "hero",
  "home",
  "nav",
  "services",
  "stats",
  "process",
  "industries",
  "fleet",
  "hubs",
  "testimonials",
  "faqs",
  "clients",
  "posts",
  "jobs",
  "leads",
  "customers",
  "shipments",
  "applications",
  "subscribers",
];

export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  booked: "Booked",
  picked: "Picked up",
  in_transit: "In transit",
  customs: "Customs clearance",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  exception: "Exception",
};

export const SHIPMENT_FLOW: ShipmentStatus[] = [
  "booked",
  "picked",
  "in_transit",
  "customs",
  "out_for_delivery",
  "delivered",
];

export const LEAD_STAGES: { id: LeadStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "quoted", label: "Quoted" },
  { id: "negotiation", label: "Negotiation" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];
