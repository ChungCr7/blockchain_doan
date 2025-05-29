import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      const { token } = res.data;
      localStorage.setItem("token", token);
      alert("✅ Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi.");
    }
  };

  return (
    <section className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-gray-800 p-12 rounded-lg shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold mb-2">🔐 Đăng nhập</h2>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
          >
            🚀 Đăng nhập
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-300">
          <a href="/forgot-password" className="text-yellow-400 hover:underline">
            Quên mật khẩu?
          </a>
          <br />
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-yellow-400 hover:underline font-medium">
            Đăng ký ngay
          </a>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
