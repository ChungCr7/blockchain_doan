// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white shadow px-6 py-4 flex justify-between items-center fixed top-0 left-0 w-full z-50">
      <Link to="/" className="text-yellow-400 font-bold text-xl">🪙 NFT Market</Link>
      <ul className="flex gap-6 text-sm">
        <li><Link to="/" className="hover:text-yellow-300">Trang chủ</Link></li>
        <li><Link to="/create" className="hover:text-yellow-300">Tạo NFT</Link></li>
         <li><Link to="/products" className="hover:text-yellow-300">Sản phẩm</Link></li> 
        <li><Link to="/market" className="hover:text-yellow-300">Thị trường</Link></li>
        <li><Link to="/collection" className="hover:text-yellow-300">Bộ sưu tập</Link></li>
      </ul>
      <div className="flex gap-3">
        <button className="bg-transparent border border-yellow-400 text-yellow-400 px-4 py-1 rounded hover:bg-yellow-400 hover:text-black">Đăng nhập</button>
        <button className="bg-yellow-400 text-black px-4 py-1 rounded hover:bg-yellow-500">Đăng ký</button>
      </div>
    </nav>
  );
};

export default Navbar;