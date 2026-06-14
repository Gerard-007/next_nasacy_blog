import BlogPostCard from "@/components/general/BlogPostCard";
import NewsletterForm from "@/components/general/NewsletterForm";
import HomePostTabs from "@/components/general/HomePostTabs";
import FollowAuthorButton from "@/components/general/FollowAuthorButton";
import { prisma } from "./utils/db";
import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const revalidate = 60;

async function getLatestPosts() {
  return await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      author: { select: { id: true, name: true, imageUrl: true } },
      categories: { include: { category: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });
}

async function getTopPosts() {
  // Query top 5 posts ordered by viewCount desc, then by likes count desc
  return await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: [
      { viewCount: "desc" },
      { likes: { _count: "desc" } }
    ],
    take: 5,
    include: {
      author: { select: { id: true, name: true, imageUrl: true } },
      categories: { include: { category: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });
}

async function getCategories() {
  return await prisma.category.findMany({ orderBy: { name: "asc" } });
}

async function getWriters(dbUserId?: string) {
  const writers = await prisma.user.findMany({
    where: { role: "ADMIN" },
    take: 5,
    select: {
      id: true,
      name: true,
      imageUrl: true,
      followers: dbUserId
        ? {
            where: { followerId: dbUserId },
          }
        : undefined,
    },
  });

  return writers.map((w) => ({
    id: w.id,
    name: w.name,
    imageUrl: w.imageUrl,
    isFollowing: dbUserId ? w.followers.length > 0 : false,
  }));
}

export default async function Home() {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  let dbUserId: string | undefined;
  if (kindeUser?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { kindeId: kindeUser.id },
      select: { id: true },
    });
    dbUserId = dbUser?.id;
  }

  const [latestPosts, topPosts, categories, writers] = await Promise.all([
    getLatestPosts(),
    getTopPosts(),
    getCategories(),
    getWriters(dbUserId),
  ]);

  const featuredPost = latestPosts[0];
  const remainingLatest = latestPosts.slice(1);

  return (
    <div className="pb-24">
      {/* Hero Section: Featured Post */}
      {featuredPost ? (
        <section className="max-w-container-max mx-auto px-gutter py-12">
          <Link href={`/post/${featuredPost.slug}`}>
            <BlogPostCard data={featuredPost} featured />
          </Link>
        </section>
      ) : (
        <section className="max-w-container-max mx-auto px-gutter py-12">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 text-center text-on-surface-variant">
            No featured post available. Check back soon!
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Posts Section */}
        <div className="lg:col-span-8">
          <HomePostTabs
            latestPosts={remainingLatest.length > 0 ? remainingLatest : latestPosts}
            topPosts={topPosts}
          />
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-12">
          {/* Tag Cloud */}
          <section>
            <h4 className="font-label-md text-label-md text-on-surface mb-6 uppercase tracking-wider">Top Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="px-4 py-2 bg-surface-container-low text-on-surface-variant rounded-full font-label-md text-label-md hover:bg-primary-fixed hover:text-on-primary-fixed-variant transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>

          {/* Newsletter Signup */}
          <section className="p-8 rounded-xl bg-primary text-on-primary shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
            <div className="relative z-10">
              <h4 className="text-headline-sm font-headline-sm mb-4">Deep dives, delivered.</h4>
              <p className="text-body-md font-body-md mb-8 opacity-90">Join 50,000+ subscribers who get our weekly analysis on tech and design.</p>
              <NewsletterForm />
              <p className="mt-4 font-caption text-caption opacity-70 text-center">No spam, just insights. Unsubscribe anytime.</p>
            </div>
          </section>

          {/* Recommended Writers */}
          {writers.length > 0 && (
            <section>
              <h4 className="font-label-md text-label-md text-on-surface mb-6 uppercase tracking-wider">Recommended Writers</h4>
              <div className="space-y-6">
                {writers.map((writer) => (
                  <div key={writer.id} className="flex items-center gap-4 group">
                    <Link href={`/profile/${writer.id}`} className="w-12 h-12 rounded-full bg-surface-container-highest overflow-hidden shrink-0 cursor-pointer">
                      {writer.imageUrl ? (
                        <img src={writer.imageUrl} alt={writer.name ?? ""} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                          {writer.name?.charAt(0) || "W"}
                        </div>
                      )}
                    </Link>
                    <Link href={`/profile/${writer.id}`} className="cursor-pointer">
                      <h5 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{writer.name}</h5>
                      <p className="font-caption text-caption text-on-surface-variant">Writer</p>
                    </Link>
                    <div className="ml-auto">
                      <FollowAuthorButton
                        authorId={writer.id}
                        initialFollowing={writer.isFollowing}
                        userId={dbUserId}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
