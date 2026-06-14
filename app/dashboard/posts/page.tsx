import Link from "next/link";
import { prisma } from "@/app/utils/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { syncKindeUser } from "@/lib/auth/sync-user";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { DeleteButton } from "@/components/general/DeleteButton";

export const dynamic = "force-dynamic";

export default async function DashboardPostsPage() {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  const kindeId = kindeUser?.id;

  if (!kindeId) {
    return (
      <div className="pt-24 text-center text-on-surface-variant">Please sign in to view your posts.</div>
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
      <div className="pt-24 text-center text-on-surface-variant">Please sync your profile first.</div>
    );
  }

  const posts = await prisma.blogPost.findMany({
    where: { authorId: localUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { comments: true, likes: true } },
      categories: { include: { category: true } },
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface-bright/50">
      <div className="flex flex-1 max-w-container-max mx-auto w-full">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 border-r border-outline-variant/20 p-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="space-y-8">
            <div>
              <p className="font-label-md text-label-md text-outline uppercase tracking-widest mb-4">Workspace</p>
              <nav className="space-y-1">
                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all">
                  <span className="material-symbols-outlined">dashboard</span>
                  <span className="text-body-md">Overview</span>
                </Link>
                <Link href="/dashboard/posts" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold transition-all">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
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
          <div className="mt-auto pt-8">
            <div className="bg-primary-fixed text-on-primary-fixed p-4 rounded-2xl">
              <p className="font-label-md text-label-md mb-2">PRO PLAN</p>
              <p className="text-body-md font-bold mb-3">Unlock deeper audience insights</p>
              <button className="w-full bg-primary text-white py-2 rounded-xl text-sm font-bold hover:shadow-md transition-all">Upgrade Now</button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-headline-md font-headline-md text-on-surface mb-2">Post Management</h1>
              <p className="text-body-md text-on-surface-variant">Manage your published articles and drafts.</p>
            </div>
            <Link href="/dashboard/create" className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Write New Post
            </Link>
          </header>

          {posts.length === 0 ? (
            <div className="py-32 flex flex-col items-center text-center">
              <div className="w-64 h-64 mb-8 bg-surface-container rounded-full flex items-center justify-center relative overflow-hidden">
                <span className="material-symbols-outlined text-[80px] text-primary/40">edit_note</span>
              </div>
              <h2 className="text-headline-md font-headline-md text-on-surface mb-2">No posts yet</h2>
              <p className="text-on-surface-variant max-w-md text-body-md font-body-md mb-8">
                You haven&apos;t created any posts yet. Start writing and share your insights with the world.
              </p>
              <Link href="/dashboard/create" className="bg-primary text-on-primary font-label-md px-8 py-3 rounded-full shadow-md hover:opacity-90 transition-all active:scale-95">
                Write Your First Post
              </Link>
            </div>
          ) : (
            <section className="glass-card rounded-2xl shadow-sm overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-white/40 dark:bg-surface-container-lowest/40">
                <h2 className="text-headline-sm text-[20px] text-on-surface">All Posts</h2>
                <Link href="/dashboard/create" className="font-label-md text-label-md text-primary hover:underline">Create New</Link>
              </div>
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
                              {post.imageUrl ? (
                                <img className="w-full h-full object-cover" alt={post.title} src={post.imageUrl} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                  <span className="material-symbols-outlined text-[24px]">image</span>
                                </div>
                              )}
                            </div>
                            <Link href={`/post/${post.slug}`} className="text-body-md font-bold text-on-surface max-w-[300px] truncate block hover:text-primary transition-colors">
                              {post.title}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${post.published ? "bg-secondary-container/30 text-on-secondary-container" : "bg-surface-container-highest text-on-surface-variant"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${post.published ? "bg-secondary" : "bg-outline"}`}></span>
                            {post.published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-body-md text-on-surface-variant">{post.viewCount.toLocaleString()}</td>
                        <td className="px-6 py-5 text-body-md text-on-surface-variant whitespace-nowrap">
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
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
