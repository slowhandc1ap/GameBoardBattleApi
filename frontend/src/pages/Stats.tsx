import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Character {
    id: string;
    name: string;
    hp: number;
    atk: number;
    def: number;
}

interface TeamMember {
    userCharacter: {
        character: Character;
    };
}

interface Team {
    id: string;
    user: {
        username: string;
    };
    teamMembers: TeamMember[];
}

interface Battle {
    id: string;
    startedAt: string;
    endedAt: string;
    turns: any[];
    attackerTeam: Team;
    defenderTeam: Team;
    winnerTeamId: string;
}

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white/70 shadow-xl rounded-xl overflow-hidden ${className}`}>
        {children}
    </div>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-4 ${className}`}>
        {children}
    </div>
);

const Button = ({
    children,
    onClick,
    className = "",
}: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md ${className}`}
    >
        {children}
    </button>
);

const BattleStatsPage = () => {
    const [battles, setBattles] = useState<Battle[]>([]);
    const [userTeamIds, setUserTeamIds] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const userString = localStorage.getItem("user");

        if (!userString) return;

        const user = JSON.parse(userString);
        const userId = user.id;
        const username = user.username;

        console.log("Fetching battle history for userId:", userId, "and username:", username);

        if (!userId || !username) return;

        axios
            .get(`http://localhost:3000/api/battle/history/${userId}`)
            .then((response) => {
                const { battles } = response.data;
                setBattles(battles);

                const teamIds = new Set<string>();
                battles.forEach((b: Battle) => {
                    if (b.attackerTeam.user.username === username) {
                        teamIds.add(b.attackerTeam.id);
                    }
                    if (b.defenderTeam.user.username === username) {
                        teamIds.add(b.defenderTeam.id);
                    }
                });
                setUserTeamIds(Array.from(teamIds));
            })
            .catch((error) => {
                console.error("Error fetching battle history:", error);
            });
    }, []);

    const totalBattles = battles.length;
    const totalWins = battles.filter((b) => userTeamIds.includes(b.winnerTeamId)).length;
    const totalLosses = totalBattles - totalWins;
    const winRate = totalBattles > 0 ? ((totalWins / totalBattles) * 100).toFixed(1) : "0.0";

    const renderTeamSummary = (team: Team) => (
        <div>
            <p className="font-bold text-blue-700">{team.user.username}</p>
            <ul className="text-sm list-disc ml-4 text-gray-700">
                {team.teamMembers.map((m, i) => (
                    <li key={i}>{m.userCharacter.character.name}</li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="relative min-h-screen bg-[url('/images/stats-bg.gif')]  bg-fixed bg-cover bg-center p-6">
            {/* Header */}
            <div className="fixed top-4 left-4">
                <h1 className="text-3xl font-bold text-blue-700">📊 สถิติการต่อสู้ของคุณ</h1>
            </div>

            {/* Back to Lobby Button */}
            <div className="fixed h-1/2 right-4 top-4">
                <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-md"
                    onClick={() => navigate('/lobby')}
                >
                    🔙 กลับสู่หน้าหลัก
                </button>
            </div>

            <div className="fixed top-20 left-4 bg-white/80 p-4 rounded-xl shadow-md space-y-2 ">
                <p className="text-blue-900 font-bold text-md">🧮 สรุปสถิติ</p>
                <ul className="text-gray-700 text-sm space-y-1">
                    <li>จำนวนการแข่งทั้งหมด: {totalBattles} ครั้ง</li>
                    <li>ชนะ: ✅ {totalWins} ครั้ง</li>
                    <li>แพ้: ❌ {totalLosses} ครั้ง</li>
                    <li>อัตราชนะ: 🏆 {winRate}%</li>
                </ul>
            </div>


            {/* Battle List */}
            <div className="flex justify-center items-center min-h-screen">
                <div className="max-w-3xl w-full space-y-6">
                    {battles.length === 0 ? (
                        <Card>
                            <CardContent>
                                <p className="text-gray-600 text-center">ไม่พบประวัติการต่อสู้</p>
                            </CardContent>
                        </Card>
                    ) : (
                        battles.map((battle) => {
                            const isVictory = userTeamIds.includes(battle.winnerTeamId);
                            return (
                                <motion.div
                                    key={battle.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className={`border-l-4 ${isVictory ? "border-green-500" : "border-red-500"}`}>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-lg font-bold text-blue-700">
                                                    🗓️ {format(new Date(battle.startedAt), "dd MMM yyyy HH:mm")}
                                                </h2>
                                                <Button onClick={() => navigate(`/battle-replay/${battle.id}`)}>
                                                    ดูเทิร์น
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h3 className="font-bold text-sm text-gray-600">Attacker</h3>
                                                    {renderTeamSummary(battle.attackerTeam)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm text-gray-600">Defender</h3>
                                                    {renderTeamSummary(battle.defenderTeam)}
                                                </div>
                                            </div>

                                            <p className={`text-sm font-bold ${isVictory ? "text-green-600" : "text-red-600"}`}>
                                                {isVictory ? "✅ ชนะ" : "❌ แพ้"}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default BattleStatsPage;