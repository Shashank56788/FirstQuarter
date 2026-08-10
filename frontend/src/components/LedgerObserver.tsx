import React from 'react';
import { Eye, ShieldCheck, Hash, Radio, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react';
import { LedgerState } from '../contract-bindings';

interface LedgerObserverProps {
  ledger: LedgerState;
  onResetStatus: () => void;
}

export const LedgerObserver: React.FC<LedgerObserverProps> = ({
  ledger,
  onResetStatus
}) => {
  return (
    <div className="bg-midnight-800/60 backdrop-blur-xl border border-midnight-700/70 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-midnight-700/60 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <Eye className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Midnight Public Ledger Observer</h2>
            <p className="text-xs text-slate-400">Verifiable public contract state readable by anyone on the network</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-xs text-cyan-400 font-mono">Live Sync</span>
        </div>
      </div>

      {/* Main Status Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Access Status Card */}
        <div
          className={`p-4 rounded-xl border transition-all duration-300 ${
            ledger.accessGranted
              ? 'bg-gradient-to-br from-emerald-950/80 to-midnight-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
              : 'bg-midnight-900/90 border-midnight-700/80'
          }`}
        >
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Access Status Output</span>
            {ledger.accessGranted && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                VERIFIED
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3 my-2">
            {ledger.accessGranted ? (
              <>
                <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-pulse" />
                <div>
                  <div className="text-lg font-bold text-emerald-300">accessGranted = true</div>
                  <div className="text-[11px] text-emerald-400/80 font-mono">
                    Public Event Emitted: Access Granted
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full border-2 border-slate-600 flex items-center justify-center text-slate-500 font-bold text-xs">
                  OFF
                </div>
                <div>
                  <div className="text-base font-semibold text-slate-400">accessGranted = false</div>
                  <div className="text-[11px] text-slate-500 font-mono">No active proof verified</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contract Metrics Card */}
        <div className="bg-midnight-900/90 p-4 rounded-xl border border-midnight-700/80 space-y-2">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>On-Chain Ledger Nonce</span>
            <span className="font-mono text-purple-400 font-bold">#{ledger.lastEventNonce}</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Registered Commitments</span>
            <span className="font-mono text-indigo-400 font-bold">{ledger.registeredCount} Entries</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-midnight-800">
            <span>Identity Leakage Risk</span>
            <span className="font-mono text-emerald-400 font-bold text-[11px] px-2 py-0.5 bg-emerald-500/10 rounded">
              0.00% (Mathematically Proven)
            </span>
          </div>
        </div>
      </div>

      {/* Merkle Root Display */}
      <div className="bg-midnight-950 p-4 rounded-xl border border-midnight-700/60 font-mono space-y-1">
        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-cyan-400" /> On-Chain Merkle Root Hash</span>
          <span className="text-[10px] text-emerald-400">Public State</span>
        </div>
        <div className="text-xs text-slate-200 break-all bg-midnight-900 p-2.5 rounded border border-midnight-800">
          {ledger.allowlistRoot}
        </div>
      </div>

      {/* Reset State Button */}
      {ledger.accessGranted && (
        <div className="pt-2">
          <button
            onClick={onResetStatus}
            className="w-full py-2 rounded-xl bg-midnight-900 hover:bg-midnight-800 border border-midnight-700 text-slate-400 hover:text-slate-200 text-xs font-mono transition flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Access Status Flag (Testing Utility)</span>
          </button>
        </div>
      )}
    </div>
  );
};
