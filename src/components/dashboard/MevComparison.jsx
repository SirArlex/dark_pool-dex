import { useState } from "react";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

const NORMAL_DEX_DATA = {
  price:  "3,241.50",
  amount: "2.500000",
  wallet: "0x7f3a...b2e1",
  side:   "BUY",
};

export default function MevComparison() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="grid md:grid-cols-2 gap-5 mt-6">

      {/* Normal DEX */}
      <div className="glass-panel p-5 border-red-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Eye size={14} className="text-red-400" />
          <h3 className="text-sm font-semibold text-white">Normal DEX — Mempool</h3>
        </div>
        <div className="space-y-2 font-mono text-xs mb-4">
          {Object.entries(NORMAL_DEX_DATA).map(([k, v]) => (
            <div key={k} className="flex justify-between p-2 rounded bg-red-500/5 border border-red-500/20">
              <span className="text-gray-400 capitalize">{k}</span>
              <span className="text-red-300">{v} 👁️</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30">
          <XCircle size={12} className="text-red-400" />
          <span className="text-xs text-red-400">Bot reads → front-runs → profit extracted</span>
        </div>
      </div>

      {/* Dark Pool */}
      <div className="glass-panel p-5 glow-border-purple">
        <div className="flex items-center gap-2 mb-4">
          <EyeOff size={14} className="text-accent-purple" />
          <h3 className="text-sm font-semibold text-white">DarkPool — Mempool</h3>
        </div>
        <div className="space-y-2 font-mono text-xs mb-4">
          {[
            { label: "price",  value: "0x7f3a9b2e1c4d8f..." },
            { label: "amount", value: "0x2b9c4a1f7e3d2a..." },
            { label: "wallet", value: "0x7f3a...b2e1" },
            { label: "side",   value: "0x9f2c1a..." },
          ].map(({ label, value }) => (
            <div key={label}
              className="flex justify-between p-2 rounded bg-accent-purple/5 border border-accent-purple/20">
              <span className="text-gray-400">{label}</span>
              <span className={`text-gray-500 transition-all duration-300 ${revealed ? "" : "encrypted-blur"}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-accent-green/10 border border-accent-green/30">
          <CheckCircle size={12} className="text-accent-green" />
          <span className="text-xs text-accent-green">Bot sees ciphertext → cannot act → 0 MEV</span>
        </div>
      </div>
    </div>
  );
}
