import { motion } from "framer-motion";

type Props = {
  result: {
    character: Character;
    message: string;
  };
  onClose: () => void;
};

type Character = {
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

export default function GachaPopup({ result, onClose }: Props) {
  const { character, message } = result;

  const renderStars = (rarity: number) => {
    return "⭐".repeat(rarity);
  };

  const rarityGlow: Record<number, string> = {
    2: "shadow-md shadow-purple-500/20",
    3: "shadow-lg shadow-purple-500/40",
    4: "shadow-xl shadow-purple-500/70",
    5: "shadow-2xl shadow-yellow-400/80",
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`rounded-xl p-6 text-center w-[22rem] text-white relative border border-purple-600 bg-gradient-to-br from-[#1c0f2e] via-[#2b1d48] to-[#1c0f2e] ${rarityGlow[character.rarity]}`}
      >
        <h2 className="text-2xl font-extrabold mb-3 text-purple-300 drop-shadow-md">
          🚀 {message}
        </h2>

        <motion.img
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          src={character.imageUrl}
          alt={character.name}
          className="w-32 h-32 mx-auto object-contain drop-shadow-xl rounded-lg bg-black border border-purple-800"
        />

        <div className="mt-4">
          <p className="text-xl font-bold text-purple-200">{character.name}</p>
          <p className="text-sm text-purple-400 italic">{character.job}</p>
          <p className="text-lg mt-1 text-yellow-300">{renderStars(character.rarity)}</p>
          <p className="text-sm text-purple-500">🌌 ธาตุ: {character.element}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 text-sm text-left">
          <div className="bg-purple-900/30 rounded p-2 border border-purple-700">❤️ HP: {character.hp}</div>
          <div className="bg-purple-900/30 rounded p-2 border border-purple-700">🗡️ ATK: {character.atk}</div>
          <div className="bg-purple-900/30 rounded p-2 border border-purple-700">🛡️ DEF: {character.def}</div>
          <div className="bg-purple-900/30 rounded p-2 border border-purple-700">⚡ SPD: {character.speed}</div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-full transition shadow-md shadow-purple-500/40"
        >
          🛸 ตกลง
        </button>
      </motion.div>
    </div>
  );
}
