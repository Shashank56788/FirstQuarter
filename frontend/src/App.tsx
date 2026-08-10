import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdminPanel } from './components/AdminPanel';
import { ProofConsole } from './components/ProofConsole';
import { LedgerObserver } from './components/LedgerObserver';
import { PrivacyInspectorModal } from './components/PrivacyInspectorModal';
import { MidnightWalletService, WalletState } from './midnight-sdk';
import { AllowlistContract, TransactionResult, LedgerState, computeCommitment } from './contract-bindings';
import { ShieldCheck, Lock, Eye, Key, Sparkles, BookOpen } from 'lucide-react';

export const App: React.FC = () => {
  // Wallet State - Starts strictly disconnected by default
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    network: 'Disconnected',
    balance: '0 NIGHT',
    isLaceInstalled: false
  });

  // Contract instance
  const [contract] = useState(() => new AllowlistContract());
  const [ledger, setLedger] = useState<LedgerState>(() => contract.getPublicLedgerState());
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const walletService = MidnightWalletService.getInstance();

  // Check Lace availability on startup without auto-connecting
  useEffect(() => {
    walletService.checkLaceAvailability().then((installed) => {
      setWallet(prev => ({ ...prev, isLaceInstalled: installed }));
    });

    // Pre-register one member so the Merkle tree is active out-of-the-box
    const defaultSecret = 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90';
    const defaultSalt = '1111111111111111111111111111111111111111111111111111111111111111';
    contract.registerMemberSecret(defaultSecret, defaultSalt);
    setLedger(contract.getPublicLedgerState());
  }, [contract]);

  const handleConnectLace = async () => {
    const res = await walletService.connectLaceWallet();
    setWallet(res);
  };

  const handleConnectDemo = async () => {
    const res = await walletService.connectDemoWallet();
    setWallet(res);
  };

  const handleDisconnectWallet = async () => {
    const res = await walletService.disconnectWallet();
    setWallet(res);
  };

  const handleAddCommitment = (secret: string, salt: string) => {
    const res = contract.registerMemberSecret(secret, salt);
    setLedger(contract.getPublicLedgerState());
    return {
      commitment: res.commitment,
      index: res.index,
      newRoot: contract.getPublicLedgerState().allowlistRoot
    };
  };

  const handleProveMembership = async (secret: string, salt: string): Promise<TransactionResult> => {
    const leaf = computeCommitment(secret, salt);
    // Find index or default to 0
    let index = contract.merkleTree.leaves.findIndex(l => l === leaf);
    if (index === -1) index = 0; // Will fail ZK proof if not in tree

    const proof = contract.merkleTree.getProof(index);
    const result = contract.proveMembership({
      secretKey: secret,
      blindingSalt: salt,
      merklePath: proof.path,
      pathDirections: proof.directions
    });

    setLedger(contract.getPublicLedgerState());
    return result;
  };

  const handleResetAccessStatus = () => {
    contract.resetAccessStatus();
    setLedger(contract.getPublicLedgerState());
  };

  return (
    <div className="min-h-screen flex flex-col bg-midnight-900 text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Header / Navbar */}
      <Navbar
        wallet={wallet}
        onConnectLace={handleConnectLace}
        onConnectDemo={handleConnectDemo}
        onDisconnect={handleDisconnectWallet}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner */}
        <section className="relative rounded-3xl bg-gradient-to-r from-midnight-800 via-midnight-800/90 to-purple-950/40 p-8 border border-midnight-700/80 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Midnight Blockchain Privacy Paradigm</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Prove Membership in a Private Allowlist Without Revealing Who You Are
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              Selective disclosure dApp powered by Midnight Compact ZK smart contracts. An admin maintains hashed identity commitments in private state. Members generate local zero-knowledge proofs to unlock access — leaving zero trace of their identity or address on the public ledger.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Zero Identity Leakage
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-cyan-400">
                <Lock className="w-4 h-4" /> Merkle ZK Circuit
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-purple-400">
                <BookOpen className="w-4 h-4" /> Verifiable Public Output
              </span>
            </div>
          </div>
        </section>

        {/* 3-Column Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Admin Register */}
          <div className="lg:col-span-1">
            <AdminPanel
              onAddCommitment={handleAddCommitment}
              currentRoot={ledger.allowlistRoot}
              memberCount={ledger.registeredCount}
            />
          </div>

          {/* Column 2: User ZK Prover */}
          <div className="lg:col-span-1">
            <ProofConsole
              onProveMembership={handleProveMembership}
              isConnected={wallet.isConnected}
            />
          </div>

          {/* Column 3: Public Ledger Observer */}
          <div className="lg:col-span-1">
            <LedgerObserver
              ledger={ledger}
              onResetStatus={handleResetAccessStatus}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-midnight-700/60 bg-midnight-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-slate-300">Midnight "First Quarter" Level 3 Submission</span>
          </div>
          <div className="font-mono text-slate-500 text-[11px]">
            Powered by Midnight Compact Language & Lace Wallet Integration
          </div>
        </div>
      </footer>

      {/* Privacy Model Inspector Modal */}
      <PrivacyInspectorModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        ledger={ledger}
      />
    </div>
  );
};
