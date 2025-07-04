// src/components/BattleButton.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PvpModal from "../../components/PVP/Pvpmodal";
import { motion } from "framer-motion";

export default function BattleButton() {
  const navigate = useNavigate();
  const [showPvpModal, setShowPvpModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [, setHasDefenseTeam] = useState(false);
  const [, setIsLoadingTeams] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const userJson = localStorage.getItem("user");
      if (!userJson) {
        alert("⛔ ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
        navigate("/login");
        return;
      }

      try {
        const user = JSON.parse(userJson);
        setUserId(user.id);

        const res = await fetch(`http://localhost:3000/api/team/user/${user.id}`);
        const data = await res.json();
        const allTeams = data.teams || [];
        const hasDefense = allTeams.some((team: any) => team.isDefenseTeam === true);
        setHasDefenseTeam(hasDefense);
      } catch (error) {
        console.error("❌ เกิดข้อผิดพลาด:", error);
        localStorage.removeItem("user");
        alert("ข้อมูลผู้ใช้เสียหาย กรุณาเข้าสู่ระบบใหม่");
        navigate("/login");
      } finally {
        setIsLoadingTeams(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handlePvpClick = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/team/user/${userId}`);
      const data = await res.json();
      const allTeams = data.teams || [];
      const hasDefense = allTeams.some((team: any) => team.isDefenseTeam === true);

      if (!hasDefense) {
        alert("⚠️ กรุณาตั้งทีมตั้งรับก่อนจึงจะสามารถเล่นโหมด PVP ได้");
        return;
      }

      setShowPvpModal(true);
    } catch (error) {
      console.error("❌ ดึงข้อมูลทีมล้มเหลว:", error);
      alert("เกิดข้อผิดพลาดในการโหลดทีม กรุณาลองใหม่");
    }
  };

  const handlePvpSuccess = (data: any) => {
    setShowPvpModal(false);
    navigate("/battle/fight", {
      state: {
        myTeamId: data.attackerTeamId,
        opponent: data.defenderTeam,
        battleId: data.battleId,
      },
    });
  };

  if (!userId) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center min-h-1/5 bg-transparent text-white px-4 mt-20"
      >
        <h1 className="text-3xl font-bold mb-8 animate-pulse">⚔️ เลือกโหมดการต่อสู้</h1>

        <motion.div
          className="flex flex-col md:flex-row gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.3 },
            },
          }}
        >
          <motion.button
            onClick={handlePvpClick}
            className={`w-64 h-24 text-xl font-semibold rounded-xl shadow-lg transition
              bg-gradient-to-br from-pink-600 to-red-700 hover:scale-105 hover:brightness-110`}
            variants={{
              hidden: { opacity: 0, scale: 0.8, y: 30 },
              visible: { opacity: 1, scale: 1, y: 0 },
            }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            🧑‍🚀 PVP <br /> ต่อสู้กับผู้เล่น
          </motion.button>

          <motion.button
            onClick={() => navigate("/battle/bot")}
            className="w-64 h-24 bg-gradient-to-br from-green-600 to-emerald-700 hover:scale-105 hover:brightness-110 transition rounded-xl shadow-lg text-xl font-semibold"
            variants={{
              hidden: { opacity: 0, scale: 0.8, y: 30 },
              visible: { opacity: 1, scale: 1, y: 0 },
            }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            🤖 BOT <br /> ต่อสู้กับ AI
          </motion.button>
        </motion.div>
      </motion.div>

      {showPvpModal && userId && (
        <PvpModal
          userId={userId}
          onClose={() => setShowPvpModal(false)}
          onMatchSuccess={handlePvpSuccess}
        />
      )}
    </>
  );
}
