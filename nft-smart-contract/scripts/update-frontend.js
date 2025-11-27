const fs = require("fs");
const path = require("path");

// ĐÚNG PATH (lùi 2 cấp từ /scripts/)
const FRONT_END_ABI_PATH =
  "../../nft-font-end/src/contract/NFTMarketplaceABI.json";

const FRONT_END_CONSTANT_PATH =
  "../../nft-font-end/src/constants/contract.js";

async function updateFrontend(contractAddress) {
  console.log("♻ Updating frontend...");

  // Lấy ABI từ artifacts
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json"
  );

  const abiFile = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = abiFile.abi;

  // Ghi ABI
  fs.writeFileSync(
    path.join(__dirname, FRONT_END_ABI_PATH),
    JSON.stringify(abi, null, 2)
  );
  console.log("✅ ABI updated!");

  // Ghi địa chỉ contract
  const content = `export const CONTRACT_ADDRESS = "${contractAddress}";\n`;
  fs.writeFileSync(
    path.join(__dirname, FRONT_END_CONSTANT_PATH),
    content
  );
  console.log("✅ CONTRACT_ADDRESS updated!");

  console.log("🎉 Frontend synced successfully!");
}

module.exports = { updateFrontend };
