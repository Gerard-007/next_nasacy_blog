import { prisma } from "@/app/utils/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { syncKindeUser } from "@/lib/auth/sync-user";
import Link from "next/link";
import Image from "next/image";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  const kindeId = kindeUser?.id;

  if (!kindeId) {
    return (
      <div className="pt-24 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-[80px] text-primary/40">bookmark_border</span>
        <h2 className="text-headline-md font-headline-md text-on-surface mt-4 mb-2">No bookmarks yet</h2>
        <p className="text-on-surface-variant mb-8">Sign in to save articles for later.</p>
        <Link href="/" className="bg-primary text-on-primary font-label-md px-8 py-3 rounded-full shadow-md hover:opacity-90 transition-all">Start Discovering</Link>
      </div>
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
    return <div className="pt-24 text-center text-on-surface-variant">Please sync your profile first.</div>;
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: localUser.id },
    include: {
      post: {
        include: {
          author: { select: { id: true, name: true, imageUrl: true } },
          categories: { include: { category: true } },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
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
                <Link href="/dashboard/posts" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all">
                  <span className="material-symbols-outlined">edit_note</span>
                  <span className="text-body-md">Post Management</span>
                </Link>
                <Link href="/bookmarks" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold transition-all">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bookmarks</span>
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
          <header className="mb-10">
            <h1 className="text-headline-md font-headline-md text-on-surface mb-2">Curated Bookmarks</h1>
            <p className="text-body-md text-on-surface-variant">Your personally saved insights and articles.</p>
          </header>

          {bookmarks.length === 0 ? (
            <div className="py-24 flex flex-col items-center text-center">
              <div className="w-48 h-48 mb-6 bg-surface-container rounded-full flex items-center justify-center relative overflow-hidden">
                <span className="material-symbols-outlined text-[64px] text-primary/40">bookmark_border</span>
              </div>
              <h2 className="text-headline-sm font-headline-sm text-on-surface mb-2">No bookmarks yet</h2>
              <p className="text-on-surface-variant max-w-sm text-body-md font-body-md mb-6">
                Save articles while browsing to read them later.
              </p>
              <Link href="/" className="bg-primary text-on-primary font-label-md px-6 py-2.5 rounded-xl shadow-md hover:opacity-90 transition-all">
                Discover Articles
              </Link>
            </div>
          ) : (
            <section className="glass-card rounded-2xl shadow-sm overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-white/40 dark:bg-surface-container-lowest/40">
                <h2 className="text-headline-sm text-[20px] text-on-surface">Saved Articles ({bookmarks.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/30">
                      <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">Article Title</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">Author</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">Likes</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">Date Saved</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {bookmarks.map((bookmark) => {
                      const post = bookmark.post;
                      return (
                        <tr key={bookmark.id} className="hover:bg-surface-container-low/50 transition-colors">
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
                          <td className="px-6 py-5 text-body-md text-on-surface-variant">
                            {post.author?.name ?? "Unknown"}
                          </td>
                          <td className="px-6 py-5 text-body-md text-on-surface-variant">
                            {post._count?.likes ?? 0}
                          </td>
                          <td className="px-6 py-5 text-body-md text-on-surface-variant whitespace-nowrap">
                            {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(bookmark.createdAt))}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Link
                              href={`/post/${post.slug}`}
                              className="px-4 py-2 text-xs rounded-xl bg-primary-container text-on-primary-container font-bold hover:opacity-90 transition-all inline-block"
                            >
                              Read
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
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
