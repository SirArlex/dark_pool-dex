import { useWallet } from "../../context/WalletContext";
import { Wallet, Unplug, AlertTriangle, Loader } from "lucide-react";

export default function WalletButton() {
  const { address, balance, isConnecting, isCorrectNetwork,
          connect, disconnect, switchNetwork } = useWallet();

  if (isConnecting) {
    return (
      <button disabled className="btn-ghost flex items-center gap-2 opacity-60">
        <Loader size={14} className="animate-spin" />
        <span className="text-sm">Connecting</span>
      </button>
    );
  }

  if (address && !isCorrectNetwork) {
    return (
      <button onClick={switchNetwork}
        className="flex items-center gap-2 px-4 py-2 bg-danger/10 border-2 border-danger/40
                   text-danger rounded-xl text-sm font-bold hover:bg-danger/20 transition-all">
        <AlertTriangle size={14} />
        Switch to Sepolia
      </button>
    );
  }

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 py-2 bg-zama-ink border border-zama-ash rounded-xl
                        flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="font-mono text-xs text-white">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <span className="text-white/20">|</span>
          <span className="font-mono text-xs text-zama-yellow">{balance} ETH</span>
        </div>
        <button onClick={disconnect}
          className="p-2 bg-zama-ink border border-zama-ash rounded-xl
                     hover:border-danger/40 text-white/40 hover:text-danger transition-all">
          <Unplug size={14} />
        </button>
      </div>
    );
  }

  return (
    <button onClick={connect} className="btn-zama flex items-center gap-2 text-sm">
      <Wallet size={14} />
      Connect Wallet
    </button>
  );
}
