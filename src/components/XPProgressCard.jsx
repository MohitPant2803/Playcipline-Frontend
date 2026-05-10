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
      <Card className={className}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">XP Progress</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">{totalXP} XP</h2>
            <p className="mt-1 text-sm text-slate-600">
              Level {levelInfo.level} | {levelInfo.xpNeededForNextLevel} XP to Level {levelInfo.level + 1}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            aria-label="Show level guide"
          >
            i
          </button>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Level {levelInfo.level}</span>
            <span>Level {levelInfo.level + 1}</span>
          </div>
          <ProgressBar current={progressPercent} total={100} percentage />
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{levelInfo.currentLevelXp} XP</span>
            <span>{levelInfo.nextLevelXp} XP</span>
          </div>
        </div>
      </Card>

      <Modal isOpen={showGuide} onClose={() => setShowGuide(false)} title="Level Guide">
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Level 1 starts at 100 total XP. A steady month can reach around Level 10, then each level asks for more.
          </p>
          <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200">
            {levelGuide.map((entry) => (
              <div
                key={entry.level}
                className={`flex items-center justify-between px-4 py-3 text-sm ${
                  entry.level === levelInfo.level ? 'bg-blue-50' : 'bg-white'
                } border-b border-slate-100 last:border-b-0`}
              >
                <span className="font-semibold text-slate-900">Level {entry.level}</span>
                <span className="text-slate-600">{entry.totalXPRequired} total XP</span>
                <span className="text-slate-500">+{entry.xpToNextLevel} to next</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
