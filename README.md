# 🔒 DarkPool DEX

> A privacy-preserving dark pool exchange built with Zama FHEVM — where order
> prices and amounts are **fully encrypted on-chain**, making front-running and
> MEV extraction structurally impossible.

[![Sepolia](https://img.shields.io/badge/network-Sepolia-blue?logo=ethereum)](https://sepolia.etherscan.io)
[![FHEVM](https://img.shields.io/badge/encryption-Zama%20FHEVM-purple)](https://github.com/zama-ai/fhevm)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## The Problem

Every order on a transparent DEX is visible in the mempool **before it settles**.
MEV bots read the price, direction, and size — then front-run or sandwich the
trade, extracting value from legitimate users.

In 2023 alone, MEV bots extracted over **$1.38 billion** from Ethereum users.
This is a structural problem that requires a cryptographic solution.

---

## The Solution

DarkPool DEX uses **Fully Homomorphic Encryption (FHE)** via Zama's FHEVM to:

- Encrypt order prices and amounts **client-side** before broadcast
- Store only ciphertext on-chain — no plaintext ever touches the network
- Match orders using **encrypted comparisons** (no decryption required)
- Make MEV impossible: bots see ciphertext, cannot determine trade direction

```
User browser          Mempool              Smart Contract
──────────────        ──────────────       ──────────────────────────
price = 3241.50  →   0x7f3a9b2e...   →   TFHE.ge(encBuy, encSell)
amount = 2.5 ETH →   0x2b9c4a1f...   →   Gateway.requestDecryption()
```

---

## Architecture

```
src/
├── components/
│   ├── dashboard/
│   │   ├── OrderForm.jsx         # Encrypted order submission UI
│   │   ├── EncryptedOrderFeed.jsx # Live order feed (no plaintext)
│   │   ├── MevBotMonitor.jsx     # MEV simulation demo
│   │   └── MevComparison.jsx     # Side-by-side DEX comparison
│   ├── layout/
│   │   └── Navbar.jsx
│   └── ui/
│       └── WalletButton.jsx
├── context/
│   ├── WalletContext.jsx         # MetaMask + ethers v6
│   └── FhevmContext.jsx          # FHEVM instance lifecycle
├── hooks/
│   └── useContract.js            # On-chain order submission + event listening
├── lib/
│   ├── fhevm.js                  # TFHE encryption helpers
│   └── mockData.js               # Fallback mock data
└── pages/
    ├── LandingPage.jsx
    ├── Dashboard.jsx
    ├── MyOrders.jsx
    └── About.jsx

contracts/
└── DarkPool.sol                  # FHEVM Solidity contract
```

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS        |
| Animations  | Framer Motion                       |
| Wallet      | MetaMask, ethers v6                 |
| Encryption  | Zama FHEVM, fhevmjs                 |
| Contract    | Solidity 0.8.24, TFHE euint64       |
| Network     | Ethereum Sepolia testnet            |
| Matching    | FHE homomorphic comparison + Gateway|

---

 Quick Start

### Prerequisites

- Node.js ≥ 18
- MetaMask browser extension
- Sepolia ETH [faucet](https://sepoliafaucet.com)
- Alchemy or Infura Sepolia RPC URL

# Installation

```bash
git clone github.com https://github.com/SirArlex/dark_pool-dex
cd dark-pool-dex
npm install
```

# Environment Setup

Create a `.env` file in the project root:

```env
# Sepolia RPC (Alchemy / Infura)
SEPOLIA_RPC_URL=[eth-sepolia.g.alchemy.com](https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY)

# Deployer wallet private key (no 0x prefix)
PRIVATE_KEY=your64charPrivateKeyHere

# Etherscan verification (optional)
ETHERSCAN_API_KEY=your_key

# Auto-filled by deploy script
VITE_CONTRACT_ADDRESS=
```

### Deploy Contract

```bash
# Compile
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia

# Copy the printed address into .env as VITE_CONTRACT_ADDRESS=0x...

# Optional: verify on Etherscan
npx hardhat verify --network sepolia 0xYourContractAddress
```

 Run Frontend

```bash
npm run dev
# → [localhost](http://localhost:5173)
```

---

## How It Works

### 1. Client-Side Encryption

```js
// fhevm.js
const input = fhevmInstance.createEncryptedInput(contractAddress, userAddress);
input.add64(BigInt(priceScaled));   // e.g. 324150 (= $3241.50)
input.add64(BigInt(amountScaled));  // e.g. 2500000 (= 2.5 ETH)
const { handles, inputProof } = await input.encrypt();
```

Raw values never leave the browser. Only ciphertext handles are sent.

2. On-Chain Encrypted Storage

```solidity
function submitOrder(
    OrderSide side,
    einput encPriceInput,
    einput encAmountInput,
    bytes calldata inputProof
) external {
    euint64 encPrice  = TFHE.asEuint64(encPriceInput, inputProof);
    euint64 encAmount = TFHE.asEuint64(encAmountInput, inputProof);
    // Stored as ciphertext — never decrypted inside the contract
}
```

 3. Encrypted Order Matching

```solidity
// No plaintext comparison — operates entirely on ciphertext
ebool priceMatches = TFHE.ge(buyOrder.encPrice, sellOrder.encPrice);

// Gateway decrypts only the boolean result to finalize settlement
Gateway.requestDecryption(cts, this.matchCallback.selector, ...);
```

 4. MEV Resistance

A bot scanning the mempool sees:

```
calldata: 0x7f3a9b2e1c4d8f6a2b9c4a1f7e3d2a9b...
```

Without the private key, the price and amount are computationally irreversible.
There is no profit opportunity to calculate, so front-running is impossible by design.

---

 Demo Flow 

1. Landing page — walk through the MEV problem visual
2. Launch DApp — connect MetaMask on Sepolia
3. MEV Bot Monitor — click "Launch Bot", watch attack logs fail in real time
4. Submit an order — enter price + amount, observe TFHE encryption step
5. Order feed — encrypted ciphertext appears, no plaintext visible
6. My Orders — all values remain encrypted, only status is public
7. Key message — *"We didn't build a private mempool. We made the mempool useless."*

---

 Contract Interface

```solidity
// Submit an encrypted order
function submitOrder(
    OrderSide side,         // 0=BUY, 1=SELL
    einput encPriceInput,   // TFHE handle
    einput encAmountInput,  // TFHE handle
    bytes calldata inputProof
) external returns (uint256 orderId);

// Read public order metadata (no price/amount exposed)
function getOrderMeta(uint256 orderId) external view returns (
    address owner,
    OrderSide side,
    uint256 timestamp,
    OrderStatus status      // PENDING=0, MATCHED=1, CANCELLED=2
);

function getTotalOrders()      external view returns (uint256);
function getPendingBuyCount()  external view returns (uint256);
function getPendingSellCount() external view returns (uint256);
```

---

## Privacy Guarantees

| Property                    | Guarantee                              |
|-----------------------------|----------------------------------------|
| Order price                 | Never stored or compared in plaintext  |
| Order amount                | Never stored or compared in plaintext  |
| Match result                | Only a boolean is decrypted via Gateway|
| Public orderbook            | Does not exist                         |
| MEV opportunity             | Structurally impossible                |
| Who can decrypt your order  | Only you, via FHEVM Gateway ACL        |

---

 Known Limitations (MVP Scope)

- Single trading pair (ETH/USDC conceptual)
- FIFO matching only (latest buy vs. latest sell)
- No on-chain settlement of actual token transfers
- No slippage protection or partial fills
- FHEVM operations are gas-intensive (~10–50× normal)
- Gateway decryption introduces ~1–2 block latency on match confirmation

These are intentional MVP trade-offs as the goal is demonstrating the
privacy model, not building a production exchange.

---

 License

MIT © 2025 DarkPool DEX
