import React, { useState, useEffect } from 'react';

const AXES = [
  { id: 'Body', label: 'Body', color: '#fb923c', angle: -Math.PI / 2 },
  { id: 'Mind', label: 'Mind', color: '#06b6d4', angle: -Math.PI / 6 },
  { id: 'Work', label: 'Work', color: '#60a5fa', angle: Math.PI / 6 },
  { id: 'Social', label: 'Social', color: '#10b981', angle: Math.PI / 2 },
  { id: 'Lifestyle', label: 'Lifestyle', color: '#a855f7', angle: 5 * Math.PI / 6 },
  { id: 'Purpose', label: 'Purpose', color: '#f472b6', angle: 7 * Math.PI / 6 }
];

const calculateScores = (stats, timeFilter) => {
  const baseScores = { Body: 0, Mind: 0, Work: 0, Social: 0, Lifestyle: 0, Purpose: 0 };
  
  // Process actual user history
  if (stats?.allChallenges && stats.allChallenges.length > 0) {
    stats.allChallenges.forEach(c => {
      const cat = c.challengeId?.category;
      let axis = 'Lifestyle'; // fallback
      if (cat === 'Fitness') axis = 'Body';
      else if (cat === 'Mind') axis = 'Mind';
      else if (cat === 'Work') axis = 'Work';
      else if (cat === 'Social') axis = 'Social';
      else if (cat === 'Purpose') axis = 'Purpose';

      if (c.status === 'completed') {
        baseScores[axis] += 20; // High points for completion
      } else if (c.status === 'active') {
        baseScores[axis] += (c.completedDays || 0) * 2; // Incremental points
      }
    });
  }

  // Normalize
  Object.keys(baseScores).forEach(k => {
    baseScores[k] = Math.min(100, Math.max(10, baseScores[k] * 2.5)); // Multiply and clamp
  });

  return applyTimeFilter(baseScores, timeFilter);
};

const applyTimeFilter = (scores, filter) => {
  const multiplier = filter === 'This Week' ? 0.4 : filter === 'This Month' ? 0.75 : 1;
  const filtered = {};
  Object.keys(scores).forEach((k, i) => {
    // Add slight variance so the shape transforms organically
    const variance = (i % 2 === 0 ? 0.9 : 1.1); 
    filtered[k] = Math.min(100, Math.max(0, Math.round(scores[k] * multiplier * variance)));
  });
  return filtered;
};

const getArchetype = (scores) => {
  const vals = Object.values(scores);
  const max = Math.max(...vals);
  const min = Math.min(...vals);

  if (max - min <= 15 && max > 30) {
    return { icon: '⚖️', title: 'Balanced Performer', desc: 'Consistent growth across all areas of life. Rare and worth protecting.', unlock: 'Unlock "The Harmonist" title at Level 20' };
  }
  if (scores.Work > 80 && scores.Work - Math.max(scores.Body, scores.Mind, scores.Social, scores.Lifestyle, scores.Purpose) > 30) {
    return { icon: '⚡', title: 'The Grinder', desc: 'Dangerous territory. High output, low balance. Watch for burnout.', unlock: 'Unlock "Rest & Recovery" domains to balance.' };
  }
  if (scores.Work >= 60 && scores.Body >= 60) {
    return { icon: '🔷', title: 'Builder', desc: 'Strong in Work and Body, but your inner world and connections may need tending.', unlock: 'Unlock Elite Builder status at 1,000 XP.' };
  }
  if (scores.Mind >= 60 && scores.Purpose >= 60) {
    return { icon: '👁️', title: 'The Philosopher', desc: 'Deep thinker, inner clarity, but your physical and social presence may lag.', unlock: 'Unlock "Visionary" aura at 500 Purpose XP.' };
  }
  if (scores.Body >= 60 && scores.Social >= 60) {
    return { icon: '🤝', title: 'The Connector', desc: 'Present, energetic, and social — but deep work and purpose may drift.', unlock: 'Unlock "Tribe Leader" badge at 50 followers.' };
  }
  if (scores.Lifestyle >= 60 && scores.Purpose >= 60) {
    return { icon: '🧘', title: 'The Monk', desc: 'Intentional living and meaning-seeking. Consider channeling this into output.', unlock: 'Unlock "Zen Master" flair at 100 days streak.' };
  }
  
  return { icon: '🌱', title: 'The Seeker', desc: 'You are building the foundation of your future identity. Keep exploring domains.', unlock: 'Reach Level 5 to solidify your primary archetype.' };
};

const getInsights = (scores) => {
  const vals = Object.values(scores);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  const harmony = Math.max(0, 100 - (max - min));
  const strongest = Object.keys(scores).find(k => scores[k] === max);
  const weakest = Object.keys(scores).find(k => scores[k] === min);
  
  return { avg, harmony, strongest, weakest };
};

