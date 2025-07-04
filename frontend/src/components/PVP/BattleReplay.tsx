
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BattleLog from "./BattleLog";
import { useLocation } from "react-router-dom";
import VictoryPopup from "./VictoryPopup";

// ประเภทข้อมูล
export type Character = {
    id: string;
    name: string;
    imageUrl: string;
    hp: number;
    attack: number;
    defense: number;
    currentHp?: number;
};

export type UserCharacter = {
    userCharacterId: string;
    character: Character;
};

export type TeamMember = {
    userCharacterId: string;
    userCharacter: UserCharacter;
};

export type Team = {
    id: string; // เพิ่ม property id
    name: string;
    user: {
        id: string;
        username: string;
    };
    teamMembers: TeamMember[];
};

export type Turn = {
    turn: number;
    attacker: {
        id: string;
        name: string;
        hp: number;
        atk: number;
        def: number;
        currentHp?: number;
        alive?: boolean;
    };
    defender: {
        id: string;
        name: string;
        hp: number;
        atk: number;
        def: number;
        currentHp?: number;
        alive?: boolean;
    };
    damage: number;
    killed: boolean;
};

type BattleDetailResponse = {
    attackerTeam: Team;
    defenderTeam: Team;
    turns: Turn[];
    winnerId: string; // เพิ่มฟิลด์ winnerId เข้ามา
};

