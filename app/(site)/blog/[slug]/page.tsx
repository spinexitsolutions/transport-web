import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { get } from "@/lib/db";
import { fmtDate } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { SplitWords } from "@/components/ui/SplitWords";
import { ArticleBody, CoverParallax, ShareBar } from "@/components/pages/inner3/LongRead";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const posts = (await get("posts")).filter((p) => p.published).sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return { post: posts.find((p) => p.slug === slug), posts };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { post } = await load((await params).slug);
  if (!post) return { title: "Post not found" };
  return { title: post.title, description: post.excerpt, openGraph: { images: [post.cover], type: "article" } };
}

export default async function PostPage({ params }: Props) {
  const { post, posts } = await load((await params).slug);
  if (!post) notFound();
  const idx = posts.findIndex((p) => p.id === post.id);
  const next = posts.length > 1 ? posts[(idx + 1) % posts.length] : null;
  const related = posts
    .filter((p) => p.id !== post.id && p.id !== next?.id)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 3);
  const paragraphs = post.body.split(/\n\s*\n/).filter(Boolean);

  return (
    <article>
      {/* ── hero ── */}
      <header data-nav-label="Article" className="wrap relative overflow-hidden pb-10 pt-8 sm:pt-14 lg:pt-24">
        <span
          aria-hidden
          className="board outline-text pointer-events-none absolute -right-4 top-6 select-none text-[clamp(8rem,26vw,22rem)] leading-none [--stroke:rgba(58,46,255,.18)]"
        >
          {post.readTime}MIN
        </span>
        <div className="relative">
          <Link href="/blog" className="eyebrow inline-flex items-center gap-2 text-muted transition-colors hover:text-ink">
            <ArrowLeft size={13} /> The Dispatch
          </Link>
          <div className="mt-8 grid grid-cols-3 border-y border-line text-xs sm:max-w-2xl">
            {[
              ["Section", post.category],
              ["Published", fmtDate(post.date)],
              ["Read", `${post.readTime} min`],
            ].map(([k, v], i) => (
              <div key={k} className={`py-3 ${i > 0 ? "border-l border-line pl-3 sm:pl-4" : ""}`}>
                <div className="eyebrow text-muted">{k}</div>
                <div className="board mt-1 text-lg text-ink">{v}</div>
              </div>
            ))}
          </div>
          <h1 className="display mt-8 max-w-5xl text-[clamp(2.4rem,7vw,6rem)] text-balance">
            <SplitWords text={post.title} animateOnMount stagger={0.04} />
          </h1>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
            <p className="max-w-xl text-lg text-muted sm:text-xl">{post.excerpt}</p>
            <div className="flex items-center gap-3 rounded-full bg-white py-1.5 pl-1.5 pr-5 ring-1 ring-line">
              <span className="board grid h-11 w-11 place-items-center rounded-full bg-accent text-xl text-white">{post.author.charAt(0)}</span>
              <div className="text-sm leading-tight">
                <div className="font-semibold">{post.author}</div>
                <div className="text-muted">Kinetik Editorial</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <CoverParallax src={post.cover} alt={post.title} />

      {/* ── body ── */}
      <section data-nav-label="Story" className="wrap grid gap-10 py-14 sm:py-20 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <div className="eyebrow text-muted">Written by</div>
            <div className="mt-2 font-semibold">{post.author}</div>
            <div className="mt-6 eyebrow text-muted">Share this story</div>
            <div className="mt-3">
              <ShareBar title={post.title} />
            </div>
          </div>
        </aside>
        <div className="lg:col-span-7 lg:col-start-5">
          <ArticleBody readTime={post.readTime}>
            <div className="space-y-8 text-[1.13rem] leading-[1.8] text-ink/85 sm:text-xl">
              {paragraphs.map((p, i) => {
                if (i === 0)
                  return (
                    <Reveal key={i}>
                      <p className="first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-[5.2rem] first-letter:font-extrabold first-letter:leading-[0.8] first-letter:text-accent">
                        {p}
                      </p>
                    </Reveal>
                  );
                if (i === 1)
                  return (
                    <Reveal key={i}>
                      <blockquote className="relative my-4 border-l-[6px] border-accent py-2 pl-6 sm:pl-8">
                        <p className="display text-[clamp(1.6rem,3.6vw,2.6rem)] leading-[1.05] text-ink [font-stretch:105%]">{p}</p>
                      </blockquote>
                    </Reveal>
                  );
                return (
                  <Reveal key={i}>
                    <p>{p}</p>
                  </Reveal>
                );
              })}
            </div>
            <div className="mt-12 flex items-center gap-3 border-t border-line pt-6">
              <span className="cross text-accent" />
              <span className="eyebrow text-muted">End of story · {post.category}</span>
              <span className="barcode ml-auto h-6 w-20 text-ink/60" />
            </div>
          </ArticleBody>
        </div>
      </section>

      {/* ── next up ── */}
      {next && (
        <section data-nav-label="Next up" className="bg-accent text-white">
          <Link href={`/blog/${next.slug}`} className="wrap group grid items-center gap-8 py-14 sm:py-20 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="eyebrow flex items-center gap-3 text-white/70">
                <span className="cross text-signal" /> Next up · {next.category}
              </div>
              <h2 className="display mt-5 text-[clamp(2.2rem,6vw,5rem)] leading-[0.95] text-balance transition-transform duration-700 group-hover:translate-x-3">
                {next.title}
              </h2>
              <div className="mt-6 inline-flex items-center gap-3 font-medium">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-signal text-ink transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight size={22} />
                </span>
                Read the next story · {next.readTime} min
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] ring-8 ring-white/15 lg:col-span-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={next.cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
            </div>
          </Link>
        </section>
      )}

      {/* ── related ── */}
      {related.length > 0 && (
        <section data-nav-label="More stories" className="wrap py-14 sm:py-20">
          <div className="flex items-end justify-between gap-4 border-b-2 border-ink pb-4">
            <h2 className="board text-[clamp(2.4rem,6vw,4.5rem)]">More from the Dispatch</h2>
            <Link href="/blog" className="eyebrow shrink-0 text-muted hover:text-ink">
              All stories →
            </Link>
          </div>
          <div className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {related.map((r, i) => (
              <Link key={r.id} href={`/blog/${r.slug}`} className="group block py-6 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                <span className="board text-3xl text-ink/20 transition-colors group-hover:text-accent">{String(i + 1).padStart(2, "0")}</span>
                <div className="mt-3 aspect-[16/10] overflow-hidden rounded-[6px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.cover} alt="" loading="lazy" className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                </div>
                <div className="eyebrow mt-4 text-accent">{r.category}</div>
                <h3 className="mt-1 text-lg font-semibold leading-snug tracking-tight">{r.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
