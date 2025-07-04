
import { motion } from "framer-motion";

type VictoryPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  winnerTeam: {
    name: string;
    user: { username: string };
  } | null;
  loserTeam: {
    name: string;
    user: { username: string };
  } | null;
};

const VictoryPopup = ({ isOpen, onClose, winnerTeam, loserTeam }: VictoryPopupProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="bg-[#1a1a1a] text-white p-6 rounded-lg border-2 border-[#333] shadow-lg font-prompt"
      >
        <h2 className="text-2xl font-bold mb-4 text-[#ffd700]">🎉 ผลการต่อสู้!</h2>
        <p className="mb-2">ทีมผู้ชนะ: <strong>{winnerTeam?.name} ({winnerTeam?.user.username})</strong></p>
        <p className="mb-4">ทีมที่พ่ายแพ้: <strong>{loserTeam?.name} ({loserTeam?.user.username})</strong></p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#00b7eb] text-white rounded-lg font-prompt hover:bg-[#00a0cc]"
        >
          ปิด
        </button>
      </motion.div>
    </motion.div>
  );
};

export default VictoryPopup;
