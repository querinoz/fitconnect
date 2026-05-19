import { getPrisma } from "@/lib/db/client";

export async function registerPushToken(input: {
  userId: string;
  token: string;
  platform: string;
}) {
  const prisma = getPrisma();
  if (!prisma) return null;

  return prisma.pushToken.upsert({
    where: { token: input.token },
    create: input,
    update: { userId: input.userId, platform: input.platform }
  });
}

export async function listPushTokensForUser(userId: string) {
  const prisma = getPrisma();
  if (!prisma) return [];
  return prisma.pushToken.findMany({ where: { userId } });
}
