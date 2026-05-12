import { useState, useCallback, useEffect } from "react";
import { Contract } from "ethers";

import { useWallet } from "../context/WalletContext";
import { useFhevm } from "../context/FhevmContext";

import { encryptOrderInputs } from "../lib/fhevm";

import DarkPoolABI from "../contracts/abi/DarkPool.json";

const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS || "";

console.log(
  "🔍 CONTRACT_ADDRESS at load:",
  CONTRACT_ADDRESS
);

export function useContract() {
  const { signer, provider, address } = useWallet();

  const {
    instance: fhevmInstance,
    isReady: fhevmReady,
  } = useFhevm();

  const [isSubmitting, setSubmitting] =
    useState(false);

  const [txHash, setTxHash] =
    useState(null);

  const [error, setError] =
    useState(null);

  const [orders, setOrders] =
    useState([]);

  const [allOrders, setAllOrders] =
    useState([]);

  const [totalOrders, setTotalOrders] =
    useState(0);

  const [isFetching, setFetching] =
    useState(false);

  // ✅ tx hash storage
  const [txHashMap, setTxHashMap] =
    useState({});

  // Helpers
  

  const getReadContract = useCallback(() => {
    if (!provider) {
      throw new Error("No provider");
    }

    if (!CONTRACT_ADDRESS) {
      throw new Error(
        "VITE_CONTRACT_ADDRESS not set"
      );
    }

    return new Contract(
      CONTRACT_ADDRESS,
      DarkPoolABI,
      provider
    );
  }, [provider]);

  const getWriteContract = useCallback(() => {
    if (!signer) {
      throw new Error(
        "Wallet not connected"
      );
    }

    if (!CONTRACT_ADDRESS) {
      throw new Error(
        "VITE_CONTRACT_ADDRESS not set"
      );
    }

    return new Contract(
      CONTRACT_ADDRESS,
      DarkPoolABI,
      signer
    );
  }, [signer]);

 
  // Fetch my orders
 

  const fetchMyOrders = useCallback(
    async () => {
      if (
        !provider ||
        !address ||
        !CONTRACT_ADDRESS
      ) {
        return;
      }

      setFetching(true);

      try {
        const contract =
          getReadContract();

        const total = Number(
          await contract.getTotalOrders()
        );

        setTotalOrders(total);

        const mine = [];

        const limit = Math.min(
          total,
          100
        );

        for (
          let i = total;
          i >= Math.max(
            1,
            total - limit + 1
          );
          i--
        ) {
          const [
            owner,
            side,
            timestamp,
            status,
          ] =
            await contract.getOrderMeta(
              i
            );

          if (
            owner.toLowerCase() ===
            address.toLowerCase()
          ) {
            mine.push({
              id: i,

              owner,

              side:
                Number(side) === 0
                  ? "BUY"
                  : "SELL",

              timestamp:
                Number(timestamp) *
                1000,

              status:
                [
                  "PENDING",
                  "MATCHED",
                  "CANCELLED",
                ][Number(status)] ||
                "PENDING",
            });
          }
        }

        setOrders(mine);
      } catch (e) {
        console.error(
          "[fetchMyOrders]",
          e.message
        );
      } finally {
        setFetching(false);
      }
    },
    [
      provider,
      address,
      getReadContract,
    ]
  );


  // Fetch all orders


  const fetchAllOrders = useCallback(
    async () => {
      if (
        !provider ||
        !CONTRACT_ADDRESS
      ) {
        return [];
      }

      try {
        const contract =
          getReadContract();

        const total = Number(
          await contract.getTotalOrders()
        );

        const limit = Math.min(
          total,
          30
        );

        const result = [];

        for (
          let i = total;
          i >= Math.max(
            1,
            total - limit + 1
          );
          i--
        ) {
          const [
            owner,
            side,
            timestamp,
            status,
          ] =
            await contract.getOrderMeta(
              i
            );

          result.push({
            id: i,

            type:
              Number(side) === 0
                ? "BUY"
                : "SELL",

            ciphertext: `0x${BigInt(
              i * 0xdeadbeef
            )
              .toString(16)
              .padStart(40, "0")}`,

            amountCipher: `0x${BigInt(
              i * 0xcafebabe
            )
              .toString(16)
              .padStart(40, "0")}`,

            timestamp:
              Number(timestamp) *
              1000,

            status:
              [
                "PENDING",
                "MATCHED",
                "CANCELLED",
              ][Number(status)] ||
              "PENDING",

            owner,

            // ✅ attach tx hash
            txHash:
              txHashMap[i] || null,
          });
        }

        setAllOrders(result);

        return result;
      } catch (e) {
        console.error(
          "[fetchAllOrders]",
          e.message
        );

        return [];
      }
    },
    [
      provider,
      getReadContract,
      txHashMap,
    ]
  );


  // Submit encrypted order


  const submitOrder = useCallback(
    async ({
      side,
      price,
      amount,
    }) => {
      if (!CONTRACT_ADDRESS) {
        throw new Error(
          "Contract address not configured — set VITE_CONTRACT_ADDRESS in .env"
        );
      }

      if (!signer || !address) {
        throw new Error(
          "Wallet not connected"
        );
      }

      if (
        !fhevmReady ||
        !fhevmInstance
      ) {
        throw new Error(
          "FHE not ready — wait for initialization"
        );
      }

      setSubmitting(true);

      setError(null);

      setTxHash(null);

      try {
        console.log(
          "[Submit] Encrypting inputs..."
        );

        const {
          priceHandle,
          amountHandle,
          inputProof,
        } =
          await encryptOrderInputs(
            price,
            amount,
            CONTRACT_ADDRESS,
            address,
            fhevmInstance
          );

        console.log(
          "[Submit] Encryption done. Sending tx..."
        );

        const contract =
          getWriteContract();

        const sideEnum =
          side === "BUY"
            ? 0
            : 1;

        const tx =
          await contract.submitOrder(
            sideEnum,
            priceHandle,
            amountHandle,
            inputProof
          );

        setTxHash(tx.hash);

        console.log(
          `[Submit] tx sent: ${tx.hash}`
        );

        // wait for confirmation
        const receipt =
          await tx.wait();

        console.log(
          `[Submit] confirmed in block ${receipt.blockNumber}`
        );

        // parse event
        const event = receipt.logs
          .map((log) => {
            try {
              return contract.interface.parseLog(
                log
              );
            } catch {
              return null;
            }
          })
          .find(
            (e) =>
              e?.name ===
              "OrderSubmitted"
          );

        // extract order id
        const orderId = event
          ? Number(
              event.args.orderId
            )
          : null;

        // store tx hash
        if (orderId) {
          setTxHashMap((prev) => ({
            ...prev,
            [orderId]:
              tx.hash,
          }));
        }

        // refresh feeds
        await Promise.all([
          fetchMyOrders(),
          fetchAllOrders(),
        ]);

        return {
          receipt,
          orderId,
          txHash: tx.hash,
        };
      } catch (e) {
        const msg =
          e?.reason ||
          e?.shortMessage ||
          e?.message ||
          "Transaction failed";

        console.error(
          "[Submit] failed:",
          msg
        );

        setError(msg);

        throw new Error(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [
      fhevmReady,
      fhevmInstance,
      signer,
      address,
      getWriteContract,
      fetchMyOrders,
      fetchAllOrders,
    ]
  );


  // Event listeners
 
  useEffect(() => {
    if (
      !provider ||
      !CONTRACT_ADDRESS
    ) {
      return;
    }

    const contract =
      new Contract(
        CONTRACT_ADDRESS,
        DarkPoolABI,
        provider
      );

    const onSubmitted = (
      orderId,
      owner
    ) => {
      console.log(
        `[Event] OrderSubmitted #${orderId} by ${owner}`
      );

      fetchAllOrders();

      if (
        owner.toLowerCase() ===
        address?.toLowerCase()
      ) {
        fetchMyOrders();
      }
    };

    const onMatched = (
      buyId,
      sellId
    ) => {
      console.log(
        `[Event] OrderMatched buy#${buyId} ↔ sell#${sellId}`
      );

      fetchAllOrders();

      fetchMyOrders();
    };

    contract.on(
      "OrderSubmitted",
      onSubmitted
    );

    contract.on(
      "OrderMatched",
      onMatched
    );

    return () => {
      contract.off(
        "OrderSubmitted",
        onSubmitted
      );

      contract.off(
        "OrderMatched",
        onMatched
      );
    };
  }, [
    provider,
    address,
    fetchMyOrders,
    fetchAllOrders,
  ]);


  // Auto load


  useEffect(() => {
    if (address && provider) {
      fetchMyOrders();

      fetchAllOrders();
    }
  }, [
    address,
    provider,
    fetchMyOrders,
    fetchAllOrders,
  ]);

  return {
    submitOrder,

    fetchMyOrders,

    fetchAllOrders,

    orders,

    allOrders,

    totalOrders,

    isSubmitting,

    isFetching,

    txHash,

    error,

    fhevmReady,

    contractAddress:
      CONTRACT_ADDRESS,
  };
}