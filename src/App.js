import React from "react";
import Navbar from "./components/Navbar";
import WalletInfo from "./components/WalletInfo";
import NFTForm from "./components/NFTForm";
import NFTList from "./components/NFTList";
import useMarketplace from "./hooks/useMarketplace";

function App() {
  const { account, form, listedNFTs, setForm, createNFT, buyNFT } = useMarketplace();

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <Navbar />
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <WalletInfo account={account} />
        <div className="my-6 border-t border-gray-700" />
        <NFTForm form={form} setForm={setForm} createNFT={createNFT} />
        <div className="my-6 border-t border-gray-700" />
        <NFTList listedNFTs={listedNFTs} buyNFT={buyNFT} />
      </div>
    </div>
  );
}

export default App;
