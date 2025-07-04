// src/components/UserInfoHeader.tsx
type User = {
  id: string;
  username: string;
  coin: number;
  freeGachaUse: number;
};

export default function UserInfoHeader() {
  const stored = localStorage.getItem("user");
  const user: User | null = stored ? JSON.parse(stored) : null;

  if (!user) return null;

  return (
    <div className="w-full bg-black/30 text-white px-6 py-3 flex justify-between items-center shadow-md rounded-lg mb-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <img
          src="https://i.postimg.cc/mDgs5Ndz/avatar.png"
          alt="avatar"
          className="w-10 h-10 rounded-full border border-white"
        />
        <span className="text-lg font-bold">{user.username}</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1">
          <img src="/icons/gem.png" className="w-5 h-5" alt="coin" />
          <span>{user.coin}</span>
        </div>
        <div className="flex items-center gap-1">
          <img src="https://www.flaticon.com/free-icons/gem" className="w-5 h-5" alt="free" />
          <span>{user.freeGachaUse} สุ่มฟรี</span>
        </div>
      </div>
    </div>
  );
}
