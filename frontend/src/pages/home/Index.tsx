import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'เกิดข้อผิดพลาด');
      }



      const { token, user } = await res.json(); // ✅ ดึง user ด้วย

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); // ✅ เซฟ user ลง localStorage

      console.log("✅ Login Success:", { token, user });

      navigate('/lobby');

    } catch (err: any) {
      alert(err.message || "Login failed");
      console.error("❌ Login error:", err);
    }
  };

  const handleGoogleLogin = () => {
    // 👉 redirect ไปที่ backend Google OAuth (passport)
    window.location.href = 'http://localhost:3000/api/auth/google';

  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center"
      style={{ backgroundImage: "url('/images/bg-2.gif')" }}
    >
      <div className='mb-10 animate-pulse'>
      <img src="/images/logo-text=lobby.png" alt="Game Battle Logo" />
      </div>
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md ">
        
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">เข้าสู่ระบบ</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">อีเมล</label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">รหัสผ่าน</label>
            <input
              id="password"
              type="password"
              className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm">ยังไม่มีบัญชี?</span>
          <Link to="/register" className="text-sm text-blue-500 hover:underline">สมัครสมาชิก</Link>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50 transition"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            <span>เข้าสู่ระบบด้วย Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
