import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserHeroes = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const heroes = await prisma.userCharacter.findMany({
    where: { userId },
    include: {
      character: true // เอาข้อมูลตัวละครมาแสดงด้วย เช่นชื่อ สาย พลัง ความแรร์ ฯลฯ
    }
  });

  return heroes.map(h => ({
    id: h.id,
    nickname: h.nickname,
    obtainedAt: h.createAt,
    character: h.character // มี name, job, rarity, atk, def, etc.
  }));
};