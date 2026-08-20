import React, { useState } from 'react';
import { Eye, ShieldCheck, Lock, RotateCcw, Terminal, List, Hash, Copy, Check } from 'lucide-react';
import { LedgerState } from '../contract-bindings';

export interface AuditLog {
  id: string;
  timestamp: string;
  type: 'register' | 'prove' | 'reset' | 'system';
  message: string;
}

interface LedgerObserverProps {
  ledger: LedgerState;
  onResetStatus: () => void;
  auditLogs: AuditLog[];
}

export const LedgerObserver: React.FC<LedgerObserverProps> = ({
  ledger,
  onResetStatus,
  auditLogs
}) => {
  const [viewMode, setViewMode] = useState<'status' | 'logs' | 'json'>('status');
  const [copied, setCopied] = useState(false);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(ledger, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-midnight-800/40 backdrop-blur-xl border border-midnight-700/60 rounded-2xl p-5 shadow-xl flex flex-col h-[460px]">
      
      {/* Header and Switcher */}
      <div className="flex items-center justify-between border-b border-midnight-700/60 pb-3 mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400">
            <Eye className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Public Ledger Observer</h2>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-midnight-950 p-0.5 rounded-lg border border-midnight-850">
          <button
            onClick={() => setViewMode('status')}
            className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
              viewMode === 'status'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            State
          </button>
          <button
            onClick={() => setViewMode('logs')}
            className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
              viewMode === 'logs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Log
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'json'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3 h-3" /> Dump
          </button>
        </div>
      </div>

      {/* Main panel area */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-0 scrollbar">
        {viewMode === 'status' && (
          <div className="space-y-4">
            
            {/* Concentric Glowing Shield Display */}
            <div className="flex flex-col items-center justify-center py-6 bg-midnight-950/60 rounded-2xl border border-midnight-850 relative overflow-hidden h-[180px]">
              
              {/* Spinning decorative orbits in background */}
              {ledger.accessGranted && (
                <>
                  <div className="absolute w-36 h-36 border border-emerald-500/20 rounded-full animate-orbit-slow" />
                  <div className="absolute w-28 h-28 border border-dashed border-cyan-500/25 rounded-full animate-orbit-fast" />
                  <div className="absolute w-20 h-20 bg-emerald-500/5 rounded-full filter blur-xl animate-pulse" />
                </>
              )}

              {/* Centered Shield Asset */}
              <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-500 ${
                ledger.accessGranted
                  ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400 shadow-emerald-glow-md'
                  : 'bg-midnight-900 border-midnight-700 text-slate-500'
              }`}>
                {ledger.accessGranted ? (
                  <ShieldCheck className="w-9 h-9 animate-pulse" />
                ) : (
                  <Lock className="w-7 h-7" />
                )}
              </div>

              {/* Status title */}
              <div className="mt-3.5 text-center z-10">
                <div className={`text-xs font-bold font-mono tracking-wider ${
                  ledger.accessGranted ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {ledger.accessGranted ? 'accessGranted = true' : 'accessGranted = false'}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-sans">
                  {ledger.accessGranted 
                    ? 'A valid ZK proof was verified by the contract' 
                    : 'Awaiting valid proof submission'}
                </div>
              </div>
            </div>

            {/* Grid details cards */}
            <div className="grid grid-cols-2 gap-3.5 text-xs font-mono">
              <div className="bg-midnight-900/40 border border-midnight-800 p-3 rounded-xl">
                <div className="text-slate-500 text-[9px] uppercase font-sans">Total Members</div>
                <div className="text-slate-200 font-bold mt-1 text-sm">{ledger.registeredCount} Entries</div>
              </div>
              <div className="bg-midnight-900/40 border border-midnight-800 p-3 rounded-xl">
                <div className="text-slate-500 text-[9px] uppercase font-sans">Event Sequence Nonce</div>
                <div className="text-purple-400 font-bold mt-1 text-sm">#{ledger.lastEventNonce}</div>
              </div>
            </div>

            {/* Merkle root info */}
            <div className="bg-midnight-950 border border-midnight-850 p-3 rounded-xl font-mono text-[11px] space-y-1 shadow-inner">
              <div className="text-[9.5px] text-slate-450 flex items-center justify-between font-sans">
                <span>ON-CHAIN ROOT COMMITMENT</span>
                <span className="text-emerald-400 text-[8.5px] font-mono">ACTIVE STATE</span>
              </div>
              <div className="text-slate-300 break-all text-[10px] bg-midnight-900/40 p-1.5 rounded border border-midnight-800">
                {ledger.allowlistRoot}
              </div>
            </div>

            {/* Test utility reset button */}
            {ledger.accessGranted && (
              <button
                onClick={onResetStatus}
                className="w-full py-2 rounded-xl bg-midnight-900 hover:bg-midnight-850 border border-midnight-750 text-slate-450 hover:text-slate-300 text-[10.5px] font-mono transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Access State (Testing Utility)</span>
              </button>
            )}
          </div>
        )}

        {viewMode === 'logs' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400 font-sans mb-1">
              Live updates logged by the indexer service monitoring the Midnight contract events.
            </div>

            <div className="space-y-2 border-l border-midnight-800 pl-3 ml-2.5">
              {auditLogs.map((log) => (
                <div key={log.id} className="relative text-[11px] font-mono py-1">
                  
                  {/* Event type node marker */}
                  <div className={`absolute -left-[16.5px] top-2 w-2 h-2 rounded-full border ${
                    log.type === 'prove'
                      ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_4px_#10b981]'
                      : log.type === 'register'
                      ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_4px_#6366f1]'
                      : log.type === 'reset'
                      ? 'bg-amber-500 border-amber-400'
                      : 'bg-slate-650 border-slate-600'
                  }`} />

                  <div className="flex items-center justify-between text-[9px] text-slate-500">
                    <span>{log.timestamp}</span>
                    <span className="uppercase tracking-wide px-1.5 py-0.2 rounded bg-midnight-900 border border-midnight-800">
                      {log.type}
                    </span>
                  </div>
                  <div className="text-slate-300 mt-0.5 text-[10px] leading-relaxed">
                    {log.message}
                  </div>
                </div>
              ))}

              {auditLogs.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs font-sans">
                  No contract events logged yet.
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'json' && (
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex justify-between items-center text-[10px] text-slate-450 font-sans flex-shrink-0">
              <span>LEDGER PUBLIC PARAMETERS</span>
              <button
                onClick={handleCopyJSON}
                className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            
            <pre className="flex-1 text-[10px] font-mono text-cyan-300 bg-midnight-950 p-3 rounded-xl border border-midnight-850 overflow-auto scrollbar select-all">
              {JSON.stringify(ledger, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer warning */}
      <div className="mt-4 pt-3 border-t border-midnight-800 text-[10px] text-slate-400 flex items-center space-x-1.5 flex-shrink-0">
        <span className="flex h-1.5 w-1.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wide">Live sync observer actively listening for blocks</span>
      </div>
    </div>
  );
};
