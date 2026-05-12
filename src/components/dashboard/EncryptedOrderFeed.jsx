import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Clock,
  CheckCircle,
  Loader,
  RefreshCw,
  Activity,
  ExternalLink,
} from "lucide-react";

import { useContract } from "../../hooks/useContract";

const ETHERSCAN = "https://sepolia.etherscan.io";

const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000);

  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;

  return `${Math.floor(s / 3600)}h`;
};

const StatusBadge = ({ status }) => {
  const map = {
    MATCHED: {
      icon: CheckCircle,
      cls: "badge-success",
      spin: false,
    },

    PENDING: {
      icon: Loader,
      cls: "badge-yellow",
      spin: true,
    },

    CANCELLED: {
      icon: Lock,
      cls: "badge-mute",
      spin: false,
    },
  };

  const { icon: Icon, cls, spin } = map[status] || map.PENDING;

  return (
    <span className={`status-pill ${cls}`}>
      <Icon size={9} className={spin ? "animate-spin" : ""} />
      {status}
    </span>
  );
};

export default function EncryptedOrderFeed({ newOrder }) {
  const { allOrders, fetchAllOrders } = useContract();

  const [revealed, setRevealed] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);

    await fetchAllOrders();

    setRefreshing(false);
  };

  useEffect(() => {
    if (newOrder) {
      refresh();
    }
  }, [newOrder]);

  const stats = {
    total: allOrders.length,

    pending: allOrders.filter(
      (o) => o.status === "PENDING"
    ).length,

    matched: allOrders.filter(
      (o) => o.status === "MATCHED"
    ).length,
  };

  return (
    <div className="zama-panel p-5 h-full flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity
            size={14}
            className="text-zama-yellow"
          />

          <h2 className="font-bold text-white text-sm">
            ON-CHAIN FEED
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="
              p-1.5 rounded-lg
              hover:bg-zama-yellow/10
              text-white/40
              hover:text-zama-yellow
              transition-all
              disabled:opacity-40
            "
          >
            <RefreshCw
              size={12}
              className={
                refreshing ? "animate-spin" : ""
              }
            />
          </button>

          <div className="status-pill badge-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 text-[9px] font-mono text-white/30 px-3 mb-2 uppercase tracking-wider">
        <span className="col-span-2">Order</span>
        <span className="col-span-1">Side</span>
        <span className="col-span-4">Cipher</span>
        <span className="col-span-2">Time</span>
        <span className="col-span-3 text-right">
          Status
        </span>
      </div>

      {/* Orders */}
      <div className="flex-1 space-y-2 overflow-y-auto min-h-0 pr-1">

        {allOrders.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-12">
            <Lock
              size={32}
              className="text-white/20"
            />

            <p className="text-white/40 text-xs">
              No orders on-chain yet
            </p>

            <p className="text-white/20 text-[11px] font-mono">
              Submit one to begin
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {allOrders.map((o) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setRevealed((r) =>
                  r === o.id ? null : o.id
                )
              }
              className={`
                p-3 rounded-xl border cursor-pointer transition-all
                ${
                  o.status === "MATCHED"
                    ? "bg-success/5 border-success/20"
                    : "bg-zama-coal border-zama-ash hover:border-zama-yellow/30"
                }
              `}
            >

              {/* Main Row */}
              <div className="grid grid-cols-12 items-center">

                <span className="col-span-2 font-mono text-xs text-white">
                  #{o.id}
                </span>

                <span
                  className={`
                    col-span-1 text-xs font-bold
                    ${
                      o.type === "BUY"
                        ? "text-success"
                        : "text-danger"
                    }
                  `}
                >
                  {o.type}
                </span>

                <div className="col-span-4 flex items-center gap-1.5 min-w-0">
                  <Lock
                    size={9}
                    className="text-zama-yellow flex-shrink-0"
                  />

                  <span
                    className={`
                      font-mono text-[10px]
                      truncate
                      transition-all duration-300
                      ${
                        revealed === o.id
                          ? "text-zama-yellow"
                          : "text-white/30 encrypted-blur"
                      }
                    `}
                  >
                    {o.ciphertext.slice(0, 18)}...
                  </span>
                </div>

                <span className="col-span-2 font-mono text-[10px] text-white/40 flex items-center gap-1">
                  <Clock size={9} />
                  {timeAgo(o.timestamp)}
                </span>

                <div className="col-span-3 flex justify-end">
                  <StatusBadge status={o.status} />
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {revealed === o.id && (
                  <motion.div
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    className="overflow-hidden"
                  >

                    <div className="mt-3 pt-3 border-t border-zama-ash space-y-2">

                      {/* Price Cipher */}
                      <div className="flex justify-between gap-3">
                        <span className="text-[9px] text-white/30 font-mono uppercase tracking-wider flex-shrink-0">
                          price cipher
                        </span>

                        <span className="text-[10px] text-zama-yellow font-mono truncate">
                          {o.ciphertext.slice(0, 32)}...
                        </span>
                      </div>

                      {/* Amount Cipher */}
                      <div className="flex justify-between gap-3">
                        <span className="text-[9px] text-white/30 font-mono uppercase tracking-wider flex-shrink-0">
                          amount cipher
                        </span>

                        <span className="text-[10px] text-zama-yellow font-mono truncate">
                          {o.amountCipher.slice(0, 32)}...
                        </span>
                      </div>

                      {/* Owner */}
                      <div className="flex justify-between gap-3">
                        <span className="text-[9px] text-white/30 font-mono uppercase tracking-wider flex-shrink-0">
                          owner
                        </span>

                        <a
                          href={`${ETHERSCAN}/address/${o.owner}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                          className="
                            text-[10px]
                            text-zama-yellow
                            font-mono
                            hover:text-white
                            flex items-center gap-1
                            transition-colors
                          "
                        >
                          {o.owner.slice(0, 8)}...
                          {o.owner.slice(-6)}

                          <ExternalLink size={9} />
                        </a>
                      </div>

                      {/* TX HASH */}
                      {o.txHash && (
                        <a
                          href={`${ETHERSCAN}/tx/${o.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                          className="
                            mt-1
                            flex items-center justify-between
                            w-full
                            px-3 py-2
                            rounded-lg
                            bg-zama-yellow/10
                            border border-zama-yellow/30
                            hover:bg-zama-yellow/20
                            transition-all
                            group
                          "
                        >

                          <div className="flex items-center gap-2">
                            <Lock
                              size={10}
                              className="text-zama-yellow"
                            />

                            <span className="text-[10px] font-mono text-zama-yellow">
                              {o.txHash.slice(0, 12)}...
                              {o.txHash.slice(-8)}
                            </span>
                          </div>

                          <div
                            className="
                              flex items-center gap-1
                              text-[9px]
                              text-white/50
                              group-hover:text-zama-yellow
                              transition-colors
                              font-mono uppercase
                            "
                          >
                            Etherscan

                            <ExternalLink size={9} />
                          </div>
                        </a>
                      )}

                      {/* Footer Note */}
                      <p className="text-[9px] text-white/20 font-mono text-center pt-1">
                        Price &amp; amount encrypted via TFHE-64 · No plaintext on-chain
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-4 border-t border-zama-ash grid grid-cols-3 gap-2 text-center">

        {[
          {
            label: "Total",
            value: stats.total,
            cls: "text-white",
          },

          {
            label: "Pending",
            value: stats.pending,
            cls: "text-zama-yellow",
          },

          {
            label: "Matched",
            value: stats.matched,
            cls: "text-success",
          },
        ].map(({ label, value, cls }) => (
          <div
            key={label}
            className="p-2 rounded-lg bg-zama-coal border border-zama-ash"
          >
            <div
              className={`text-lg font-black font-mono ${cls}`}
            >
              {value}
            </div>

            <div className="text-[9px] text-white/30 uppercase tracking-wider">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}