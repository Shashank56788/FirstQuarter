import React, { useState } from 'react';
import { X, Lock, Eye, ShieldAlert, CheckCircle, HelpCircle, ArrowRight, Shield } from 'lucide-react';
import { LedgerState } from '../contract-bindings';

interface PrivacyInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledger: LedgerState;
}

export const PrivacyInspectorModal: React.FC<PrivacyInspectorModalProps> = ({
  isOpen,
  onClose,
  ledger
}) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'firewall'>('comparison');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-midnight-900 border border-midnight-700/80 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
        
        {/* Glow decoration inside modal */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-midnight-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Midnight Privacy Model Specification</h2>
              <p className="text-[11px] text-slate-400">Mathematical boundary: Public Blockchain State vs. Client Private Witness</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-midnight-850 hover:bg-midnight-800 text-slate-400 hover:text-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-midnight-950 p-0.5 rounded-lg border border-midnight-850 self-start w-fit">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-1.2 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Data Disclosure Comparison
          </button>
          <button
            onClick={() => setActiveTab('firewall')}
            className={`px-4 py-1.2 text-[10px] font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'firewall'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ZK Firewall Model
          </button>
        </div>

        {/* Panels */}
        {activeTab === 'comparison' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Observer CAN see */}
            <div className="bg-midnight-850/80 border border-cyan-500/20 rounded-2xl p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-midnight-750 pb-2">
                <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <Eye className="w-4 h-4" /> Public State (Ledger)
                </span>
                <span className="text-[9px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20 font-semibold font-mono">
                  OBSERVERS SEE
                </span>
              </div>
              <ul className="text-[11.5px] text-slate-300 space-y-2.5 leading-relaxed font-sans">
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                  <span><strong>allowlistRoot (Bytes&lt;32&gt;)</strong>: The public cryptographic Merkle root hash of commitments.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                  <span><strong>accessGranted (Boolean)</strong>: Verifiable output flag set to true when any valid ZK proof is verified.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                  <span><strong>registeredCount (Uint&lt;32&gt;)</strong>: Total number of members registered by the administrator.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                  <span><strong>lastEventNonce (Uint&lt;64&gt;)</strong>: A sequence counter incrementing with contract events.</span>
                </li>
              </ul>
            </div>

            {/* Observer CANNOT see */}
            <div className="bg-midnight-850/80 border border-purple-500/20 rounded-2xl p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-midnight-750 pb-2">
                <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <Lock className="w-4 h-4" /> Private State (Witness)
                </span>
                <span className="text-[9px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20 font-semibold font-mono">
                  ZK PROTECTED
                </span>
              </div>
              <ul className="text-[11.5px] text-slate-300 space-y-2.5 leading-relaxed font-sans">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-450 font-bold mt-0.5">✗</span>
                  <span><strong>Your Wallet Address / PubKey</strong>: No wallet address is passed to the smart contract or saved in the tree.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-450 font-bold mt-0.5">✗</span>
                  <span><strong>Raw Secret Keys / Salts</strong>: Secret hex keys and blinding salts stay strictly inside client RAM.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-450 font-bold mt-0.5">✗</span>
                  <span><strong>Merkle Sibling Path Indexes</strong>: Path indices and directions are consumed locally, hidden in ZK parameters.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-450 font-bold mt-0.5">✗</span>
                  <span><strong>Linkability</strong>: Transactions are un-linkable, meaning observers cannot correlate consecutive proofs back to you.</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* ZK Firewall Model diagram and text */
          <div className="space-y-4 font-sans">
            <p className="text-[11.5px] text-slate-350 leading-relaxed">
              Midnight uses a client-side execution model. Smart contract state changes are calculated inside the user's browser, creating a cryptographic firewall that prevents identity leakages.
            </p>

            {/* Graphical representation of the firewall */}
            <div className="bg-midnight-950 p-5 rounded-2xl border border-midnight-850 flex flex-col md:flex-row items-center justify-around gap-6 py-8 relative">
              
              {/* Client Side box */}
              <div className="bg-midnight-900 border border-purple-500/40 p-3.5 rounded-xl text-center w-full md:w-48 space-y-2 shadow-lg">
                <div className="text-[10px] font-mono text-purple-400 font-bold flex items-center justify-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> CLIENT-SIDE RAM
                </div>
                <div className="text-[9.5px] font-mono text-slate-300 space-y-1 bg-midnight-950 p-2 rounded border border-midnight-850 text-left">
                  <div>• Secret Key</div>
                  <div>• Blinding Salt</div>
                  <div>• Merkle Path Steps</div>
                </div>
                <span className="text-[9px] text-slate-450 block leading-tight">Witnesses processed locally inside ZK circuit</span>
              </div>

              {/* Arrow and firewall line */}
              <div className="flex flex-col items-center justify-center space-y-1 text-slate-400">
                <div className="px-2.5 py-1 bg-purple-500/10 rounded-full border border-purple-500/20 text-[9px] font-mono text-purple-300 flex items-center gap-1 font-bold">
                  <Shield className="w-3 h-3 text-purple-400" /> ZK-Constraint Solver
                </div>
                <div className="flex items-center gap-1 mt-1 text-slate-500 animate-pulse">
                  <span>────────</span>
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-[8.5px] text-slate-500">Only Proof payload is exported</span>
              </div>

              {/* Ledger Side box */}
              <div className="bg-midnight-900 border border-cyan-500/40 p-3.5 rounded-xl text-center w-full md:w-48 space-y-2 shadow-lg">
                <div className="text-[10px] font-mono text-cyan-400 font-bold flex items-center justify-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> PUBLIC ON-CHAIN STATE
                </div>
                <div className="text-[9.5px] font-mono text-slate-300 space-y-1 bg-midnight-950 p-2 rounded border border-midnight-850 text-left">
                  <div>• Merkle Root Hash</div>
                  <div>• accessGranted: true</div>
                  <div>• registeredCount</div>
                </div>
                <span className="text-[9px] text-slate-450 block leading-tight">Ledger records public results after proof verification</span>
              </div>
            </div>

            <div className="bg-midnight-850/50 p-3 rounded-xl border border-midnight-800 text-[10px] text-slate-400 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">
                By proving inclusion relative to the public Merkle root without disclosing the path indices or leaf coordinates, Midnight guarantees mathematical privacy. The blockchain verifies the equation: <strong>Proof is mathematically correct = true</strong>, and grants access accordingly.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-midnight-800 pt-3 flex-shrink-0">
          <div className="text-[10px] text-slate-500 font-mono">
            Midnight compact 0.14.0 ZK Specifications
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
