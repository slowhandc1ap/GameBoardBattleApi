// src/components/Leaderboard.tsx
import { useEffect, useState } from "react";
import axios from "axios";

interface Player {
  id: string;
  user: {
    username: string;
  };
  rankPoints: number;
  wins: number;
  losses: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);

 useEffect(() => {
  axios.get("http://localhost:3000/api/leaderboard/getall")
    .then((res) => {
      console.log("📦 ข้อมูลที่ได้จาก API:", res.data);
      setLeaderboard(res.data.leaderboard); // <<< ใช้ .leaderboard
    })
    .catch((err) => console.error("Error loading leaderboard", err));
}, []);

  return (
    <div className="bg-black/40 backdrop-blur-md text-white p-6 rounded-xl shadow-md w-full max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">🏆 กระดานจัดอันดับนักรบจักรวาล</h2>

      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-gray-800 text-gray-300">
            <th className="p-3">อันดับ</th>
            <th className="p-3">ผู้เล่น</th>
            <th className="p-3 text-right">คะแนน</th>
            <th className="p-3 text-center">ชนะ</th>
            <th className="p-3 text-center">แพ้</th>
            <th className="p-3">ระดับ</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((player, index) => {
            const tier = getTier(player.rankPoints);
            return (
              <tr
                key={player.id}
                className={`border-b border-gray-700 ${
                  index < 3 ? "bg-gradient-to-r from-yellow-900/30 to-transparent" : ""
                }`}
              >
                <td className="p-3 font-bold">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                </td>
                <td className="p-3">{player.user.username}</td>
                <td className="p-3 text-right">{player.rankPoints.toLocaleString()}</td>
                <td className="p-3 text-center">{player.wins}</td>
                <td className="p-3 text-center">{player.losses}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${getTierColor(tier)}`}>
                    {tier}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ฟังก์ชันกำหนด Tier ตามคะแนน
function getTier(score: number): string {
  if (score >= 9000) return "Diamond";
  if (score >= 8000) return "Platinum";
  if (score >= 7000) return "Gold";
  if (score >= 6000) return "Silver";
  return "Bronze";
}

// ฟังก์ชันกำหนดสี Tier
function getTierColor(tier: string) {
  switch (tier) {
    case "Diamond":
      return "bg-gradient-to-r from-blue-400 to-purple-500 text-white";
    case "Platinum":
      return "bg-slate-300 text-black";
    case "Gold":
      return "bg-yellow-400 text-black";
    case "Silver":
      return "bg-gray-400 text-black";
    case "Bronze":
      return "bg-orange-500 text-black";
    default:
      return "bg-gray-700";
  }
}
