import React from "react";
import WalletInfo from "./components/WalletInfo";
import NFTForm from "./components/NFTForm";
import NFTList from "./components/NFTList";
import useMarketplace from "./hooks/useMarketplace";

function App() {
  const { account, form, listedNFTs, setForm, createNFT, buyNFT } = useMarketplace();

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h1>🛒 NFT Marketplace</h1>
      <WalletInfo account={account} />
      <hr />
      <NFTForm form={form} setForm={setForm} createNFT={createNFT} />
      <hr />
      <NFTList listedNFTs={listedNFTs} buyNFT={buyNFT} />
    </div>
  );
}

export default App;
