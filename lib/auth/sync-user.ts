import { prisma } from "@/app/utils/db";

type KindeUser = {
  sub: string; // kinde id
  email?: string;
  name?: string;
  given_name?: string;
  picture?: string;
};

export async function syncKindeUser(kindeUser: KindeUser) {
  if (!kindeUser?.sub) return null;

  const kindeId = kindeUser.sub;
  const email = kindeUser.email ?? null;
  if (!email) return null;
  const name = kindeUser.name ?? kindeUser.given_name ?? null;
  const imageUrl = kindeUser.picture ?? null;

  const user = await prisma.user.upsert({
    where: { kindeId },
    create: {
      kindeId,
      email: email ?? undefined,
      name: name ?? undefined,
      imageUrl: imageUrl ?? undefined,
    },
    update: {
      email: email ?? undefined,
      name: name ?? undefined,
      imageUrl: imageUrl ?? undefined,
    },
  });

  return user;
}

export type { KindeUser };
