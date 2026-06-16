import Link from "next/link";
import { prisma } from "@/app/utils/db";

export default async function RightSidebar() {
  const trending = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { viewCount: "desc" },
    take: 5,
    select: { id: true, title: true, slug: true, viewCount: true },
  });

  const categories = await prisma.category.findMany({ take: 8 });

  return (
    <div className="space-y-8">
      {/* Trending */}
      <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <h3 className="font-label-md text-label-md text-on-surface mb-6 uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">trending_up</span>
          Trending Now
        </h3>
        <div className="flex flex-col gap-5">
          {trending.map((post, idx) => (
            <Link key={post.id} href={`/post/${post.slug}`} className="group flex items-start gap-4">
              <span className="text-headline-sm font-headline-sm font-bold text-outline w-6 shrink-0">{idx + 1}</span>
              <div>
                <p className="text-body-md font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">{post.title}</p>
                <p className="text-caption text-on-surface-variant mt-1">{post.viewCount.toLocaleString()} views</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Tags */}
      <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <h3 className="font-label-md text-label-md text-on-surface mb-6 uppercase tracking-wider">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="px-4 py-2 bg-surface-container-low text-on-surface-variant rounded-full font-label-md text-label-md hover:bg-primary-fixed hover:text-on-primary-fixed-variant transition-colors"
            >
              #{category.slug}
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="p-6 rounded-xl bg-primary text-on-primary shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
        <div className="relative z-10">
          <span className="material-symbols-outlined text-3xl mb-3 block">mail</span>
          <h4 className="text-headline-sm font-headline-sm mb-2">Weekly Digest</h4>
          <p className="text-body-md font-body-md opacity-90 mb-6">Get the best of Nasacy delivered to your inbox.</p>
          <button className="w-full bg-on-primary text-primary py-3 rounded-xl font-label-md text-label-md hover:bg-surface-bright active:scale-95 transition-all">
            Subscribe
          </button>
        </div>
      </section>
    </div>
  );
}
