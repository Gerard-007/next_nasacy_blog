import { prisma } from "@/app/utils/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        include: {
          post: {
            include: {
              author: { select: { id: true, name: true, imageUrl: true } },
              categories: { include: { category: true } },
              _count: { select: { comments: true, likes: true } },
            },
          },
        },
      },
    },
  });

  if (!category) return notFound();

  const allCategories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const posts = category.posts.map((pc) => pc.post);

  return (
    <div className="pt-24 pb-32 min-h-screen px-gutter max-w-container-max mx-auto">
      {/* Category Header */}
      <header className="mb-16">
        <h1 className="text-display-lg-mobile md:text-display-lg text-display-lg-mobile md:text-display-lg mb-4 text-on-surface tracking-tight">{category.name}</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant max-w-content-max">
          {category.description ?? `Explore articles in the ${category.name} category.`}
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar (Left) */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="font-label-md text-label-md uppercase tracking-wider text-outline mb-4">Related Topics</h3>
              <div className="flex flex-col gap-1">
                {allCategories.filter((c) => c.slug !== slug).slice(0, 6).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="flex items-center justify-between group p-3 rounded-xl hover:bg-surface-container-low transition-colors"
                  >
                    <span className="text-body-md font-body-md text-on-surface group-hover:text-primary">{cat.name}</span>
                    <span className="material-symbols-outlined text-outline group-hover:text-primary transition-transform group-hover:translate-x-1">chevron_right</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="p-6 bg-primary-container/10 rounded-2xl border border-primary-container/20">
              <h4 className="text-headline-sm font-headline-sm text-primary mb-2">Weekly Brief</h4>
              <p className="font-caption text-caption text-on-surface-variant mb-4">The top stories delivered to your inbox every Sunday.</p>
              <button className="w-full bg-primary text-on-primary py-3 rounded-xl font-label-md text-label-md hover:shadow-lg transition-shadow">Subscribe</button>
            </div>
          </div>
        </aside>

        {/* Posts Grid */}
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-8 border-b border-outline-variant/30 pb-4">
            <span className="font-label-md text-label-md text-on-surface-variant">Showing {posts.length} articles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.length === 0 ? (
              <div className="col-span-full text-center py-16 text-on-surface-variant">
                No posts found in this category yet.
              </div>
            ) : (
              posts.map((post, idx) => (
                <Link key={post.id} href={`/post/${post.slug}`} className={`group bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow ${idx === 0 ? "md:col-span-2 flex flex-col md:flex-row" : ""}`}>
                  <div className={idx === 0 ? "md:w-3/5 overflow-hidden" : "h-64 overflow-hidden relative"}>
                    {(post.imageUrl || post.categories?.[0]?.category?.imageUrl) ? (
                      <Image
                        src={post.imageUrl || post.categories?.[0]?.category?.imageUrl || ""}
                        alt={post.title}
                        width={idx === 0 ? 800 : 640}
                        height={idx === 0 ? 480 : 360}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container-highest" />
                    )}
                  </div>
                  <div className={idx === 0 ? "p-8 md:w-2/5 flex flex-col justify-center" : "p-6"}>
                    {post.categories?.[0] && (
                      <span className="inline-block bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-md text-label-md mb-4 self-start">
                        {post.categories[0].category.name}
                      </span>
                    )}
                    <h2 className={`${idx === 0 ? "text-headline-md" : "text-headline-sm"} font-headline-sm mb-3 group-hover:text-primary transition-colors`}>
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden">
                        {post.author?.imageUrl ? (
                          <Image src={post.author.imageUrl} alt={post.author.name ?? ""} width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">
                            {post.author?.name?.charAt(0) || "A"}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="font-label-md text-label-md text-on-surface">{post.author?.name ?? "Unknown"}</span>
                        <span className="font-caption text-caption text-outline block">
                          {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(post.createdAt))} &middot;{" "}
                          {Math.max(1, Math.ceil(String(post.content ?? "").replace(/<[^>]*>/g, "").length / 1000))} min read
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
