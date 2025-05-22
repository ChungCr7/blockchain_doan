import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.js";
import Footer from "./components/Footer.js"; // ✅ Thêm dòng này
import NFTForm from "./pages/CreateProduct.js";
import useMarketplace from "./hooks/useMarketplace";

import HomePage from "./pages/HomePage";
import MarketPage from "./pages/MarketPage";
import ProductPage from "./pages/ProductPage";
import ProductDetailPage from "./pages/ProductDetailPage";

function App() {
  const { form, listedNFTs, setForm, createNFT, buyNFT } = useMarketplace();

  return (
    <Router>
      <div className="bg-gray-950 text-white min-h-screen flex flex-col">
        <Navbar />
        <main className="pt-24 px-6 max-w-7xl mx-auto flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/products"
              element={<ProductPage listedNFTs={listedNFTs} buyNFT={buyNFT} />}
            />
            <Route
              path="/products/:id"
              element={<ProductDetailPage listedNFTs={listedNFTs} buyNFT={buyNFT} />}
            />
            <Route
              path="/create"
              element={<NFTForm form={form} setForm={setForm} createNFT={createNFT} />}
            />
            <Route
              path="/collection"
              element={<p className="text-center text-xl">🎨 Trang Bộ Sưu Tập (đang phát triển)</p>}
            />
            <Route path="/market" element={<MarketPage />} />
          </Routes>
        </main>
        <Footer /> {/* ✅ Thêm footer ở đây */}
      </div>
    </Router>
  );
}

export default App;
