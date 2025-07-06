import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "../utils/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import BlogPostCard from "@/components/general/BlogPostCard";

async function getData(userId: string) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return await prisma.blogPost.findMany({
            where: {
                authorId: userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
}

export default async function DashboardRoute() {
    const {getUser} = getKindeServerSession();
    const user = await getUser();

    const data = await getData(user?.id as string);
    return (
        <>
            <div className="max-w-2xl mx-auto mt-10">
                <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
                <p className="text-gray-600">This is your dashboard where you can manage your account.</p>
                <Link href="/dashboard/create" className={buttonVariants({ variant: "secondary" })}>
                    create post
                </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.length > 0 ? (
                    data.map((post) => (
                        <BlogPostCard data={post} key={post.id}/>
                    ))
                ) : (
                    <p className="text-gray-500">No posts found.</p>
                )}
            </div>
        </>
    );
}