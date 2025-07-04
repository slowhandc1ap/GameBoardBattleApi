import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function MatchingResult() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { battleId } = state;

    const [myTeam, setMyTeam] = useState<any>(null);
    const [enemyTeam, setEnemyTeam] = useState<any>(null);

    useEffect(() => {
    const fetchTeams = async () => {
        const res = await fetch(`http://localhost:3000/api/battle/detail/${battleId}`);
        const data = await res.json();

        setMyTeam(data.attackerTeam);
        setEnemyTeam(data.defenderTeam);

        // ✅ Auto redirect หลัง 5 วิ พร้อมส่ง props ไป
        setTimeout(() => {
            navigate(`/battle-replay/${battleId}`, {
                state: {
                    battleId,
                    attackerTeam: data.attackerTeam,
                    defenderTeam: data.defenderTeam,
                },
            });
        }, 5000);
    };

    fetchTeams();
}, [battleId]);


    return (
        <div
            className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center"
            style={{ backgroundImage: "url('/images/matching-bg.gif')" }}>
            <h1 className="text-4xl font-extrabold mb-10 text-center text-yellow-400 tracking-wide drop-shadow-lg">
                🥊 เจอคู่ต่อสู้เเล้วววว!
            </h1>

            <div className="flex justify-center items-center relative">
                {/* ทีมของคุณ */}
                <div className="bg-gradient-to-br from-green-800 to-green-600 p-4 rounded-xl shadow-xl w-1/3 border-2 border-green-300">
                    <h2 className="text-xl font-bold mb-2 text-white">🧍‍♂️ ทีมของคุณ</h2>
                    <p className="mb-1">👤 เจ้าของทีม: {myTeam?.user?.username}</p>
                    <p className="mb-3">📛 ชื่อทีม: {myTeam?.name}</p>
                    {myTeam?.teamMembers?.map((m: any) => (
                        <div key={m.userCharacter.id} className="flex items-center gap-2 mb-2 bg-black/30 p-1 rounded">
                            <img
                                src={m.userCharacter.character.imageUrl}
                                alt={m.userCharacter.character.name}
                                className="w-10 h-10 rounded object-cover border border-green-300"
                            />
                            <p>{m.userCharacter.character.name}</p>
                        </div>
                    ))}
                </div>

                {/* VS กลาง */}
                <div className="text-6xl font-extrabold text-red-800 mx-6 animate-pulse drop-shadow-lg">
                    VS
                </div>

                {/* ทีมศัตรู */}
                <div className="bg-gradient-to-br from-red-800 to-red-600 p-4 rounded-xl shadow-xl w-1/3 border-2 border-red-300">
                    <h2 className="text-xl font-bold mb-2 text-white">👾 ทีมศัตรู</h2>
                    <p className="mb-1">👤 เจ้าของทีม: {enemyTeam?.user?.username}</p>
                    <p className="mb-3">📛 ชื่อทีม: {enemyTeam?.name}</p>
                    {enemyTeam?.teamMembers?.map((m: any) => (
                        <div key={m.userCharacter.id} className="flex items-center gap-2 mb-2 bg-black/30 p-1 rounded">
                            <img
                                src={m.userCharacter.character.imageUrl}
                                alt={m.userCharacter.character.name}
                                className="w-10 h-10 rounded object-cover border border-red-300"
                            />
                            <p>{m.userCharacter.character.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center mt-12">
                <button
                    onClick={() =>
                        navigate(`/battle-replay/${battleId}`, { state: { battleId } })
                    }
                    className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl font-bold text-black text-xl shadow-md transition"
                >
                    ▶️ ชมการต่อสู้แบบเรียลไทม์
                </button>
            </div>
        </div>
    );
}
