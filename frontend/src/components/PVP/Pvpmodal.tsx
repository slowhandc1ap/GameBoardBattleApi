import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Hero = {
  id: string;
  name: string;
  atk: number;
  def: number;
  hp: number;
  imageUrl: string;
};

type Team = {
  id: string;
  name: string;
  members: {
    userCharacter: {
      id: string;
      character: Hero;
    };
  }[];
};

type Props = {
  userId: string;
  onClose: () => void;
  onMatchSuccess: (data: any) => void;
};

export default function PvpModal({ userId, onClose, onMatchSuccess }: Props) {

  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [attackOrder, setAttackOrder] = useState<string[]>([]);
  const [defenseOrder, setDefenseOrder] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  useEffect(() => {
    const fetchTeams = async () => {
      const res = await fetch(`http://localhost:3000/api/team/user/${userId}`);
      const data = await res.json();
      setTeams(data.teams || []);
    };

    if (userId) fetchTeams();
  }, [userId]);

  const toggleOrder = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const handleSubmit = async () => {
    if (!selectedTeamId || attackOrder.length !== 3 || defenseOrder.length !== 3) {
      alert("กรุณาเลือกทีม และจัดลำดับให้ครบ 3 ตัวละครทั้งโจมตีและป้องกัน");
      return;
    }

    setIsLoading(true); // 👉 เริ่มโหลด

    try {
      // รอ 3 วิเพื่อให้เหมือนจับคู่นาน ๆ (เช่นรอหา match)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const res = await fetch("http://localhost:3000/api/battle/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attackerTeamId: selectedTeamId,
          attackerAttackOrder: attackOrder,
          attackerDefenseOrder: defenseOrder,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsLoading(false);
        onMatchSuccess(data);
        navigate("/matching-result", {
          state: {
            battleId: data.battleId,
            winnerTeamId: data.winnerTeamId,
            turns: data.turns,
            attackerTeamId: selectedTeamId,
          },
        });
      } else {
        setIsLoading(false);
        alert("จับคู่ไม่สำเร็จ");
      }

    } catch (error) {
      setIsLoading(false);
      alert("เกิดข้อผิดพลาดในการจับคู่");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl w-[90vw] max-w-lg text-white shadow-xl border border-purple-700 relative ">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-lg hover:text-red-400"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-4 text-purple-300">
          ⚔️ เลือกทีมและลำดับ
        </h2>

        {/* เลือกทีม */}
        <div className="mb-4">
          <label className="block text-sm mb-1">เลือกทีม:</label>
          <select
            value={selectedTeamId}
            onChange={(e) => {
              setSelectedTeamId(e.target.value);
              setAttackOrder([]);
              setDefenseOrder([]);
            }}
            className="w-full px-2 py-1 rounded bg-gray-800 border border-purple-500"
          >
            <option value="">-- เลือกทีม --</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {/* ลำดับโจมตี */}
        <div className="mb-4">
          <label className="block text-sm mb-1 " >เลือกลำดับโจมตี:</label>
          <div className="flex justify-center gap-10">
            {selectedTeam?.members.map((m) => {
              const char = m.userCharacter.character;
              const isSelected = attackOrder.includes(m.userCharacter.id); // ✅ ใช้ userCharacter.id
              const order = attackOrder.indexOf(m.userCharacter.id) + 1;

              return (
                <div
                  key={m.userCharacter.id}
                  onClick={() => setAttackOrder((prev) => toggleOrder(prev, m.userCharacter.id))} // ✅
                  className={`relative border-2 p-1 rounded cursor-pointer transition-all duration-150 ${isSelected ? "border-green-500 scale-110" : "border-transparent"
                    }`}
                >
                  <p className="text-xs text-white text-center">🗡️{char.atk}</p>
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  {isSelected && (
                    <div className="absolute top-0 right-0 text-xs bg-green-600 px-1 rounded-bl">
                      {order}
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>

        {/* ลำดับป้องกัน */}
        <div className="mb-4">
          <label className="block text-sm mb-1">เลือกลำดับป้องกัน:</label>
          <div className="flex gap-10 justify-center">
            {selectedTeam?.members.map((m) => {
              const char = m.userCharacter.character;
              const isSelected = defenseOrder.includes(m.userCharacter.id); // ✅
              const order = defenseOrder.indexOf(m.userCharacter.id) + 1;

              return (
                <div
                  key={m.userCharacter.id}
                  onClick={() => setDefenseOrder((prev) => toggleOrder(prev, m.userCharacter.id))} // ✅
                  className={`relative border-2 p-1 rounded cursor-pointer transition-all duration-150 ${isSelected ? "border-yellow-400 scale-110" : "border-transparent"
                    }`}
                >
                  <p className="text-xs text-white text-center">🛡️{char.def}</p>
                  <p className="text-xs text-white text-center">❤️{char.hp}</p>
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  {isSelected && (
                    <div className="absolute top-0 right-0 text-xs bg-yellow-500 px-1 rounded-bl">
                      {order}
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-pink-600 hover:bg-pink-700 w-full py-2 mt-4 rounded font-bold"
        >
          ✅ เริ่มจับคู่ PVP
        </button>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
          <div className="bg-gray-800 text-white px-6 py-4 rounded-xl shadow-lg border border-purple-500">
            <p className="text-lg animate-pulse">🔄 กำลังจับคู่ PVP...</p>
          </div>
        </div>
      )}

    </div>


  );
}
