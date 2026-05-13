import React from 'react';
import Modal from './Modal';
import { Card, ProgressBar } from './UI';
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
      <Card className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-purple-500 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-purple-300">🏆 XP Progress</p>
            <h2 className="mt-2 text-4xl font-black text-white drop-shadow-lg">{totalXP} XP</h2>
            <p className="mt-1 text-sm text-purple-200 font-semibold">
              ⭐ Level {levelInfo.level} | {levelInfo.xpNeededForNextLevel} XP to Level {levelInfo.level + 1}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-purple-400 text-lg font-bold text-purple-300 transition hover:bg-purple-500 hover:text-white hover:border-purple-300"
            aria-label="Show level guide"
          >
            ?
          </button>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-purple-300 uppercase tracking-wide">
            <span>Level {levelInfo.level}</span>
            <span>Level {levelInfo.level + 1}</span>
          </div>
          <ProgressBar current={progressPercent} total={100} percentage color="purple" />
          <div className="mt-2 flex items-center justify-between text-xs text-purple-200 font-semibold">
            <span>{levelInfo.currentLevelXp} XP</span>
            <span>{levelInfo.nextLevelXp} XP</span>
          </div>
        </div>
      </Card>

      <Modal isOpen={showGuide} onClose={() => setShowGuide(false)} title="⭐ LEVEL GUIDE">
        <div className="space-y-3">
          <p className="text-sm text-gray-700 font-semibold">
            Level 1 starts at 100 total XP. A steady month can reach around Level 10, then each level asks for more.
          </p>
          <div className="max-h-96 overflow-y-auto rounded-lg border-2 border-purple-300">
            {levelGuide.map((entry) => (
              <div
                key={entry.level}
                className={`flex items-center justify-between px-4 py-3 text-sm font-semibold transition ${
                  entry.level === levelInfo.level ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white' : 'bg-white text-gray-900'
                } border-b border-purple-200 last:border-b-0`}
              >
                <span>Level {entry.level}</span>
                <span>{entry.totalXPRequired} total XP</span>
                <span className="text-xs">+{entry.xpToNextLevel}</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
