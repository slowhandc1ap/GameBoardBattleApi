// services/battle/getBattleHistoriesByUserId.ts

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const getBattleHistoriesByUserId = async (userId: string) => {
  const teams = await prisma.team.findMany({
    where: { userId },
    select: { id: true }
  });

  const teamIds = teams.map(t => t.id);

  const battles = await prisma.battleHistory.findMany({
    where: {
      OR: [
        { attackerTeamId: { in: teamIds } },
        { defenderTeamId: { in: teamIds } },
      ]
    },
    orderBy: { startedAt: "desc" },
    include: {
      attackerTeam: {
        include: {
          user: true,
          teamMembers: {
            include: {
              userCharacter: {
                include: { character: true }
              }
            }
          }
        }
      },
      defenderTeam: {
        include: {
          user: true,
          teamMembers: {
            include: {
              userCharacter: {
                include: { character: true }
              }
            }
          }
        }
      },
      winnerTeam: true
    }
  });

  return battles.map(battle => ({
    id: battle.id,
    startedAt: battle.startedAt,
    endedAt: battle.endedAt,
    turns: battle.turns,
    attackerTeam: battle.attackerTeam,
    defenderTeam: battle.defenderTeam,
    winnerTeamId: battle.winnerTeamId,
  }));
};
