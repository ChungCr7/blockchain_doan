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
import TransactionHistoryPage from "./pages/TransactionHistoryPage"; // ✅ Thêm trang lịch sử

function App() {
  const {
    account,
    contract,
    form,
    setForm,
    createNFT,
    listedNFTs,
    buyNFT,
  } = useMarketplace();

  return (
    <Router>
      <div className="bg-gray-950 text-white min-h-screen flex flex-col">
        <Navbar />

        <main className="pt-24 px-6 max-w-7xl mx-auto flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route
              path="/products"
              element={
                <ProductPage listedNFTs={listedNFTs} buyNFT={buyNFT} />
              }
            />

            <Route
              path="/products/:id"
              element={
                <ProductDetailPage listedNFTs={listedNFTs} buyNFT={buyNFT} />
              }
            />

            <Route
              path="/create"
              element={
                <CreateProduct
                  form={form}
                  setForm={setForm}
                  createNFT={createNFT}
                  contract={contract}
                />
              }
            />

            <Route
              path="/history"
              element={
                <TransactionHistoryPage
                  listedNFTs={listedNFTs}
                  account={account}
                  contract={contract}
                />
              }
            />

            <Route
              path="/market"
              element={<MarketPage />}
            />

            <Route
              path="/collection"
              element={
                <p className="text-center text-xl">
                  🎨 Trang Bộ Sưu Tập (đang phát triển)
                </p>
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
