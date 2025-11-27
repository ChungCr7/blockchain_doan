const hre = require("hardhat");
const { updateFrontend } = require("./update-frontend");

async function main() {
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const contract = await NFTMarketplace.deploy();

  console.log("⏳ Deploying contract...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ Contract deployed to:", address);

  // 🔥 auto update frontend
  await updateFrontend(address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
