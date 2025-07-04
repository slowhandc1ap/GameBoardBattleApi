import { useEffect, useState } from "react";

interface Character {
  name: string;
  rarity: number;
  imageUrl: string;
}

const mockCharacters: Character[] = [
  {
    name: "ผู้ปกป้องประตูมิติ",
    rarity: 4,
    imageUrl: "https://i.postimg.cc/c4x6Jgc1/image.gif",
  },
  {
    name: "ผู้พิพากษาประจำดวงอาทิตย์",
    rarity: 5,
    imageUrl: "https://i.postimg.cc/wBmjrh92/image.gif",
  },
  {
    name: "จ่าร้อยหน่วยต่อต้านเอเลี่ยน",
    rarity: 3,
    imageUrl: "https://i.postimg.cc/MZbvxbVr/image.gif",
  },
  {
    name: "คาวบอยดาวเสาร์",
    rarity: 3,
    imageUrl: "https://i.postimg.cc/prZTZRPt/image.gif",
  },
  {
    name: "หมูทะจากกรีน",
    rarity: 4,
    imageUrl: "https://i.postimg.cc/MGQDQxyj/9.gif",
  },
];

const getRarityColor = (rarity: number): string => {
  switch (rarity) {
    case 5:
      return "text-yellow-400";
    case 4:
      return "text-purple-400";
    case 3:
      return "text-blue-400";
    case 2:
      return "text-green-400";
    case 1:
      return "text-gray-400";
    default:
      return "text-white";
  }
};

const getRarityGlow = (rarity: number): string => {
  switch (rarity) {
    case 5:
      return "bg-yellow-400";
    case 4:
      return "bg-purple-400";
    case 3:
      return "bg-blue-400";
    case 2:
      return "bg-green-400";
    case 1:
      return "bg-gray-400";
    default:
      return "bg-white";
  }
};

const MetaCharacter: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white flex flex-col items-center p-6">
      {/* Meta Characters Section */}
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-transparent  bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 text-center">
          🌌 เมตาตัวละครประจำเกม!
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {mockCharacters.map((char, idx) => (
            <div
              key={idx}
              className={`rounded-lg overflow-hidden shadow-md transform transition-all duration-300 hover:scale-105 ${
                loading ? "bg-gray-800 animate-pulse" : "bg-gray-800"
              }`}
            >
              <div className="relative h-32 bg-black/30 flex items-center justify-center">
                <img
                  src={char.imageUrl}
                  alt={char.name}
                  className="w-20 h-20 object-contain"
                />
                <div
                  className={`absolute bottom-0 right-0 w-6 h-6 rounded-full ${getRarityGlow(
                    char.rarity
                  )} blur-sm`}
                ></div>
                <div
                  className={`absolute bottom-0 right-0 w-6 h-6 rounded-full ${getRarityColor(
                    char.rarity
                  )}`}
                ></div>
              </div>
              {!loading && (
                <div className="p-2">
                  <p className="text-xs font-bold text-center truncate">{char.name}</p>
                  <p className={`text-xs text-center ${getRarityColor(char.rarity)} mt-1`}>
                    ⭐ {char.rarity} ดาว
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {loading && (
        <p className="mt-8 text-xl text-yellow-400 animate-bounce">🌀 กำลังโหลดเมตา...</p>
      )}
      {!loading && (
        <p className="mt-6 text-gray-300 italic">ขอบคุณที่สนับสนุนเกมของเรา!</p>
      )}
    </div>
  );
};

export default MetaCharacter;