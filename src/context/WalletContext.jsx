import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { BrowserProvider, formatEther } from "ethers";

const WalletContext = createContext(null);
const SEPOLIA = "0xaa36a7";

export function WalletProvider({ children }) {
  const [address, setAddress]   = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner]     = useState(null);
  const [chainId, setChainId]   = useState(null);
  const [balance, setBalance]   = useState(null);
  const [isConnecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const isCorrectNetwork = chainId === SEPOLIA;

  const connect = useCallback(async () => {
    if (!window.ethereum) { setError("MetaMask not installed"); return; }
    try {
      setConnecting(true); setError(null);
      const p = new BrowserProvider(window.ethereum);
      await p.send("eth_requestAccounts", []);
      const s = await p.getSigner();
      const addr = await s.getAddress();
      const net = await p.getNetwork();
      const bal = await p.getBalance(addr);

      setProvider(p); setSigner(s); setAddress(addr);
      setChainId("0x" + net.chainId.toString(16));
      setBalance(parseFloat(formatEther(bal)).toFixed(4));
    } catch (e) {
      setError(e.message);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null); setProvider(null); setSigner(null);
    setChainId(null); setBalance(null);
  }, []);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA }],
      });
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const onAccts = (accs) => accs.length === 0 ? disconnect() : connect();
    const onChain = () => window.location.reload();
    window.ethereum.on("accountsChanged", onAccts);
    window.ethereum.on("chainChanged", onChain);
    return () => {
      window.ethereum.removeListener?.("accountsChanged", onAccts);
      window.ethereum.removeListener?.("chainChanged", onChain);
    };
  }, [connect, disconnect]);

  return (
    <WalletContext.Provider value={{
      address, provider, signer, chainId, balance,
      isConnecting, isCorrectNetwork, error,
      connect, disconnect, switchNetwork,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
};
