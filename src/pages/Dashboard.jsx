import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useFhevm } from "../context/FhevmContext";
import OrderForm from "../components/dashboard/OrderForm";
import EncryptedOrderFeed from "../components/dashboard/EncryptedOrderFeed";
import MevBotMonitor from "../components/dashboard/MevBotMonitor";
import { AlertTriangle, ArrowRight, Loader } from "lucide-react";
import { useMatchFinalizer } from "../hooks/useMatchFinalizer";

export default function Dashboard() {
  const { address, isCorrectNetwork, connect, switchNetwork } = useWallet();
  const { isReady: fheReady, isLoading: fheLoading, error: fheError } = useFhevm();
  const [lastOrder, setLastOrder] = useState(null);

  useMatchFinalizer(); // ✅ inside component body

  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 grid-bg">
        <div className="zama-panel-glow p-12 text-center max-w-md">
          <div className="w-12 h-12 rounded-xl bg-zama-yellow/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={20} className="text-zama-yellow" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Connect Wallet</h2>
          <p className="text-white/50 text-sm mb-6">Connect MetaMask to access the trading terminal.</p>
          <button onClick={connect} className="btn-zama flex items-center gap-2 mx-auto">
            Connect MetaMask <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 grid-bg">
        <div className="zama-panel p-12 text-center max-w-md border-danger/30">
          <AlertTriangle size={36} className="text-danger mx-auto mb-4" />
          <h2 className="text-xl font-black text-white mb-2">Wrong Network</h2>
          <p className="text-white/50 text-sm mb-6">DarkPool runs on Sepolia testnet.</p>
          <button onClick={switchNetwork} className="btn-zama mx-auto">Switch to Sepolia</button>
        </div>
      </div>
    );
  }

  if (fheLoading || (!fheReady && !fheError)) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 grid-bg">
        <div className="zama-panel-glow p-12 text-center max-w-md">
          <Loader size={36} className="text-zama-yellow mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-black text-white mb-2">Initializing FHE</h2>
          <p className="text-white/50 text-sm">Loading TFHE keys from Zama relayer...</p>
        </div>
      </div>
    );
  }

  if (fheError) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 grid-bg">
        <div className="zama-panel p-12 text-center max-w-md border-danger/30">
          <AlertTriangle size={36} className="text-danger mx-auto mb-4" />
          <h2 className="text-xl font-black text-white mb-2">FHE Init Failed</h2>
          <p className="text-white/50 text-sm mb-2 font-mono">{fheError}</p>
          <button onClick={() => window.location.reload()} className="btn-zama mt-4">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white">Trading Terminal</h1>
          <p className="text-sm text-white/40 font-mono mt-1">
            All orders encrypted client-side · Zero plaintext on-chain
          </p>
        </div>

        <div className="grid grid-cols-12 gap-5 h-[calc(100vh-180px)]">
          <div className="col-span-3"><OrderForm onOrderSubmit={setLastOrder} /></div>
          <div className="col-span-5"><EncryptedOrderFeed newOrder={lastOrder} /></div>
          <div className="col-span-4"><MevBotMonitor /></div>
        </div>
      </div>
    </div>
  );
}