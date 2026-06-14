import { prisma } from "@/app/utils/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import FollowAuthorButton from "@/components/general/FollowAuthorButton";
import ProfileTabs from "@/components/profile/ProfileTabs";

export const revalidate = 60;

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Retrieve user with updated fields
  const profileUser = await prisma.user.findUnique({
    where: { id },
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          categories: { include: { category: true } },
          _count: { select: { comments: true, likes: true } },
        },
      },
      _count: { select: { posts: true } },
    },
  });

  if (!profileUser) return notFound();

  // Resolve current authenticated user
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  let dbUserId: string | undefined;
  let isFollowing = false;

  if (kindeUser?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { kindeId: kindeUser.id },
      select: { id: true },
    });
    dbUserId = dbUser?.id;

    if (dbUserId) {
      const followRecord = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: dbUserId,
            followingId: profileUser.id,
          },
        },
      });
      isFollowing = !!followRecord;
    }
  }

  const isOwner = dbUserId === profileUser.id;

  const totalViews = profileUser.posts.reduce((sum, p) => sum + (p.viewCount ?? 0), 0);
  const totalReactions = profileUser.posts.reduce((sum, p) => sum + ((p._count?.likes as number) ?? 0), 0);

  function formatCount(num: number) {
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toLocaleString();
  }

  return (
    <div className="pt-24 pb-32">
      <div className="max-w-container-max mx-auto px-gutter">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="relative w-full h-64 rounded-xl overflow-hidden mb-12 shadow-sm bg-surface-container-low">
            {profileUser.bannerUrl ? (
              <img
                src={profileUser.bannerUrl}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary-container/20"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
          </div>
          <div className="flex flex-col md:flex-row items-end gap-6 -mt-24 px-4 md:px-8">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background overflow-hidden shadow-lg bg-surface">
                {profileUser.imageUrl ? (
                  <Image
                    src={profileUser.imageUrl}
                    alt={profileUser.name ?? ""}
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-bold text-4xl">
                    {profileUser.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">
                {profileUser.name ?? "Unknown"}
              </h1>
              <p className="text-on-surface-variant text-body-lg font-body-lg">
                {profileUser.role === "ADMIN" ? "Writer & Curator" : "Writer"}
              </p>
            </div>
            {/* Show Follow button only if it's not the owner's profile */}
            {!isOwner && (
              <div className="flex gap-3 pb-2">
                <FollowAuthorButton
                  authorId={profileUser.id}
                  initialFollowing={isFollowing}
                  userId={dbUserId}
                />
              </div>
            )}
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Feed tabs switcher */}
          <ProfileTabs
            posts={profileUser.posts}
            aboutMe={profileUser.aboutMe}
            gender={profileUser.gender}
            name={profileUser.name}
            imageUrl={profileUser.imageUrl}
            bannerUrl={profileUser.bannerUrl}
            isOwner={isOwner}
            userId={profileUser.id}
          />

          {/* Sidebar Stats */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-8 shadow-sm">
              <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-6">
                User Stats
              </h4>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant text-body-md">Posts</span>
                  <span className="text-headline-sm font-headline-sm text-primary">
                    {profileUser._count.posts}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant text-body-md">Total Views</span>
                  <span className="text-headline-sm font-headline-sm text-on-surface">
                    {formatCount(totalViews)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant text-body-md">Total Reactions</span>
                  <span className="text-headline-sm font-headline-sm text-on-surface">
                    {formatCount(totalReactions)}
                  </span>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-outline-variant/20">
                <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-4">
                  Top Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profileUser.posts
                    .flatMap((p) => p.categories)
                    .slice(0, 6)
                    .map((pc) => (
                      <span
                        key={pc?.id}
                        className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-caption font-caption"
                      >
                        {pc?.category.name}
                      </span>
                    ))}
                </div>
              </div>
            </div>
            {!isOwner && (
              <div className="bg-primary-fixed text-on-primary-fixed-variant rounded-xl p-8 shadow-sm">
                <h4 className="text-headline-sm font-headline-sm mb-2">
                  Connect with {profileUser.name?.split(" ")[0] ?? "this author"}
                </h4>
                <p className="text-body-md font-body-md opacity-90 mb-6">
                  Receive notifications whenever they publish a new article or insight.
                </p>
                <button className="w-full bg-primary text-on-primary px-6 py-3 rounded-full font-label-md text-label-md hover:shadow-lg active:scale-95 transition-all">
                  Subscribe via Email
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
