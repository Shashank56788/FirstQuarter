import React, { useState } from 'react';
import { ShieldCheck, Wallet, Lock, Activity, X, Zap, ChevronRight } from 'lucide-react';
import { WalletState } from '../midnight-sdk';

interface NavbarProps {
  wallet: WalletState;
  onConnectLace: () => Promise<void>;
  onConnectFreighter: () => Promise<void>;
  onDisconnect: () => void;
  onOpenPrivacyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  onConnectLace,
  onConnectFreighter,
  onDisconnect,
  onOpenPrivacyModal
}) => {
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleLaceSelect = async () => {
    setShowWalletModal(false);
    await onConnectLace();
  };

  const handleFreighterSelect = async () => {
    setShowWalletModal(false);
    await onConnectFreighter();
  };



  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-midnight-950/75 border-b border-midnight-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Brand Info */}
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/10">
              <div className="h-full w-full bg-midnight-900 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="h-5.5 w-5.5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
                  First Quarter
                </h1>
                <span className="px-2 py-0.5 text-[9px] font-semibold tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                  LEVEL 3
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <span>Midnight ZK dApp</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </p>
            </div>
          </div>

          {/* Selective Disclosure Info Badge (Hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-2.5 bg-midnight-900/80 px-4 py-2 rounded-xl border border-midnight-800 shadow-inner">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-300 font-medium">ZK Selective Disclosure Active</span>
            <span className="text-slate-700 font-light">|</span>
            <button
              onClick={onOpenPrivacyModal}
              className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2 flex items-center gap-1 transition"
            >
              Privacy Specs
            </button>
          </div>

          {/* Wallet connection area */}
          <div className="flex items-center space-x-3">
            {wallet.isConnected && (
              <div className="hidden sm:flex items-center space-x-2 bg-midnight-900/60 px-3 py-1.5 rounded-lg border border-midnight-800 text-[10px] font-mono text-slate-300">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>{wallet.network}</span>
              </div>
            )}

            {wallet.isConnected ? (
              <div className="flex items-center space-x-2.5">
                <div className="px-3.5 py-1.5 rounded-xl bg-midnight-900/90 border border-emerald-500/30 text-xs font-mono text-slate-200 flex items-center space-x-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                  <span>
                    {wallet.address?.substring(0, 6)}...{wallet.address?.substring(wallet.address.length - 6)}
                  </span>
                  {wallet.walletType && (
                    <span className="px-1.5 py-0.5 text-[8px] bg-purple-500/20 text-purple-300 rounded font-sans font-extrabold uppercase tracking-wide">
                      {wallet.walletType}
                    </span>
                  )}
                </div>
                <button
                  onClick={onDisconnect}
                  className="px-3 py-1.5 rounded-xl bg-midnight-900 hover:bg-rose-500/10 border border-midnight-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs transition duration-200"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="px-4.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all duration-300 transform active:scale-95 flex items-center space-x-2 cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Wallet Selector Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-midnight-900 border border-midnight-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative overflow-hidden">
            
            {/* Ambient blur inside modal */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            
            <div className="flex items-center justify-between border-b border-midnight-800 pb-3">
              <div className="flex items-center space-x-2.5 text-slate-100 font-bold text-sm">
                <Wallet className="w-4.5 h-4.5 text-purple-400" />
                <span>Connect Web3 Wallet</span>
              </div>
              <button
                onClick={() => setShowWalletModal(false)}
                className="p-1 rounded-lg bg-midnight-850 hover:bg-midnight-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Connect one of the supported wallets to sign transactions and verify private states using Zero-Knowledge proofs:
            </p>

            <div className="space-y-2.5 pt-1">
              {/* Option 1: Lace Wallet */}
              <button
                onClick={handleLaceSelect}
                className="w-full p-3 rounded-2xl bg-midnight-850 hover:bg-midnight-800/80 border border-purple-500/20 hover:border-purple-500/40 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400 group-hover:scale-105 transition">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      Midnight Lace Wallet
                      {wallet.isLaceInstalled ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" title="Extension Detected"></span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" title="Extension Not Detected"></span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">Official Midnight Blockchain Wallet</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition" />
              </button>

              {/* Option 2: Freighter Wallet */}
              <button
                onClick={handleFreighterSelect}
                className="w-full p-3 rounded-2xl bg-midnight-850 hover:bg-midnight-800/80 border border-cyan-500/20 hover:border-cyan-500/40 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition">
                    <Zap className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      Stellar Freighter Wallet
                      {wallet.isFreighterInstalled ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#22d3ee]" title="Extension Detected"></span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" title="Extension Not Detected"></span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">Freighter Extension / Stellar Network</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
