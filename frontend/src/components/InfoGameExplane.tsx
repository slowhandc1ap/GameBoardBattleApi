
import { motion } from 'framer-motion';


// 🧠 เพิ่ม Popup อธิบายการเล่นแบบสวยงามขึ้น
export default function GameInfoPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center backdrop-blur-sm ">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-purple-800 to-gray-900 text-white p-8 rounded-2xl max-w-2xl w-[95vw] shadow-2xl border-2 border-purple-600 relative "
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl hover:text-red-400 transition-colors"
        >
          ✖
        </button>
        <h2 className="text-3xl font-extrabold text-purple-300 mb-6 text-center drop-shadow-lg">
          🎮 วิธีเล่นเกม Battle Arena
        </h2>
        <div className="space-y-4 text-base leading-relaxed text-gray-200">
          <p>✅ <span className="font-semibold text-white">1. สร้างทีม:</span> คุณสามารถจัดทีมตัวละครได้สูงสุด 3 ตัวต่อทีม</p>
          <p>🛡 <span className="font-semibold text-white">2. ตั้งทีมตั้งรับ:</span> กำหนดทีมป้องกันของคุณโดยเลือกทีมแล้วกดปุ่ม <span className="text-green-400 font-semibold">"⚔ ตั้งเป็นทีมตั้งรับ"</span></p>
          <p>🎯 <span className="font-semibold text-white">3. ระบบ PVP:</span> ผู้เล่นคนอื่นจะ <span className="underline">เจอทีมตั้งรับของคุณ</span> เมื่อทำการสุ่มเจอในโหมด PVP</p>
          <p className="text-yellow-300">⚠️ หากคุณ <u>ไม่ได้ตั้งทีมตั้งรับ</u> จะไม่สามารถเล่น PVP ได้นะครับ!</p>
          <p>💰 <span className="font-semibold text-white">4. รางวัล:</span> หากคุณชนะในการต่อสู้จะได้รับ <span className="text-green-400 font-bold">เหรียญ</span> สำหรับนำไปหมุนกาชาเพื่อรับตัวละครใหม่</p>
          <p>🚩 <span className="font-semibold text-white line-through" >5. โหมดการเล่น:</span> ตอนนี้เปิดให้เล่นเฉพาะโหมด <span className="text-yellow-300 font-bold line-through">PVP</span> เท่านั้น (โหมดบอทยังไม่เปิดใช้งาน)</p>
        </div>
      </motion.div>
    </div>
  );
}
