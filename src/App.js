import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import NFTForm from "./components/marketplace/NFTForm";
import useMarketplace from "./hooks/useMarketplace";

import HomePage from "./pages/HomePage";
import MarketPage from "./pages/MarketPage";
import ProductPage from "./pages/ProductPage";
import ProductDetailPage from "./pages/ProductDetailPage"; // ✅ Thêm dòng này

function App() {
  const { form, listedNFTs, setForm, createNFT, buyNFT } = useMarketplace();

  return (
    <Router>
      <div className="bg-gray-950 text-white min-h-screen">
        <Navbar />
        <div className="pt-24 px-6 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/products"
              element={<ProductPage listedNFTs={listedNFTs} buyNFT={buyNFT} />}
            />
            <Route
              path="/products/:id"
              element={<ProductDetailPage listedNFTs={listedNFTs} buyNFT={buyNFT} />} // ✅ Route chi tiết sản phẩm
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
        </div>
      </div>
    </Router>
  );
}

export default App;
