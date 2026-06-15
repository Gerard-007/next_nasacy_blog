"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "./utils/db"
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getUserId(): Promise<string | null> {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  if (!kindeUser?.id) return null;

  let user = await prisma.user.findUnique({ where: { kindeId: kindeUser.id } });
  if (user) return user.id;

  const { syncKindeUser } = await import("@/lib/auth/sync-user");
  const synced = await syncKindeUser({
    sub: kindeUser.id,
    email: kindeUser.email ?? undefined,
    name: kindeUser.given_name ? `${kindeUser.given_name} ${kindeUser.family_name ?? ''}`.trim() : undefined,
    given_name: kindeUser.given_name ?? undefined,
    picture: kindeUser.picture ?? undefined,
  });

  return synced?.id ?? null;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 200)
    || "post";
}

async function createPost(formData: FormData, published: boolean) {
  const userId = await getUserId();
  if (!userId) redirect("/api/auth/register");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!title || !content) {
    throw new Error("Title and content are required.");
  }

  const baseSlug = generateSlug(title);

  const existing = await prisma.blogPost.findMany({
    where: { slug: { startsWith: baseSlug } },
    select: { slug: true },
  });

  let slug = baseSlug;
  if (existing.some((p) => p.slug === slug)) {
    const existingSlugs = new Set(existing.map((p) => p.slug));
    let counter = 1;
    while (existingSlugs.has(`${baseSlug}-${counter}`)) counter++;
    slug = `${baseSlug}-${counter}`;
  }

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      content,
      imageUrl: imageUrl || null,
      published,
      authorId: userId,
      categories: categoryId ? {
        create: { categoryId },
      } : undefined,
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/posts");

  return post;
}

async function getOwnedPost(postId: string) {
  const userId = await getUserId();
  if (!userId) redirect("/api/auth/register");

  const post = await prisma.blogPost.findFirst({
    where: { id: postId, authorId: userId },
    select: { id: true, slug: true },
  });

  if (!post) {
    throw new Error("Post not found or you do not have permission to edit it.");
  }

  return post;
}

export async function publishPost(formData: FormData) {
  const post = await createPost(formData, true);
  redirect(`/post/${post.slug}`);
}

export async function saveDraft(formData: FormData) {
  await createPost(formData, false);
  redirect("/dashboard/posts");
}

