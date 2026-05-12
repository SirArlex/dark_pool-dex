import { useEffect, useState } from "react";
import { Lock, Clock, CheckCircle, Loader, Filter, RefreshCw } from "lucide-react";
import { useContract } from "../hooks/useContract";
import { useWallet } from "../context/WalletContext";

const FILTERS = ["ALL", "PENDING", "MATCHED", "CANCELLED"];

const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
};

export default function MyOrders() {
  const { address } = useWallet();
  const { orders, fetchMyOrders, isFetching, totalOrders } = useContract();
  const [filter, setFilter] = useState("ALL");

  useEffect(() => { fetchMyOrders(); }, [fetchMyOrders]);

  const filtered = orders.filter(o => filter === "ALL" ? true : o.status === filter);

  return (
    <div className="min-h-screen pt-24 pb-8 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">My Orders</h1>
            <p className="text-sm text-white/40 mt-1 font-mono">
              {address && `${address.slice(0,8)}...${address.slice(-6)} · ${totalOrders} total on Sepolia`}
            </p>
          </div>
          <button onClick={fetchMyOrders} disabled={isFetching}
            className="btn-zama-outline flex items-center gap-2 text-sm py-2.5 px-5">
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Filter size={13} className="text-white/30" />
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all
                ${filter === f
                  ? "bg-zama-yellow text-black"
                  : "text-white/40 hover:text-white border border-zama-ash hover:border-zama-yellow/30"}`}>
              {f}
              {f !== "ALL" && (
                <span className="ml-1.5 opacity-60">
                  ({orders.filter(o => o.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {isFetching && (
          <div className="flex items-center gap-3 p-6 zama-panel mb-4">
            <Loader size={16} className="animate-spin text-zama-yellow" />
            <span className="text-sm text-white/50 font-mono">Fetching on-chain data…</span>
          </div>
        )}

        {!isFetching && filtered.length === 0 && (
          <div className="zama-panel p-12 text-center">
            <Lock size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No {filter.toLowerCase()} orders found</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(o => (
            <div key={o.id}
              className={`zama-panel p-5 grid grid-cols-6 items-center gap-4
                ${o.status === "MATCHED" ? "border-success/30" : ""}`}>
              <div>
                <div className="text-[9px] text-white/30 font-mono uppercase tracking-wider mb-1">Order</div>
                <div className="text-white font-mono text-sm font-black">#{o.id}</div>
                <span className={`text-xs font-bold ${o.side === "BUY" ? "text-success" : "text-danger"}`}>
                  {o.side}
                </span>
              </div>

              <div className="col-span-2">
                <div className="text-[9px] text-white/30 font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Lock size={9} className="text-zama-yellow" /> Price
                </div>
                <div className="font-mono text-xs text-white/30 encrypted-blur cursor-pointer">
                  euint64::0x{o.id.toString(16).padStart(4,"0")}...cipher
                </div>
              </div>

              <div>
                <div className="text-[9px] text-white/30 font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Lock size={9} className="text-zama-yellow" /> Amount
                </div>
                <div className="font-mono text-xs text-white/30 encrypted-blur cursor-pointer">
                  euint64::0x{(o.id*7).toString(16).padStart(4,"0")}...
                </div>
              </div>

              <div>
                <div className="text-[9px] text-white/30 font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock size={9} /> Time
                </div>
                <div className="text-xs text-white/60 font-mono">{timeAgo(o.timestamp)}</div>
              </div>

              <div className="text-right">
                <span className={`status-pill
                  ${o.status === "MATCHED"   ? "badge-success" :
                    o.status === "CANCELLED" ? "badge-mute"    : "badge-yellow"}`}>
                  {o.status === "MATCHED" ? <CheckCircle size={10} /> : <Loader size={10} className="animate-spin" />}
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
