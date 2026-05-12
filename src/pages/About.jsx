import { Shield, Lock, Zap, Eye, Code } from "lucide-react";

const TECH = [
  { icon: Shield, label: "Zama FHEVM",      desc: "FHE-enabled EVM for encrypted on-chain computation" },
  { icon: Lock,   label: "TFHE-rs",         desc: "FHE library, 64-bit encrypted integers" },
  { icon: Code,   label: "Solidity euint",  desc: "Smart contracts operating on encrypted types" },
  { icon: Zap,    label: "Relayer SDK",     desc: "Browser FHE encryption + key management" },
  { icon: Eye,    label: "React + Tailwind",desc: "Privacy-first trading UI" },
];

export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-3">About</h1>
          <p className="text-white/60 leading-relaxed">
            DarkPool DEX is a hackathon proof-of-concept demonstrating how Fully Homomorphic
            Encryption can eliminate MEV from decentralized exchanges — not by hiding transactions,
            but by making them mathematically uninspectable.
          </p>
        </div>

        <div className="zama-panel-glow p-6 mb-6">
          <h2 className="font-black text-white mb-3 text-lg">The MEV Problem</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-3">
            Every order on a transparent DEX is visible in the mempool before it settles.
            Bots read the price, amount, and direction — then insert their own transaction
            at a higher gas price, stealing value from legitimate traders.
          </p>
          <p className="text-white/60 text-sm leading-relaxed">
            In 2023 alone, MEV bots extracted over <span className="text-zama-yellow font-bold">$1.38B</span> from
            Ethereum users. This is a structural problem requiring a cryptographic solution.
          </p>
        </div>

        <div className="zama-panel p-6 mb-6">
          <h2 className="font-black text-white mb-3 text-lg">The FHE Solution</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Fully Homomorphic Encryption allows computations on encrypted data without
            decrypting it first. DarkPool encrypts order prices and amounts <span className="text-zama-yellow font-bold">client-side</span> before
            they ever touch the network. The contract matches orders by comparing ciphertexts
            directly — it never sees the underlying numbers.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="font-black text-white mb-4 text-lg">Tech Stack</h2>
          <div className="space-y-3">
            {TECH.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="zama-panel p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zama-yellow/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-zama-yellow" />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">{label}</div>
                  <div className="text-white/50 text-xs">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
