import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/utils/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return NextResponse.json({ ok: false, error: 'post not found' }, { status: 404 });

    const comments = await prisma.comment.findMany({
      where: { postId: post.id, parentId: null },
      include: {
        author: true,
        replies: {
          include: {
            author: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ ok: true, comments });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { userId, content, parentId } = await req.json();
    if (!userId || !content) return NextResponse.json({ ok: false, error: 'userId and content required' }, { status: 400 });

    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return NextResponse.json({ ok: false, error: 'post not found' }, { status: 404 });

    const comment = await prisma.comment.create({ data: { content, postId: post.id, authorId: userId, parentId: parentId ?? null } });

    return NextResponse.json({ ok: true, comment });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
