import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { get } from "@/lib/db";
import { fmtDate } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { SplitWords } from "@/components/ui/SplitWords";
import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/pages/ImageReveal";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const posts = (await get("posts")).filter((p) => p.published);
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
  const related = posts.filter((p) => p.id !== post.id).sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category)).slice(0, 2);
  const paragraphs = post.body.split(/\n\s*\n/).filter(Boolean);

  return (
    <article>
      <header className="wrap pt-32 sm:pt-40">
        <div className="mx-auto max-w-4xl">
          <Link href="/blog" className="eyebrow text-muted transition-colors hover:text-ink">
            ← All insights
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-accent px-3 py-1 font-medium text-accent-ink">{post.category}</span>
            <span className="font-mono text-xs text-muted">
              {fmtDate(post.date)} · {post.readTime} min read
            </span>
          </div>
          <h1 className="display mt-6 text-[clamp(2.5rem,7vw,5.5rem)] text-balance">
            <SplitWords text={post.title} animateOnMount stagger={0.04} />
          </h1>
          <p className="mt-6 text-xl text-muted">{post.excerpt}</p>
          <div className="mt-8 flex items-center gap-3 border-t border-line pt-6">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ink font-medium text-white">{post.author.charAt(0)}</span>
            <div className="text-sm">
              <div className="font-medium">{post.author}</div>
              <div className="text-muted">Kinetik Editorial</div>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-12 px-2 sm:px-4">
        <ImageReveal src={post.cover} alt={post.title} priority className="mx-auto aspect-[4/3] max-w-6xl rounded-[20px] sm:aspect-[21/10] sm:rounded-[20px]" />
      </div>

      <div className="wrap py-16 sm:py-24">
        <div className="mx-auto max-w-2xl space-y-7 text-lg leading-[1.75] text-ink/85 sm:text-xl">
          {paragraphs.map((p, i) =>
            i === 0 ? (
              <Reveal key={i}>
                <p className="first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:font-bold first-letter:text-7xl first-letter:leading-[0.85] first-letter:text-accent">{p}</p>
              </Reveal>
            ) : (
              <Reveal key={i}>
                <p>{p}</p>
              </Reveal>
            ),
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line">
          <div className="wrap py-16 sm:py-24">
            <h2 className="display text-[clamp(2rem,5vw,3.5rem)]">
              Keep <span className="hl-soft">reading</span>
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group grid grid-cols-[120px_1fr] items-center gap-5 rounded-[20px] bg-white p-3 ring-1 ring-line sm:grid-cols-[180px_1fr]">
                  <div className="aspect-square overflow-hidden rounded-[20px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="pr-3">
                    <div className="font-mono text-xs text-muted">{r.category}</div>
                    <h3 className="mt-2 text-lg font-medium tracking-tight text-balance sm:text-xl">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-12">
              <Button href="/quote" variant="accent">Ship with Kinetik</Button>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