export default function BattleReplay() {
    const { battleId } = useParams();
    const [turns, setTurns] = useState<Turn[]>([]);
    const [attackerTeam, setAttackerTeam] = useState<Team | null>(null);
    const [defenderTeam, setDefenderTeam] = useState<Team | null>(null);
    const [deadCharacters, setDeadCharacters] = useState<string[]>([]);
    const [currentTurn, setCurrentTurn] = useState(0);
    const [loading, setLoading] = useState(true);
    const [damageDisplay, setDamageDisplay] = useState<{ id: string; damage: number } | null>(null);
    const [teamHpMap, setTeamHpMap] = useState<Record<string, number>>({});
    const [teamStatsMap, setTeamStatsMap] = useState<Record<string, { atk: number; def: number }>>({});
    const [isPlaying, setIsPlaying] = useState(true);
    const [isPopupOpen, setIsPopupOpen] = useState(false); // State สำหรับ popup
    const [battleData, setBattleData] = useState<BattleDetailResponse | null>(null); // เพิ่ม state สำหรับเก็บข้อมูลจาก API
    const location = useLocation();
    const locationState = location.state as any || {};

    useEffect(() => {
        const fetchBattle = async () => {
            try {
                let attacker = locationState.attackerTeam;
                let defender = locationState.defenderTeam;

                const res = await fetch(`http://localhost:3000/api/battle/detail/${battleId}`);
                const data: BattleDetailResponse = await res.json();
                const turnsData = data.turns;
                console.log("Battle data fetched:", data);
                
                console.log(" tun data ", turnsData);
                
                setAttackerTeam(attacker ?? data.attackerTeam);
                setDefenderTeam(defender ?? data.defenderTeam);
                setTurns(turnsData);
                setBattleData(data); // เก็บข้อมูลทั้งหมดใน state

                const allMembers = [
                    ...(attacker ?? data.attackerTeam).teamMembers,
                    ...(defender ?? data.defenderTeam).teamMembers,
                ];
                const initialHpMap: Record<string, number> = {};
                const initialStatsMap: Record<string, { atk: number; def: number }> = {};
                for (const m of allMembers) {
                    initialHpMap[m.userCharacterId] = m.userCharacter.character.hp;
                    initialStatsMap[m.userCharacterId] = {
                        atk: m.userCharacter.character.attack,
                        def: m.userCharacter.character.defense,
                    };
                }
                setTeamHpMap(initialHpMap);
                setTeamStatsMap(initialStatsMap);

                if (turnsData.length > 0) {
                    const updatedStats: Record<string, { atk: number; def: number }> = { ...initialStatsMap };
                    turnsData.forEach(turn => {
                        updatedStats[turn.attacker.id] = { atk: turn.attacker.atk, def: turn.attacker.def };
                        updatedStats[turn.defender.id] = { atk: turn.defender.atk, def: turn.defender.def };
                    });
                    setTeamStatsMap(updatedStats);
                }
            } catch (error) {
                console.error("โหลดข้อมูล battle ผิดพลาด:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBattle();
    }, [battleId]);

    useEffect(() => {
        if (turns.length === 0 || !isPlaying) return;

        const interval = setInterval(() => {
            setCurrentTurn((prev) => {
                if (prev < turns.length - 1) {
                    setDamageDisplay(null);
                    return prev + 1;
                }
                setIsPlaying(false);
                clearInterval(interval);
                setIsPopupOpen(true); // เปิด popup เมื่อถึงเทิร์นสุดท้าย
                return prev;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [turns, isPlaying]);

    useEffect(() => {
        if (!turns[currentTurn]) return;

        const t = turns[currentTurn];

        // เริ่มต้นด้วยการแสดงดาเมจ
        setTimeout(() => {
            setDamageDisplay({ id: t.defender.id, damage: t.damage });
            setTeamHpMap((prev) => {
                const defenderId = t.defender.id;
                const damage = t.damage;
                const newHp = Math.max(0, (prev[defenderId] ?? 0) - damage);
                return { ...prev, [defenderId]: newHp };
            });
            setTeamStatsMap((prev) => ({
                ...prev,
                [t.attacker.id]: { atk: t.attacker.atk, def: t.attacker.def },
                [t.defender.id]: { atk: t.defender.atk, def: t.defender.def },
            }));

            // เพิ่มการเลื่อนเวลาให้แอนิเมชันดาเมจเสร็จก่อนอัปเดตสถานะตาย
            if (t.killed) {
                setTimeout(() => {
                    setDeadCharacters((prev) => [...prev, t.defender.id]);
                }, 1000); // รอ 1 วินาทีหลังจากแสดงดาเมจ
            }
        }, 1500); // รอแอนิเมชันโจมตี
    }, [currentTurn]);

    const handleNextTurn = () => {
        if (currentTurn < turns.length - 1) {
            setIsPlaying(false);
            setDamageDisplay(null);
            setCurrentTurn(currentTurn + 1);
        } else if (currentTurn === turns.length - 1) {
            setIsPopupOpen(true);
        }
    };

    const handlePrevTurn = () => {
        if (currentTurn > 0) {
            setIsPlaying(false);
            setDamageDisplay(null);
            setCurrentTurn(currentTurn - 1);
            setDeadCharacters((prev) => prev.filter((id) => id !== turns[currentTurn].defender.id));
            setTeamHpMap((prev) => {
                const defenderId = turns[currentTurn].defender.id;
                const damage = turns[currentTurn].damage;
                const originalHp = [...(attackerTeam?.teamMembers || []), ...(defenderTeam?.teamMembers || [])]
                    .find((m) => m.userCharacterId === defenderId)?.userCharacter.character.hp || prev[defenderId];
                const newHp = Math.min(prev[defenderId] + damage, originalHp);
                return { ...prev, [defenderId]: newHp };
            });
            const prevTurn = turns[currentTurn];
            setTeamStatsMap((prev) => ({
                ...prev,
                [prevTurn.attacker.id]: { atk: prevTurn.attacker.atk, def: prevTurn.attacker.def },
                [prevTurn.defender.id]: { atk: prevTurn.defender.atk, def: prevTurn.defender.def },
            }));
        }
    };

    const togglePlayPause = () => {
        setIsPlaying((prev) => !prev);
    };

    const handlePopupClose = () => {
        setIsPopupOpen(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#1a1a1a] text-white flex justify-center items-center text-xl font-prompt">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                >
                    ⏳ กำลังโหลด...
                </motion.div>
            </div>
        );
    }

    if (!turns || turns.length === 0) {
        return (
            <div className="min-h-screen w-full bg-[#1a1a1a] text-white flex justify-center items-center text-xl font-prompt">
                <div>⚠️ ไม่พบข้อมูลการต่อสู้</div>
            </div>
        );
    }

    const current = turns[currentTurn];
    const isKilled = (id: string) => deadCharacters.includes(id);

    const attackerAnimation = {
        initial: { x: 0, scale: 1 },
        animate: { x: 30, scale: 1.2 },
        transition: { duration: 0.5, ease: "easeInOut" as const },
    };

    const defenderAnimation = {
        initial: { x: 0, scale: 1 },
        animate: { x: [-10, 10, 0], scale: 0.9 },
        transition: { duration: 0.5, delay: 0.5, ease: "easeInOut" as const },
    };

    const damageAnimation = {
        initial: { y: 0, opacity: 0 },
        animate: { y: -50, opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.5, delay: 1 },
    };

    const deathAnimation = {
        initial: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.5, transition: { duration: 0.5 } },
    };

    const renderTeam = (team: Team | null, isTeamA: boolean) => {
        return (
            <div className={`absolute ${isTeamA ? "left-1/5 h-1/2" : "right-1/5 h-1/2"} flex justify-between items-end-safe gap-10 max-w-[400px] font-prompt drop-shadow-2xl`}>
                {team?.teamMembers.map((m) => {
                    const isAttacker = m.userCharacterId === current.attacker.id && !isKilled(m.userCharacterId);
                    const isDefender = m.userCharacterId === current.defender.id && !isKilled(m.userCharacterId);
                    const isDead = isKilled(m.userCharacterId);

                    const stats = m.userCharacter.character;
                    const currentHp = teamHpMap[m.userCharacterId] ?? stats.hp;
                    stats.currentHp = currentHp;

                    const statsData = teamStatsMap[m.userCharacterId] || {
                        atk: stats.attack,
                        def: stats.defense,
                    };

                    return (
                        <AnimatePresence key={m.userCharacterId}>
                            {!isDead && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{
                                        y: 0,
                                        opacity: 1,
                                        x: isAttacker ? attackerAnimation.animate.x : isDefender ? defenderAnimation.animate.x : 0,
                                        scale: isAttacker ? attackerAnimation.animate.scale : isDefender ? defenderAnimation.animate.scale : 1,
                                    }}
                                    exit={deathAnimation.exit}
                                    transition={isAttacker ? attackerAnimation.transition : isDefender ? defenderAnimation.transition : { duration: 0.5, ease: "easeOut" as const }}
                                    className="flex flex-col items-center relative "
                                >
                                    <motion.img
                                        src={stats.imageUrl}
                                        alt={stats.name}
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: isDefender ? 0.9 : 0.6 }}
                                        transition={{ duration: 0.5, delay: isDefender ? 0.5 : 0, ease: "easeInOut" as const }}
                                        className={`w-32 h-32 object-contain pixelated ${isAttacker ? "drop-shadow-xl/50" : isDefender ? "animate-pulse brightness-75 saturate-150 hue-rotate-[-20deg] contrast-125" : ""} rounded-lg`}
                                        style={{ imageRendering: "pixelated" }}
                                    />

                                    {(isAttacker || isDefender) && (
                                        <div className={`bg-[#1a1a1a] text-white text-xs px-3 py-1 rounded-lg border-2 ${isAttacker ? "border-[#00b7eb]" : "border-[#ff4040]"} mt-2 mb-2 font-prompt`}>
                                            {isAttacker ? "🎯 โจมตี!" : "🛡️ ถูกโจมตี!"}
                                        </div>
                                    )}

                                    <span className={`text-sm text-center font-prompt ${isTeamA ? "text-[#00b7eb]" : "text-[#ff4040]"}`}>
                                        {stats.name}
                                    </span>

                                    <div className="text-xs text-white mt-2 font-prompt space-y-1 text-center">
                                        <div>❤️ HP: {stats.currentHp}/{stats.hp}</div>
                                        <div>🗡️ ATK: {statsData.atk}</div>
                                        <div>🛡️ DEF: {statsData.def}</div>
                                    </div>

                                    {stats.hp && stats.currentHp !== undefined && (
                                        <div className="w-32 h-4 bg-[#333] rounded-lg mt-2 overflow-hidden border-2 border-[#1a1a1a]">
                                            <motion.div
                                                className={`h-full ${stats.currentHp / stats.hp > 0.5 ? "bg-[#00ff00]" : stats.currentHp / stats.hp > 0.2 ? "bg-[#ffd700]" : "bg-[#ff4040]"}`}
                                                style={{ width: `${Math.max(0, (stats.currentHp / stats.hp) * 100)}%` }}
                                                initial={{ width: `${Math.max(0, ((stats.currentHp + (damageDisplay?.damage || 0)) / stats.hp) * 100)}%` }}
                                                animate={{ width: `${Math.max(0, (stats.currentHp / stats.hp) * 100)}%` }}
                                                transition={{ duration: 0.5, delay: 1, ease: "easeInOut" as const }}
                                            ></motion.div>
                                        </div>
                                    )}

                                    {isDefender && damageDisplay?.id === m.userCharacterId && (
                                        <motion.div
                                            className="absolute top-0 text-[#ff4040] font-prompt text-xl font-black"
                                            initial={damageAnimation.initial}
                                            animate={damageAnimation.animate}
                                            exit={damageAnimation.exit}
                                            transition={damageAnimation.transition}
                                        >
                                            -{damageDisplay.damage}
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    );
                })}
            </div>
        );
    };

    const winnerTeam = battleData?.winnerId === attackerTeam?.id ? attackerTeam : defenderTeam; // ใช้ battleData แทน data
    const loserTeam = battleData?.winnerId === attackerTeam?.id ? defenderTeam : attackerTeam; // ใช้ battleData แทน data

    console.log("bttleId:", battleId);
    console.log("Winner Team:", winnerTeam ? winnerTeam.name : "ไม่พบทีมชนะ");
    console.log("Loser Team:", loserTeam ? loserTeam.name : "ไม่พบทีมแพ้");

    return (
        <div
            className="min-h-screen w-full relative flex flex-col font-prompt "
        >
            <div
                className="absolute inset-0 bg-cover bg-bottom blur-sm z-0"
                style={{
                    backgroundImage: "url('/images/vs-bg.gif')",
                }}
            />
            {/* เทิร์นปัจจุบัน */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-lg text-[#ffd700] z-10">
                เทิร์น {currentTurn + 1} 
            </div>

            {/* ปุ่มควบคุมเทิร์น */}
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
                <button
                    onClick={handlePrevTurn}
                    disabled={currentTurn === 0}
                    className={`px-3 py-1 bg-[#1a1a1a] text-white text-xs rounded-lg border-2 border-[#333] font-prompt ${currentTurn === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    ⬅️ ย้อนกลับ
                </button>
                <button
                    onClick={togglePlayPause}
                    className="px-3 py-1 bg-[#1a1a1a] text-white text-xs rounded-lg border-2 border-[#333] font-prompt"
                >
                    {isPlaying ? "⏸ หยุด" : "▶️ เล่น"}
                </button>
                <button
                    onClick={handleNextTurn}
                    disabled={currentTurn === turns.length - 1}
                    className={`px-3 py-1 bg-[#1a1a1a] text-white text-xs rounded-lg border-2 border-[#333] font-prompt ${currentTurn === turns.length - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    ถัดไป ➡️
                </button>
            </div>
            <div className="absolute top-4 left-4 z-10 bg-black/60 text-white px-4 py-2 rounded-xl text-sm font-prompt">
                <div>🧍 ทีมของคุณ: <strong>{attackerTeam?.user?.username}</strong></div>
                <div>📛 ชื่อทีม: <strong>{attackerTeam?.name}</strong></div>
            </div>

            <div className="absolute top-4 right-4 z-10 bg-black/60 text-white px-4 py-2 rounded-xl text-sm font-prompt text-right">
                <div>👾 ศัตรู: <strong>{defenderTeam?.user?.username}</strong></div>
                <div>📛 ชื่อทีม: <strong>{defenderTeam?.name}</strong></div>
            </div>

            {/* log การต่อสู้ */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                <BattleLog turns={turns} currentTurn={currentTurn} attackerTeam={attackerTeam} />
            </div>

            {/* ตัวละครทั้งสองฝั่ง */}
            {renderTeam(attackerTeam, true)}
            {renderTeam(defenderTeam, false)}

            {/* Popup ผลการชนะ */}
            <VictoryPopup
              isOpen={isPopupOpen}
              onClose={handlePopupClose}
              winnerTeam={winnerTeam}
              loserTeam={loserTeam}
            />
        </div>
    );
}
