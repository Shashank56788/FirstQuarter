import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Lock, ArrowRight, CheckCircle2, XCircle, Loader2, Info, Key, Wallet } from 'lucide-react';
import { TransactionResult } from '../contract-bindings';
import { computeCommitment } from '../contract-bindings';

interface ProofConsoleProps {
  onProveMembership: (secret: string, salt: string) => Promise<TransactionResult>;
  isConnected: boolean;
  onGetProofDetails: (secret: string, salt: string) => { leaf: string; path: string[]; directions: boolean[]; root: string; index: number };
  onStepChange: (step: number, status: 'idle' | 'proving' | 'verified' | 'failed', details?: any) => void;
}

export const ProofConsole: React.FC<ProofConsoleProps> = ({
  onProveMembership,
  isConnected,
  onGetProofDetails,
  onStepChange
}) => {
  const [secretKey, setSecretKey] = useState('');
  const [blindingSalt, setBlindingSalt] = useState('');
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [currentWizardStep, setCurrentWizardStep] = useState<number>(-1);
  const [lastResult, setLastResult] = useState<TransactionResult | null>(null);
  const [computedCommitmentPreview, setComputedCommitmentPreview] = useState('');



  // Real-time commitment preview calculation
  useEffect(() => {
    if (secretKey && blindingSalt) {
      try {
        const hash = computeCommitment(secretKey, blindingSalt);
        setComputedCommitmentPreview(hash);
      } catch (e) {
        setComputedCommitmentPreview('');
      }
    } else {
      setComputedCommitmentPreview('');
    }
  }, [secretKey, blindingSalt]);

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey || !blindingSalt) return;

    setIsGeneratingProof(true);
    setLastResult(null);

    try {
      // 1. Fetch Merkle path details from parent
      const details = onGetProofDetails(secretKey, blindingSalt);

      // Notify parent that proving started, pass Merkle details
      onStepChange(0, 'proving', details);
      setCurrentWizardStep(0);
      await new Promise(r => setTimeout(r, 650));

      // 2. Sibling Pathing
      onStepChange(2, 'proving');
      setCurrentWizardStep(1);
      await new Promise(r => setTimeout(r, 650));

      // 3. Compact ZK circuit constraints synthesising
      onStepChange(5, 'proving');
      setCurrentWizardStep(2);
      await new Promise(r => setTimeout(r, 850));

      // 4. Broadcasting ZK proof transaction
      onStepChange(7, 'proving');
      setCurrentWizardStep(3);
      await new Promise(r => setTimeout(r, 700));

      // 5. Submit contract action
      const result = await onProveMembership(secretKey, blindingSalt);
      setLastResult(result);

      if (result.success) {
        onStepChange(8, 'verified');
      } else {
        onStepChange(8, 'failed');
      }
    } catch (err: any) {
      const failedResult: TransactionResult = {
        success: false,
        accessGranted: false,
        ledgerState: {} as any,
        proofVerified: false,
        identityLeaked: false,
        error: err?.message || 'Failed proof submission'
      };
      setLastResult(failedResult);
      onStepChange(8, 'failed');
    } finally {
      setIsGeneratingProof(false);
      setCurrentWizardStep(-1);
    }
  };

  const stepsList = [
    { title: 'Witness Extraction', desc: 'Prepares private key and fetches Merkle sibling path' },
    { title: 'Merkle Pathing', desc: 'Traces inclusion index up through 8 SHA256 layers' },
    { title: 'Circuit Synthesis', desc: 'Computes zero-knowledge proof locally inside client browser' },
    { title: 'Ledger Broadcast', desc: 'Submits verified proof transaction to Midnight blockchain' }
  ];

  return (
    <div className="bg-midnight-800/40 backdrop-blur-xl border border-midnight-700/60 rounded-2xl p-5 shadow-xl flex flex-col h-[460px]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-midnight-700/60 pb-3 mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
            <Cpu className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">ZK Membership Prover</h2>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-md text-[9px] font-mono text-purple-300">
          <Lock className="w-3 h-3" /> Client Circuit
        </div>
      </div>

      {/* Main Section */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-0 scrollbar space-y-3.5">
        
        {!isGeneratingProof && !lastResult && (
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Generate a local zero-knowledge proof of allowance. Raw values never reach the blockchain.
          </p>
        )}

        {/* Proving Wizard Status Stepper */}
        {isGeneratingProof ? (
          <div className="space-y-3.5 py-2">
            <div className="flex items-center gap-2 bg-midnight-950/80 p-2.5 rounded-xl border border-midnight-850">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              <span className="text-[10px] font-mono text-slate-300">Synthesizing Client ZK Proof...</span>
            </div>
            
            <div className="relative pl-3 border-l border-midnight-800 space-y-2.5 ml-2">
              {stepsList.map((step, idx) => {
                const isActive = currentWizardStep === idx;
                const isDone = currentWizardStep > idx;
                
                return (
                  <div key={idx} className="relative text-[11px]">
                    {/* Glowing Bullet */}
                    <div className={`absolute -left-[18.5px] top-1 w-3 h-3 rounded-full border transition-all duration-300 ${
                      isDone 
                        ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]' 
                        : isActive 
                        ? 'bg-purple-500 border-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.6)] animate-ping' 
                        : 'bg-midnight-900 border-midnight-750'
                    }`} />
                    <div className={`absolute -left-[18.5px] top-1 w-3 h-3 rounded-full border transition-all duration-300 ${
                      isDone 
                        ? 'bg-cyan-500 border-cyan-400' 
                        : isActive 
                        ? 'bg-purple-500 border-purple-400' 
                        : 'bg-midnight-900 border-midnight-750'
                    }`} />

                    <div className="pl-2">
                      <div className={`font-semibold text-[10px] uppercase tracking-wide transition-colors ${
                        isActive ? 'text-purple-300' : isDone ? 'text-cyan-300' : 'text-slate-500'
                      }`}>
                        {idx + 1}. {step.title}
                      </div>
                      <div className={`text-[9.5px] font-light mt-0.5 leading-snug ${
                        isActive ? 'text-slate-300 font-normal' : isDone ? 'text-slate-400' : 'text-slate-650'
                      }`}>
                        {step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : lastResult ? (
          /* Proof feedback console */
          <div className="space-y-3.5">
            <div
              className={`rounded-xl p-3.5 border text-[11px] space-y-2.5 animate-fadeIn ${
                lastResult.success
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 shadow-emerald-glow'
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs border-b border-current/10 pb-2">
                <div className="flex items-center space-x-2">
                  {lastResult.success ? (
                    <>
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                      <span>ZK Proof Verified — Access Granted!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4.5 h-4.5 text-rose-400" />
                      <span>ZK Proof Rejected</span>
                    </>
                  )}
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-midnight-900/60 border border-current/20">
                  {lastResult.success ? 'PROOF_VALID' : 'PROOF_INVALID'}
                </span>
              </div>

              {lastResult.success ? (
                <div className="space-y-1.5 text-slate-300 text-[10px] font-mono pt-0.5">
                  <p className="flex justify-between">
                    <span>Public Status:</span>
                    <strong className="text-emerald-400">accessGranted = true</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Identity Exposure:</span>
                    <strong className="text-cyan-400">0 Bytes (Zero-Knowledge)</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Constraint Synthesiser:</span>
                    <strong className="text-purple-400">8 Merkle SHA256 Steps Verified</strong>
                  </p>
                </div>
              ) : (
                <p className="text-rose-300/90 font-mono text-[10.5px] pt-0.5 leading-relaxed bg-midnight-950/40 p-2 rounded border border-rose-500/20">
                  Error: {lastResult.error}
                </p>
              )}
            </div>

            <button
              onClick={() => setLastResult(null)}
              className="w-full py-2 bg-midnight-900 hover:bg-midnight-850 border border-midnight-700 text-slate-400 hover:text-slate-200 text-[10.5px] font-semibold rounded-xl transition cursor-pointer"
            >
              Clear Console
            </button>
          </div>
        ) : (
          /* Normal Input Form */
          <form onSubmit={handleSubmitProof} className="space-y-3.5">
            {/* Input secret key */}
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Your Private Secret Key
              </label>
              <input
                type="text"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Paste hex secret key (e.g. from Explorer)..."
                className="w-full bg-midnight-950/80 border border-midnight-700/60 focus:border-purple-500 rounded-xl px-3 py-2 text-[11px] text-slate-200 font-mono focus:outline-none transition placeholder:text-slate-650 shadow-inner"
              />
            </div>

            {/* Input blinding salt */}
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Your Private Blinding Salt
              </label>
              <input
                type="text"
                value={blindingSalt}
                onChange={(e) => setBlindingSalt(e.target.value)}
                placeholder="Paste hex blinding salt..."
                className="w-full bg-midnight-950/80 border border-midnight-700/60 focus:border-purple-500 rounded-xl px-3 py-2 text-[11px] text-slate-200 font-mono focus:outline-none transition placeholder:text-slate-650 shadow-inner"
              />
            </div>

            {/* Live Hashing preview inside prover */}
            {computedCommitmentPreview && (
              <div className="bg-midnight-950/85 border border-midnight-850 p-2.5 rounded-xl space-y-1.5 animate-fadeIn">
                <span className="text-[9.5px] text-purple-400 font-semibold flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" /> Computed Leaf Hash (Private Witness)
                </span>
                <div className="text-[9.5px] font-mono text-slate-300 truncate bg-midnight-900/60 p-1.5 rounded border border-midnight-850 shadow-inner">
                  {computedCommitmentPreview}
                </div>
              </div>
            )}

            {/* Wallet warning banner if not connected */}
            {!isConnected && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 flex items-start space-x-2 text-[10px] text-slate-400">
                <Wallet className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
                <p className="leading-normal">
                  Wallet disconnected. Connect your wallet via the navbar header to unlock ZK proof broadcast permissions.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!secretKey || !blindingSalt || !isConnected}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none text-white text-[11.5px] font-bold shadow-md shadow-purple-600/10 transition-all transform active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Generate & Submit ZK Proof</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {/* Info bubble */}
      {!isGeneratingProof && !lastResult && (
        <div className="mt-4 pt-3 border-t border-midnight-800 text-[10px] text-slate-400 flex items-start gap-1.5 flex-shrink-0">
          <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed font-sans">
            Client ZK proofs evaluate the equations inside browser memory. Your private keys never touch the ledger, ensuring mathematical anonymity.
          </p>
        </div>
      )}
    </div>
  );
};
