// src/pages/gacha/GachaButton.tsx
import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

export default function GachaButton({ onClick, disabled }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;
    setIsLoading(true);

    // simulate loading effect (2 sec)
    await new Promise((res) => setTimeout(res, 2000));

    onClick(); // call actual gacha
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`relative bg-yellow-400 text-black font-bold py-3 px-8 rounded-full shadow-xl transition-all duration-300 ${
          disabled || isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
        }`}
        whileTap={{
          scale: 0.95,
          rotate: [0, -3, 3, -3, 3, 0],
        }}
      >
        🎰 หมุนกาชา!
      </motion.button>

      {/* หลอดโหลด */}
      {isLoading && (
        <motion.div
          className="w-64 h-3 bg-gray-300 rounded-full overflow-hidden shadow-inner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-yellow-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </div>
  );
}
