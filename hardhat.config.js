require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config");

const privateKey = process.env.PRIVATE_KEY
  ? `0x${process.env.PRIVATE_KEY.replace(/^0x/, "")}`
  : undefined;

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
    },
  },
  networks: {
    sepolia: {
      url:      process.env.SEPOLIA_RPC_URL || "",
      accounts: privateKey ? [privateKey] : [],
      chainId:  11155111,
      timeout:  120000,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  paths: {
    sources:   "./contracts",
    tests:     "./test",
    cache:     "./cache",
    artifacts: "./artifacts",
  },
};
