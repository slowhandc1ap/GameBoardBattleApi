import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GachaWheel from '../../components/GachaWheel';
import Leaderboard from './Leaderboard';
import BattleButton from './BattleButton';
import HeroStage from '../../components/HeroState';
import type { HeroStageHero } from '../../components/HeroState';
import TeamList from '../../components/TeamList';
import GameInfoPopup from '../../components/InfoGameExplane';

// User และ Hero Type

type User = {
  id: string;
  username: string;
  coin: number;
  freeGachaUse: number;
};

type Hero = {
  id: string;
  nickname: string | null;
  obtainedAt: string;
  character: {
    id: string;
    name: string;
    job: string;
    rarity: number;
    hp: number;
    atk: number;
    def: number;
    speed: number;
    element: string;
    imageUrl: string;
  };
};

export default function Lobby() {
  const [user, setUser] = useState<User | null>(null);
  const [userHeroes, setUserHeroes] = useState<Hero[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Hero[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (token && userParam) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', userParam);
      const parsedUser = JSON.parse(userParam);
      setUser(parsedUser);
      fetchUserHeroes(parsedUser.id);
      navigate('/lobby', { replace: true });
    } else {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        fetchUserHeroes(parsedUser.id);
      } else {
        navigate('/');
      }
    }
  }, []);

  const fetchUserHeroes = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/heroes/${userId}`);
      const data = await response.json();
      if (data.success) {
        setUserHeroes(data.heroes);
      } else {
        alert('โหลดฮีโร่ล้มเหลว: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการโหลดฮีโร่');
    }
  };

  const toggleHeroInTeam = (hero: Hero) => {
    if (selectedTeam.some(h => h.id === hero.id)) {
      setSelectedTeam(prev => prev.filter(h => h.id !== hero.id));
    } else {
      if (selectedTeam.length >= 3) {
        alert("เลือกได้สูงสุด 3 ฮีโร่");
        return;
      }
      setSelectedTeam(prev => [...prev, hero]);
    }
  };
  const saveTeam = async () => {
    if (!user || selectedTeam.length === 0 || !teamName.trim()) {
      alert("กรุณาตั้งชื่อทีมและเลือกฮีโร่");
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/team/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          teamName,
          userId: user.id,
          heroIds: selectedTeam.map(h => h.character.id)
        })
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ บันทึกทีมสำเร็จ!");
        setTeamName('');
        setSelectedTeam([]);
      } else {
        alert("❌ บันทึกทีมไม่สำเร็จ: " + result.message);
      }

    } catch (err) {
      console.error(err);
      alert("❌ เกิดข้อผิดพลาด");
    }
  };



  const displayHeroes: HeroStageHero[] = selectedTeam.map(h => ({
    id: h.id,
    name: h.character.name,
    job: h.character.job,
    rarity: h.character.rarity,
    hp: h.character.hp,
    atk: h.character.atk,
    def: h.character.def,
    speed: h.character.speed,
    element: h.character.element,
    imageUrl: h.character.imageUrl
  }));

  return (
    <div className="relative min-h-screen bg-[url('/images/bg-lobby.gif')] bg-cover bg-center">

      {/* Profile */}
      <div className="absolute top-4 left-4 bg-white/70 rounded-xl px-4 py-2 shadow max-w-xs w-64">
        <h2 className="text-lg font-bold text-blue-700">👤 {user?.username}</h2>
        <p className="text-sm text-gray-700">💰 Coins: {user?.coin}</p>
        {user?.freeGachaUse && user.freeGachaUse >= 0 && (
          <p className="text-sm text-gray-700">🎁 Free Gacha: {user.freeGachaUse}</p>
        )}
        <GachaWheel />
      </div>

      <div className="absolute bottom-8 left-4">
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow cursor-pointer b" 
          onClick={() => {
            localStorage.clear();
            navigate('/');
          }}
        >
          🔒 ออกจากระบบ
        </button>
      </div>
      

      {/* ปุ่มดูทีม */}
      <div className="absolute bottom-4 w-full flex justify-center items-center z-20">
        <button
          onClick={() => setShowTeamModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow-md"
        >
          📋 ดูทีมของฉัน
        </button>
      </div>
      {showTeamModal && user?.id && (
        <TeamList userId={user.id} onClose={() => setShowTeamModal(false)} />
      )}
      {/* Hero Inventory Grid */}
      {/* ฮีโร่ในคลัง */}
      <div className="absolute bottom-24 left-4 bg-pink-300/80 rounded-xl p-4 shadow max-w-lg w-1/2">

        <h3 className="font-bold mb-3 text-center text-lg">🎮 ฮีโร่ในคลัง</h3>

        <div className="grid grid-cols-6 gap-2">
          {userHeroes.map((hero) => {
            const isSelected = selectedTeam.some(h => h.id === hero.id);
            return (
              <div
                key={hero.id}
                onClick={() => toggleHeroInTeam(hero)}
                className={`border rounded p-1 cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
                  }`}
                title={hero.character.name}
              >
                <img
                  src={hero.character.imageUrl}
                  alt={hero.character.name}
                  className="w-full aspect-square object-cover rounded"
                />
                <p className="text-xs text-center mt-1 truncate">{hero.nickname || hero.character.name}</p>
              </div>
            );
          })}
        </div>

        {/* ชื่อทีมและปุ่มบันทึก */}
        {selectedTeam.length > 0 && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="ตั้งชื่อทีม..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full mb-2 px-2 py-1 border rounded text-sm"
            />
            <button
              onClick={saveTeam}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              💾 บันทึกทีม
            </button>
          </div>
        )}
      </div>


      {/* ปุ่ม Battle และอื่น ๆ */}
      <div className="absolute top-1/3 right-4 transform -translate-y-1/2 space-y-4">
        <Leaderboard />


      </div>

      {/* Welcome Text */}
      <div className="flex items-center justify-center h-full mt-1">
        <div className="text-center p-10 rounded-2xl shadow-xl max-w-3xl">
          <img src="/images/logo-text=lobby.png" alt="Game Battle Logo" />
          <p className="text-gray-300">เลือกเมนูจากรอบ ๆ เพื่อเริ่มต้นใช้งาน</p>
        </div>

        <button onClick={() => setShowInfo(true)} className="bg-blue-600 px-3 py-1 rounded text-sm cursor-pointer animate-pulse">
          📘 วิธีเล่น
        </button>
        {showInfo && <GameInfoPopup onClose={() => setShowInfo(false)} />}
      </div>

      {/* HeroStage: โชว์ฮีโร่ที่เลือก */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
        <HeroStage heroes={displayHeroes} />

      </div>


      <BattleButton />

    </div>
  );
}