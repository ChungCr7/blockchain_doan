// src/components/Navbar.js
import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white shadow px-6 py-4 flex justify-between items-center fixed top-0 left-0 w-full z-50">
      <div className="text-yellow-400 font-bold text-xl">🪙 NFT Market</div>
      <ul className="flex gap-6 text-sm">
        <li className="hover:text-yellow-300 cursor-pointer">Trang chủ</li>
        <li className="hover:text-yellow-300 cursor-pointer">Thị trường</li>
        <li className="hover:text-yellow-300 cursor-pointer">Tạo NFT</li>
        <li className="hover:text-yellow-300 cursor-pointer">Bộ sưu tập</li>
      </ul>
      <div className="flex gap-3">
        <button className="bg-transparent border border-yellow-400 text-yellow-400 px-4 py-1 rounded hover:bg-yellow-400 hover:text-black">Đăng nhập</button>
        <button className="bg-yellow-400 text-black px-4 py-1 rounded hover:bg-yellow-500">Đăng ký</button>
      </div>
    </nav>
  );
};

export default Navbar;