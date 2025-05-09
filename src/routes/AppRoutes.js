// src/routes/AppRoutes.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import WalletInfo from "../components/WalletInfo";
import NFTForm from "../components/NFTForm";
import NFTList from "../components/NFTList";

const AppRoutes = ({ account, form, listedNFTs, setForm, createNFT, buyNFT }) => {
  return (
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
    </Routes>
  );
};

export default AppRoutes;
