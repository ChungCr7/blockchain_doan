const fs = require("fs");
const path = require("path");

const artifactPath = path.join(
  __dirname,
  "..",
  "artifacts",
  "contracts",
  "NFTMarketplace.sol",
  "NFTMarketplace.json"
);

const destAbiPath = path.join(
  __dirname,
  "..",
  "..",
  "nft-front-end",
  "src",
  "contract",
  "NFTMarketplaceABI.json"
);

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
fs.writeFileSync(destAbiPath, JSON.stringify(artifact.abi, null, 2));

console.log("ABI updated →", destAbiPath);
