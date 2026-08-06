import React, { useState } from 'react';
import { UserPlus, Key, ShieldAlert, CheckCircle2, Hash, Sparkles } from 'lucide-react';
import { computeCommitment } from '../../../contract/src';

interface AdminPanelProps {
  onAddCommitment: (secret: string, salt: string) => { commitment: string; index: number; newRoot: string };
  currentRoot: string;
  memberCount: number;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onAddCommitment,
  currentRoot,
  memberCount
}) => {
  const [secret, setSecret] = useState('');
  const [salt, setSalt] = useState('');
  const [lastAdded, setLastAdded] = useState<{ commitment: string; index: number } | null>(null);

  const generateRandomCredentials = () => {
    const randomBytes = (len: number) =>
      Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setSecret(randomBytes(64));
    setSalt(randomBytes(64));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret || !salt) return;

    const result = onAddCommitment(secret, salt);
    setLastAdded({ commitment: result.commitment, index: result.index });
  };

  return (
    <div className="bg-midnight-800/60 backdrop-blur-xl border border-midnight-700/70 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-midnight-700/60 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <UserPlus className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Admin Allowlist Register</h2>
            <p className="text-xs text-slate-400">Stores hashed member commitments in Midnight state (Zero Raw Address Leakage)</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-midnight-900/80 border border-midnight-700 rounded-lg text-xs font-mono text-cyan-400">
          Total Members: {memberCount}
        </div>
      </div>

      {/* Merkle Root Header */}
      <div className="bg-midnight-900/90 p-3.5 rounded-xl border border-midnight-700/80 font-mono text-xs space-y-1">
        <div className="text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-purple-400" /> Current Merkle Root</span>
          <span className="text-[10px] text-slate-500 font-sans">Depth: 8 (Max 256)</span>
        </div>
        <div className="text-slate-200 truncate font-mono text-[11px] bg-midnight-950 p-2 rounded border border-midnight-800">
          {currentRoot}
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-slate-300">Member Secret Key (Private)</label>
            <button
              type="button"
              onClick={generateRandomCredentials}
              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono transition"
            >
              <Sparkles className="w-3 h-3" /> Auto-Generate
            </button>
          </div>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="64-character hex secret string..."
            className="w-full bg-midnight-900/90 border border-midnight-700/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Blinding Salt (Private)</label>
          <input
            type="text"
            value={salt}
            onChange={(e) => setSalt(e.target.value)}
            placeholder="64-character hex salt..."
            className="w-full bg-midnight-900/90 border border-midnight-700/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
          />
        </div>

        <button
          type="submit"
          disabled={!secret || !salt}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition flex items-center justify-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Hashed Commitment to Tree</span>
        </button>
      </form>

      {lastAdded && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs space-y-1 animate-fadeIn">
          <div className="flex items-center text-emerald-400 font-semibold gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Commitment Registered at Index #{lastAdded.index}
          </div>
          <p className="text-[11px] font-mono text-slate-300 truncate">
            Hash: {lastAdded.commitment}
          </p>
        </div>
      )}
    </div>
  );
};
