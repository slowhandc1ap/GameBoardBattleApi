import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const startBattle = async (attackerTeamId: string, attackerOrder: string[]) => {
    const attackerTeam = await prisma.team.findUnique({
        where: { id: attackerTeamId },
        include: {
            user: true,
            teamMembers: {
                include: { userCharacter: { include: { character: true } } }
            },
        },
    })

    const defenderTeam = await prisma.team.findFirst({
        where: {
            isDefenseTeam: true,
            NOT: { id: attackerTeamId },
        },
        include: {
            user: true,
            teamMembers: {
                include: { userCharacter: { include: { character: true } } },
            },
            defenseFormation: true,
        },
    })

    if (!attackerTeam || !defenderTeam) {
        throw new Error("ทีมโจมตีหรือทีมป้องกันไม่ถูกต้อง");
    }

    const defenderOrder = defenderTeam.defenseFormation?.defenseOrder.split(",") || [];

    const attackerCharacters = attackerOrder.map(id =>
        attackerTeam.teamMembers.find(m => m.userCharacterId === id)
    ).map(m => ({
        id: m!.userCharacterId,
        name: m!.userCharacter.character.name,
        hp: m!.userCharacter.character.hp,
        atk: m!.userCharacter.character.atk,
        def: m!.userCharacter.character.def,
        alive: true,
    }));

    const defenderCharacters = defenderOrder.map(id =>
        defenderTeam.teamMembers.find(m => m.userCharacterId === id)
    ).map(m => ({
        id: m!.userCharacterId,
        name: m!.userCharacter.character.name,
        hp: m!.userCharacter.character.hp,
        atk: m!.userCharacter.character.atk,
        def: m!.userCharacter.character.def,
        alive: true,
    }));

    const turns = [];
    let turnIndex = 1;

    for (const attacker of attackerCharacters) {
        if (!attacker.alive) continue;

        for (const defender of defenderCharacters) {
            if (!defender.alive) continue;

            const damage = Math.max(attacker.atk - defender.def, 1);
            defender.hp -= damage;

            const killed = defender.hp <= 0;
            if (killed) defender.alive = false;

            turns.push({
                turn: turnIndex++,
                attacker: attacker.id,
                defender: defender.id,
                damage,
                killed,
            });

            break;
        }
    }

    const winnerTeamId =
        attackerCharacters.filter(c => c.alive).length > defenderCharacters.filter(c => c.alive).length
            ? attackerTeam.id
            : defenderTeam.id;

    const battle = await prisma.battleHistory.create({
        data: {
            attackerTeamId: attackerTeam.id,
            defenderTeamId: defenderTeam.id,
            winnerTeamId,
            turns,
        },
    });

    return {
        battleId: battle.id,
        turns,
        attackerTeam,
        defenderTeam,
        winnerTeamId,
    };
};