import {
  initSDK,
  createInstance,
  SepoliaConfig,
} from "@zama-fhe/relayer-sdk/web";

let fheInstance = null;
let initPromise = null;

export async function getFhevmInstance() {
  if (fheInstance) return fheInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await initSDK();
    if (!window.ethereum) throw new Error("MetaMask not detected");
    fheInstance = await createInstance({
      ...SepoliaConfig,
      network: window.ethereum,
    });
    return fheInstance;
  })();

  return initPromise;
}

export function resetInstance() {
  fheInstance = null;
  initPromise = null;
}

// Convert Uint8Array → 0x-prefixed hex string
function toHex(u8) {
  return "0x" + Array.from(u8).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function encryptOrderInputs(
  priceFloat,
  amountFloat,
  contractAddress,
  userAddress,
  instance
) {
  const priceScaled  = BigInt(Math.round(priceFloat * 100));
  const amountScaled = BigInt(Math.round(amountFloat * 1_000_000));

  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.add64(priceScaled);
  input.add64(amountScaled);

  const encrypted = await input.encrypt();

  const priceHandle  = toHex(encrypted.handles[0]);
  const amountHandle = toHex(encrypted.handles[1]);
  const inputProof   = toHex(encrypted.inputProof);

  console.log("[encrypt] priceHandle:", priceHandle);
  console.log("[encrypt] amountHandle:", amountHandle);
  console.log("[encrypt] inputProof:", inputProof);

  return { priceHandle, amountHandle, inputProof };
}