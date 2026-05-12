// Realistic mock data

export const generateCiphertext = () => {
  const chars = "0123456789abcdef";
  return "0x" + Array.from({ length: 64 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

export const generateOrderId = () =>
  Math.floor(1000 + Math.random() * 9000);

export const MOCK_ORDERS = [
  {
    id: 1024,
    type: "BUY",
    ciphertext: generateCiphertext(),
    amountCipher: generateCiphertext(),
    timestamp: Date.now() - 12000,
    status: "MATCHED",
    txHash: generateCiphertext(),
  },
  {
    id: 1025,
    type: "SELL",
    ciphertext: generateCiphertext(),
    amountCipher: generateCiphertext(),
    timestamp: Date.now() - 8000,
    status: "PENDING",
    txHash: generateCiphertext(),
  },
  {
    id: 1026,
    type: "BUY",
    ciphertext: generateCiphertext(),
    amountCipher: generateCiphertext(),
    timestamp: Date.now() - 3000,
    status: "PENDING",
    txHash: generateCiphertext(),
  },
  {
    id: 1027,
    type: "SELL",
    ciphertext: generateCiphertext(),
    amountCipher: generateCiphertext(),
    timestamp: Date.now() - 1000,
    status: "PROCESSING",
    txHash: generateCiphertext(),
  },
];

export const MEV_LOG_SEQUENCES = [
  { delay: 0,    type: "info",    text: "Mempool scanner initialized..." },
  { delay: 800,  type: "detect",  text: "Detected incoming transaction from 0x7f3a..." },
  { delay: 1600, type: "warn",    text: "Analyzing calldata payload..." },
  { delay: 2400, type: "attack",  text: "Attempting to decode order parameters..." },
  { delay: 3200, type: "error",   text: "ERROR: Data is FHE ciphertext — unreadable" },
  { delay: 4000, type: "error",   text: "ERROR: Price field encrypted — cannot determine order direction" },
  { delay: 4800, type: "error",   text: "ERROR: Amount field encrypted — sandwich attack impossible" },
  { delay: 5600, type: "success", text: "Front-running attempt FAILED ✗" },
  { delay: 6400, type: "info",    text: "Scanning next transaction..." },
  { delay: 7200, type: "detect",  text: "Detected transaction from 0x2b9c..." },
  { delay: 8000, type: "attack",  text: "Attempting gas price manipulation..." },
  { delay: 8800, type: "error",   text: "ERROR: Cannot determine profit opportunity without plaintext" },
  { delay: 9600, type: "success", text: "MEV extraction BLOCKED ✗" },
];

export const truncateHash = (hash, start = 8, end = 6) =>
  hash ? `${hash.slice(0, start)}...${hash.slice(-end)}` : "";

export const timeAgo = (timestamp) => {
  const s = Math.floor((Date.now() - timestamp) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};
