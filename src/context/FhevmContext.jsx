import { createContext, useContext, useState, useEffect } from "react";
import { useWallet } from "./WalletContext";
import { getFhevmInstance, resetInstance } from "../lib/fhevm";

const FhevmContext = createContext(null);

export function FhevmProvider({ children }) {
  const { provider, address } = useWallet();
  const [instance,  setInstance]  = useState(null);
  const [isReady,   setReady]     = useState(false);
  const [isLoading, setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    if (!provider || !address) {
      setInstance(null);
      setReady(false);
      setError(null);
      resetInstance();
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      if (!cancelled) {
        console.error("[FHE] init timed out after 30s");
        setError("FHE initialization timed out — refresh and try again");
        setLoading(false);
      }
    }, 30_000);

    getFhevmInstance(provider)
      .then((inst) => {
        clearTimeout(timer);
        if (cancelled) return;
        console.log("[FHE] ✅ ready");
        setInstance(inst);
        setReady(true);
      })
      .catch((e) => {
        clearTimeout(timer);
        if (cancelled) return;
        console.error("[FHE] ❌ init failed:", e);
        setError(e.message || String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [provider, address]);

  return (
    <FhevmContext.Provider value={{ instance, isReady, isLoading, error }}>
      {children}
    </FhevmContext.Provider>
  );
}

export const useFhevm = () => {
  const ctx = useContext(FhevmContext);
  if (!ctx) throw new Error("useFhevm must be used inside FhevmProvider");
  return ctx;
};
