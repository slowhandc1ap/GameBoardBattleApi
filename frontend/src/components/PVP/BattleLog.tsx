
import { motion, AnimatePresence } from "framer-motion";
import type { Team, Turn } from "./BattleReplay";

type BattleLogProps = {
    turns: Turn[];
    currentTurn: number;
    attackerTeam: Team | null;
};

export default function BattleLog({ turns, currentTurn, attackerTeam }: BattleLogProps) {

    return (
        <div
            className="bg-[#1a1a1a] p-4 rounded-lg max-h-[250px] overflow-y-auto mb-8 text-base"
            style={{
                whiteSpace: "pre-wrap",
                border: "4px solid #333",
                boxShadow: "8px 8px 0px #000",
                backgroundImage: "linear-gradient(rgba(255,255,255,0.05), rgba(255,255,255,0.05))",
            }}
        >
            <AnimatePresence>
                {turns.slice(0, currentTurn + 1).reverse().map((t) => {
                    const isAttackerFromTeamA = attackerTeam?.teamMembers?.some((m) => m.userCharacterId === t.attacker.id);
                    const isDefenderFromTeamA = attackerTeam?.teamMembers?.some((m) => m.userCharacterId === t.defender.id);

                    return (
                        <motion.div
                            key={t.turn}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="text-base mb-2 text-white"
                        >
                            <span className="text-[#ffd700] font-bold">เทิร์น {t.turn}:</span>{" "}
                            <span className={isAttackerFromTeamA ? "text-[#00b7eb] font-semibold" : "text-[#ff4040] font-semibold"}>
                                {t.attacker.name} ({isAttackerFromTeamA ? "ฝ่าย A" : "ฝ่าย B"})
                            </span>{" "}
                            ⚔️{" "}
                            <span className={isDefenderFromTeamA ? "text-[#00b7eb] font-semibold" : "text-[#ff4040] font-semibold"}>
                                {t.defender.name} ({isDefenderFromTeamA ? "ฝ่าย A" : "ฝ่าย B"})
                            </span>{" "}
                            | ดาเมจ: <span className="text-[#ff8c00] font-bold">{t.damage}</span> {t.killed ? "💀" : ""}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}