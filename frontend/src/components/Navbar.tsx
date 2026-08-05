import React from 'react';
import { ShieldCheck, Wallet, Lock, Key, ExternalLink, Activity } from 'lucide-react';
import { WalletState } from '../midnight-sdk';

interface NavbarProps {
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  onOpenPrivacyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  onConnect,
  onDisconnect,
  onOpenPrivacyModal
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-midnight-900/80 border-b border-midnight-700/60 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-midnight-900 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                First Quarter
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
                LEVEL 3
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span>Midnight Private Allowlist</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </p>
          </div>
        </div>

        {/* Center Privacy Shields */}
        <div className="hidden md:flex items-center space-x-2 bg-midnight-800/80 px-4 py-2 rounded-xl border border-midnight-700/80 shadow-inner">
          <Lock className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-300 font-medium">Selective Disclosure Active</span>
          <span className="text-slate-600">|</span>
          <button
            onClick={onOpenPrivacyModal}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2 flex items-center gap-1 transition"
          >
            Privacy Model Specs <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Right Actions: Wallet & Network */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 bg-midnight-800/50 px-3 py-1.5 rounded-lg border border-midnight-700/50 text-xs font-mono text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Testnet</span>
          </div>

          {wallet.isConnected ? (
            <div className="flex items-center space-x-2">
              <div className="px-3.5 py-1.5 rounded-xl bg-midnight-800 border border-emerald-500/30 text-xs font-mono text-slate-200 flex items-center space-x-2 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{wallet.address?.substring(0, 8)}...{wallet.address?.substring(wallet.address.length - 6)}</span>
              </div>
              <button
                onClick={onDisconnect}
                className="p-2 rounded-xl bg-midnight-800 hover:bg-rose-500/10 border border-midnight-700 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs transition"
                title="Disconnect Lace Wallet"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition transform active:scale-95 flex items-center space-x-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Lace Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
