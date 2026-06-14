import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/utils/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    let isFollowing = false;
    if (userId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: id,
          }
        }
      });
      isFollowing = !!follow;
    }

    const followersCount = await prisma.follow.count({
      where: { followingId: id }
    });

    const followingCount = await prisma.follow.count({
      where: { followerId: id }
    });

    return NextResponse.json({ ok: true, isFollowing, followersCount, followingCount });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 });
    if (userId === id) return NextResponse.json({ ok: false, error: 'Cannot follow yourself' }, { status: 400 });

    const follow = await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: id,
        }
      },
      create: {
        followerId: userId,
        followingId: id,
      },
      update: {}
    });

    return NextResponse.json({ ok: true, follow });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 });

    await prisma.follow.deleteMany({
      where: {
        followerId: userId,
        followingId: id,
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
