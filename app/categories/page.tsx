import { prisma } from "@/app/utils/db";
import Link from "next/link";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="py-10 container mx-auto px-4 space-y-8">
      <div className="rounded-[2rem] border border-border bg-white p-10 shadow-sm dark:bg-neutral-950">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Topics</p>
          <h1 className="mt-4 text-4xl font-semibold text-foreground">Discover content by category</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Browse curated categories to find posts that match your interests, from product design to developer tooling.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group rounded-[2rem] border border-border bg-white p-8 text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-neutral-950"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">#{category.slug}</span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">Explore</span>
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-foreground transition group-hover:text-primary">{category.name}</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{category.description ?? "Posts, insights and stories in this topic."}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