export default function IdentityGraph({ stats }) {
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [scores, setScores] = useState({ Body: 0, Mind: 0, Work: 0, Social: 0, Lifestyle: 0, Purpose: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Slight delay to trigger CSS entry animations
    const timer = setTimeout(() => {
      setScores(calculateScores(stats, timeFilter));
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [stats, timeFilter]);

  const archetype = getArchetype(scores);
  const insights = getInsights(scores);

  // SVG Geometry constants
  const cx = 180;
  const cy = 180;
  const radiusMax = 90; // Leave room for labels

  const getPoint = (val, angle) => {
    const r = (val / 100) * radiusMax;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const dataPoints = AXES.map(axis => getPoint(scores[axis.label], axis.angle));
  const polygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-wider drop-shadow-lg uppercase">Identity Evolution</h2>
          <p className="text-sm text-cyan-400 font-bold uppercase tracking-widest mt-1">The shape of your habits.</p>
        </div>
        <select 
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-full px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer backdrop-blur-md mt-4 sm:mt-0"
        >
          <option className="bg-slate-900">This Week</option>
          <option className="bg-slate-900">This Month</option>
          <option className="bg-slate-900">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {/* LEFT: Radar Chart */}
        <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>
          <svg viewBox="0 0 360 360" className="w-full max-w-[380px] h-auto drop-shadow-[0_0_20px_rgba(168,85,247,0.2)] relative z-10">
            {/* Hexagonal Grid Rings */}
            {[0.25, 0.5, 0.75, 1].map((scale, i) => (
              <polygon
                key={i}
                points={AXES.map(a => {
                  const p = getPoint(100 * scale, a.angle);
                  return `${p.x},${p.y}`;
                }).join(' ')}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
              />
            ))}

            {/* Axis Lines & Labels */}
            {AXES.map((axis, i) => {
              const edge = getPoint(100, axis.angle);
              const labelPos = getPoint(125, axis.angle); // push label out
              return (
                <g key={i}>
                  <line x1={cx} y1={cy} x2={edge.x} y2={edge.y} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(255,255,255,0.8)"
                    fontSize="12"
                    fontWeight="700"
                    letterSpacing="0.1em"
                    fontFamily="Inter, sans-serif"
                    className="uppercase"
                  >
                    {axis.label}
                  </text>
                </g>
              );
            })}

            {/* Data Polygon & Points (Animated Group) */}
            <g 
              style={{ 
                transformOrigin: `${cx}px ${cy}px`,
                transform: isMounted ? 'scale(1)' : 'scale(0)',
                transition: 'transform 1000ms cubic-bezier(0.16, 1, 0.3, 1)' 
              }}
            >
              <polygon
                points={polygonPoints}
                fill="rgba(168, 85, 247, 0.15)"
                stroke="rgba(34, 211, 238, 0.8)"
                strokeWidth="1.5"
                style={{ transition: 'all 400ms ease-in-out' }}
              />
              
              {AXES.map((axis, i) => {
                const p = getPoint(scores[axis.label], axis.angle);
                return (
                  <circle
                    key={`dot-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill={axis.color}
                    stroke="#020617"
                    strokeWidth="2"
                    style={{ transition: 'all 600ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                    className="hover:r-6 cursor-pointer transition-all duration-300 drop-shadow-[0_0_8px_currentColor]"
                  >
                    <title>{axis.label}: {scores[axis.label]}</title>
                  </circle>
                );
              })}
            </g>
          </svg>
        </div>

        {/* RIGHT: Insights & Identity Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Harmony & Balance Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 backdrop-blur-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/20 rounded-full blur-[30px] -mr-8 -mt-8 group-hover:bg-cyan-500/30 transition-colors"></div>
               <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Harmony Index</p>
               <p className="text-3xl font-black text-white">{insights.harmony}<span className="text-sm text-white/50 ml-1">/100</span></p>
               <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Domain Balance</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 backdrop-blur-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/20 rounded-full blur-[30px] -mr-8 -mt-8 group-hover:bg-purple-500/30 transition-colors"></div>
               <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Strongest Pillar</p>
               <p className="text-2xl font-black text-white uppercase tracking-wide truncate">{insights.strongest || 'None'}</p>
               <p className="text-[10px] text-slate-400 font-bold uppercase mt-3">Leading Domain</p>
            </div>
          </div>

          {/* Current Inclination Identity Card */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-[2rem] p-8 flex-grow flex flex-col justify-center relative overflow-hidden shadow-2xl backdrop-blur-xl group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest mb-6 border border-white/5 backdrop-blur-md">
                Current Identity
              </span>
              
              <h4 className="text-3xl font-black text-white mb-4 tracking-tight drop-shadow-md flex items-center gap-3">
                <span className="text-4xl">{archetype.icon}</span> 
                {archetype.title}
              </h4>
              
              <p className="text-sm text-slate-300 leading-relaxed font-medium mb-8">
                {archetype.desc}
              </p>

              <div className="w-full bg-black/40 rounded-xl p-4 border border-white/5">
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Progression Goal</p>
                <p className="text-xs text-white font-bold">{archetype.unlock}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}