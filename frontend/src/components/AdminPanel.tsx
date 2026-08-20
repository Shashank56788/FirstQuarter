import React, { useState, useEffect } from 'react';
import { UserPlus, Key, Eye, HelpCircle, Hash, Sparkles, Copy, Check, ListFilter, ClipboardCheck, ArrowUpRight } from 'lucide-react';
import { computeCommitment } from '../contract-bindings';

interface RegisteredMember {
  commitment: string;
  index: number;
}

interface AdminPanelProps {
  onAddCommitment: (secret: string, salt: string) => { commitment: string; index: number; newRoot: string };
  currentRoot: string;
  memberCount: number;
  registeredMembers: RegisteredMember[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onAddCommitment,
  currentRoot,
  memberCount,
  registeredMembers
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'explorer'>('register');
  const [secret, setSecret] = useState('');
  const [salt, setSalt] = useState('');
  const [computedPreview, setComputedPreview] = useState('');
  const [lastAdded, setLastAdded] = useState<{ commitment: string; index: number } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Compute real-time commitment hash preview as the user types
  useEffect(() => {
    if (secret && salt) {
      try {
        const hash = computeCommitment(secret, salt);
        setComputedPreview(hash);
      } catch (e) {
        setComputedPreview('');
      }
    } else {
      setComputedPreview('');
    }
  }, [secret, salt]);

  const generateRandomCredentials = () => {
    const randomBytes = (len: number) =>
      Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    const newSecret = randomBytes(64);
    const newSalt = randomBytes(64);
    
    setSecret(newSecret);
    setSalt(newSalt);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret || !salt) return;

    const result = onAddCommitment(secret, salt);
    setLastAdded({ commitment: result.commitment, index: result.index });
    
    // Clear fields
    setSecret('');
    setSalt('');
  };

  const triggerCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  };

  return (
    <div className="bg-midnight-800/40 backdrop-blur-xl border border-midnight-700/60 rounded-2xl p-5 shadow-xl flex flex-col h-[460px]">
      
      {/* Header and tab switcher */}
      <div className="flex items-center justify-between border-b border-midnight-700/60 pb-3 mb-4 flex-shrink-0">
        <div className="flex bg-midnight-950 p-0.5 rounded-lg border border-midnight-850">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-3.5 py-1.2 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Member
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-3.5 py-1.2 text-[10px] font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'explorer'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Allowlist Explorer
            <span className="px-1.5 py-0.2 bg-midnight-900 text-[8.5px] rounded border border-midnight-800 text-indigo-400 font-bold">
              {memberCount}
            </span>
          </button>
        </div>

        <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
          <Hash className="w-3 h-3 text-purple-400" />
          <span>Root: {currentRoot.substring(0, 6)}...</span>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-0 scrollbar">
        {activeTab === 'register' ? (
          <div className="space-y-4">
            <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Hash and commit new identity parameters into the blockchain tree. The raw values remain fully private.
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Secret key input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    Member Secret Key
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomCredentials}
                    className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter 64-char hex secret or auto-generate..."
                  className="w-full bg-midnight-950/80 border border-midnight-700/60 focus:border-indigo-500 rounded-xl px-3 py-2 text-[11px] text-slate-200 font-mono focus:outline-none transition placeholder:text-slate-600 shadow-inner"
                />
              </div>

              {/* Blinding salt input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Blinding Salt (Private)
                </label>
                <input
                  type="text"
                  value={salt}
                  onChange={(e) => setSalt(e.target.value)}
                  placeholder="Enter 64-char hex blinding salt..."
                  className="w-full bg-midnight-950/80 border border-midnight-700/60 focus:border-indigo-500 rounded-xl px-3 py-2 text-[11px] text-slate-200 font-mono focus:outline-none transition placeholder:text-slate-600 shadow-inner"
                />
              </div>

              {/* Hash Commitment preview box */}
              {computedPreview && (
                <div className="bg-midnight-950/90 border border-midnight-800 rounded-xl p-2.5 space-y-1 animate-fadeIn">
                  <span className="text-[9.5px] text-indigo-400 font-semibold flex items-center gap-1">
                    <Key className="w-3 h-3" /> Real-time Commitment Preview (SHA256)
                  </span>
                  <div className="text-[9.5px] font-mono text-slate-300 truncate break-all bg-midnight-900/60 p-1.5 rounded border border-midnight-850">
                    {computedPreview}
                  </div>
                  <span className="text-[8.5px] text-slate-500 font-sans block">
                    This hash is what gets registered on the ledger. Raw secrets never leave this panel.
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={!secret || !salt}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11.5px] font-bold shadow-md shadow-indigo-600/10 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Commitment to Allowlist</span>
              </button>
            </form>

            {/* Notification of last added member */}
            {lastAdded && (
              <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-3 text-[11px] space-y-1.5 animate-fadeIn">
                <div className="flex items-center text-emerald-400 font-bold gap-1">
                  <ClipboardCheck className="w-3.5 h-3.5" /> 
                  <span>Commitment Added at Index #{lastAdded.index}</span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-midnight-900/60 p-1.5 rounded border border-midnight-850 font-mono text-[10px]">
                  <span className="text-slate-300 truncate">{truncateHash(lastAdded.commitment)}</span>
                  <button
                    onClick={() => triggerCopy(lastAdded.commitment, 'last-added')}
                    className="p-1 rounded hover:bg-midnight-800 text-slate-400 hover:text-white transition"
                    title="Copy full commitment hash"
                  >
                    {copiedId === 'last-added' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-[11px] text-slate-400 font-sans">
              All public commitment hashes registered in the active Merkle Tree on the Midnight ledger.
            </div>

            <div className="space-y-2">
              {registeredMembers.map((member) => {
                const copyId = `explorer-${member.index}`;
                
                return (
                  <div 
                    key={`m-${member.index}`}
                    className="bg-midnight-900/50 border border-midnight-800 rounded-xl p-3 flex items-center justify-between text-[11px] hover:border-midnight-700/60 transition duration-200"
                  >
                    <div className="space-y-1 max-w-[240px]">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        Commitment #{member.index}
                        <span className="text-[9px] font-normal text-slate-500 font-mono">Index {member.index}</span>
                      </div>
                      <div className="font-mono text-[9px] text-slate-400 truncate break-all">
                        {truncateHash(member.commitment)}
                      </div>
                    </div>

                    <div className="flex items-center flex-shrink-0">
                      <button
                        onClick={() => triggerCopy(member.commitment, copyId)}
                        className="p-1.5 rounded-lg bg-midnight-950 border border-midnight-800 text-slate-400 hover:text-slate-200 hover:bg-midnight-850 transition"
                        title="Copy full commitment hash"
                      >
                        {copiedId === copyId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Zero registered state */}
              {registeredMembers.length === 0 && (
                <div className="py-12 border border-dashed border-midnight-800 rounded-xl text-center text-slate-500 text-xs font-sans">
                  No member commitments registered yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer detailing Merkle specification */}
      <div className="mt-4 pt-3 border-t border-midnight-800 text-[10px] text-slate-400 flex items-start gap-1.5 flex-shrink-0">
        <HelpCircle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed font-sans">
          Midnight smart contracts do not store member identities. They only maintain the root of the Merkle Tree commitment structure.
        </p>
      </div>
    </div>
  );
};
