import { useNavigate } from "react-router-dom";

export default function GachaWheel() {
  const navigate = useNavigate();

  return (
    <div className="fixed mt-10 z-50">
      <div
        onClick={() => navigate("/gacha")}
        className="w-20 h-20  cursor-pointer relative hover:scale-110 transition-transform "
        style={{
          backgroundImage: `url("https://i.postimg.cc/6QZGZ817/ring-103.gif")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* ข้อความตรงกลาง */}
        <div className="flex items-center justify-center">
          <span className="mb-4 text-white text-xs font-bold animate-pulse">สุ่มตัวละคร</span>
        </div>
        
      </div>
    </div>
  );
}
