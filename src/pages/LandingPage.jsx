import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Zap, Shield, ArrowRight, ChevronRight,
         AlertTriangle, CheckCircle } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid-bg overflow-hidden">

      {/* Navbar inline (landing has its own clean header) */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 h-16
                         flex items-center justify-between
                         border-b border-zama-ash/40 bg-zama-black/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zama-yellow flex items-center justify-center">
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
        </div>
        <button onClick={() => navigate("/dashboard")}
          className="btn-zama text-sm px-5 py-2.5 flex items-center gap-2">
          Launch DApp <ArrowRight size={14} />
        </button>
      </header>

      <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-20">

        {/* HERO */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="text-center mb-28">
          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                       bg-zama-yellow/10 border border-zama-yellow/30 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-zama-yellow animate-pulse" />
            <span className="text-xs font-mono text-zama-yellow tracking-widest uppercase">
              Powered by Zama FHEVM
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="text-6xl md:text-8xl font-black mb-6 leading-[0.95] tracking-tight">
            <span className="text-white">Trade in</span><br />
            <span className="text-zama-yellow">Total Darkness.</span>
          </motion.h1>

          <motion.p variants={fadeUp}
            className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            The first DEX where order prices and amounts are <span className="text-white font-semibold">fully encrypted on-chain</span>.
            MEV bots cannot read what they cannot see.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3">
            <button onClick={() => navigate("/dashboard")}
              className="btn-zama text-base px-8 py-4 flex items-center gap-2">
              Launch DApp <ArrowRight size={16} />
            </button>
            <a href="#how" className="btn-zama-outline text-base px-8 py-4 flex items-center gap-2">
              How it works <ChevronRight size={16} />
            </a>
          </motion.div>
        </motion.div>

        {/* COMPARISON */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-28">
          <div className="grid md:grid-cols-2 gap-5">

            <div className="zama-panel p-6 border-danger/30">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-danger/15 flex items-center justify-center">
                  <Eye size={16} className="text-danger" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Traditional DEX</h3>
                  <p className="text-xs text-danger">Public · Vulnerable</p>
                </div>
              </div>
              <div className="space-y-2 font-mono text-xs">
                {[["price","3,241.50 USDC"],["amount","2.5 ETH"],["wallet","0x7f3a...b2e1"]].map(([k,v]) => (
                  <div key={k} className="flex justify-between p-2.5 rounded-lg bg-danger/5 border border-danger/20">
                    <span className="text-white/40">{k}</span>
                    <span className="text-danger">{v} 👁</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-danger/10 border border-danger/30 flex items-center gap-2">
                <AlertTriangle size={12} className="text-danger" />
                <span className="text-xs text-danger">Bot reads → front-runs → extracts profit</span>
              </div>
            </div>

            <div className="zama-panel-glow p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-zama-yellow/15 flex items-center justify-center">
                  <EyeOff size={16} className="text-zama-yellow" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">DarkPool DEX</h3>
                  <p className="text-xs text-zama-yellow">Encrypted · MEV-Proof</p>
                </div>
              </div>
              <div className="space-y-2 font-mono text-xs">
                {[["price","0x7f3a9b2e1c4d8f..."],["amount","0x2b9c4a1f7e3d2a..."],["wallet","0x7f3a...b2e1"]].map(([k,v]) => (
                  <div key={k} className="flex justify-between p-2.5 rounded-lg bg-zama-yellow/5 border border-zama-yellow/20">
                    <span className="text-white/40">{k}</span>
                    <span className="text-white/30 encrypted-blur cursor-pointer">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/30 flex items-center gap-2">
                <CheckCircle size={12} className="text-success" />
                <span className="text-xs text-success">Bot sees ciphertext → cannot act → 0 MEV</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* HOW IT WORKS */}
        <motion.div id="how" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-3">How It Works</h2>
            <p className="text-white/50">Four steps from plaintext to encrypted execution</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step:"01", icon: Lock,   title:"Client Encryption",  desc:"Price and amount encrypted in your browser using TFHE before any network call." },
              { step:"02", icon: Shield, title:"Encrypted Submission", desc:"Only ciphertext is sent. The mempool contains no readable order data." },
              { step:"03", icon: Zap,    title:"FHE Matching",        desc:"The contract compares encrypted prices using TFHE — no decryption required." },
              { step:"04", icon: CheckCircle, title:"Private Settlement", desc:"Matched orders settle. Only owners can decrypt their own results." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="zama-panel p-5 relative overflow-hidden hover:border-zama-yellow/30 transition-all">
                <div className="text-7xl font-black text-white/[0.04] absolute top-2 right-3 select-none">{step}</div>
                <div className="w-10 h-10 rounded-lg bg-zama-yellow/10 mb-4 flex items-center justify-center">
                  <Icon size={18} className="text-zama-yellow" />
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center">
          <div className="zama-panel-glow p-12 max-w-2xl mx-auto">
            <Lock size={36} className="text-zama-yellow mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white mb-3">Ready to trade privately?</h2>
            <p className="text-white/60 mb-8 text-sm">Connect MetaMask on Sepolia and submit your first encrypted order.</p>
            <button onClick={() => navigate("/dashboard")}
              className="btn-zama text-base px-10 py-4 flex items-center gap-2 mx-auto">
              Launch DApp <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
