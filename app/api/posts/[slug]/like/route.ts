import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/utils/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 });

    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return NextResponse.json({ ok: false, error: 'post not found' }, { status: 404 });

    // create like if not exists
    const [like] = await prisma.$transaction([
      prisma.like.upsert({
        where: { userId_postId: { userId, postId: post.id } },
        create: { userId, postId: post.id },
        update: {},
      }),
      prisma.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 0 } } }),
    ]);

    return NextResponse.json({ ok: true, like });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 });

    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return NextResponse.json({ ok: false, error: 'post not found' }, { status: 404 });

    await prisma.like.deleteMany({ where: { userId, postId: post.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
