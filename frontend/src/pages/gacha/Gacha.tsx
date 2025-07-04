// src/pages/gacha/Index.tsx
import { useState } from "react";
import GachaButton from "./GachaButton";
import GachaPopup from "./GachaPopup";
import MetaCharacter from "./MetaCharacter";
import UserInfoHeader from "./UserInfo";


export default function GachaPage() {
  const [result, setResult] = useState<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleDraw = async () => {
    setIsDrawing(true);

    const savedUser = localStorage.getItem("user");
    const userId = savedUser ? JSON.parse(savedUser).id : null;

    if (!userId) {
      alert("กรุณาเข้าสู่ระบบก่อนสุ่มกาชา");
      setIsDrawing(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/gacha/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      setResult(data);

      // 🔁 อัปเดต user info ใน localStorage
      if (data.freeGachaLeft !== undefined && data.coinLeft !== undefined) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...user,
          freeGachaUse: data.freeGachaLeft,
          coin: data.coinLeft,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("สุ่มไม่ผ่าน", err);
    } finally {
      setTimeout(() => {
        setIsDrawing(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen  bg-[url('/images/bg-galaxy.gif')] bg-cover bg-center text-white py-6 px-4 flex flex-col items-center">
      {/* Header User */}
      <UserInfoHeader />

      {/* กล่องกลาง */}
      <div className="w-full max-w-4xl bg-transparent rounded-lg shadow-md p-6 mt-4">
        <h1 className="text-2xl font-bold text-center mb-4">
          🌌 ระบบกาชาแห่งจักรวาล
        </h1>

        {/* Preview ตัวละคร (mockup) */}
        <MetaCharacter />

        {/* ปุ่มสุ่ม */}
        <div className="flex justify-center mt-6">
          <GachaButton onClick={handleDraw} disabled={isDrawing} />
        </div>

        {/* สถานะขณะสุ่ม */}
        {isDrawing && (
          <p className="text-center mt-4 text-sm animate-pulse">🌀 กำลังสุ่ม...</p>
        )}
      </div>

      {/* Popup แสดงผล */}
      {result && !isDrawing && (
        <GachaPopup result={result} onClose={() => setResult(null)} />
      )}

      <div className="button"></div>
      
    </div>
  );
}
