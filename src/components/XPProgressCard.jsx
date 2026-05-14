import React from 'react';
import Modal from './Modal';
import { getLevelGuide, getLevelInfo } from '../utils/leveling';

export default function XPProgressCard({ totalXP = 0, className = '' }) {
  const [showGuide, setShowGuide] = React.useState(false);
  const levelInfo = getLevelInfo(totalXP);
  const levelGuide = getLevelGuide(100);
  const progressPercent = levelInfo.xpRange > 0
    ? (levelInfo.xpIntoLevel / levelInfo.xpRange) * 100
    : 100;

  return (
    <>
      <div className={`bg-[#11111c]/60 border border-white/[0.06] rounded-[2rem] p-8 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:bg-[#11111c]/80 transition-all duration-500 ease-out relative overflow-hidden group mb-10 ${className}`}>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div>
            <h2 className="text-5xl sm:text-6xl font-black text-white tracking-tighter drop-shadow-lg">
              {totalXP} <span className="text-xl sm:text-2xl font-bold text-slate-500 uppercase tracking-[0.2em] ml-3">Experience</span>
            </h2>
            <p className="mt-3 text-sm text-cyan-400 font-black uppercase tracking-widest">
              Level {levelInfo.level} <span className="text-slate-500 mx-2">•</span> {levelInfo.xpNeededForNextLevel} XP to Level {levelInfo.level + 1}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all shadow-lg"
            aria-label="Show level guide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
          </button>
        </div>

        <div className="mt-10 relative z-10">
          <div className="mb-4 flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span>Level {levelInfo.level}</span>
            <span>Level {levelInfo.level + 1}</span>
          </div>
          <div className="w-full bg-white/[0.03] rounded-full h-1.5 overflow-hidden border border-white/[0.05] relative shadow-inner">
            <div
              className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-purple-600/80 via-cyan-400/80 to-cyan-300 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_20px_rgba(34,211,238,0.4)]`}
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/50 blur-[2px]"></div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <span>{levelInfo.currentLevelXp} XP</span>
            <span>{levelInfo.nextLevelXp} XP</span>
          </div>
        </div>
      </div>

      <Modal isOpen={showGuide} onClose={() => setShowGuide(false)} title="EVOLUTION GUIDE">
        <div className="space-y-4">
          <p className="text-sm text-slate-300 font-medium leading-relaxed">
            The path begins at 100 XP. Momentum builds with each level, demanding deeper dedication as you evolve.
          </p>
          <div className="max-h-96 overflow-y-auto rounded-2xl border border-white/10 bg-[#020617]/50 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {levelGuide.map((entry) => (
              <div
                key={entry.level}
                className={`flex items-center justify-between px-5 py-4 text-xs font-black uppercase tracking-widest transition-colors ${
                  entry.level === levelInfo.level ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white border-l-2 border-cyan-400' : 'text-slate-400 border-b border-white/5 last:border-b-0'
                }`}
              >
                <span>Level {entry.level}</span>
                <div className="flex gap-4 items-center">
                  <span className="text-slate-300">{entry.totalXPRequired} XP</span>
                  <span className="text-[9px] text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">+{entry.xpToNextLevel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
