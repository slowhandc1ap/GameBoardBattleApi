import { useEffect, useState } from 'react';
import HeroStage from './HeroState';
import type { HeroStageHero } from './HeroState';
import { motion } from 'framer-motion';
import DefenseModal from './DefenseModal';

type Team = {
  id: string;
  name: string;
  isDefenseTeam: boolean;
  members: {
    userCharacter: {
      id: string;
      character: HeroStageHero;
    };
  }[];
};

type Props = {
  userId: string;
  onClose: () => void;
};

export default function TeamListModal({ userId, onClose }: Props) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [showDefenseModal, setShowDefenseModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formations, setFormations] = useState<Record<string, {
    attackOrder: string[];
    defenseOrder: string[];
  }>>({});

  const fetchFormations = async (teams: Team[]) => {
    const result: Record<string, { attackOrder: string[]; defenseOrder: string[] }> = {};
    await Promise.all(
      teams.map(async (team) => {
        try {
          const res = await fetch(`http://localhost:3000/api/team/defense-formation/${team.id}`);
          const data = await res.json();
          if (data.success && data.data) {
            result[team.id] = {
              attackOrder: data.data.attackOrder.split(","),
              defenseOrder: data.data.defenseOrder.split(","),
            };
          }
        } catch (err) {
          console.warn(`⚠️ ไม่พบ formation สำหรับทีม ${team.name}`);
        }
      })
    );
    setFormations(result);
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/team/user/${userId}`);
      const data = await res.json();
      console.log("โหลดทีม:", data);

      const allTeams = data.teams || [];
      setTeams(allTeams);

      // ✅ กรองเฉพาะทีมที่ตั้งเป็นทีมตั้งรับ
      const defenseTeams = allTeams.filter((team: Team) => team.isDefenseTeam);
      await fetchFormations(defenseTeams);
    } catch (err) {
      console.error("โหลดทีมล้มเหลว:", err);
    }
  };


  const getCharactersByOrder = (order: string[], team: Team) => {
    return order
      .map((id) => {
        const found = team.members.find((m) => m.userCharacter.id === id);
        return found ? {
          ...found.userCharacter.character,
          userCharacterId: found.userCharacter.id
        } : null;
      })
      .filter(Boolean);
  };


  useEffect(() => {
    if (userId) fetchTeams();
  }, [userId]);

  const deleteTeam = async (teamId: string) => {
    if (!confirm("❗ คุณแน่ใจว่าต้องการลบทีมนี้?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/team/delete/${teamId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        alert("🗑️ ลบทีมสำเร็จ");
        fetchTeams();
      } else {
        alert("❌ ลบทีมไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTeamName = async (teamId: string) => {
    if (!editingName.trim()) {
      alert("กรุณากรอกชื่อทีมใหม่");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/team/update-name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, newName: editingName }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✏️ เปลี่ยนชื่อทีมสำเร็จ");
        setEditingTeamId(null);
        setEditingName('');
        fetchTeams();
      } else {
        alert("❌ เปลี่ยนชื่อไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1f1b2e] text-white p-6 rounded-xl shadow-xl max-h-[80vh] overflow-y-auto w-[90vw] max-w-3xl relative border border-purple-700"
      >
        <button className="absolute top-2 right-2 text-white text-xl hover:text-red-400" onClick={onClose}>✖</button>
        <h2 className="text-2xl font-bold text-purple-300 mb-4">🛡️ ทีมของฉัน</h2>

        {teams.length === 0 ? (
          <p className="text-gray-400">ยังไม่มีทีม</p>
        ) : (
          teams.map((team) => {
            const heroes: HeroStageHero[] = team.members.map(m => m.userCharacter.character);
            const isEditing = editingTeamId === team.id;

            return (
              <div key={team.id} className={`mb-6 border-t pt-4 rounded-lg transition-all ${team.isDefenseTeam ? 'border-green-500 bg-green-900/20 ring-2 ring-green-400' : 'border-purple-600'}`}>
                <div className="flex items-center justify-between mb-2">
                  {isEditing ? (
                    <div className="flex gap-2 w-full">
                      <input
                        type="text"
                        className="flex-1 px-2 py-1 rounded bg-gray-800 border border-purple-500 text-white"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                      <button className="bg-green-600 px-3 py-1 text-xs rounded" onClick={() => updateTeamName(team.id)}>✅ บันทึก</button>
                      <button className="bg-red-600 px-3 py-1 text-xs rounded" onClick={() => { setEditingTeamId(null); setEditingName(''); }}>❌ ยกเลิก</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <h3 className="text-lg text-purple-200">📛 {team.name}</h3>
                      <div className="flex gap-2">
                        <button className="bg-yellow-600 px-2 py-1 text-xs rounded" onClick={() => { setEditingTeamId(team.id); setEditingName(team.name); }}>✏ เปลี่ยนชื่อ</button>
                        <button className="bg-red-600 px-2 py-1 text-xs rounded" onClick={() => deleteTeam(team.id)}>🗑 ลบทีม</button>
                        <button
                          className={`text-xs px-2 py-1 rounded ${team.isDefenseTeam ? 'bg-green-600' : 'bg-purple-600'}`}
                          onClick={() => { setSelectedTeam(team); setShowDefenseModal(true); }}
                        >
                          {team.isDefenseTeam ? '✅ ทีมตั้งรับ' : '⚔ ตั้งเป็นทีมตั้งรับ'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <HeroStage heroes={heroes} />

                {formations[team.id] && (
                  <div className="mt-2 text-sm text-gray-300">
                    <div className="mb-1">
                      🗡️ ลำดับการโจมตี:
                      <div className="flex gap-2 mt-1">
                        {getCharactersByOrder(formations[team.id].attackOrder, team).map((char, index) => (
                          <div key={char!.userCharacterId} className="relative">

                            <img
                              src={char?.imageUrl}
                              alt={char?.name}
                              className="w-8 h-8 rounded object-cover border border-green-400"
                            />
                            <div className="absolute -top-1 -left-1 bg-green-700 text-white text-xs rounded-full px-1">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      🛡️ ลำดับการป้องกัน:
                      <div className="flex gap-2 mt-1">
                        {getCharactersByOrder(formations[team.id].defenseOrder, team).map((char, index) => (
                          <div key={char!.userCharacterId} className="relative">

                            <img
                              src={char?.imageUrl}
                              alt={char?.name}
                              className="w-8 h-8 rounded object-cover border border-yellow-400"
                            />
                            <div className="absolute -top-1 -left-1 bg-yellow-600 text-white text-xs rounded-full px-1">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </motion.div>

      {selectedTeam && showDefenseModal && (
        <DefenseModal
          userId={userId}
          team={selectedTeam}
          onClose={() => { setShowDefenseModal(false); setSelectedTeam(null); }}
          onComplete={fetchTeams}
        />
      )}
    </div>
  );
}
