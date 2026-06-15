import { prisma } from "@/app/utils/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  toggleUserRole,
  deleteUser,
  togglePostPublished,
  togglePostFeatured,
  resolveReport,
  adminDeletePost,
  adminDeleteComment,
  pruneUnusedFiles,
  purgeCache,
} from "@/app/actions";
import AdminActionButton from "@/components/admin/AdminActionButton";
import { DashboardMobileNav } from "@/components/general/DashboardMobileNav";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { getUser } = getKindeServerSession();
  const currentUser = await getUser();
  const kindeId = currentUser?.id;
  const user = kindeId ? await prisma.user.findUnique({ where: { kindeId } }) : null;

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="pt-24 flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-12 bg-error-container/10 rounded-2xl border border-error/20 max-w-md">
          <span className="material-symbols-outlined text-error text-5xl">gpp_bad</span>
          <h2 className="text-headline-md font-headline-md text-on-surface mt-4 mb-2">Access Denied</h2>
          <p className="text-on-surface-variant">You do not have permission to access this area.</p>
          <Link
            href="/"
            className="mt-6 inline-block bg-primary text-on-primary px-6 py-2.5 rounded-xl text-body-md font-bold hover:shadow-md transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { tab = "overview" } = await searchParams;

  // Global stats for dashboard
  const [totalUsers, totalPosts, totalComments, totalCategories, totalViews, pendingPosts, reportedCount, activeWriters] = await Promise.all([
    prisma.user.count(),
    prisma.blogPost.count(),
    prisma.comment.count(),
    prisma.category.count(),
    prisma.blogPost.aggregate({ _sum: { viewCount: true } }).then((res) => res._sum.viewCount ?? 0),
    prisma.blogPost.count({ where: { published: false } }),
    prisma.report.count({ where: { resolved: false } }),
    prisma.user.count({ where: { posts: { some: { published: true } } } }),
  ]);

  // Tab-specific data fetching
  let usersList: any[] = [];
  let postsList: any[] = [];
  let reportsList: any[] = [];

  if (tab === "overview") {
    usersList = await prisma.user.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    });
    postsList = await prisma.blogPost.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } }, reports: true },
    });
    reportsList = await prisma.report.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { reporter: { select: { name: true } } },
    });
  } else if (tab === "users") {
    usersList = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  } else if (tab === "posts") {
    postsList = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, imageUrl: true } },
        categories: { include: { category: true } },
        _count: { select: { reports: true } },
      },
    });
  } else if (tab === "reports") {
    reportsList = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { name: true, email: true } },
        post: { select: { title: true, id: true } },
        comment: { select: { content: true, id: true } },
      },
    });
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-outline-variant/30 flex-shrink-0 flex-col bg-surface-container-lowest z-30">
        <div className="h-16 flex items-center px-6 mb-4">
          <span className="text-headline-sm font-headline-sm font-bold text-primary tracking-tight">Nasacy Admin</span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link
            href="/admin?tab=overview"
            className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
              tab === "overview"
                ? "bg-primary-container text-on-primary-container rounded-xl"
                : "text-on-surface-variant hover:bg-surface-container-high rounded-xl"
            }`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Overview</span>
          </Link>
          <Link
            href="/admin?tab=users"
            className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
              tab === "users"
                ? "bg-primary-container text-on-primary-container rounded-xl"
                : "text-on-surface-variant hover:bg-surface-container-high rounded-xl"
            }`}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-md text-label-md">User Management</span>
          </Link>
          <Link
            href="/admin?tab=posts"
            className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
              tab === "posts"
                ? "bg-primary-container text-on-primary-container rounded-xl"
                : "text-on-surface-variant hover:bg-surface-container-high rounded-xl"
            }`}
          >
            <span className="material-symbols-outlined">edit_note</span>
            <span className="font-label-md text-label-md">Post Moderation</span>
          </Link>
          <Link
            href="/admin?tab=reports"
            className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
              tab === "reports"
                ? "bg-primary-container text-on-primary-container rounded-xl"
                : "text-on-surface-variant hover:bg-surface-container-high rounded-xl"
            }`}
          >
            <span className="material-symbols-outlined">report</span>
            <span className="font-label-md text-label-md">Reports</span>
          </Link>
          {/* <Link
            href="/admin?tab=settings"
            className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
              tab === "settings"
                ? "bg-primary-container text-on-primary-container rounded-xl"
                : "text-on-surface-variant hover:bg-surface-container-high rounded-xl"
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">System Settings</span>
          </Link> */}

          <div className="h-px bg-outline-variant/20 dark:bg-outline-variant/10 my-4" />

          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all duration-200"
          >
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-md text-label-md">Back to Blog</span>
          </Link>
          <LogoutLink
            postLogoutRedirectURL="/"
            className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Sign Out</span>
          </LogoutLink>
        </nav>

        <div className="p-4 border-t border-outline-variant/20">
          <div className="flex items-center gap-3 p-2 bg-surface-container rounded-xl">
            {user.imageUrl ? (
              <Image src={user.imageUrl} alt={user.name ?? ""} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-caption">
                {getInitials(user.name)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface truncate max-w-[140px]">{user.name ?? "Admin"}</span>
              <span className="font-caption text-[11px] text-outline">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardMobileNav userId={user.id} isAdmin={true} />
        {/* Top App Bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 md:px-8 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-20">
          <h1 className="text-[16px] sm:text-headline-sm font-headline-sm font-bold text-on-surface capitalize">
            {tab === "overview" ? "Dashboard" : tab.replace("-", " ")}
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-body-md font-body-md w-48 lg:w-64 focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Global search..."
                type="text"
              />
            </div>
            <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              {reportedCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
              )}
            </button>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 md:p-8 space-y-6 md:space-y-gutter pb-16">
          {/* Quick Stats Section */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col gap-2">
              <span className="font-label-md text-label-md text-outline">Total Users</span>
              <div className="flex items-end justify-between">
                <span className="text-headline-md font-headline-md text-on-surface">{totalUsers}</span>
                <span className="text-secondary font-label-md text-label-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span> +12%
                </span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col gap-2">
              <span className="font-label-md text-label-md text-outline">Active Writers</span>
              <div className="flex items-end justify-between">
                <span className="text-headline-md font-headline-md text-on-surface">{activeWriters}</span>
                <span className="text-secondary font-label-md text-label-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span> +5%
                </span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col gap-2">
              <span className="font-label-md text-label-md text-outline">Pending Posts</span>
              <div className="flex items-end justify-between">
                <span className="text-headline-md font-headline-md text-on-surface">{pendingPosts}</span>
                <span className="text-tertiary font-label-md text-label-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">hourglass_empty</span> {pendingPosts} draft
                </span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col gap-2">
              <span className="font-label-md text-label-md text-outline">Unresolved Reports</span>
              <div className="flex items-end justify-between">
                <span className="text-headline-md font-headline-md text-on-surface">{reportedCount}</span>
                <span className={`${reportedCount > 0 ? "text-error" : "text-secondary"} font-label-md text-label-md flex items-center gap-1`}>
                  <span className="material-symbols-outlined text-[18px]">{reportedCount > 0 ? "warning" : "check_circle"}</span>
                  {reportedCount > 0 ? "Action Needed" : "Clean"}
                </span>
              </div>
            </div>
          </section>

          {/* Tab Content Rendering */}

          {/* OVERVIEW TAB */}
          {tab === "overview" && (
            <div className="space-y-gutter">
              {/* Post Moderation Table Preview */}
              <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                  <h2 className="text-headline-sm font-headline-sm text-on-surface">Recent Posts</h2>
                  <Link href="/admin?tab=posts" className="text-primary font-label-md text-label-md hover:underline">
                    Manage Posts
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low">
                        <th className="px-6 py-3 font-label-md text-label-md text-outline">Post Title</th>
                        <th className="px-6 py-3 font-label-md text-label-md text-outline">Author</th>
                        <th className="px-6 py-3 font-label-md text-label-md text-outline">Date</th>
                        <th className="px-6 py-3 font-label-md text-label-md text-outline">Status</th>
                        <th className="px-6 py-3 font-label-md text-label-md text-outline text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {postsList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant/60 text-body-md">
                            No posts found.
                          </td>
                        </tr>
                      ) : (
                        postsList.map((postItem) => (
                          <tr key={postItem.id} className="hover:bg-surface-container-low transition-colors group">
                            <td className="px-6 py-4 font-label-md text-label-md text-on-surface">
                              <div className="flex items-center gap-3">
                                {postItem.imageUrl && (
                                  <div className="relative w-12 h-8 rounded overflow-hidden flex-shrink-0 bg-surface-container-highest">
                                    <Image src={postItem.imageUrl} alt={postItem.title} fill className="object-cover" />
                                  </div>
                                )}
                                <span className="truncate max-w-[280px]">{postItem.title}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-body-md text-on-surface-variant">{postItem.author?.name ?? "Unknown"}</td>
                            <td className="px-6 py-4 font-caption text-caption text-outline">
                              {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
                                new Date(postItem.createdAt)
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {postItem.published ? (
                                <span className="px-2.5 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-[10px] uppercase tracking-wider">
                                  Published
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full font-label-md text-[10px] uppercase tracking-wider">
                                  Draft
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <AdminActionButton
                                  action={async () => {
                                    "use server";
                                    await togglePostPublished(postItem.id);
                                  }}
                                  className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-high transition-all"
                                  confirmMessage={`Are you sure you want to ${
                                    postItem.published ? "unpublish" : "publish"
                                  } "${postItem.title}"?`}
                                >
                                  <span className="material-symbols-outlined text-[20px]">
                                    {postItem.published ? "visibility_off" : "visibility"}
                                  </span>
                                </AdminActionButton>
                                <AdminActionButton
                                  action={async () => {
                                    "use server";
                                    await adminDeletePost(postItem.id);
                                  }}
                                  className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-all"
                                  confirmMessage={`Are you sure you want to delete the post "${postItem.title}"? This cannot be undone.`}
                                >
                                  <span className="material-symbols-outlined text-[20px]">delete</span>
                                </AdminActionButton>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* User list + Recent Reports grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
                {/* User List Preview */}
                <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm">
                  <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">Recent Users</h2>
                    <Link href="/admin?tab=users" className="text-primary font-label-md text-label-md hover:underline">
                      View All
                    </Link>
                  </div>
                  <div className="p-2 space-y-1">
                    {usersList.map((usr) => (
                      <div
                        key={usr.id}
                        className="flex items-center justify-between p-4 hover:bg-surface-container-low rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {usr.imageUrl ? (
                            <Image src={usr.imageUrl} alt={usr.name ?? ""} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">
                              {getInitials(usr.name)}
                            </div>
                          )}
                          <div>
                            <span className="font-label-md text-label-md text-on-surface block">{usr.name ?? "User"}</span>
                            <span className="font-caption text-caption text-outline block">{usr.email}</span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full font-label-md text-[11px] ${
                            usr.role === "ADMIN"
                              ? "bg-primary-fixed text-on-primary-fixed-variant"
                              : "bg-secondary-fixed text-on-secondary-fixed-variant"
                          }`}
                        >
                          {usr.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Recent Reports Preview */}
                <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm flex flex-col">
                  <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">Recent Reports</h2>
                    <Link href="/admin?tab=reports" className="text-primary font-label-md text-label-md hover:underline">
                      Manage Reports
                    </Link>
                  </div>
                  <div className="p-6 flex-1 space-y-4">
                    {reportsList.length === 0 ? (
                      <div className="text-center text-on-surface-variant/60 text-body-md py-8">No reports logged.</div>
                    ) : (
                      reportsList.map((rep) => (
                        <div
                          key={rep.id}
                          className={`flex gap-4 p-4 border-l-4 rounded-r-lg ${
                            rep.resolved
                              ? "border-secondary bg-secondary-container/10"
                              : "border-error bg-error-container/10"
                          }`}
                        >
                          <span className={`material-symbols-outlined ${rep.resolved ? "text-secondary" : "text-error"}`}>
                            {rep.resolved ? "check_circle" : "error_outline"}
                          </span>
                          <div>
                            <span className="font-label-md text-label-md text-on-surface block truncate max-w-[280px]">
                              {rep.reason}
                            </span>
                            <span className="font-caption text-caption text-outline block">
                              Reported by {rep.reporter?.name ?? "Anonymous"} •{" "}
                              {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(rep.createdAt))}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>

              {/* System Information Section */}
              <section className="p-gutter bg-surface-container-high rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-gutter">
                  <div className="space-y-2">
                    <h3 className="font-label-md text-label-md uppercase tracking-widest text-outline">System Status</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-secondary rounded-full animate-pulse"></span>
                      <span className="font-headline-sm text-headline-sm text-on-surface">All Nodes Operational</span>
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant">
                      Uptime is at 99.9% for the current billing period. Active Node: server-prod-01.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-label-md text-label-md uppercase tracking-widest text-outline">Storage Capacity</h3>
                    <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "72%" }}></div>
                    </div>
                    <div className="flex justify-between font-label-md text-label-md text-on-surface">
                      <span>1.4 TB of 2.0 TB used</span>
                      <span>72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <Link
                      href="/admin?tab=settings"
                      className="flex items-center gap-2 px-6 py-3 bg-on-surface text-surface rounded-xl font-label-md text-label-md hover:bg-primary transition-all active:scale-95 shadow-lg"
                    >
                      <span className="material-symbols-outlined">terminal</span>
                      Open Settings
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* USER MANAGEMENT TAB */}
          {tab === "users" && (
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                <h2 className="text-headline-sm font-headline-sm text-on-surface font-bold">User Database ({usersList.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="px-6 py-3 font-label-md text-label-md text-outline">User Details</th>
                      <th className="px-6 py-3 font-label-md text-label-md text-outline">Role</th>
                      <th className="px-6 py-3 font-label-md text-label-md text-outline">Joined Date</th>
                      <th className="px-6 py-3 font-label-md text-label-md text-outline text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {usr.imageUrl ? (
                              <Image src={usr.imageUrl} alt={usr.name ?? ""} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">
                                {getInitials(usr.name)}
                              </div>
                            )}
                            <div>
                              <span className="font-label-md text-label-md text-on-surface block">{usr.name ?? "User"}</span>
                              <span className="font-caption text-caption text-outline block">{usr.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full font-label-md text-[11px] ${
                              usr.role === "ADMIN"
                                ? "bg-primary-fixed text-on-primary-fixed-variant"
                                : "bg-secondary-fixed text-on-secondary-fixed-variant"
                            }`}
                          >
                            {usr.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-caption text-caption text-outline">
                          {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
                            new Date(usr.createdAt)
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {usr.id !== user.id ? (
                            <div className="flex justify-end gap-2">
                              <AdminActionButton
                                action={async () => {
                                  "use server";
                                  await toggleUserRole(usr.id);
                                }}
                                className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-high transition-all"
                                confirmMessage={`Are you sure you want to change the role of "${usr.name ?? usr.email}" to ${
                                  usr.role === "ADMIN" ? "USER" : "ADMIN"
                                }?`}
                              >
                                <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                              </AdminActionButton>
                              <AdminActionButton
                                action={async () => {
                                  "use server";
                                  await deleteUser(usr.id);
                                }}
                                className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-all"
                                confirmMessage={`Are you sure you want to delete "${
                                  usr.name ?? usr.email
                                }"? This will permanently delete all their posts and comments. This cannot be undone.`}
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </AdminActionButton>
                            </div>
                          ) : (
                            <span className="text-caption text-outline italic px-2">Current Admin</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* POST MODERATION TAB */}
          {tab === "posts" && (
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/10">
                <h2 className="text-headline-sm font-headline-sm text-on-surface font-bold">Post Catalog ({postsList.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="px-6 py-3 font-label-md text-label-md text-outline">Post</th>
                      <th className="px-6 py-3 font-label-md text-label-md text-outline">Author</th>
                      <th className="px-6 py-3 font-label-md text-label-md text-outline">Status</th>
                      <th className="px-6 py-3 font-label-md text-label-md text-outline">Featured</th>
                      <th className="px-6 py-3 font-label-md text-label-md text-outline">Views</th>
                      <th className="px-6 py-3 font-label-md text-label-md text-outline text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {postsList.map((postItem) => (
                      <tr key={postItem.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {postItem.imageUrl && (
                              <div className="relative w-12 h-8 rounded overflow-hidden flex-shrink-0 bg-surface-container-highest">
                                <Image src={postItem.imageUrl} alt={postItem.title} fill className="object-cover" />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-label-md text-label-md text-on-surface truncate max-w-[280px]">
                                {postItem.title}
                              </span>
                              {postItem.categories?.[0] && (
                                <span className="text-[10px] text-primary uppercase font-bold tracking-wider mt-0.5">
                                  {postItem.categories[0].category.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-body-md text-on-surface-variant">{postItem.author?.name ?? "Unknown"}</td>
                        <td className="px-6 py-4">
                          {postItem.published ? (
                            <span className="px-2.5 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-[10px] uppercase tracking-wider">
                              Published
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full font-label-md text-[10px] uppercase tracking-wider">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              postItem.featured
                                ? "bg-primary-container text-on-primary-container"
                                : "bg-surface-container-highest text-on-surface-variant/55"
                            }`}
                          >
                            {postItem.featured ? "Featured" : "Standard"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-caption text-caption text-outline">{postItem.viewCount}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <AdminActionButton
                              action={async () => {
                                "use server";
                                await togglePostFeatured(postItem.id);
                              }}
                              className={`p-2 rounded-lg hover:bg-surface-container-high transition-all ${
                                postItem.featured ? "text-primary" : "text-on-surface-variant"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: postItem.featured ? "'FILL' 1" : undefined }}>
                                star
                              </span>
                            </AdminActionButton>
                            <AdminActionButton
                              action={async () => {
                                "use server";
                                await togglePostPublished(postItem.id);
                              }}
                              className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-high transition-all"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {postItem.published ? "visibility_off" : "visibility"}
                              </span>
                            </AdminActionButton>
                            <AdminActionButton
                              action={async () => {
                                "use server";
                                await adminDeletePost(postItem.id);
                              }}
                              className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-all"
                              confirmMessage={`Are you sure you want to delete "${postItem.title}"? This cannot be undone.`}
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </AdminActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* REPORTS TAB */}
          {tab === "reports" && (
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/10">
                <h2 className="text-headline-sm font-headline-sm text-on-surface font-bold">User Infraction Reports ({reportsList.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="px-6 py-3 font-label-md text-label-md text-outline">Reporter</th>
                      <th className="px-6 py-3 font-label-md text-label-md text-outline">Infraction Type</th>
                      <th className="px-6 py-3 font-label-md text-label-md text-outline">Target Content</th>
                      <th className="px-6 py-3 font-label-md text-label-md text-outline">Reason Given</th>
                      <th className="px-6 py-3 font-label-md text-label-md text-outline">Status</th>
                      <th className="px-6 py-3 font-label-md text-label-md text-outline text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {reportsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant/60 text-body-md">
                          No active infraction reports found in database.
                        </td>
                      </tr>
                    ) : (
                      reportsList.map((reportItem) => (
                        <tr key={reportItem.id} className="hover:bg-surface-container-low transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-label-md text-label-md text-on-surface block">
                                {reportItem.reporter?.name ?? "Anonymous"}
                              </span>
                              <span className="font-caption text-[11px] text-outline block">{reportItem.reporter?.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-body-md text-on-surface-variant font-semibold">
                            {reportItem.commentId ? "Comment" : "BlogPost"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="truncate block max-w-[200px] text-body-md text-on-surface">
                              {reportItem.commentId
                                ? reportItem.comment?.content
                                : reportItem.post?.title ?? "Unknown Target"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-body-md text-on-surface-variant max-w-[180px] truncate">
                            {reportItem.reason}
                          </td>
                          <td className="px-6 py-4">
                            {reportItem.resolved ? (
                              <span className="px-2.5 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-[10px] uppercase tracking-wider">
                                Resolved
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-error-container text-on-error-container rounded-full font-label-md text-[10px] uppercase tracking-wider">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <AdminActionButton
                                action={async () => {
                                  "use server";
                                  await resolveReport(reportItem.id);
                                }}
                                className={`p-2 rounded-lg hover:bg-surface-container-high transition-all ${
                                  reportItem.resolved ? "text-secondary" : "text-on-surface-variant"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  {reportItem.resolved ? "check_circle" : "radio_button_unchecked"}
                                </span>
                              </AdminActionButton>
                              {reportItem.commentId ? (
                                <AdminActionButton
                                  action={async () => {
                                    "use server";
                                    await adminDeleteComment(reportItem.commentId!);
                                  }}
                                  className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-all"
                                  confirmMessage="Are you sure you want to delete the reported comment? This will also delete the report."
                                >
                                  <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                                </AdminActionButton>
                              ) : (
                                <AdminActionButton
                                  action={async () => {
                                    "use server";
                                    await adminDeletePost(reportItem.postId!);
                                  }}
                                  className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-all"
                                  confirmMessage="Are you sure you want to delete the reported blog post? This will permanently delete the post and all associated records."
                                >
                                  <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                                </AdminActionButton>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* SYSTEM SETTINGS TAB */}
          {tab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
              {/* Preferences Form */}
              <section className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm space-y-6">
                <h2 className="text-headline-sm font-headline-sm text-on-surface font-bold mb-4">Blog System Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-body-md font-bold text-on-surface-variant mb-2">Blog Name</label>
                    <input
                      type="text"
                      defaultValue="InsightHub"
                      disabled
                      className="w-full bg-surface-container-low border-none rounded-xl p-3 text-body-md text-on-surface outline-none cursor-not-allowed opacity-75"
                    />
                  </div>
                  <div>
                    <label className="block text-body-md font-bold text-on-surface-variant mb-2">System Administrator Email</label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      disabled
                      className="w-full bg-surface-container-low border-none rounded-xl p-3 text-body-md text-on-surface outline-none cursor-not-allowed opacity-75"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-outline-variant/10">
                    <div>
                      <span className="font-label-md text-label-md text-on-surface block">Allow Public Registration</span>
                      <span className="font-caption text-caption text-outline">If disabled, only Kind-synced auth users can write.</span>
                    </div>
                    <span className="font-bold text-secondary">ENABLED</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-outline-variant/10">
                    <div>
                      <span className="font-label-md text-label-md text-on-surface block">Enable Automatic Spam Filter</span>
                      <span className="font-caption text-caption text-outline">Uses content analysis to auto-report comments.</span>
                    </div>
                    <span className="font-bold text-secondary">ACTIVE</span>
                  </div>
                </div>
              </section>

              {/* Maintenance Tools */}
              <section className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface font-bold mb-4">Maintenance Panel</h2>
                  <p className="text-body-md text-on-surface-variant mb-8">
                    Execute global cleanup tasks and service tasks. Use with caution: some operations can cause performance bottlenecks.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface">Prune Unused Files</span>
                        <span className="font-caption text-caption text-outline">Removes orphaned image uploads from Cloudinary.</span>
                      </div>
                      <AdminActionButton
                        action={pruneUnusedFiles}
                        confirmMessage="Are you sure you want to schedule unused file pruning? This may take some time."
                        className="px-4 py-2 bg-on-surface text-surface rounded-lg font-label-md text-label-md hover:bg-primary transition-colors cursor-pointer"
                      >
                        Prune
                      </AdminActionButton>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface">Purge System Cache</span>
                        <span className="font-caption text-caption text-outline">Clears the Next.js App Router cache.</span>
                      </div>
                      <AdminActionButton
                        action={purgeCache}
                        confirmMessage="Are you sure you want to purge the cache?"
                        className="px-4 py-2 bg-on-surface text-surface rounded-lg font-label-md text-label-md hover:bg-primary transition-colors cursor-pointer"
                      >
                        Purge
                      </AdminActionButton>
                    </div>
                  </div>
                </div>
                <div className="pt-8 border-t border-outline-variant/20 mt-8">
                  <div className="bg-error-container/10 p-4 border border-error/20 rounded-xl">
                    <span className="font-label-md text-label-md text-error block mb-1">System Mode</span>
                    <p className="font-caption text-caption text-on-surface-variant mb-3">
                      Put the server into read-only maintenance mode. Users will not be able to publish or edit.
                    </p>
                    <button className="w-full bg-error text-on-error py-2 rounded-lg font-bold hover:shadow-md transition-all">
                      Activate Maintenance Mode
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="h-12 flex items-center justify-between px-4 sm:px-6 md:px-8 border-t border-outline-variant/20 bg-surface-container-lowest text-outline font-caption text-caption">
          <span>© 2026 InsightHub Admin Interface</span>
          <div className="hidden sm:flex gap-4">
            <Link className="hover:text-primary transition-colors" href="#">
              Documentation
            </Link>
            <Link className="hover:text-primary transition-colors" href="#">
              API Keys
            </Link>
            <Link className="hover:text-primary transition-colors" href="#">
              Terms of Service
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
