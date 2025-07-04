import { motion } from "framer-motion";
import { useState } from "react";


const packages = [
  { id: 1, name: "แพ็คเกจเริ่มต้น", price: 100, coins: 100 },
  { id: 2, name: "มือใหม่ไฟแรง", price: 200, coins: 220 },
  { id: 3, name: "สายเปย์", price: 500, coins: 600 },
  { id: 4, name: "เทพทรู", price: 1000, coins: 1300 },
];

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const handlePay = async () => {
    if (selected === null) return;
    const pack = packages.find((p) => p.id === selected);
    if (!pack) return;

    const userData = localStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;
        const userId = user?.id || null;
        
        console.log("userId frontend:", userId);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: { name: pack.name, price: pack.price, quantity: 1 },
          information: { name: "เหรียญ", address: "Bangkok" },
          userId: userId
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("ไม่สามารถสร้าง session ได้");
        console.error(data);
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen  bg-[url('/images/bg1.jpg')] bg-cover bg-center flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-3xl w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">💸 เลือกแพ็คเกจ Coin</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {packages.map((pack) => (
            <motion.div
              key={pack.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelected(pack.id)}
              className={`cursor-pointer border rounded-xl p-4 shadow-md transition-all ${
                selected === pack.id
                  ? "bg-blue-100 border-blue-500"
                  : "bg-white hover:border-gray-400"
              }`}
            >
              <h2 className="font-bold text-lg text-gray-700">{pack.name}</h2>
              <p className="text-sm text-gray-500 mt-1">💰 {pack.price} บาท</p>
              <p className="text-xl mt-2 text-green-600 font-bold">+{pack.coins} Coin</p>
            </motion.div>
          ))}
        </div>
       

        <motion.button
          onClick={handlePay}
          whileTap={{ scale: 0.95 }}
          disabled={loading || selected === null}
          className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white text-lg font-semibold py-3 rounded-xl shadow-lg transition disabled:opacity-50"
        >
          {loading
            ? "กำลังดำเนินการ..."
            : selected !== null
            ? `🛒 จ่าย ${packages.find((p) => p.id === selected)?.price}฿`
            : "กรุณาเลือกแพ็คเกจ"}
        </motion.button>

        {selected !== null && (
          <p className="text-sm text-gray-500 mt-2">
            🎁 แพ็คเกจที่เลือก: <strong>{packages.find((p) => p.id === selected)?.name}</strong>
          </p>
        )}

        
      </div>
    </motion.div>
  );
}

