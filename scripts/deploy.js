const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("─────────────────────────────────────────");
  console.log("Deploying DarkPool DEX...");
  console.log("Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance: ", ethers.formatEther(balance), "ETH");
  console.log("─────────────────────────────────────────");

  const DarkPool = await ethers.getContractFactory("DarkPool");
  console.log("Deploying contract...");

  const darkPool = await DarkPool.deploy();
  await darkPool.waitForDeployment();

  const address = await darkPool.getAddress();
  const deployTx = darkPool.deploymentTransaction();

  console.log("─────────────────────────────────────────");
  console.log("DarkPool deployed to:", address);
  console.log("Transaction hash:   ", deployTx.hash);
  console.log("─────────────────────────────────────────");

  writeArtifacts(address);

  console.log("\nNext step — add this to your .env:");
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);
  console.log("\nVerify on Etherscan:");
  console.log(`npx hardhat verify --network sepolia ${address}`);
}

function writeArtifacts(address) {
  const abiSource = path.resolve(
    __dirname,
    "../artifacts/contracts/DarkPool.sol/DarkPool.json"
  );

  const abiDir = path.resolve(__dirname, "../src/contracts/abi");

  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  const artifact = JSON.parse(fs.readFileSync(abiSource, "utf8"));

  fs.writeFileSync(
    path.join(abiDir, "DarkPool.json"),
    JSON.stringify(artifact.abi, null, 2)
  );

  const deployInfo = {
    address,
    network: "sepolia",
    chainId: 11155111,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(abiDir, "deployment.json"),
    JSON.stringify(deployInfo, null, 2)
  );

  console.log("\nABI written to:     src/contracts/abi/DarkPool.json");
  console.log("Deployment info:    src/contracts/abi/deployment.json");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
