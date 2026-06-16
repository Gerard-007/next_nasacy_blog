import { prisma } from "@/app/utils/db";
import Link from "next/link";
import Image from "next/image";

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams?.q?.trim() ?? "";

  const posts = query
    ? await prisma.blogPost.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
            {
              categories: {
                some: {
                  category: {
                    OR: [
                      { name: { contains: query, mode: "insensitive" } },
                      { slug: { contains: query, mode: "insensitive" } },
                    ],
                  },
                },
              },
            },
          ],
        },
        include: {
          author: { select: { id: true, name: true, imageUrl: true } },
          categories: { include: { category: true } },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="pt-24 pb-16 px-gutter max-w-container-max mx-auto min-h-screen">
      {/* Search Header */}
      <section className="mb-12">
        <div className="max-w-content-max">
          <form action="/search" method="get" className="relative group mb-6">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              name="q"
              defaultValue={query}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-4 pl-12 pr-4 text-body-lg font-body-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
              placeholder="Search insights..."
              type="text"
            />
          </form>
          {query && (
            <h1 className="text-headline-md font-headline-md text-on-surface">
              {posts.length} result{posts.length !== 1 ? "s" : ""} found for <span className="text-primary italic">&ldquo;{query}&rdquo;</span>
            </h1>
          )}
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="font-label-md text-label-md text-outline uppercase tracking-widest mb-4">Content Type</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input defaultChecked className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                  <span className="text-body-md text-on-surface group-hover:text-primary transition-colors">Posts</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                  <span className="text-body-md text-on-surface group-hover:text-primary transition-colors">Topics</span>
                </label>
              </div>
            </div>
            <div>
              <h3 className="font-label-md text-label-md text-outline uppercase tracking-widest mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="block px-4 py-2 rounded-lg hover:bg-surface-container-high transition-colors text-body-md text-on-surface-variant hover:text-primary"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="flex-1 space-y-10">
          {query ? (
            posts.length === 0 ? (
              <div className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-4">search_off</span>
                <p>No results found for <span className="font-semibold text-on-surface">{query}</span>.</p>
              </div>
            ) : (
              posts.map((post, idx) => {
                const readTime = Math.max(1, Math.ceil(String(post.content ?? "").replace(/<[^>]*>/g, "").length / 1000));
                const highlightText = (text: string) => {
                  if (!query) return text;
                  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
                  return text.split(regex).map((part, i) =>
                    regex.test(part) ? (
                      <span key={i} className="bg-primary-fixed text-on-primary-fixed-variant px-0.5 rounded">{part}</span>
                    ) : (
                      part
                    )
                  );
                };
                return (
                  <Link key={post.id} href={`/post/${post.slug}`} className={`group block ${idx > 0 ? "pt-10 border-t border-outline-variant/20" : ""}`}>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-6 h-6 rounded-full bg-surface-container-highest overflow-hidden">
                            {post.author?.imageUrl ? (
                              <Image src={post.author.imageUrl} alt={post.author.name ?? ""} width={24} height={24} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary text-[10px] font-bold">{post.author?.name?.charAt(0) || "A"}</div>
                            )}
                          </div>
                          <span className="font-label-md text-label-md text-on-surface">{post.author?.name}</span>
                          <span className="text-outline text-caption font-caption">&bull; {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(post.createdAt))}</span>
                        </div>
                        <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3 group-hover:text-primary transition-colors">
                          {highlightText(post.title)}
                        </h2>
                        <div className="flex items-center gap-4">
                          {post.categories?.[0] && (
                            <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-caption font-caption">{post.categories[0].category.name}</span>
                          )}
                          <span className="text-outline text-caption font-caption">{readTime} min read</span>
                        </div>
                      </div>
                      {(post.imageUrl || post.categories?.[0]?.category?.imageUrl) && (
                        <div className="w-full md:w-48 h-32 shrink-0 overflow-hidden rounded-xl bg-surface-container-highest">
                          <Image src={post.imageUrl || post.categories?.[0]?.category?.imageUrl || ""} alt={post.title} width={192} height={128} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            )
          ) : (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-outline mb-4">search</span>
              <h2 className="text-headline-md font-headline-md text-on-surface mb-2">Search for articles</h2>
              <p className="text-on-surface-variant">Enter a keyword to find relevant articles.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
