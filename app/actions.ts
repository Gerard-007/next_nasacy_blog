"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "./utils/db"
import { redirect } from "next/navigation";

export async function blogCreateSubmission(formData: FormData) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
        return redirect("api/auth/register")
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const url = formData.get("url") as string;

    if (!title || !content || !url) {
        throw new Error("All fields are required to create a blog post.");
    }

    const data = await prisma.blogPost.create({
        data: {
            title: title,
            content: content,
            imageUrl: url,
            authorId: user.id as string,
            authorImage: user?.picture as string,
            authorName: user?.given_name as string
        },
    });

    return redirect("/dashboard");
}