export async function updatePost(postId: string, formData: FormData) {
  const existingPost = await getOwnedPost(postId);

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const categoryId = formData.get("categoryId") as string;
  const published = formData.get("published") === "true";

  if (!title || !content) {
    throw new Error("Title and content are required.");
  }

  await prisma.$transaction([
    prisma.postCategory.deleteMany({ where: { postId } }),
    prisma.blogPost.update({
      where: { id: postId },
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        published,
        categories: categoryId
          ? {
              create: { categoryId },
            }
          : undefined,
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/posts");
  revalidatePath(`/post/${existingPost.slug}`);
  redirect("/dashboard/posts");
}

export async function deletePost(postId: string) {
  await getOwnedPost(postId);

  await prisma.$transaction(async (tx) => {
    const comments = await tx.comment.findMany({
      where: { postId },
      select: { id: true },
    });
    const commentIds = comments.map((comment) => comment.id);

    if (commentIds.length > 0) {
      await tx.report.deleteMany({ where: { commentId: { in: commentIds } } });
      await tx.comment.deleteMany({ where: { parentId: { in: commentIds } } });
      await tx.comment.deleteMany({ where: { id: { in: commentIds } } });
    }

    await tx.report.deleteMany({ where: { postId } });
    await tx.like.deleteMany({ where: { postId } });
    await tx.bookmark.deleteMany({ where: { postId } });
    await tx.postCategory.deleteMany({ where: { postId } });
    await tx.blogPost.delete({ where: { id: postId } });
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/posts");
}

async function verifyAdmin() {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}

export async function toggleUserRole(targetUserId: string) {
  const admin = await verifyAdmin();
  if (admin.id === targetUserId) {
    throw new Error("You cannot change your own role.");
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) throw new Error("User not found");

  const newRole = targetUser.role === "ADMIN" ? "USER" : "ADMIN";
  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  revalidatePath("/admin");
}

export async function deleteUser(targetUserId: string) {
  const adminUser = await verifyAdmin();
  if (adminUser.id === targetUserId) {
    throw new Error("You cannot delete yourself.");
  }

  await prisma.$transaction(async (tx) => {
    const posts = await tx.blogPost.findMany({
      where: { authorId: targetUserId },
      select: { id: true },
    });
    const postIds = posts.map((p) => p.id);

    const commentsOnUserPosts = await tx.comment.findMany({
      where: { postId: { in: postIds } },
      select: { id: true },
    });
    const commentsOnUserPostsIds = commentsOnUserPosts.map((c) => c.id);

    if (commentsOnUserPostsIds.length > 0) {
      await tx.report.deleteMany({ where: { commentId: { in: commentsOnUserPostsIds } } });
      await tx.comment.deleteMany({ where: { parentId: { in: commentsOnUserPostsIds } } });
      await tx.comment.deleteMany({ where: { id: { in: commentsOnUserPostsIds } } });
    }

    if (postIds.length > 0) {
      await tx.report.deleteMany({ where: { postId: { in: postIds } } });
      await tx.like.deleteMany({ where: { postId: { in: postIds } } });
      await tx.bookmark.deleteMany({ where: { postId: { in: postIds } } });
      await tx.postCategory.deleteMany({ where: { postId: { in: postIds } } });
      await tx.blogPost.deleteMany({ where: { authorId: targetUserId } });
    }

    await tx.report.deleteMany({ where: { reporterId: targetUserId } });
    await tx.report.deleteMany({ where: { comment: { authorId: targetUserId } } });
    await tx.comment.deleteMany({ where: { authorId: targetUserId } });
    await tx.like.deleteMany({ where: { userId: targetUserId } });
    await tx.bookmark.deleteMany({ where: { userId: targetUserId } });
    
    await tx.user.delete({ where: { id: targetUserId } });
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function togglePostPublished(postId: string) {
  await verifyAdmin();
  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");

  await prisma.blogPost.update({
    where: { id: postId },
    data: { published: !post.published },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/post/${post.slug}`);
}

export async function togglePostFeatured(postId: string) {
  await verifyAdmin();
  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");

  await prisma.blogPost.update({
    where: { id: postId },
    data: { featured: !post.featured },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/post/${post.slug}`);
}

export async function resolveReport(reportId: string) {
  await verifyAdmin();
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new Error("Report not found");

  await prisma.report.update({
    where: { id: reportId },
    data: { resolved: !report.resolved },
  });

  revalidatePath("/admin");
}

export async function adminDeletePost(postId: string) {
  await verifyAdmin();

  await prisma.$transaction(async (tx) => {
    const comments = await tx.comment.findMany({
      where: { postId },
      select: { id: true },
    });
    const commentIds = comments.map((comment) => comment.id);

    if (commentIds.length > 0) {
      await tx.report.deleteMany({ where: { commentId: { in: commentIds } } });
      await tx.comment.deleteMany({ where: { parentId: { in: commentIds } } });
      await tx.comment.deleteMany({ where: { id: { in: commentIds } } });
    }

    await tx.report.deleteMany({ where: { postId } });
    await tx.like.deleteMany({ where: { postId } });
    await tx.bookmark.deleteMany({ where: { postId } });
    await tx.postCategory.deleteMany({ where: { postId } });
    await tx.blogPost.delete({ where: { id: postId } });
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/posts");
  revalidatePath("/admin");
}

export async function adminDeleteComment(commentId: string) {
  await verifyAdmin();
  await prisma.$transaction(async (tx) => {
    await tx.report.deleteMany({ where: { commentId } });
    await tx.comment.deleteMany({ where: { parentId: commentId } });
    await tx.comment.delete({ where: { id: commentId } });
  });
  revalidatePath("/admin");
}

export async function createCategoryAction(name: string) {
  const admin = await verifyAdmin();
  if (!admin) throw new Error("Unauthorized");

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const existing = await prisma.category.findUnique({
    where: { slug }
  });
  if (existing) {
    throw new Error("Category already exists");
  }

  const cat = await prisma.category.create({
    data: { name, slug }
  });

  revalidatePath("/dashboard/create");
  return cat;
}

export async function updateUserProfileAction(userId: string, formData: FormData) {
  const currentUserId = await getUserId();
  if (!currentUserId || currentUserId !== userId) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const bannerUrl = formData.get("bannerUrl") as string;
  const gender = formData.get("gender") as string;
  const aboutMe = formData.get("aboutMe") as string;

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || undefined,
      imageUrl: imageUrl || null,
      bannerUrl: bannerUrl || null,
      gender: gender || null,
      aboutMe: aboutMe || null,
    },
  });

  revalidatePath(`/profile/${userId}`);
  revalidatePath("/");
}

export async function pruneUnusedFiles() {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  if (!kindeUser?.id) throw new Error("Unauthorized");
  
  const user = await prisma.user.findUnique({ where: { kindeId: kindeUser.id } });
  if (user?.role !== "ADMIN") throw new Error("Unauthorized");
  
  await new Promise(resolve => setTimeout(resolve, 1500));
}

export async function purgeCache() {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  if (!kindeUser?.id) throw new Error("Unauthorized");
  
  const user = await prisma.user.findUnique({ where: { kindeId: kindeUser.id } });
  if (user?.role !== "ADMIN") throw new Error("Unauthorized");
  
  revalidatePath("/");
  revalidatePath("/dashboard");
  await new Promise(resolve => setTimeout(resolve, 1000));
}

