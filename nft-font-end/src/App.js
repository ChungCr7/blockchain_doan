import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import useMarketplace from "./hooks/useMarketplace";

// Pages
import HomePage from "./pages/HomePage";
import MarketPage from "./pages/MarketPage";
import ProductPage from "./pages/ProductPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CreateProduct from "./pages/CreateProduct";
import TransactionHistoryPage from "./pages/TransactionHistoryPage"; // ✅ thêm trang lịch sử
import LoginPage from "./pages/auth/LoginPage";
import ListNFTPage from "./pages/ListNFTPage";
import CollectionPage from "./pages/CollectionPage";

function App() {
  const {
    account,
    contract,
    form,
    setForm,
    createNFT,
    listedNFTs,
    buyNFT,
    listNFT,
  } = useMarketplace();

  return (
    <Router>
      <div className="bg-gray-950 text-white min-h-screen flex flex-col">
        <Navbar />

        <main className="pt-24 px-6 max-w-7xl mx-auto flex-grow">
          <Routes>
            {/* Trang chủ */}
            <Route path="/" element={<HomePage />} />

            {/* Danh sách NFT (sản phẩm) */}
            <Route
              path="/products"
              element={
                <ProductPage
                  listedNFTs={listedNFTs}
                  buyNFT={buyNFT}
                  account={account}
                />
              }
            />

            {/* Chi tiết NFT */}
            <Route
              path="/products/:id"
              element={
                <ProductDetailPage
                  listedNFTs={listedNFTs}
                  buyNFT={buyNFT}
                />
              }
            />

            {/* Tạo NFT */}
            <Route
              path="/create"
              element={
                <CreateProduct
                  form={form}
                  setForm={setForm}
                  createNFT={createNFT}
                  contract={contract}
                  account={account}
                />
              }
            />

            {/* Thị trường NFT */}
            <Route path="/market" element={<MarketPage />} />

            {/* Bộ sưu tập NFT của người dùng */}
            <Route
              path="/collection"
              element={
                <CollectionPage
                  account={account}
                  contract={contract}
                  listNFT={listNFT}
                />
              }
            />

            {/* Đăng nhập */}
            <Route path="/login" element={<LoginPage />} />

            {/* Đăng bán NFT */}
            <Route
              path="/list"
              element={
                <ListNFTPage
                  contract={contract}
                  account={account}
                  listNFT={listNFT}
                />
              }
            />

            {/* ✅ Lịch sử mua bán NFT */}
            <Route
              path="/history"
              element={
                <TransactionHistoryPage
                  account={account}
                  contract={contract}
                />
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
