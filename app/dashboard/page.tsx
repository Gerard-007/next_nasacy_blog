import Link from "next/link";
import { prisma } from "../utils/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { syncKindeUser } from "@/lib/auth/sync-user";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { DeleteButton } from "@/components/general/DeleteButton";
import { DashboardMobileNav } from "@/components/general/DashboardMobileNav";

export const dynamic = "force-dynamic";

async function getDashboardData(userId: string) {
  const posts = await prisma.blogPost.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { comments: true, likes: true } },
      categories: { include: { category: true } },
    },
  });

  const totalViews = posts.reduce((sum, p) => sum + (p.viewCount ?? 0), 0);
  const totalReactions = posts.reduce((sum, p) => sum + ((p._count?.likes as number) ?? 0), 0);

  const followers = await prisma.follow.count({
    where: { followingId: userId }
  });

  return { posts, totalViews, totalReactions, followers };
}

export default async function DashboardRoute() {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  const kindeId = kindeUser?.id;

  if (!kindeId) {
    return (
      <div className="pt-24 text-center text-on-surface-variant">Please sign in to view your dashboard.</div>
    );
  }

  let localUser = await prisma.user.findUnique({ where: { kindeId } });
  if (!localUser) {
    localUser = await syncKindeUser({
      sub: kindeId,
      email: kindeUser?.email ?? undefined,
      name: kindeUser?.given_name ? `${kindeUser.given_name} ${kindeUser?.family_name ?? ''}`.trim() : kindeUser?.given_name ?? undefined,
      given_name: kindeUser?.given_name ?? undefined,
      picture: kindeUser?.picture ?? undefined,
    });
  }

  if (!localUser) {
    return (
      <div className="pt-24 text-center text-on-surface-variant">Please sync your profile (visit any page while signed in).</div>
    );
  }

  const { posts, totalViews, totalReactions, followers } = await getDashboardData(localUser.id);

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-surface-bright/50 w-full">
      {/* Dashboard Layout */}
      <div className="flex flex-1 max-w-container-max mx-auto w-full min-h-screen">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 border-r border-outline-variant/20 p-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="space-y-8">
            <div>
              <p className="font-label-md text-label-md text-outline uppercase tracking-widest mb-4">Workspace</p>
              <nav className="space-y-1">
                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold transition-all">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                  <span className="text-body-md">Overview</span>
                </Link>
                <Link href="/dashboard/posts" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all">
                  <span className="material-symbols-outlined">edit_note</span>
                  <span className="text-body-md">Post Management</span>
                </Link>
                <Link href="/bookmarks" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all">
                  <span className="material-symbols-outlined">bookmarks</span>
                  <span className="text-body-md">Bookmarks</span>
                </Link>
              </nav>
            </div>
            <div>
              <p className="font-label-md text-label-md text-outline uppercase tracking-widest mb-4">Personal</p>
              <nav className="space-y-1">
                <Link href={`/profile/${localUser.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all">
                  <span className="material-symbols-outlined">person</span>
                  <span className="text-body-md">Profile</span>
                </Link>
                {localUser.role === "ADMIN" && (
                  <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all">
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    <span className="text-body-md">Admin Panel</span>
                  </Link>
                )}
                <LogoutLink postLogoutRedirectURL="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-error hover:bg-error-container/20 transition-all cursor-pointer">
                  <span className="material-symbols-outlined">logout</span>
                  <span className="font-body-md">Sign Out</span>
                </LogoutLink>
              </nav>
            </div>
          </div>
          {/* Upgrade Promo */}
          {/* <div className="mt-auto pt-8">
            <div className="bg-primary-fixed text-on-primary-fixed p-4 rounded-2xl">
              <p className="font-label-md text-label-md mb-2">PRO PLAN</p>
              <p className="text-body-md font-bold mb-3">Unlock deeper audience insights</p>
              <button className="w-full bg-primary text-white py-2 rounded-xl text-sm font-bold hover:shadow-md transition-all">
                Upgrade Now
              </button>
            </div>
          </div> */}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 w-full p-4 sm:p-6 md:p-8">
          <DashboardMobileNav userId={localUser.id} isAdmin={localUser.role === "ADMIN"} />
          {/* Header */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-headline-md font-headline-md text-on-surface mb-2">Welcome back, {localUser.name?.split(" ")[0] || "there"}</h1>
              <p className="text-body-md text-on-surface-variant">Here is what&apos;s happening with your insights today.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/create" className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Write New Post
              </Link>
            </div>
          </header>

          {/* Analytics Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-surface-container-lowest glass-card p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-label-md text-label-md text-outline mb-1 uppercase tracking-wider">Total Views</p>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface">{formatNumber(totalViews)}</h3>
                </div>
                <span className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded text-[12px] font-bold">+12%</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest glass-card p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-label-md text-label-md text-outline mb-1 uppercase tracking-wider">Total Reactions</p>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface">{totalReactions.toLocaleString()}</h3>
                </div>
                <span className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded text-[12px] font-bold">+8%</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest glass-card p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-label-md text-label-md text-outline mb-1 uppercase tracking-wider">Followers</p>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface">{followers}</h3>
                </div>
                <span className="bg-primary-fixed text-on-primary-fixed-variant px-2 py-1 rounded text-[12px] font-bold">Active</span>
              </div>
            </div>
          </section>

          {/* Recent Posts Table */}
          <section className="bg-surface-container-lowest glass-card rounded-2xl shadow-sm overflow-hidden border border-outline-variant/30">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-white/40">
              <h2 className="text-headline-sm text-[20px] text-on-surface">Recent Posts</h2>
              <div className="flex items-center gap-4">
                <Link href="/dashboard/create" className="font-label-md text-label-md text-primary hover:underline">Create New</Link>
              </div>
            </div>
            {posts.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">No posts yet. Write your first post!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/30">
                      <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">Post Title</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">Views</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-surface-container-highest overflow-hidden flex-shrink-0 border border-outline-variant/20">
                              {(post.imageUrl || post.categories?.[0]?.category?.imageUrl) ? (
                                <img className="w-full h-full object-cover" alt={post.title} src={post.imageUrl || post.categories?.[0]?.category?.imageUrl || ""} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                  <span className="material-symbols-outlined text-[24px]">image</span>
                                </div>
                              )}
                            </div>
                            <span className="text-body-md font-bold text-on-surface max-w-[120px] xs:max-w-[200px] sm:max-w-[300px] truncate block">{post.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${post.published ? "bg-secondary-container/30 text-on-secondary-container" : "bg-surface-container-highest text-on-surface-variant"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${post.published ? "bg-secondary" : "bg-outline"}`}></span>
                            {post.published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-body-md text-on-surface-variant">{post.viewCount.toLocaleString()}</td>
                        <td className="px-6 py-5 text-body-md text-on-surface-variant">
                          {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(post.createdAt))}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/posts/edit/${post.id}`} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors inline-block" title="Edit">
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </Link>
                            <DeleteButton postId={post.id} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
