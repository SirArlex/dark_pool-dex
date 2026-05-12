import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Wifi, WifiOff, Play, RotateCcw, Shield } from "lucide-react";
import { MEV_LOG_SEQUENCES } from "../../lib/mockData";

const COLORS = {
  info:    "text-white/40",
  detect:  "text-zama-yellow",
  warn:    "text-orange-400",
  attack:  "text-danger",
  error:   "text-danger",
  success: "text-success",
};

const PREFIXES = {
  info: "[INFO] ", detect: "[SCAN] ", warn: "[WARN] ",
  attack: "[ATTK] ", error: "[FAIL] ", success: "[BLOK] ",
};

export default function MevBotMonitor() {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ attacks: 0, blocked: 0, cycles: 0 });
  const endRef = useRef(null);
  const timeouts = useRef([]);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [logs]);

  const clear = () => { timeouts.current.forEach(clearTimeout); timeouts.current = []; };

  const run = useCallback((iter) => {
    MEV_LOG_SEQUENCES.forEach(({ delay, type, text }) => {
      const id = setTimeout(() => {
        setLogs(prev => [...prev.slice(-60), {
          id: `${iter}-${delay}`, type, text,
          time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        }]);
        if (type === "attack")  setStats(s => ({ ...s, attacks: s.attacks + 1 }));
        if (type === "success") setStats(s => ({ ...s, blocked: s.blocked + 1 }));
      }, delay);
      timeouts.current.push(id);
    });
    const last = MEV_LOG_SEQUENCES.at(-1).delay + 2000;
    timeouts.current.push(setTimeout(() => {
      setStats(s => ({ ...s, cycles: s.cycles + 1 }));
      run(iter + 1);
    }, last));
  }, []);

  const start = () => { setRunning(true); setLogs([]); run(0); };
  const reset = () => { clear(); setRunning(false); setLogs([]); setStats({ attacks: 0, blocked: 0, cycles: 0 }); };

  useEffect(() => () => clear(), []);

  return (
    <div className="zama-panel p-5 h-full flex flex-col">

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-white text-sm flex items-center gap-2">
          <Bot size={14} className="text-danger" />
          MEV BOT SIMULATOR
        </h2>
        <div className={`status-pill ${running ? "badge-danger" : "badge-mute"}`}>
          {running ? <Wifi size={9} /> : <WifiOff size={9} />}
          {running ? "Active" : "Idle"}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Attacks", value: stats.attacks, cls: "text-danger" },
          { label: "Blocked", value: stats.blocked, cls: "text-success" },
          { label: "Cycles",  value: stats.cycles,  cls: "text-zama-yellow" },
        ].map(({ label, value, cls }) => (
          <div key={label} className="p-2 rounded-lg bg-zama-coal border border-zama-ash text-center">
            <div className={`text-lg font-black font-mono ${cls}`}>{value}</div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 rounded-xl bg-black border border-zama-ash p-3 font-mono overflow-y-auto min-h-0">
        {logs.length === 0 && !running && (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
            <Bot size={32} className="text-white/20" />
            <p className="text-white/40 text-xs">Launch the bot to simulate MEV attacks</p>
            <p className="text-white/20 text-[10px]">All attempts will fail vs. encrypted orders</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {logs.map(log => (
            <motion.div key={log.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className={`text-[10px] mb-0.5 flex gap-2 ${COLORS[log.type]}`}>
              <span className="text-white/20 flex-shrink-0">{log.time}</span>
              <span className="text-white/30 flex-shrink-0">{PREFIXES[log.type]}</span>
              <span>{log.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={start} disabled={running}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2
                      transition-all
            ${running
              ? "bg-danger/10 border border-danger/30 text-danger/60 cursor-not-allowed"
              : "bg-danger/10 border border-danger/40 text-danger hover:bg-danger/20"}`}>
          <Play size={13} />
          {running ? "BOT RUNNING..." : "LAUNCH BOT"}
        </button>
        <button onClick={reset} className="px-4 py-2.5 rounded-xl btn-ghost">
          <RotateCcw size={13} />
        </button>
      </div>

      <div className="mt-3 p-2.5 rounded-xl bg-zama-yellow/5 border border-zama-yellow/20 flex items-center gap-2">
        <Shield size={12} className="text-zama-yellow flex-shrink-0" />
        <span className="text-[10px] text-white/50 font-mono">
          TFHE encryption · Ciphertext opaque to all observers
        </span>
      </div>
    </div>
  );
}
