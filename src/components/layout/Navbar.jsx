import { Link, useLocation } from "react-router-dom";
import { Lock, Activity } from "lucide-react";
import WalletButton from "../ui/WalletButton";
import { useWallet } from "../../context/WalletContext";
import { useFhevm } from "../../context/FhevmContext";

const NAV_LINKS = [
  { to: "/dashboard", label: "Trade" },
  { to: "/orders",    label: "My Orders" },
  { to: "/about",     label: "About" },
];

export default function Navbar() {
  const location = useLocation();
  const { chainId } = useWallet();
  const { isReady: fheReady, isLoading: fheLoading } = useFhevm();
  const isLanding = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zama-ash
                    bg-zama-black/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-zama-yellow flex items-center justify-center
                          group-hover:rotate-12 transition-transform duration-200">
            <Lock size={16} className="text-black" strokeWidth={3} />
          </div>
          <div>
            <div className="font-black text-white text-base tracking-tight leading-none">
              DARKPOOL<span className="text-zama-yellow">.</span>
            </div>
            <div className="text-[9px] text-white/40 font-mono uppercase tracking-widest">
              FHE × Zama
            </div>
          </div>
        </Link>

        {!isLanding && (
          <div className="flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
                  ${location.pathname === to
                    ? "bg-zama-yellow text-black"
                    : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                {label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          {!isLanding && (
            <div className={`status-pill
              ${fheReady ? "badge-success" : fheLoading ? "badge-yellow" : "badge-mute"}`}>
              <span className={`w-1.5 h-1.5 rounded-full
                ${fheReady ? "bg-success" : fheLoading ? "bg-zama-yellow animate-pulse" : "bg-white/30"}`} />
              {fheReady ? "FHE Active" : fheLoading ? "FHE Init..." : "FHE Idle"}
            </div>
          )}
          {!isLanding && chainId && (
            <div className="status-pill badge-yellow">
              <Activity size={9} /> Sepolia
            </div>
          )}
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
