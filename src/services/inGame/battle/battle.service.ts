import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type BattleCharacter = {
    id: string;
    name: string;
    hp: number;
    atk: number;
    def: number;
    alive: boolean;
    teamId: string;
};

type Turn = {
    turn: number;
    attacker: BattleCharacter & { currentHp: number };
    defender: BattleCharacter & { currentHp: number };
    damage: number;
    killed: boolean;
};

export const startBattle = async (
    attackerTeamId: string,
    attackerAttackOrder: string[],
    attackerDefenseOrder: string[]
): Promise<{
    battleId: string;
    turns: Turn[];
    winnerTeamId: string;
}> => {
    const maxTurns = 100;
    try {
        console.time("startBattle");

        if (!attackerAttackOrder.length || !attackerDefenseOrder.length) {
            throw new Error("Attack or defense order is empty");
        }

        console.log("🚀 Starting battle for team:", attackerTeamId);

        // 1. Randomize defender team with stricter validation
        const [randomDefenseTeam] = await prisma.$queryRawUnsafe<any[]>(`
            SELECT id
            FROM Team
            WHERE isDefenseTeam = true AND id != ? AND NOT EXISTS (
                SELECT 1 FROM TeamMember tm1
                JOIN TeamMember tm2 ON tm1.userCharacterId = tm2.userCharacterId
                WHERE tm1.teamId = ? AND tm2.teamId = Team.id
            )
            ORDER BY RAND()
            LIMIT 1;
        `, attackerTeamId, attackerTeamId);

        if (!randomDefenseTeam) {
            throw new Error("No suitable defense team found");
        }

        console.log("🛡️ Defender team selected:", randomDefenseTeam.id);

        console.time("fetchTeams");
        const [attackerTeam, defenderTeam] = await prisma.$transaction([
            prisma.team.findUnique({
                where: { id: attackerTeamId },
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
            }),
            prisma.team.findUnique({
                where: { id: randomDefenseTeam.id },
                include: {
                    user: true,
                    teamMembers: {
                        include: {
                            userCharacter: {
                                include: { character: true }
                            }
                        }
                    },
                    defenseFormation: true
                }
            })
        ]);
        console.timeEnd("fetchTeams");

        if (!attackerTeam || !defenderTeam || !defenderTeam.defenseFormation) {
            throw new Error("Invalid teams or missing formation");
        }

        const attackerMembers = attackerTeam.teamMembers;
        const defenderMembers = defenderTeam.teamMembers;

        const mapToBattleCharacter = (id: string, members: typeof attackerMembers, teamId: string): BattleCharacter => {
            const member = members.find(m => m.userCharacterId === id);
            if (!member) throw new Error(`Character ${id} not found`);
            return {
                id: member.userCharacterId,
                name: member.userCharacter.character.name,
                hp: member.userCharacter.character.hp,
                atk: member.userCharacter.character.atk,
                def: member.userCharacter.character.def,
                alive: true,
                teamId: teamId
            };
        };

        const resolveUserCharacterIds = (ids: string[], members: typeof defenderMembers) => {
            return ids
                .map(charId => {
                    const match = members.find(m => m.userCharacterId === charId);
                    if (!match) {
                        console.warn(`⚠️ userCharacterId ${charId} not found in team`);
                        return null;
                    }
                    return match.userCharacterId;
                })
                .filter((id): id is string => id !== null);
        };

        console.time("mapCharacters");
        const attackerCharacters = attackerAttackOrder
            .concat(attackerDefenseOrder)
            .filter((v, i, a) => a.indexOf(v) === i)
            .map(id => mapToBattleCharacter(id, attackerMembers, attackerTeamId));
        const defenderCharacters = resolveUserCharacterIds(
            defenderTeam.defenseFormation.attackOrder.split(",").concat(defenderTeam.defenseFormation.defenseOrder.split(",")),
            defenderMembers
        )
            .filter((v, i, a) => a.indexOf(v) === i)
            .map(id => mapToBattleCharacter(id, defenderMembers, defenderTeam.id));

        const attackerAttackers = attackerAttackOrder.map(id =>
            attackerCharacters.find(c => c.id === id)!
        );
        const attackerDefenders = attackerDefenseOrder.map(id =>
            attackerCharacters.find(c => c.id === id)!
        );
        const defenderAttackers = resolveUserCharacterIds(defenderTeam.defenseFormation.attackOrder.split(","), defenderMembers).map(id =>
            defenderCharacters.find(c => c.id === id)!
        );
        const defenderDefenders = resolveUserCharacterIds(defenderTeam.defenseFormation.defenseOrder.split(","), defenderMembers).map(id =>
            defenderCharacters.find(c => c.id === id)!
        );
        console.timeEnd("mapCharacters");

        console.time("battleLoop");
        const turns: Turn[] = [];
        let turnIndex = 1;
        let attackerTurn = true;
        let attackerIndex = 0;
        let defenderIndex = 0;

        const updateAliveStatus = (characters: BattleCharacter[]) => {
            characters.forEach(c => {
                if (c.hp <= 0 && c.alive) {
                    c.alive = false;
                    console.log(`Character ${c.name} is dead (hp: ${c.hp})`);
                }
            });
        };

        console.log("Initial Attackers A:", attackerAttackers.map(c => ({ name: c.name, hp: c.hp, alive: c.alive, teamId: c.teamId })));
        console.log("Initial Defenders A:", attackerDefenders.map(c => ({ name: c.name, hp: c.hp, alive: c.alive, teamId: c.teamId })));
        console.log("Initial Attackers B:", defenderAttackers.map(c => ({ name: c.name, hp: c.hp, alive: c.alive, teamId: c.teamId })));
        console.log("Initial Defenders B:", defenderDefenders.map(c => ({ name: c.name, hp: c.hp, alive: c.alive, teamId: c.teamId })));

        while (attackerAttackers.some(c => c.alive && c.hp > 0) && defenderAttackers.some(c => c.alive && c.hp > 0) && turnIndex <= maxTurns) {
            updateAliveStatus(attackerCharacters);
            updateAliveStatus(defenderCharacters);

            if (attackerTurn) {
                let attacker: BattleCharacter | null = null;
                for (let i = 0; i < attackerAttackers.length; i++) {
                    const index = (attackerIndex + i) % attackerAttackers.length;
                    if (attackerAttackers[index].alive && attackerAttackers[index].hp > 0) {
                        attacker = attackerAttackers[index];
                        attackerIndex = (index + 1) % attackerAttackers.length;
                        break;
                    }
                }
                if (!attacker) {
                    console.log("No alive attackers for Team A");
                    break;
                }

                const targets = defenderCharacters.filter(d => d.alive && d.hp > 0 && d.teamId !== attacker.teamId);
                const target = targets.length > 0 ? targets[Math.floor(Math.random() * targets.length)] : null;
                if (!target) {
                    console.log("No alive defenders for Team B");
                    break;
                }

                const damage = Math.max(attacker.atk - target.def, 1);
                target.hp = Math.max(0, target.hp - damage);
                const killed = target.hp === 0;
                if (killed) target.alive = false;

                turns.push({
                    turn: turnIndex++,
                    attacker: { ...attacker, currentHp: attacker.hp },
                    defender: { ...target, currentHp: target.hp },
                    damage,
                    killed
                });

                console.log(`Turn ${turnIndex - 1}: ${attacker.name} (Team ${attacker.teamId}) attacks ${target.name} (Team ${target.teamId}), Damage: ${damage}, Target HP: ${target.hp}, Killed: ${killed}`);
            } else {
                let attacker: BattleCharacter | null = null;
                for (let i = 0; i < defenderAttackers.length; i++) {
                    const index = (defenderIndex + i) % defenderAttackers.length;
                    if (defenderAttackers[index].alive && defenderAttackers[index].hp > 0) {
                        attacker = defenderAttackers[index];
                        defenderIndex = (index + 1) % defenderAttackers.length;
                        break;
                    }
                }
                if (!attacker) {
                    console.log("No alive attackers for Team B");
                    break;
                }

                const targets = attackerCharacters.filter(d => d.alive && d.hp > 0 && d.teamId !== attacker.teamId);
                const target = targets.length > 0 ? targets[Math.floor(Math.random() * targets.length)] : null;
                if (!target) {
                    console.log("No alive defenders for Team A");
                    break;
                }

                const damage = Math.max(attacker.atk - target.def, 1);
                target.hp = Math.max(0, target.hp - damage);
                const killed = target.hp === 0;
                if (killed) target.alive = false;

                turns.push({
                    turn: turnIndex++,
                    attacker: { ...attacker, currentHp: attacker.hp, atk: attacker.atk, def: attacker.def },
                    defender: { ...target, currentHp: target.hp, atk: target.atk, def: target.def },
                    damage,
                    killed
                });

                console.log(`Turn ${turnIndex - 1}: ${attacker.name} (Team ${attacker.teamId}) attacks ${target.name} (Team ${target.teamId}), Damage: ${damage}, Target HP: ${target.hp}, Killed: ${killed}`);
            }

            attackerTurn = !attackerTurn;

            console.log(`After Turn ${turnIndex - 1}:`);
            console.log("Attackers A:", attackerCharacters.map(c => ({ name: c.name, hp: c.hp, alive: c.alive, teamId: c.teamId })));
            console.log("Defenders B:", defenderCharacters.map(c => ({ name: c.name, hp: c.hp, alive: c.alive, teamId: c.teamId })));
        }
        console.timeEnd("battleLoop");

        const attackerAliveCount = attackerCharacters.filter(c => c.alive && c.hp > 0).length;
        const defenderAliveCount = defenderCharacters.filter(c => c.alive && c.hp > 0).length;
        const winnerTeamId =
            attackerAliveCount > defenderAliveCount
                ? attackerTeam.id
                : defenderAliveCount >= attackerAliveCount
                    ? defenderTeam.id
                    : defenderTeam.id;

        const winnerUserId = winnerTeamId === attackerTeam.id ? attackerTeam.userId : defenderTeam.userId;
        const loserUserId = winnerTeamId === attackerTeam.id ? defenderTeam.userId : attackerTeam.userId;

        await prisma.$transaction([
            prisma.leaderboard.upsert({
                where: { userId: winnerUserId },
                update: { wins: { increment: 1 }, rankPoints: { increment: 10 } },
                create: { userId: winnerUserId, wins: 1, losses: 0, rankPoints: 1010 }
            }),
            prisma.leaderboard.upsert({
                where: { userId: loserUserId },
                update: { losses: { increment: 1 }, rankPoints: { decrement: 5 } },
                create: { userId: loserUserId, wins: 0, losses: 1, rankPoints: 995 }
            })
        ]);

        console.time("saveBattle");
        const battle = await prisma.battleHistory.create({
            data: {
                attackerTeamId: attackerTeam.id,
                defenderTeamId: defenderTeam.id,
                winnerTeamId,
                turns,
                endedAt: new Date()
            }
        });
        console.timeEnd("saveBattle");

        console.timeEnd("startBattle");
        console.log(`✅ Battle complete. Winner: ${winnerTeamId}, Turns: ${turns.length}`);
        return {
            battleId: battle.id,
            turns,
            winnerTeamId
        };
    } catch (error) {
        console.error("❌ Battle failed:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};

export const getBattleDetail = async (battleId: string) => {
    const battle = await prisma.battleHistory.findUnique({
        where: { id: battleId },
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
            }
        }
    });

    if (!battle) {
        throw new Error("ไม่พบประวัติการต่อสู้");
    }

    return {
        attackerTeam: battle.attackerTeam,
        defenderTeam: battle.defenderTeam,
        turns: battle.turns,
        winnerId: battle.winnerTeamId, // เปลี่ยน "winerId" เป็น "winnerId" และใช้ให้ถูกต้อง
    };
};
