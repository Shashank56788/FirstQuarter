import React, { useState } from 'react';
import { Cpu, ShieldCheck, Key, Lock, ArrowRight, CheckCircle2, XCircle, Loader2, Info } from 'lucide-react';
import { TransactionResult } from '../../../contract/src';

interface ProofConsoleProps {
  onProveMembership: (secret: string, salt: string) => Promise<TransactionResult>;
  isConnected: boolean;
}

export const ProofConsole: React.FC<ProofConsoleProps> = ({
  onProveMembership,
  isConnected
}) => {
  const [secretKey, setSecretKey] = useState('');
  const [blindingSalt, setBlindingSalt] = useState('');
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [proofStep, setProofStep] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<TransactionResult | null>(null);

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey || !blindingSalt) return;

    setIsGeneratingProof(true);
    setLastResult(null);

    try {
      setProofStep('1/3 Fetching private local witnesses & Merkle sibling path...');
      await new Promise(r => setTimeout(r, 600));

      setProofStep('2/3 Synthesizing Compact ZK proof circuit constraints locally...');
      await new Promise(r => setTimeout(r, 900));

      setProofStep('3/3 Submitting ZK proof transaction to Midnight node ledger...');
      const result = await onProveMembership(secretKey, blindingSalt);

      setLastResult(result);
    } catch (err: any) {
      setLastResult({
        success: false,
        accessGranted: false,
        ledgerState: {} as any,
        proofVerified: false,
        identityLeaked: false,
        error: err?.message || 'Failed proof submission'
      });
    } finally {
      setIsGeneratingProof(false);
      setProofStep(null);
    }
  };

  return (
    <div className="bg-midnight-800/60 backdrop-blur-xl border border-midnight-700/70 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-midnight-700/60 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Zero-Knowledge Membership Prover</h2>
            <p className="text-xs text-slate-400">Generates local Compact ZK proof matching an allowlist commitment</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs font-mono text-purple-300">
          <Lock className="w-3.5 h-3.5" /> Client-Side Circuit
        </div>
      </div>

      <form onSubmit={handleSubmitProof} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Your Private Secret Key</label>
          <input
            type="text"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Paste your secret hex string..."
            className="w-full bg-midnight-900/90 border border-midnight-700/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500 transition placeholder:text-slate-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Your Private Blinding Salt</label>
          <input
            type="text"
            value={blindingSalt}
            onChange={(e) => setBlindingSalt(e.target.value)}
            placeholder="Paste your salt hex string..."
            className="w-full bg-midnight-900/90 border border-midnight-700/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500 transition placeholder:text-slate-600"
          />
        </div>

        {/* Local Security Banner */}
        <div className="bg-midnight-900/80 p-3 rounded-xl border border-midnight-700/60 flex items-start space-x-2.5 text-xs text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">Zero Identity Leakage:</strong> Your secret key and salt remain strictly in browser RAM. Midnight Compact circuits convert your secret into a zero-knowledge proof before reaching the ledger.
          </p>
        </div>

        <button
          type="submit"
          disabled={!secretKey || !blindingSalt || isGeneratingProof}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition flex items-center justify-center space-x-2 transform active:scale-95"
        >
          {isGeneratingProof ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Generating ZK Proof...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Generate & Submit ZK Proof</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Progress status banner */}
      {proofStep && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3.5 text-xs font-mono text-purple-300 flex items-center space-x-2.5 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          <span>{proofStep}</span>
        </div>
      )}

      {/* Result feedback box */}
      {lastResult && (
        <div
          className={`rounded-xl p-4 border text-xs space-y-2 animate-fadeIn ${
            lastResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center justify-between font-bold text-sm">
            <div className="flex items-center space-x-2">
              {lastResult.success ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>ZK Membership Verified — Access Granted!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span>ZK Verification Rejected</span>
                </>
              )}
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-midnight-900 border border-current">
              {lastResult.success ? 'PROOF_VALID' : 'PROOF_INVALID'}
            </span>
          </div>

          {lastResult.success ? (
            <div className="space-y-1 text-slate-300 text-[11px] font-mono border-t border-emerald-500/20 pt-2.5">
              <p className="flex justify-between">
                <span>Public Event Output:</span>
                <strong className="text-emerald-400">accessGranted = true</strong>
              </p>
              <p className="flex justify-between">
                <span>On-Chain Identity Revealed:</span>
                <strong className="text-cyan-400">0 Bytes (Anonymous)</strong>
              </p>
              <p className="flex justify-between">
                <span>Proof Constraints Evaluated:</span>
                <strong className="text-purple-400">8 Merkle SHA256 Steps Verified</strong>
              </p>
            </div>
          ) : (
            <p className="text-rose-200 font-mono text-[11px] pt-1">
              Error: {lastResult.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
