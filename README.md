# Kinetik Logistics — website + admin (CRM & CMS)

A demo website for a logistics and transport company, built with **Next.js 15 (App Router)**, **Tailwind CSS v4**, **Framer Motion** and **Lenis** smooth scroll.
It's designed mobile-first. Every piece of content, plus the intro animation, can be edited from the admin panel.

**Design system**
- Type (all sans-serif): *Archivo* at expanded width for headlines and labels, *Big Shoulders Display* (condensed signage) for numbers, indices and tickers, *Hanken Grotesk* for text.
- Colour: cool paper and blue-black ink, an electric ultramarine accent (changeable in admin), signal lime, a lavender tint and a deep blue-black — sections alternate between these colour blocks.
- A "freight manifest" visual language: faint column rules, crosshair section tags, barcode details and live data strips.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

- **Website:** `/`
- **Admin panel:** `/admin`. Demo login: `admin@kinetik.in` / `kinetik@2026`.

Copy `.env.example` to `.env.local` to change the admin credentials and the session secret before you deploy.

## Website features

| Area | What it does |
| --- | --- |
| **Page transitions** | An accent curtain lifts and the new page eases in on every navigation. |
| **Intro animation** | Full-screen loader with a 0→100 counter and cycling words. There are three styles (counter, wordmark, route), and by default it plays once per visit. You can toggle it, pick the style, and set the words and duration from the admin panel. Add `?intro=preview` to the URL to replay it. |
| **Route Rail navigation** | Desktop: a dark rail on the left where the page sections are stops on a route; a truck marker moves down it as you scroll, and you can click any stop. Track and Get-a-quote sit top-right. Mobile: a thumb-reach bottom bar with the current section and a Quote button. The menu is a full-screen blue overlay with a live "Departures" board. |
| **Home** | Every section has its own layout: hero with an expanding image capsule · lime client band · ultramarine scroll-lit statement with a stamp · expanding service panels · split-flap departure board for stats · route timeline for the process · hub board + world map · annotated phone for tracking · inline-pill sentence for industries · draggable asset tags for the fleet · receipt-edge quote calculator · rating panel testimonials · chat-style FAQ · newspaper-style blog · signage marquee CTA with a rotating badge. |
| **Pages** | Services and a page for each service, shipment tracking (`/track?id=KNT-482019`), instant quote, about, blog list and articles, careers (with an apply form), contact, and a custom 404. |
| **Lead capture** | Quote, contact, careers and newsletter forms all save into the CRM. |

## Admin panel (`/admin`)

- **Dashboard:** pipeline value, new leads, active shipments, won revenue and win rate. Charts for inbound leads and the pipeline by stage.
- **CRM**
  - Leads: a Kanban board with drag-and-drop between stages, and a table view. Each lead has notes, an owner and a deal value, and can be converted to a customer.
  - Customers.
  - Shipments: create a shipment and post tracking events. The public tracking page updates straight away.
  - Job applications.
  - Newsletter subscribers, with CSV export.
- **CMS**
  - Site & brand: name, accent colour, contact details, social links, SEO and the navbar announcement.
  - Intro animation.
  - Homepage: hero text, the scroll statement, the CTA, and section order and visibility.
  - Navigation, services, blog posts, testimonials, FAQs, jobs, stats, process steps, industries, fleet, network hubs and clients.

## How data is stored

`lib/db.ts` is a small JSON-file database. It saves to `data/db.json`, which is created from `lib/seed.ts` the first time the app runs.
- On read-only hosts such as Vercel it keeps data in memory instead, so the demo still works.
- For production, swap that one file for Postgres, MongoDB or Supabase. The rest of the app only uses `get` / `set` / `update`.
- To restore the demo content, use **Reset demo data** in the admin panel.

## Structure

```
app/(site)/        public website (layout adds intro, navbar, footer, smooth scroll)
app/admin/         login + admin panel (route group (panel) holds the shell)
app/api/           auth, admin collections, leads, tracking, applications, newsletter
components/site/   navbar, intro, footer, home sections, quote + tracking widgets
components/admin/  shell, generic CollectionEditor, CRM boards, editors
components/ui/     motion primitives (Reveal, SplitWords, Button, Counter, Marquee…)
lib/               types, seed content, db, auth, utils, world map dots
```
