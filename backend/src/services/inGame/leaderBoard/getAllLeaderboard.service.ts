import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const getAllLeaderboard = async () => {
  const leaderboard = await prisma.leaderboard.findMany({
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      rankPoints: "desc", // เรียงจากคะแนนมากไปน้อย
    },
  });

  return leaderboard;
};
