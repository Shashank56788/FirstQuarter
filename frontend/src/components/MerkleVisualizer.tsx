import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Hash, ArrowUp, CheckCircle2, GitCommit, GitMerge, AlertCircle, HelpCircle } from 'lucide-react';

export interface ActiveProofPath {
  leaf: string;
  path: string[];
  directions: boolean[];
  root: string;
  currentStep: number; // 0 to 8
  status: 'idle' | 'proving' | 'verified' | 'failed';
  index: number;
}

interface MerkleVisualizerProps {
  activePath: ActiveProofPath | null;
  ledgerRoot: string;
}

export const MerkleVisualizer: React.FC<MerkleVisualizerProps> = ({ activePath, ledgerRoot }) => {
  const [viewMode, setViewMode] = useState<'pipeline' | 'tree'>('pipeline');
  const [hoveredHash, setHoveredHash] = useState<string | null>(null);

  // Helper to truncate hashes for visual layout
  const truncateHash = (hash: string) => {
    if (!hash || hash === '0'.repeat(64)) return '0x0000...0000';
    return `0x${hash.substring(0, 4)}...${hash.substring(hash.length - 4)}`;
  };

  // Helper to check if a node is the default zero node
  const isDefaultNode = (hash: string) => hash === '0'.repeat(64);

  // Simple representation of a Merkle Tree structure (Depth 3 - 8 Leaves)
  // Used for the conceptual tree view
  const renderTreeView = () => {
    // Determine active index for tracing paths
    const activeIndex = activePath && activePath.status !== 'idle' ? activePath.index % 8 : -1;
    
    // Generate tree paths for Depth 3 (Leaves: 0-7)
    // We can compute which nodes on each level are active
    const isActiveNode = (level: number, nodeIndex: number): 'active' | 'sibling' | 'inactive' => {
      if (activeIndex === -1) return 'inactive';
      
      // Active index at current level
      const currentActiveIndexAtLevel = Math.floor(activeIndex / Math.pow(2, level));
      const siblingIndexAtLevel = currentActiveIndexAtLevel % 2 === 0 
        ? currentActiveIndexAtLevel + 1 
        : currentActiveIndexAtLevel - 1;

      if (nodeIndex === currentActiveIndexAtLevel) return 'active';
      if (nodeIndex === siblingIndexAtLevel) return 'sibling';
      return 'inactive';
    };

    const levels = [
      { name: 'Leaves (Commitments)', nodes: 8 },
      { name: 'Level 1 Hashes', nodes: 4 },
      { name: 'Level 2 Hashes', nodes: 2 },
      { name: 'Root Hash', nodes: 1 },
    ];

    return (
      <div className="flex flex-col items-center justify-center py-6 font-sans relative overflow-hidden h-[360px]">
        {/* Connection Lines (SVG Backing) */}
        <svg className="absolute inset-0 w-full h-full text-midnight-700/40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Sibling Path lines dynamically colored when active */}
          {/* Level 0 to Level 1 connections */}
          {Array.from({ length: 8 }).map((_, i) => {
            const parentIndex = Math.floor(i / 2);
            const isActive = activeIndex !== -1 && Math.floor(activeIndex / 2) === parentIndex && (activeIndex === i);
            const isSibling = activeIndex !== -1 && Math.floor(activeIndex / 2) === parentIndex && (activeIndex !== i);
            const color = isActive ? '#06B6D4' : isSibling ? '#A855F7' : 'currentColor';
            const opacity = isActive || isSibling ? 0.7 : 0.25;
            const strokeWidth = isActive ? 2 : 1;
            
            // Approximate coordinates based on level flex positions
            const x1 = `${6.25 + i * 12.5}%`;
            const y1 = '78%';
            const x2 = `${12.5 + parentIndex * 25}%`;
            const y2 = '52%';
            
            return (
              <line 
                key={`line-0-${i}`} 
                x1={x1} y1={y1} x2={x2} y2={y2} 
                stroke={color} 
                strokeWidth={strokeWidth} 
                opacity={opacity} 
                strokeDasharray={isActive ? "3,3" : undefined}
                className={isActive ? "animate-[shimmer_2s_infinite_linear]" : ""}
              />
            );
          })}

          {/* Level 1 to Level 2 connections */}
          {Array.from({ length: 4 }).map((_, i) => {
            const parentIndex = Math.floor(i / 2);
            const activeParent = activeIndex !== -1 ? Math.floor(activeIndex / 2) : -1;
            const isActive = activeIndex !== -1 && Math.floor(activeParent / 2) === parentIndex && (activeParent === i);
            const isSibling = activeIndex !== -1 && Math.floor(activeParent / 2) === parentIndex && (activeParent !== i);
            const color = isActive ? '#06B6D4' : isSibling ? '#A855F7' : 'currentColor';
            const opacity = isActive || isSibling ? 0.8 : 0.25;
            const strokeWidth = isActive ? 2 : 1;
            
            const x1 = `${12.5 + i * 25}%`;
            const y1 = '46%';
            const x2 = `${25 + parentIndex * 50}%`;
            const y2 = '24%';
            
            return (
              <line 
                key={`line-1-${i}`} 
                x1={x1} y1={y1} x2={x2} y2={y2} 
                stroke={color} 
                strokeWidth={strokeWidth} 
                opacity={opacity}
              />
            );
          })}

          {/* Level 2 to Root connections */}
          {Array.from({ length: 2 }).map((_, i) => {
            const activeParentLevel2 = activeIndex !== -1 ? Math.floor(activeIndex / 4) : -1;
            const isActive = activeIndex !== -1 && activeParentLevel2 === i;
            const isSibling = activeIndex !== -1 && activeParentLevel2 !== i;
            const color = isActive ? '#06B6D4' : isSibling ? '#A855F7' : 'currentColor';
            const opacity = isActive || isSibling ? 0.9 : 0.25;
            const strokeWidth = isActive ? 2 : 1;
            
            const x1 = `${25 + i * 50}%`;
            const y1 = '18%';
            const x2 = '50%';
            const y2 = '4%';
            
            return (
              <line 
                key={`line-2-${i}`} 
                x1={x1} y1={y1} x2={x2} y2={y2} 
                stroke={color} 
                strokeWidth={strokeWidth} 
                opacity={opacity}
              />
            );
          })}
        </svg>

        {/* Level 3: Root (Top) */}
        <div className="absolute top-1 flex flex-col items-center">
          <div 
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
              activeIndex !== -1 
                ? 'bg-midnight-800 border-cyan-400 shadow-cyan-glow-md text-cyan-400' 
                : 'bg-midnight-900 border-midnight-700 text-slate-500'
            }`}
            title={`Root Hash: ${ledgerRoot}`}
          >
            <Hash className="w-5 h-5" />
          </div>
          <span className="text-[9px] text-slate-400 font-mono mt-1">Root Node</span>
        </div>

        {/* Level 2: Hashes */}
        <div className="absolute top-[80px] w-full flex justify-around px-8">
          {Array.from({ length: 2 }).map((_, i) => {
            const state = isActiveNode(2, i);
            return (
              <div key={`n2-${i}`} className="flex flex-col items-center">
                <div 
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                    state === 'active' 
                      ? 'bg-midnight-800 border-cyan-400 text-cyan-400 shadow-cyan-glow' 
                      : state === 'sibling'
                      ? 'bg-midnight-800 border-purple-500 text-purple-400 shadow-purple-glow'
                      : 'bg-midnight-900/60 border-midnight-700/60 text-slate-600'
                  }`}
                >
                  <span className="text-[10px] font-mono">H2_{i}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Level 1: Hashes */}
        <div className="absolute top-[170px] w-full flex justify-around px-4">
          {Array.from({ length: 4 }).map((_, i) => {
            const state = isActiveNode(1, i);
            return (
              <div key={`n1-${i}`} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                    state === 'active' 
                      ? 'bg-midnight-800 border-cyan-400 text-cyan-400 shadow-cyan-glow' 
                      : state === 'sibling'
                      ? 'bg-midnight-800 border-purple-500 text-purple-400 shadow-purple-glow'
                      : 'bg-midnight-900/40 border-midnight-800 text-slate-700'
                  }`}
                >
                  <span className="text-[9px] font-mono">H1_{i}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Level 0: Leaves (Bottom) */}
        <div className="absolute bottom-2 w-full flex justify-between px-2">
          {Array.from({ length: 8 }).map((_, i) => {
            const state = isActiveNode(0, i);
            const isMatch = activeIndex === i;
            return (
              <div key={`leaf-${i}`} className="flex flex-col items-center flex-1">
                <div 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border text-[10px] font-semibold transition-all duration-300 ${
                    isMatch 
                      ? 'bg-cyan-500 text-midnight-950 border-cyan-300 shadow-cyan-glow-md font-bold scale-110' 
                      : state === 'sibling'
                      ? 'bg-midnight-800 border-purple-500 text-purple-400 shadow-purple-glow'
                      : 'bg-midnight-900/30 border-midnight-800 text-slate-500'
                  }`}
                  title={isMatch ? `Active user leaf commitment` : `Allowlist slot #${i}`}
                >
                  {isMatch ? 'Prover' : `#${i}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Legend */}
        {activeIndex !== -1 && (
          <div className="absolute bottom-[48px] bg-midnight-900/90 border border-midnight-700/80 px-3 py-1 rounded-full text-[9px] font-mono flex items-center gap-3 text-slate-300 shadow-md">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Proving Path</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Sibling Hash Witness</span>
          </div>
        )}
      </div>
    );
  };

  // Pipeline Hashing Tower - displays details of the 8 steps
  const renderPipelineView = () => {
    if (!activePath || activePath.status === 'idle') {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 h-[360px]">
          <div className="p-3 bg-midnight-800/40 rounded-full border border-midnight-700/60 text-slate-500 animate-pulse">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-300">Prover Pipeline Offline</h4>
            <p className="text-[11px] text-slate-500 max-w-[240px] mt-1">
              Connect your wallet, enter credentials, and generate a ZK proof to observe the local constraint solver.
            </p>
          </div>
        </div>
      );
    }

    const { leaf, path, directions, root, currentStep, status } = activePath;

    return (
      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 py-1 scrollbar">
        {/* Leaf Node Start */}
        <div className="bg-midnight-900/60 border border-midnight-800 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-slate-400 text-[10px] font-sans">1. Leaf Hash Commitment [Private]</div>
              <div 
                className="text-slate-200 truncate cursor-help max-w-[170px]"
                onMouseEnter={() => setHoveredHash(leaf)}
                onMouseLeave={() => setHoveredHash(null)}
                title={leaf}
              >
                {truncateHash(leaf)}
              </div>
            </div>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            PROVER INPUT
          </span>
        </div>

        {/* 8 Merkle Levels */}
        <div className="relative pl-4 border-l border-dashed border-midnight-700/60 space-y-2">
          {path.map((sibling, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            const isPending = idx > currentStep;
            const isRightSibling = directions[idx];

            return (
              <motion.div 
                key={`step-${idx}`} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className={`relative rounded-xl border p-2.5 text-[11px] font-mono transition-all duration-300 ${
                  isActive 
                    ? 'bg-purple-950/20 border-purple-500/50 shadow-purple-glow text-purple-300' 
                    : isCompleted
                    ? 'bg-midnight-900/80 border-cyan-500/25 text-cyan-300'
                    : 'bg-midnight-900/10 border-midnight-800/40 text-slate-600'
                }`}
              >
                {/* Step number marker */}
                <div className={`absolute -left-[23px] top-3.5 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  isCompleted 
                    ? 'bg-cyan-500 text-midnight-950 shadow-cyan-glow' 
                    : isActive
                    ? 'bg-purple-500 text-white animate-pulse'
                    : 'bg-midnight-900 border border-midnight-700 text-slate-600'
                }`}>
                  {idx + 1}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <GitMerge className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-sans text-slate-400">
                        SHA256 Level {idx + 1} Hashing
                      </span>
                    </div>
                    {/* Sibling Info */}
                    <div className="mt-1 flex flex-col gap-0.5 pl-5">
                      <span className="text-[9px] text-slate-400 font-sans flex items-center gap-1">
                        Witness Sibling: 
                        <strong className={`font-mono truncate max-w-[120px] ${isActive ? 'text-purple-300' : isCompleted ? 'text-cyan-300' : 'text-slate-600'}`}>
                          {truncateHash(sibling)}
                        </strong>
                      </span>
                      <span className="text-[9px] text-slate-400 font-sans">
                        Position: <strong className={isRightSibling ? 'text-indigo-400' : 'text-pink-400'}>{isRightSibling ? 'Right Side (Sibling || Hash)' : 'Left Side (Hash || Sibling)'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="text-right">
                    {isCompleted ? (
                      <span className="text-[9px] text-cyan-400 font-sans font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Hashed
                      </span>
                    ) : isActive ? (
                      <span className="text-[9px] text-purple-400 font-sans font-semibold animate-pulse">
                        Solving...
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-600 font-sans">
                        Queued
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Output verification block */}
        <div className={`rounded-xl border p-3 flex items-center justify-between text-[11px] font-mono transition-all duration-300 ${
          status === 'verified'
            ? 'bg-emerald-950/20 border-emerald-500/50 shadow-emerald-glow text-emerald-400'
            : status === 'failed'
            ? 'bg-rose-950/20 border-rose-500/50 text-rose-400'
            : currentStep === 8
            ? 'bg-purple-950/20 border-purple-500/40 text-purple-300'
            : 'bg-midnight-900/20 border-midnight-800/40 text-slate-600'
        }`}>
          <div className="flex items-center gap-2">
            <ArrowUp className={`w-4 h-4 ${status === 'verified' ? 'text-emerald-400' : 'text-slate-500'}`} />
            <div>
              <div className="text-slate-400 text-[10px] font-sans">Output Root Hash [Verification]</div>
              <div 
                className="font-bold truncate max-w-[170px]"
                onMouseEnter={() => setHoveredHash(root)}
                onMouseLeave={() => setHoveredHash(null)}
                title={root}
              >
                {truncateHash(root)}
              </div>
            </div>
          </div>
          <div>
            {status === 'verified' ? (
              <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded font-sans">
                ROOT MATCHED
              </span>
            ) : status === 'failed' ? (
              <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded font-sans flex items-center gap-0.5">
                <AlertCircle className="w-3 h-3" /> MATCH FAILED
              </span>
            ) : currentStep === 8 ? (
              <span className="px-2 py-0.5 text-[9px] font-bold bg-purple-500/20 text-purple-300 rounded font-sans">
                COMPUTED
              </span>
            ) : (
              <span className="text-slate-600 font-sans text-[10px]">
                Pending proof
              </span>
            )}
          </div>
        </div>

        {/* Hovered hash full view */}
        <AnimatePresence>
          {hoveredHash && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="mt-2 bg-midnight-950 p-2 rounded-lg border border-midnight-800 text-[10px] text-cyan-400 break-all font-mono shadow-lg"
            >
              Full Hash: {hoveredHash}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="bg-midnight-800/40 backdrop-blur-xl border border-midnight-700/60 rounded-2xl p-5 shadow-xl flex flex-col h-[460px]">
      {/* Title & View Switcher */}
      <div className="flex items-center justify-between border-b border-midnight-700/60 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            ZK Verification Visualizer
          </h3>
        </div>

        {/* Tabs switcher */}
        <div className="flex bg-midnight-950 p-0.5 rounded-lg border border-midnight-800">
          <button
            onClick={() => setViewMode('pipeline')}
            className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all ${
              viewMode === 'pipeline'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Proof Pipeline
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all ${
              viewMode === 'tree'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Merkle Tree Map
          </button>
        </div>
      </div>

      {/* Main panel body */}
      <div className="flex-1 min-h-0">
        {viewMode === 'pipeline' ? renderPipelineView() : renderTreeView()}
      </div>

      {/* Help footer */}
      <div className="mt-4 pt-3 border-t border-midnight-800 text-[10px] text-slate-400 flex items-start gap-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed font-sans">
          {viewMode === 'pipeline' 
            ? "Witness path hashes verify membership without revealing which index you belong to. The smart contract validates these hashing equations locally in ZK."
            : "The visual map illustrates inclusion. A zero-knowledge proof verifies the sibling hashes up to the root, confirming membership with complete privacy."}
        </p>
      </div>
    </div>
  );
};
