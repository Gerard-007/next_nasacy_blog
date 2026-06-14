import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/utils/db";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 });

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return NextResponse.json({ ok: false, error: 'comment not found' }, { status: 404 });
    if (comment.authorId !== userId) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });

    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId, content } = await req.json();
    if (!userId || !content) return NextResponse.json({ ok: false, error: 'userId and content required' }, { status: 400 });

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return NextResponse.json({ ok: false, error: 'comment not found' }, { status: 404 });
    if (comment.authorId !== userId) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });

    const updated = await prisma.comment.update({ where: { id }, data: { content } });
    return NextResponse.json({ ok: true, comment: updated });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
