import React, { useEffect, useState, useContext } from "react";
import { WalletContext } from "../context/WalletContext";

const TransactionHistoryPage = ({ contract }) => {
  const { account } = useContext(WalletContext);
  const [sales, setSales] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🕒 Chuyển timestamp -> giờ VN
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  };

  // ⚙️ Đổi Wei -> ETH
  const renderETH = (wei) => {
    if (!wei) return "0 ETH";
    const eth = Number(wei) / 1e18;
    return `${eth.toFixed(4)} ETH`;
  };

  // 🔍 Lấy lịch sử từ blockchain
  useEffect(() => {
    const fetchHistory = async () => {
      if (!contract || !account) return;
      setLoading(true);

      try {
        // Lấy toàn bộ event NFTSale
        const saleEvents = await contract.getPastEvents("NFTSale", {
          fromBlock: 0,
          toBlock: "latest",
        });

        // Lấy toàn bộ event NFTListed
        const listedEvents = await contract.getPastEvents("NFTListed", {
          fromBlock: 0,
          toBlock: "latest",
        });

const getBlockTime = async (blockNumber) => {
  const hexBlock = "0x" + blockNumber.toString(16); // 🔥 thêm '0x' đầu vào
  const block = await window.ethereum.request({
    method: "eth_getBlockByNumber",
    params: [hexBlock, false],
  });
  return parseInt(block.timestamp, 16);
};


        // --- Xử lý NFTSale ---
        const mySales = await Promise.all(
          saleEvents
            .filter(
              (e) =>
                e.returnValues.buyer.toLowerCase() === account.toLowerCase() ||
                e.returnValues.seller?.toLowerCase() === account.toLowerCase()
            )
            .map(async (e) => {
              const time = await getBlockTime(e.blockNumber);
              return {
                tokenId: Number(e.returnValues.tokenId),
                buyer: e.returnValues.buyer,
                seller: e.returnValues.seller,
                price: Number(e.returnValues.price),
                fee: Number(e.returnValues.fee),
                txHash: e.transactionHash,
                timestamp: time,
              };
            })
        );

        // --- Xử lý NFTListed ---
        const myListings = await Promise.all(
          listedEvents
            .filter(
              (e) =>
                e.returnValues.seller?.toLowerCase() === account.toLowerCase()
            )
            .map(async (e) => {
              const time = await getBlockTime(e.blockNumber);
              return {
                tokenId: Number(e.returnValues.tokenId),
                price: Number(e.returnValues.price),
                seller: e.returnValues.seller,
                txHash: e.transactionHash,
                timestamp: time,
              };
            })
        );

        setSales(mySales.reverse());
        setListings(myListings.reverse());
      } catch (error) {
        console.error("❌ Lỗi khi lấy lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [contract, account]);

  // 🖥️ Giao diện
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-3xl font-bold text-yellow-400 text-center mb-8">
        📜 Lịch sử giao dịch NFT
      </h2>

      {!account ? (
        <p className="text-center text-gray-400">
          ⚠️ Vui lòng kết nối ví để xem lịch sử.
        </p>
      ) : loading ? (
        <p className="text-center text-gray-400">⏳ Đang tải dữ liệu...</p>
      ) : (
        <div className="max-w-5xl mx-auto space-y-10">
          {/* --- NFT đã đăng bán --- */}
          <div>
            <h3 className="text-xl font-semibold text-yellow-300 mb-3">
              🏷 NFT bạn đã đăng bán
            </h3>
            {listings.length === 0 ? (
              <p className="text-gray-500">Bạn chưa đăng bán NFT nào.</p>
            ) : (
              <table className="w-full border-collapse border border-gray-700 text-left">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="border border-gray-700 p-2">Token ID</th>
                    <th className="border border-gray-700 p-2">Giá bán</th>
                    <th className="border border-gray-700 p-2">Thời gian</th>
                    <th className="border border-gray-700 p-2">Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-800">
                      <td className="border border-gray-700 p-2">
                        #{item.tokenId}
                      </td>
                      <td className="border border-gray-700 p-2">
                        {renderETH(item.price)}
                      </td>
                      <td className="border border-gray-700 p-2 text-gray-400">
                        {formatTimestamp(item.timestamp)}
                      </td>
                      <td className="border border-gray-700 p-2 text-blue-400 truncate max-w-[200px]">
                        <a
                          href={`https://sepolia.etherscan.io/tx/${item.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.txHash.slice(0, 20)}...
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* --- NFT đã mua / giao dịch --- */}
          <div>
            <h3 className="text-xl font-semibold text-green-300 mb-3">
              💰 NFT bạn đã mua / giao dịch
            </h3>
            {sales.length === 0 ? (
              <p className="text-gray-500">Bạn chưa mua NFT nào.</p>
            ) : (
              <table className="w-full border-collapse border border-gray-700 text-left">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="border border-gray-700 p-2">Token ID</th>
                    <th className="border border-gray-700 p-2">Người bán</th>
                    <th className="border border-gray-700 p-2">Giá mua</th>
                    <th className="border border-gray-700 p-2">Phí (2.5%)</th>
                    <th className="border border-gray-700 p-2">Thời gian</th>
                    <th className="border border-gray-700 p-2">Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-800">
                      <td className="border border-gray-700 p-2">
                        #{item.tokenId}
                      </td>
                      <td className="border border-gray-700 p-2 text-gray-300">
                        {item.seller
                          ? item.seller.slice(0, 8) + "..."
                          : "—"}
                      </td>
                      <td className="border border-gray-700 p-2">
                        {renderETH(item.price)}
                      </td>
                      <td className="border border-gray-700 p-2 text-gray-400">
                        {renderETH(item.fee)}
                      </td>
                      <td className="border border-gray-700 p-2 text-gray-400">
                        {formatTimestamp(item.timestamp)}
                      </td>
                      <td className="border border-gray-700 p-2 text-blue-400 truncate max-w-[200px]">
                        <a
                          href={`https://sepolia.etherscan.io/tx/${item.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.txHash.slice(0, 20)}...
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryPage;
