import Image from "next/image";
import Link from "next/link";

interface BlogPost {
    data: {
        id: string;
        title: string;
        content: string;
        imageUrl: string | null;
        authorId: string | null;
        authorImage: string | null;
        authorName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }
}

export default function BlogPostCard({ data }: BlogPost) {
    return (
        <div className="border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center mb-4">
                <Link href={`/post/${data.id}`} className="text-blue-500 hover:underline">
                    <div className="w-full h-48 relative overflow-hidden">

                        <Image
                            src={data.imageUrl ?? "/placeholder.png"}
                            alt={data.title}
                            width={800}
                            height={400}
                            className="w-full h-auto rounded mb-4"
                        />
                    </div>
                </Link>
                <h2 className="text-xl font-semibold">{data.title}</h2>
                <p className="text-gray-600 mt-2 line-clamp-2">{data.content}</p>
                <div className="mt-4">
                    <Link href={`/post/${data.id}`} className="text-blue-500 hover:underline">Read more</Link>
                </div>
            </div>
            <div className="flex items-center mt-2 p-4">
                <Image
                    src={data.authorImage ?? "/placeholder.png"}
                    alt={data.authorName ?? "Author"}
                    width={40}
                    height={40}
                    className="rounded-full mr-2"
                />
                <div>
                    <p className="text-sm font-medium">{data.authorName ?? "Unknown Author"}</p>
                    {/* <p className="text-xs text-gray-500">{new Date(data.createdAt).toLocaleDateString()}</p> */}
                    <p className="text-xs text-gray-500">{new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    }).format((data.createdAt)) }</p>
                </div>
            </div>
        </div>
    );
}