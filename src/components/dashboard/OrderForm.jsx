import { useState } from "react";
import { Lock, Loader, CheckCircle, AlertCircle, ChevronDown,
         ExternalLink, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useContract } from "../../hooks/useContract";
import { useFhevm } from "../../context/FhevmContext";

const PAIRS = ["ETH / USDC", "WBTC / USDC", "ARB / USDC"];

const STATE = {
  IDLE: "idle", ENCRYPTING: "encrypting", SUBMITTING: "submitting",
  CONFIRMING: "confirming", DONE: "done", ERROR: "error",
};

export default function OrderForm({ onOrderSubmit }) {
  const { submitOrder } = useContract();
  const { isReady: fheReady, isLoading: fheLoading, error: fheError } = useFhevm();

  const [side, setSide] = useState("BUY");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [pair, setPair] = useState(PAIRS[0]);
  const [showPairs, setShowPairs] = useState(false);
  const [state, setState] = useState(STATE.IDLE);
  const [errMsg, setErrMsg] = useState(null);
  const [tx, setTx] = useState(null);

  const total = price && amount ? (parseFloat(price) * parseFloat(amount)).toFixed(2) : "—";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!price || !amount || state !== STATE.IDLE) return;
    if (!fheReady) {
      setErrMsg("FHE not ready. Wait for initialization.");
      setState(STATE.ERROR);
      setTimeout(() => setState(STATE.IDLE), 3000);
      return;
    }

    setErrMsg(null); setTx(null);

    try {
      setState(STATE.ENCRYPTING);
      // Tiny delay so the UI step is visible
      await new Promise(r => setTimeout(r, 300));

      setState(STATE.SUBMITTING);
      const result = await submitOrder({
        side, price: parseFloat(price), amount: parseFloat(amount),
      });

      setTx(result.txHash);
      setState(STATE.DONE);

      onOrderSubmit?.({
        side, price: parseFloat(price), amount: parseFloat(amount), pair,
        orderId: result.orderId, txHash: result.txHash,
      });

      setTimeout(() => {
        setState(STATE.IDLE); setPrice(""); setAmount("");
      }, 4000);

    } catch (err) {
      console.error("[OrderForm]", err);
      setErrMsg(err.message || "Submission failed");
      setState(STATE.ERROR);
      setTimeout(() => setState(STATE.IDLE), 5000);
    }
  };

  const fheStatus = fheLoading
    ? { label: "● Initializing", cls: "badge-yellow" }
    : fheReady
      ? { label: "● FHE Active", cls: "badge-success" }
      : { label: "● FHE Offline", cls: "badge-danger" };

  return (
    <div className="zama-panel-glow p-5 h-full flex flex-col">

      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-white text-sm flex items-center gap-2">
          <Lock size={14} className="text-zama-yellow" />
          ENCRYPTED ORDER
        </h2>
        <span className={`status-pill ${fheStatus.cls}`}>{fheStatus.label}</span>
      </div>

      {/* Pair */}
      <div className="relative mb-3">
        <button type="button" onClick={() => setShowPairs(p => !p)}
          className="w-full flex items-center justify-between input-zama text-left">
          <span className="text-white font-mono text-sm">{pair}</span>
          <ChevronDown size={14} className={`text-white/40 transition-transform ${showPairs ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {showPairs && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute top-full left-0 right-0 mt-1 zama-panel p-1 z-20">
              {PAIRS.map(p => (
                <button key={p} type="button" onClick={() => { setPair(p); setShowPairs(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-mono
                             text-white/70 hover:bg-zama-yellow/10 hover:text-zama-yellow transition-all">
                  {p}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side */}
      <div className="flex rounded-xl overflow-hidden border-2 border-zama-ash mb-4">
        {["BUY", "SELL"].map(s => (
          <button key={s} type="button" onClick={() => setSide(s)}
            className={`flex-1 py-2.5 text-sm font-bold transition-all
              ${side === s
                ? s === "BUY" ? "bg-success text-black" : "bg-danger text-white"
                : "bg-transparent text-white/40 hover:text-white"}`}>
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1">
        <div>
          <label className="text-[11px] text-white/50 mb-1.5 block font-mono uppercase tracking-wider">
            Price (USDC) <span className="text-zama-yellow">· encrypted</span>
          </label>
          <div className="relative">
            <input type="number" step="0.01" min="0" value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00" className="input-zama pr-16" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30 font-mono">USDC</span>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-white/50 mb-1.5 block font-mono uppercase tracking-wider">
            Amount (ETH) <span className="text-zama-yellow">· encrypted</span>
          </label>
          <div className="relative">
            <input type="number" step="0.0001" min="0" value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.0000" className="input-zama pr-14" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30 font-mono">ETH</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zama-coal border border-zama-ash space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/40 font-mono">Total</span>
            <span className="font-mono text-white">{total} USDC</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/40 font-mono">Encryption</span>
            <span className="text-zama-yellow font-mono text-[11px]">TFHE euint64</span>
          </div>
        </div>

        {/* Cipher preview */}
        <div className="p-3 rounded-xl bg-zama-coal border border-zama-yellow/20">
          <div className="text-[9px] font-mono text-white/30 mb-1 uppercase tracking-wider">cipher preview</div>
          <div className="text-[10px] font-mono text-zama-yellow/70 break-all leading-relaxed">
            {price ? `0x${Array.from({length:40},() => "0123456789abcdef"[Math.floor(Math.random()*16)]).join("")}` : "Awaiting input..."}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {(errMsg || fheError) && (state === STATE.ERROR || !fheReady) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-xl bg-danger/10 border border-danger/30">
              <p className="text-xs text-danger font-mono break-words">{errMsg || fheError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tx link */}
        <AnimatePresence>
          {tx && state === STATE.DONE && (
            <motion.a initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              href={`[sepolia.etherscan.io](https://sepolia.etherscan.io/tx/${tx})`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-xl
                         bg-success/10 border border-success/30 text-success text-xs font-mono
                         hover:bg-success/20 transition-all">
              <ShieldCheck size={12} />
              <span className="truncate">{tx.slice(0, 16)}...{tx.slice(-8)}</span>
              <ExternalLink size={10} className="ml-auto" />
            </motion.a>
          )}
        </AnimatePresence>

        <button type="submit" disabled={!price || !amount || state !== STATE.IDLE || !fheReady}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                      transition-all duration-150 mt-auto
            ${state !== STATE.IDLE || !fheReady
              ? "bg-zama-ash text-white/30 cursor-not-allowed"
              : side === "BUY"
                ? "bg-success hover:bg-success/90 text-black active:scale-[0.98]"
                : "bg-danger  hover:bg-danger/90 text-white active:scale-[0.98]"}`}>
          {state === STATE.IDLE      && <><Lock size={14} /> ENCRYPT &amp; SUBMIT {side}</>}
          {state === STATE.ENCRYPTING && <><Loader size={14} className="animate-spin" /> Encrypting with TFHE…</>}
          {state === STATE.SUBMITTING && <><Loader size={14} className="animate-spin" /> Broadcasting…</>}
          {state === STATE.DONE       && <><CheckCircle size={14} /> Confirmed on-chain</>}
          {state === STATE.ERROR      && <><AlertCircle size={14} /> Failed — try again</>}
        </button>
      </form>
    </div>
  );
}
