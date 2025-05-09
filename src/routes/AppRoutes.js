import React from "react";
import { Routes, Route } from "react-router-dom";
import WalletInfo from "../components/WalletInfo";
import NFTForm from "../components/NFTForm";
import NFTList from "../components/NFTList";
import ProductPage from "../pages/ProductPage"; // ✅ pages thay vì components
import ProductDetailPage from "../pages/ProductDetailPage"; // ✅ đúng đường dẫn và tên

const AppRoutes = ({ account, form, listedNFTs, setForm, createNFT, buyNFT }) => {
  return (
    <Routes>
      {/* Trang chủ */}
      <Route
        path="/"
        element={
          <>
            <WalletInfo account={account} />
            <div className="my-6 border-t border-gray-700" />
            <NFTList listedNFTs={listedNFTs} buyNFT={buyNFT} />
          </>
        }
      />

      {/* Tạo NFT */}
      <Route
        path="/create"
        element={<NFTForm form={form} setForm={setForm} createNFT={createNFT} />}
      />

      {/* Bộ sưu tập */}
      <Route
        path="/collection"
        element={<p className="text-center text-xl">🎨 Trang Bộ Sưu Tập (đang phát triển)</p>}
      />

      {/* Danh sách sản phẩm */}
      <Route
        path="/products"
        element={<ProductPage listedNFTs={listedNFTs} buyNFT={buyNFT} />}
      />

      {/* Chi tiết sản phẩm */}
      <Route
        path="/products/:id"
        element={<ProductDetailPage listedNFTs={listedNFTs} buyNFT={buyNFT} />}
      />
    </Routes>
  );
};

export default AppRoutes;
