import Image from "next/image";
import Link from "next/link";

interface BlogPostCardProps {
  data: any;
  featured?: boolean;
}

export default function BlogPostCard({ data, featured = false }: BlogPostCardProps) {
  const excerpt = data.excerpt ?? (data.content ? String(data.content).replace(/<[^>]*>/g, "").slice(0, 120) + "..." : "");
  const readTime = Math.max(1, Math.ceil(String(data.content ?? "").replace(/<[^>]*>/g, "").length / 1000));

  if (featured) {
    return (
      <article className="relative group overflow-hidden rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative aspect-video lg:aspect-auto lg:h-[480px] overflow-hidden">
            <Image
              src={data.imageUrl ?? "/placeholder.png"}
              alt={data.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            {data.categories?.[0] && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full w-fit mb-6">
                <span className="font-label-md text-label-md">{data.categories[0].category.name}</span>
              </div>
            )}
            <h1 className="text-display-lg-mobile md:text-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-6 leading-tight">
              {data.title}
            </h1>
            {excerpt && (
              <p className="text-on-surface-variant text-body-lg font-body-lg mb-8 line-clamp-3">
                {excerpt}
              </p>
            )}
            <div className="flex items-center justify-between mt-auto pt-8 border-t border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden">
                  {data.author?.imageUrl ? (
                    <Image src={data.author.imageUrl} alt={data.author.name ?? "Author"} width={40} height={40} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">
                      {data.author?.name?.charAt(0) || "A"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{data.author?.name ?? "Unknown"}</p>
                  <p className="font-caption text-caption text-on-surface-variant">
                    {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(data.createdAt))} &middot; {readTime} min read
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-on-surface-variant">
                <span className="flex items-center gap-1 font-caption text-caption">
                  <span className="material-symbols-outlined text-[18px]">favorite</span> {data._count?.likes ?? 0}
                </span>
                <span className="flex items-center gap-1 font-caption text-caption">
                  <span className="material-symbols-outlined text-[18px]">chat_bubble</span> {data._count?.comments ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col">
      {data.imageUrl && (
        <Link href={`/post/${data.slug}`}>
          <div className="aspect-video overflow-hidden">
            <Image
              src={data.imageUrl}
              alt={data.title}
              width={640}
              height={360}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </Link>
      )}
      <div className="p-6 flex flex-col flex-grow">
        {data.categories?.[0] && (
          <span className="text-secondary font-label-md text-label-md mb-3">{data.categories[0].category.name}</span>
        )}
        <Link href={`/post/${data.slug}`}>
          <h3 className="text-headline-sm font-headline-sm text-on-surface mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {data.title}
          </h3>
        </Link>
        {excerpt && (
          <p className="text-on-surface-variant font-caption text-caption mb-6 line-clamp-2">{excerpt}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-outline-variant/20">
          <span className="font-caption text-caption text-outline">
            {data.author?.name ?? "Unknown"} &middot; {readTime} min read
          </span>
          <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">bookmark</span>
        </div>
      </div>
    </article>
  );
}
