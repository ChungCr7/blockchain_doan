// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import WalletInfo from "./components/WalletInfo";
import NFTForm from "./components/NFTForm";
import NFTList from "./components/NFTList";
import useMarketplace from "./hooks/useMarketplace";
import MarketPage from "./pages/MarketPage";

function App() {
  const { account, form, listedNFTs, setForm, createNFT, buyNFT } = useMarketplace();

  return (
    <Router>
      <div className="bg-gray-950 text-white min-h-screen">
        <Navbar />
        <div className="pt-24 px-6 max-w-7xl mx-auto">
          <Routes>
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
            <Route
              path="/create"
              element={<NFTForm form={form} setForm={setForm} createNFT={createNFT} />}
            />
            <Route
              path="/collection"
              element={<p className="text-center text-xl">🎨 Trang Bộ Sưu Tập (đang phát triển)</p>}
            />
            <Route
              path="/market"
              element={<MarketPage />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
