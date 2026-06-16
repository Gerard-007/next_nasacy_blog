import { prisma } from "@/app/utils/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CommentList from "@/components/comments/CommentList";
import PostActions from "@/components/general/PostActions";
import FollowAuthorButton from "@/components/general/FollowAuthorButton";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const revalidate = 60;

export default async function PostBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, imageUrl: true, aboutMe: true } },
      categories: { include: { category: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  if (!post) return notFound();

  try {
    await prisma.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
  } catch (e) {}

  // Resolve logged-in user's database ID and interaction states
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  let dbUserId: string | undefined;
  let isLiked = false;
  let isBookmarked = false;
  let isFollowing = false;

  if (kindeUser?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { kindeId: kindeUser.id },
      select: { id: true },
    });
    dbUserId = dbUser?.id;

    if (dbUserId) {
      const [like, bookmark, follow] = await Promise.all([
        prisma.like.findUnique({
          where: { userId_postId: { userId: dbUserId, postId: post.id } },
        }),
        prisma.bookmark.findUnique({
          where: { userId_postId: { userId: dbUserId, postId: post.id } },
        }),
        prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: dbUserId, followingId: post.authorId } },
        }),
      ]);
      isLiked = !!like;
      isBookmarked = !!bookmark;
      isFollowing = !!follow;
    }
  }

  const relatedPosts = await prisma.blogPost.findMany({
    where: { published: true, id: { not: post.id } },
    take: 2,
    orderBy: { createdAt: "desc" },
    include: {
      categories: { include: { category: { select: { imageUrl: true } } } },
    },
  });

  return (
    <div className="pt-16 pb-24">
      {/* Hero Header */}
      <header className="w-full mb-16">
        <div className="max-w-container-max mx-auto px-gutter md:mt-12">
          {(post.imageUrl || post.categories?.[0]?.category?.imageUrl) && (
            <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden shadow-sm mb-12">
              <Image src={post.imageUrl || post.categories?.[0]?.category?.imageUrl || ""} alt={post.title} fill className="object-cover" priority />
            </div>
          )}

          <div className="max-w-content-max mx-auto text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              {post.categories?.[0] && (
                <span className="bg-secondary-container text-on-secondary-container font-label-md px-3 py-1 rounded-full uppercase tracking-widest text-[10px]">
                  {post.categories[0].category.name}
                </span>
              )}
              <span className="text-on-surface-variant text-caption">
                {Math.max(1, Math.ceil(String(post.content ?? "").replace(/<[^>]*>/g, "").length / 1000))} min read
              </span>
            </div>
            <h1 className="text-display-lg-mobile md:text-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-8">{post.title}</h1>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30">
                {post.author?.imageUrl ? (
                  <Image src={post.author.imageUrl} alt={post.author.name ?? ""} width={48} height={48} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">
                    {post.author?.name?.charAt(0) || "A"}
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="font-label-md text-on-surface">{post.author?.name ?? "Unknown"}</p>
                <p className="text-caption text-on-surface-variant">
                  {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(post.createdAt))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content & Sidebar */}
      <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 relative">
        {/* Side Interaction (Desktop) + Mobile Bottom Bar — rendered by PostActions */}
        <PostActions
          postSlug={post.slug}
          postId={post.id}
          initialLikes={post._count?.likes ?? 0}
          initialLiked={isLiked}
          initialBookmarked={isBookmarked}
          userId={dbUserId}
        />

        {/* Content Area */}
        <article className="max-w-content-max mx-auto text-on-surface leading-relaxed">
          <div
            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-on-surface prose-p:text-on-surface-variant prose-a:text-primary prose-blockquote:border-primary prose-blockquote:bg-surface-container-low prose-blockquote:rounded-r-xl prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.categories && post.categories.length > 0 && (
            <div className="mt-16 flex flex-wrap gap-2">
              {post.categories.map((pc) => (
                <Link key={pc.id} href={`/category/${pc.category.slug}`} className="bg-surface-container-high px-4 py-1 rounded-full text-caption text-on-surface-variant hover:bg-primary-fixed hover:text-on-primary-fixed-variant transition-colors">
                  #{pc.category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Author Bio Card */}
          {post.author && (
            <div className="mt-16 p-8 bg-surface-container-low rounded-2xl border border-outline-variant/10 flex flex-col md:flex-row gap-8 items-start">
              <div className="w-20 h-20 rounded-full bg-surface-container-highest overflow-hidden shrink-0">
                {post.author.imageUrl ? (
                  <Image src={post.author.imageUrl} alt={post.author.name ?? ""} width={80} height={80} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl">
                    {post.author.name?.charAt(0) || "A"}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">{post.author.name}</h3>
                <p className="text-body-md text-on-surface-variant mb-4">
                  {post.author.aboutMe || "Writer at Nasacy. Sharing insights on technology, design, and the future of thought."}
                </p>
                <div className="flex gap-4">
                  <FollowAuthorButton
                    authorId={post.author.id}
                    initialFollowing={isFollowing}
                    userId={dbUserId}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-24">
              <h3 className="text-headline-md font-headline-md text-on-surface mb-8">Related Reads</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {relatedPosts.map((rp) => (
                  <Link key={rp.slug} href={`/post/${rp.slug}`} className="group cursor-pointer">
                    <div className="aspect-video rounded-xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow bg-surface-container-highest">
                      {(rp.imageUrl || rp.categories?.[0]?.category?.imageUrl) && (
                        <Image src={rp.imageUrl || rp.categories?.[0]?.category?.imageUrl || ""} alt={rp.title} width={640} height={360} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <h4 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors">{rp.title}</h4>
                    <p className="text-caption text-on-surface-variant mt-2">
                      {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(rp.createdAt))}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Comments Section */}
          <section className="mt-24 mb-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-headline-md font-headline-md text-on-surface">Discussion ({post._count?.comments ?? 0})</h3>
            </div>
            <CommentList slug={post.slug} userId={dbUserId} />
          </section>
        </article>
      </div>
    </div>
  );
}
