import React from 'react';
import { X, Lock, Eye, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-midnight-900 border border-midnight-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-midnight-700/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Lock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Midnight Privacy Model Specification</h2>
              <p className="text-xs text-slate-400">Strict technical boundary: Public Ledger State vs. Client Private Witness</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-midnight-800 hover:bg-midnight-700 text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side by Side Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* What Ledger CAN SEE */}
          <div className="bg-midnight-800/80 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-midnight-700 pb-2">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> An Observer CAN See:
              </span>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded font-mono">Public State</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 font-mono">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span>The Merkle Root Hash of allowlist commitments (`allowlistRoot`).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span>The boolean flag outcome (`accessGranted = true / false`).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span>The total count of registered commitments (`registeredCount`).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span>Contract transaction sequence nonce (`lastEventNonce`).</span>
              </li>
            </ul>
          </div>

          {/* What Ledger CANNOT SEE */}
          <div className="bg-midnight-800/80 border border-purple-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-midnight-700 pb-2">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> An Observer CANNOT See:
              </span>
              <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded font-mono">Zero-Knowledge Protected</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 font-mono">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✗</span>
                <span>Which member identity or address proved access.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✗</span>
                <span>The user's raw secret key or blinding salt.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✗</span>
                <span>The leaf index position in the Merkle tree.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✗</span>
                <span>Timing correlation linking transaction to an identity.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Interactive JSON State Viewer */}
        <div className="bg-midnight-950 p-4 rounded-2xl border border-midnight-800 space-y-2">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Live On-Chain Public Ledger Dump (Readable by anyone)</span>
            <span className="text-[10px] font-mono text-emerald-400">0 User Identity Fields</span>
          </div>
          <pre className="text-[11px] font-mono text-cyan-300 bg-midnight-900 p-3 rounded-xl border border-midnight-800 overflow-x-auto">
{JSON.stringify(ledger, null, 2)}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition"
          >
            Close Privacy Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
