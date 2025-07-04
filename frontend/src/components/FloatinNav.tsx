// src/components/FloatingNav.tsx
import { useNavigate, useLocation } from "react-router-dom";
import {
  GiCastle,
  GiCardRandom,
  GiReceiveMoney,
  GiChart,
  GiGearHammer,
} from "react-icons/gi";

type NavItem = {
  icon: React.ReactNode;
  label: string;
  route: string;
};

const navItems: NavItem[] = [
  { icon: <GiCastle />, label: "หน้าหลัก", route: "/lobby" },
  { icon: <GiCardRandom />, label: "กาชา", route: "/gacha" },
  { icon: <GiReceiveMoney />, label: "ชำระเงิน", route: "/payment" },
  { icon: <GiChart />, label: "สถิติ", route: "/stats" },
  { icon: <GiGearHammer />, label: "ตั้งค่า", route: "/settings" },
];

export default function FloatingNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-purple-900/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-purple-500 flex flex-row gap-4">
      {navItems.map((item, idx) => {
        const isActive = location.pathname === item.route;
        return (
          <button
            key={idx}
            onClick={() => navigate(item.route)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-200
              ${isActive
                ? "bg-yellow-400 text-black scale-110 shadow-lg"
                : "bg-white/10 text-white hover:bg-white/20 hover:scale-105"
              }`}
            title={item.label}
          >
            {item.icon}
          </button>
        );
      })}
    </div>
  );
}
