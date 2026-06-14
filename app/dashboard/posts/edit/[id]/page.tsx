import { prisma } from "@/app/utils/db";
import BlogEditor from "@/components/editor/BlogEditor";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditBlogRouteProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogRoute({ params }: EditBlogRouteProps) {
  const { id } = await params;
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  if (!kindeUser?.id) {
    redirect("/api/auth/register");
  }

  const user = await prisma.user.findUnique({
    where: { kindeId: kindeUser.id },
  });

  if (!user) {
    redirect("/api/auth/register");
  }

  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      categories: {
        select: {
          categoryId: true,
        },
      },
    },
  });

  if (!post || post.authorId !== user.id) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="pt-24 pb-32 min-h-screen">
      <div className="max-w-container-max mx-auto px-gutter">
        <BlogEditor categories={categories} post={post} isAdmin={user.role === "ADMIN"} />
      </div>
    </div>
  );
}
