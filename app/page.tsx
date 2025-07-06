import BlogPostCard from "@/components/general/BlogPostCard";
import { prisma } from "./utils/db";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";


async function getData() {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return await prisma.blogPost.findMany({
    select: {
      title: true,
      content: true,
      id: true,
      imageUrl: true,
      authorImage: true,
      authorName: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
    }
  });
}


export default async function Home() {

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold text-center mb-4">Latest Posts</h1>
      <Suspense fallback={<Skeleton className="h-[500] w-full mt-10" />}>
        <BlogPosts />
      </Suspense>
    </div>
  );
}


async function BlogPosts() {
  const data = await getData();
  if (!data || data.length === 0) {
    return <p className="text-gray-500">No posts found.</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((post) => (
        <BlogPostCard data={post} key={post.id} />
      ))}
    </div>
  );
}
