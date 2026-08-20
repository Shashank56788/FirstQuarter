import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdminPanel } from './components/AdminPanel';
import { ProofConsole } from './components/ProofConsole';
import { LedgerObserver, AuditLog } from './components/LedgerObserver';
import { PrivacyInspectorModal } from './components/PrivacyInspectorModal';
import { MerkleVisualizer, ActiveProofPath } from './components/MerkleVisualizer';
import { MidnightWalletService, WalletState } from './midnight-sdk';
import { AllowlistContract, TransactionResult, LedgerState, computeCommitment } from './contract-bindings';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Wallet State
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    network: 'Disconnected',
    balance: '0 NIGHT',
    isLaceInstalled: false,
    isFreighterInstalled: false
  });

  // Contract and Ledger States
  const [contract] = useState(() => new AllowlistContract());
  const [ledger, setLedger] = useState<LedgerState>(() => contract.getPublicLedgerState());
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Advanced Redesign states
  const [registeredMembers, setRegisteredMembers] = useState<{
    commitment: string;
    index: number;
  }[]>([]);
  const [activeProofPath, setActiveProofPath] = useState<ActiveProofPath | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const walletService = MidnightWalletService.getInstance();

  const addAuditLog = (type: 'register' | 'prove' | 'reset' | 'system', message: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Check wallet availability on startup
  useEffect(() => {
    Promise.all([
      walletService.checkLaceAvailability(),
      walletService.checkFreighterAvailability()
    ]).then(([laceInstalled, freighterInstalled]) => {
      setWallet(prev => ({
        ...prev,
        isLaceInstalled: laceInstalled,
        isFreighterInstalled: freighterInstalled
      }));
    });

    addAuditLog('system', 'Midnight allowlist smart contract initialized in client environment.');
    addAuditLog('system', 'Depth-8 Merkle Tree generated (maximum capacity: 256 commitment leaves).');
  }, [contract]);

  const handleConnectLace = async () => {
    const res = await walletService.connectLaceWallet();
    setWallet(res);
    if (res.isConnected) addAuditLog('system', 'Connected to Midnight Lace wallet extension.');
  };

  const handleConnectFreighter = async () => {
    const res = await walletService.connectFreighterWallet();
    setWallet(res);
    if (res.isConnected) addAuditLog('system', 'Connected to Stellar Freighter wallet API.');
  };

  const handleDisconnectWallet = async () => {
    const res = await walletService.disconnectWallet();
    setWallet(res);
    addAuditLog('system', 'Wallet disconnected.');
  };

  // Add commitment handler
  const handleAddCommitment = (secret: string, salt: string) => {
    const res = contract.registerMemberSecret(secret, salt);
    const newRoot = contract.getPublicLedgerState().allowlistRoot;
    setLedger(contract.getPublicLedgerState());

    const newMember = {
      commitment: res.commitment,
      index: res.index
    };

    setRegisteredMembers(prev => [...prev, newMember]);
    addAuditLog('register', `Admin registered commitment hash at tree index #${res.index}. Merkle root updated.`);

    return {
      commitment: res.commitment,
      index: res.index,
      newRoot
    };
  };

  // Prover details lookup used for visualization sync
  const handleGetProofDetails = (secret: string, salt: string) => {
    const leaf = computeCommitment(secret, salt);
    let index = contract.merkleTree.leaves.findIndex((l: string) => l === leaf);
    const isMock = index === -1;
    if (isMock) index = 0; // fallback path to execute ZK evaluation mock

    const proof = contract.merkleTree.getProof(index);
    return {
      leaf,
      path: proof.path,
      directions: proof.directions,
      root: contract.getPublicLedgerState().allowlistRoot,
      index,
      isMock
    };
  };

  // Step changes generated during ZK Wizard runs
  const handleStepChange = (step: number, status: 'idle' | 'proving' | 'verified' | 'failed', details?: any) => {
    if (status === 'proving' && step === 0 && details) {
      setActiveProofPath({
        leaf: details.leaf,
        path: details.path,
        directions: details.directions,
        root: details.root,
        currentStep: 0,
        status: 'proving',
        index: details.index
      });
      addAuditLog('prove', 'Local membership verification initialized. Hashing private parameters.');
    } else if (status === 'proving') {
      setActiveProofPath(prev => prev ? { ...prev, currentStep: step } : null);
      if (step === 2) {
        addAuditLog('prove', 'Tracing Merkle proof path through sibling tree steps.');
      } else if (step === 5) {
        addAuditLog('prove', 'Synthesizing ZK constraints and compiling arithmetic circuits.');
      } else if (step === 7) {
        addAuditLog('prove', 'Broadcasting local proof payload to smart contract ledger.');
      }
    } else if (status === 'verified') {
      setActiveProofPath(prev => prev ? { ...prev, status: 'verified', currentStep: 8 } : null);
      addAuditLog('prove', 'ZK Proof verified successfully by contract. accessGranted flag set to true.');
    } else if (status === 'failed') {
      setActiveProofPath(prev => prev ? { ...prev, status: 'failed' } : null);
      addAuditLog('prove', 'ZK Proof verification rejected. Provided keys do not match any allowlist commitments.');
    }
  };

  // Prove membership transaction submitter
  const handleProveMembership = async (secret: string, salt: string): Promise<TransactionResult> => {
    const leaf = computeCommitment(secret, salt);
    let index = contract.merkleTree.leaves.findIndex((l: string) => l === leaf);
    if (index === -1) index = 0; // will fail contract verification circuit

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
    setActiveProofPath(null);
    addAuditLog('reset', 'Access granted token reset. Public access status set to false.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-midnight-950 text-slate-100 selection:bg-purple-500 selection:text-white cyber-grid">
      
      {/* Navbar Header */}
      <Navbar
        wallet={wallet}
        onConnectLace={handleConnectLace}
        onConnectFreighter={handleConnectFreighter}
        onDisconnect={handleDisconnectWallet}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Hero Gated Description */}
        <section className="relative rounded-3xl bg-gradient-to-r from-midnight-900 via-midnight-900/90 to-purple-950/20 p-6 border border-midnight-700/40 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none animate-float-slow"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none animate-float-slow-reverse"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-4xl space-y-3.5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Midnight Zero-Knowledge Protocol</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight">
                Prove Allowlist Membership Anonymously
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-350 leading-relaxed font-light">
                An administrator registers membership commitment hashes onto Midnight's private ledger state. Provers generate client-side Merkle inclusion ZK proofs locally, verifying authorization without broadcasting their identity, secret keys, or wallet address.
              </p>
            </div>
          </div>
        </section>

        {/* 2-Column Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Action Control Hub (5/12 grid spacing) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Action panel with tabs */}
            <AdminPanel
              onAddCommitment={handleAddCommitment}
              currentRoot={ledger.allowlistRoot}
              memberCount={ledger.registeredCount}
              registeredMembers={registeredMembers}
            />

            {/* ZK prover console component */}
            <ProofConsole
              onProveMembership={handleProveMembership}
              isConnected={wallet.isConnected}
              onGetProofDetails={handleGetProofDetails}
              onStepChange={handleStepChange}
            />
          </div>

          {/* Right Column: ZK Verification Hub (7/12 grid spacing) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Animated Merkle Tree and Prover pipeline */}
            <MerkleVisualizer
              activePath={activeProofPath}
              ledgerRoot={ledger.allowlistRoot}
            />

            {/* Public ledger observer & Event transaction logs */}
            <LedgerObserver
              ledger={ledger}
              onResetStatus={handleResetAccessStatus}
              auditLogs={auditLogs}
            />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-midnight-700/40 bg-midnight-950/90 py-5 flex-shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-slate-350">Midnight "First Quarter" Level 3 Submission</span>
          </div>
          <div className="font-mono text-slate-550 text-[10px]">
            Powered by Midnight Compact Language & Lace/Freighter Multi-Wallet Integration
          </div>
        </div>
      </footer>

      {/* Privacy modal specs */}
      <PrivacyInspectorModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        ledger={ledger}
      />
    </div>
  );
};
export default App;
