import { useEffect, useCallback } from "react";
import { Contract } from "ethers";
import { useWallet } from "../context/WalletContext";
import { useFhevm } from "../context/FhevmContext";
import DarkPoolABI from "../contracts/abi/DarkPool.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

export function useMatchFinalizer() {
  const { provider, signer } = useWallet();
  const { instance } = useFhevm();

 const finalizeMatch = useCallback(async (matchId, resultHandle) => {
  if (!signer || !instance || !CONTRACT_ADDRESS) {
    console.warn("[Match] Missing signer, instance, or contract address");
    return;
  }

  try {
    console.log(`[Match] Requesting public decryption for matchId=${matchId}`);

    const result = await instance.publicDecrypt([resultHandle]);
    console.log("[Match] publicDecrypt result:", result);

    // SDK returns { clearValues, abiEncodedClearValues, decryptionProof } at top level
    const { abiEncodedClearValues, decryptionProof } = result;

    if (!abiEncodedClearValues || !decryptionProof) {
      console.error("[Match] Missing abiEncodedClearValues or decryptionProof:", result);
      return;
    }

    console.log("[Match] abiEncodedClearValues:", abiEncodedClearValues);
    console.log("[Match] decryptionProof:", decryptionProof);

    const contract = new Contract(CONTRACT_ADDRESS, DarkPoolABI, signer);
    const tx = await contract.finalizeMatch(
      matchId,
      abiEncodedClearValues,
      decryptionProof
    );
    console.log(`[Match] finalizeMatch tx sent: ${tx.hash}`);
    await tx.wait();
    console.log(`[Match] Match ${matchId} finalized ✅`);

  } catch (e) {
    console.error(`[Match] Error for matchId ${matchId}:`, e.message, e);
  }
}, [signer, instance]);
  useEffect(() => {
    if (!provider || !CONTRACT_ADDRESS) return;

    const contract = new Contract(CONTRACT_ADDRESS, DarkPoolABI, provider);

    const onMatchRequested = async (matchId, buyId, sellId, resultHandle) => {
      console.log(`[Match] 🔔 MatchRequested #${matchId} buy#${buyId} ↔ sell#${sellId}`);
      console.log(`[Match] resultHandle: ${resultHandle}`);

      // Wait for KMS to process the decryption
      await new Promise(r => setTimeout(r, 5000));
      await finalizeMatch(Number(matchId), resultHandle);
    };

    contract.on("MatchRequested", onMatchRequested);
    return () => contract.off("MatchRequested", onMatchRequested);

  }, [provider, finalizeMatch]);

  return { finalizeMatch };
}