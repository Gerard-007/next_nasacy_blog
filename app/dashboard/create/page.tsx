import { prisma } from "@/app/utils/db";
import BlogEditor from "@/components/editor/BlogEditor";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const dynamic = "force-dynamic";

export default async function CreateBlogRoute() {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  
  let isAdmin = false;
  if (kindeUser?.id) {
    const user = await prisma.user.findUnique({
      where: { kindeId: kindeUser.id },
      select: { role: true },
    });
    isAdmin = user?.role === "ADMIN";
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="pt-24 pb-32 min-h-screen">
      <div className="max-w-container-max mx-auto px-gutter">
        <BlogEditor categories={categories} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
