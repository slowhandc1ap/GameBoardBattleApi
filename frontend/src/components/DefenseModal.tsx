import { useState } from "react";




// ใน DefenseModal.tsx
type DefenseTeam = {
  id: string;
  name: string;
  members: {
    userCharacter: {
      id: string;
      character: {
        id: string;
        name: string;
        imageUrl: string;
        atk: number;
        def: number;
        hp: number;
      };
    };
  }[];
};

type Props = {
  userId: string;
  team: DefenseTeam;
  onClose: () => void;
  onComplete: () => void;
};

export default function DefenseModal({ userId, team, onClose, onComplete }: Props) {
  const [attackOrder, setAttackOrder] = useState<string[]>([]);
  const [defenseOrder, setDefenseOrder] = useState<string[]>([]);

  const toggleOrder = (order: string[], charId: string) => {
    if (order.includes(charId)) {
      return order.filter((id) => id !== charId);
    } else {
      return [...order, charId];
    }
  };

  const handleSubmit = async () => {
    if (attackOrder.length !== 3 || defenseOrder.length !== 3) {
      alert("❗ กรุณาเลือกตัวละครให้ครบ 3 ตัว ทั้งลำดับโจมตีและป้องกัน");
      return;
    }

    try {
      // 1. บันทึกลำดับ
      const formationRes = await fetch("http://localhost:3000/api/team/defense-formation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          teamId: team.id,
          attackOrder,
          defenseOrder,
        }),
      });

      const formationData = await formationRes.json();
      if (!formationData.success) throw new Error("บันทึกลำดับล้มเหลว");

      // 2. ตั้งเป็นทีมตั้งรับ
      const res = await fetch("http://localhost:3000/api/team/set-defense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.id, userId }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ ตั้งทีมตั้งรับสำเร็จ!");
        onComplete();
        onClose();
      } else {
        throw new Error("ตั้งทีมตั้งรับล้มเหลว");
      }
    } catch (err) {
      console.error(err);
      alert("❌ เกิดข้อผิดพลาดในการบันทึก");
    }
  };



  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl w-[90vw] max-w-2xl text-white shadow-xl border border-purple-700 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-lg hover:text-red-400"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-6 text-purple-300">
          ⚔️ ตั้งค่าลำดับทีมตั้งรับ
        </h2>

        {/* ลำดับโจมตี */}
        <div className="mb-6">
          <label className="block text-sm mb-1">เลือกลำดับโจมตี:</label>
          <div className="flex justify-center gap-6">
            {team.members.map((m) => {
              const char = m.userCharacter.character;
              const isSelected = attackOrder.includes(m.userCharacter.id);
              const order = attackOrder.indexOf(m.userCharacter.id) + 1;

              return (
                <div
                  key={m.userCharacter.id}
                  onClick={() => setAttackOrder((prev) => toggleOrder(prev, m.userCharacter.id))}
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
        <div className="mb-6">
          <label className="block text-sm mb-1">เลือกลำดับป้องกัน:</label>
          <div className="flex justify-center gap-6">
            {team.members.map((m) => {
              const char = m.userCharacter.character;
              const isSelected = defenseOrder.includes(m.userCharacter.id);
              const order = defenseOrder.indexOf(m.userCharacter.id) + 1;

              return (
                <div
                  key={m.userCharacter.id}
                  onClick={() => setDefenseOrder((prev) => toggleOrder(prev, m.userCharacter.id))}
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

        <div className="flex justify-end mt-4 gap-4">
          <button onClick={onClose} className="text-gray-300 hover:text-red-400">❌ ยกเลิก</button>
          <button onClick={handleSubmit} className="bg-pink-600 px-4 py-2 rounded hover:bg-pink-700 font-bold">
            ✅ ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}
