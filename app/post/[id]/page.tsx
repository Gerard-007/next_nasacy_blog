import { prisma } from "@/app/utils/db";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

async function getData(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return await prisma.blogPost.findUnique({
        where: {
            id: id
        }
    });
}

type Params = Promise<{ id: string }>;

export default async function PostDetail({ params }: { params: Params }) {
    const {id} = await params;
    const data = await getData(id);

    if (!data) {
        return notFound();
    }
    return (
    <div className="max-w-3xl mx-auto py-8 px-4">
        <Link className={buttonVariants({ variant: "secondary" })} href={"/"}>
            Back to posts
        </Link>
        <div className="mb-8 mt-6">
            <h1 className="text-3xl font-bold tracking-tight mb-4">{data.title}</h1>
            {/* <Image src={data.imageUrl ?? "/placeholder.png"} alt={data.title} className="w-full h-auto mb-4" /> */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <div className="relative size-10 overflow-hidden rounded-full">
                        <Image className="object-cover" fill src={data.authorImage || ""} alt={data.authorName || ""}/>

                    </div>
                    <p className="font-medium">{data.authorName}</p>
                </div>
                <p className="text-sm text-gray-50">
                {new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }).format(data.createdAt)}
                </p>
            </div>
        </div>

        <div className="relative h-[400px] w-full mb-8 overflow-hidden rounded-lg">
            <Image src={data.imageUrl || ""} alt={data.title || ""} fill className="object-cover" priority/>
        </div>

        <Card>
            <CardContent>
                <p className="text-gray-700">{data.content}</p>
            </CardContent>
        </Card>
    </div>
    );
}