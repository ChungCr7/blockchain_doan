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
import TransactionHistoryPage from "./pages/TransactionHistoryPage";
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
            <Route path="/" element={<HomePage />} />

            <Route
              path="/products"
              element={
                <ProductPage
                  listedNFTs={listedNFTs}
                  buyNFT={buyNFT}
                  account={account} // ✅ ĐÃ FIX
                />
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
                  account={account}
                />
              }
            />

            <Route path="/market" element={<MarketPage />} />

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

            <Route path="/login" element={<LoginPage />} />

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
<Route path="/history" element={<TransactionHistoryPage account={account} contract={contract} listNFT={listNFT} />} />

          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
