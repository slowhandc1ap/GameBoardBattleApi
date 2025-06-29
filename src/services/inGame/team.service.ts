import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTeamService = async (userId: string, teamName: string, heroIds: string[]) => {
  return await prisma.$transaction(async (tx) => {
    // 1. สร้าง Team ใหม่
    const team = await tx.team.create({
      data: {
        name: teamName,
        userId,
      },
    });

    // 2. สร้าง TeamMember ทีละคน
    for (let i = 0; i < heroIds.length; i++) {
      const characterId = heroIds[i];

      // ตรวจสอบว่า user มี UserCharacter นี้จริงไหม
      const userCharacter = await tx.userCharacter.findFirst({
        where: {
          characterId,
          userId,
        },
      });

      if (!userCharacter) {
        throw new Error(`ไม่พบตัวละครที่ ID ${characterId} ของผู้ใช้`);
      }

      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userCharacterId: userCharacter.id,
          slot: i,
        },
      });
    }

    return team;
  });
};


/**
 * ดึงทีมทั้งหมดของ user พร้อมข้อมูลตัวละคร
 */
export const getTeamsByUserId = async (userId: string) => {
  const teams = await prisma.team.findMany({
    where: { userId },
    include: {
      teamMembers: {
        orderBy: { slot: 'asc' },
        include: {
          userCharacter: {
            include: {
              character: true
            }
          }
        }
      }
    }
  });

  return teams.map(team => ({
    id: team.id,
    name: team.name,
    isDefenseTeam: team.isDefenseTeam,
    members: team.teamMembers
    
  }));
};

export const setDefenseTeam = async (userId: string, teamId: string) => {
  // รีเซ็ตทีมตั้งรับทั้งหมดก่อน
  await prisma.team.updateMany({
    where: { userId },
    data: { isDefenseTeam: false },
  });

  // ตั้งทีมใหม่เป็นตั้งรับ
  return await prisma.team.update({
    where: { id: teamId },
    data: { isDefenseTeam: true },
  });
};

// services/team.service.ts
export const deleteTeamService = async (teamId: string) => {
  // ลบสมาชิกทีมก่อน (ถ้ามี foreign key constraint)
  await prisma.teamMember.deleteMany({
    where: { teamId },
  });

  return await prisma.team.delete({
    where: { id: teamId },
  });
};

// services/team.service.ts
export const updateTeamNameService = async (teamId: string, newName: string) => {
  return await prisma.team.update({
    where: { id: teamId },
    data: { name: newName },
  });
};


export const setDefenseFormation = async (
  teamId: string,
  attackOrder: number[],
  defenseOrder: number[]
) => {
  const attackStr = attackOrder.join(',');
  const defenseStr = defenseOrder.join(',');

  // 1. ลบ formation เก่าทั้งหมดก่อน
  await prisma.defenseFormation.deleteMany({});

  // 2. สร้างอันใหม่
  return await prisma.defenseFormation.create({
    data: {
      teamId,
      attackOrder: attackStr,
      defenseOrder: defenseStr,
    },
  });
};


export const getDefenseFormationByTeamId = async (teamId: string) => {
  return await prisma.defenseFormation.findUnique({
    where: { teamId },
  });
};
