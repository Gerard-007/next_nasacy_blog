import { NextRequest, NextResponse } from "next/server";
import { syncKindeUser } from "@/lib/auth/sync-user";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await syncKindeUser(body);
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
