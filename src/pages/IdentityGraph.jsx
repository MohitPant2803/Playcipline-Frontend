import React, { useState, useEffect } from 'react';

const AXES = [
  { id: 'Body', label: 'Body', color: '#fb923c', angle: -Math.PI / 2 },
  { id: 'Mind', label: 'Mind', color: '#818cf8', angle: -Math.PI / 6 },
  { id: 'Work', label: 'Work', color: '#60a5fa', angle: Math.PI / 6 },
  { id: 'Social', label: 'Social', color: '#34d399', angle: Math.PI / 2 },
  { id: 'Lifestyle', label: 'Lifestyle', color: '#c084fc', angle: 5 * Math.PI / 6 },
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
    return { icon: '⚖️', title: 'Balanced Performer', desc: 'Consistent growth across all areas of life. Rare and worth protecting.' };
  }
  if (scores.Work > 80 && scores.Work - Math.max(scores.Body, scores.Mind, scores.Social, scores.Lifestyle, scores.Purpose) > 30) {
    return { icon: '⚡', title: 'The Grinder', desc: 'Dangerous territory. High output, low balance. Watch for burnout.' };
  }
  if (scores.Work >= 60 && scores.Body >= 60) {
    return { icon: '🔷', title: 'Builder', desc: 'Strong in Work and Body, but your inner world and connections may need tending. You\'re building hard but not yet building meaning.' };
  }
  if (scores.Mind >= 60 && scores.Purpose >= 60) {
    return { icon: '👁️', title: 'The Philosopher', desc: 'Deep thinker, inner clarity, but your physical and social presence may lag.' };
  }
  if (scores.Body >= 60 && scores.Social >= 60) {
    return { icon: '🤝', title: 'The Connector', desc: 'Present, energetic, and social — but deep work and purpose may drift.' };
  }
  if (scores.Lifestyle >= 60 && scores.Purpose >= 60) {
    return { icon: '🧘', title: 'The Monk', desc: 'Intentional living and meaning-seeking. Consider channeling this into output.' };
  }
  
  return { icon: '🌱', title: 'The Seeker', desc: 'You are just beginning to shape your life. Keep completing challenges to build your identity.' };
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

  // SVG Geometry constants
  const cx = 150;
  const cy = 150;
  const radiusMax = 90; // Leave room for labels

  const getPoint = (val, angle) => {
    const r = (val / 100) * radiusMax;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const dataPoints = AXES.map(axis => getPoint(scores[axis.label], axis.angle));
  const polygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="bg-[#f8f7f4] rounded-3xl p-4 sm:p-8 mb-8 shadow-inner font-sans border-2 border-slate-700/50">
      <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 shadow-md border border-gray-100 relative overflow-hidden transition-all duration-500">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8 relative z-10">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Identity Graph</h3>
            <p className="text-sm text-[#9ca3af] font-medium mt-0.5">The shape of your life</p>
          </div>
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-shadow cursor-pointer"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>All Time</option>
          </select>
        </div>

        {/* Chart Area */}
        <div className="flex justify-center items-center py-4 relative z-10">
          <svg viewBox="0 0 300 300" className="w-full max-w-[320px] h-auto drop-shadow-sm">
            {/* Hexagonal Grid Rings */}
            {[0.25, 0.5, 0.75, 1].map((scale, i) => (
              <polygon
                key={i}
                points={AXES.map(a => {
                  const p = getPoint(100 * scale, a.angle);
                  return `${p.x},${p.y}`;
                }).join(' ')}
                fill="none"
                stroke="rgba(0, 0, 0, 0.06)"
                strokeWidth="1"
              />
            ))}

            {/* Axis Lines & Labels */}
            {AXES.map((axis, i) => {
              const edge = getPoint(100, axis.angle);
              const labelPos = getPoint(125, axis.angle); // push label out
              return (
                <g key={i}>
                  <line x1={cx} y1={cy} x2={edge.x} y2={edge.y} stroke="#e5e7eb" strokeWidth="1" />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#374151"
                    fontSize="13"
                    fontWeight="500"
                    fontFamily="Inter, sans-serif"
                  >
                    {axis.label}
                  </text>
                </g>
              );
            })}

            {/* Data Polygon & Points (Animated Group) */}
            <g 
              style={{ 
                transformOrigin: '150px 150px',
                transform: isMounted ? 'scale(1)' : 'scale(0)',
                transition: 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)' 
              }}
            >
              <polygon
                points={polygonPoints}
                fill="rgba(99, 102, 241, 0.08)"
                stroke="rgba(99, 102, 241, 0.5)"
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
                    r="3.5"
                    fill={axis.color}
                    style={{ transition: 'all 400ms ease-in-out' }}
                    className="hover:r-5 cursor-pointer transition-all duration-200"
                  >
                    <title>{axis.label}: {scores[axis.label]}</title>
                  </circle>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Current Inclination Insight */}
        <div className="bg-[#f5f3ff] border border-[#e0e7ff] rounded-[14px] p-5 mb-8 mt-2 transition-all duration-300 relative z-10">
          <p className="text-[11px] font-bold text-[#6366f1] uppercase tracking-widest mb-1.5 opacity-80">Current Inclination</p>
          <h4 className="text-[18px] font-bold text-[#6366f1] mb-2 flex items-center gap-2">
            <span>{archetype.icon}</span> {archetype.title}
          </h4>
          <p className="text-[14px] text-[#6b7280] leading-[1.6] font-medium">
            {archetype.desc}
          </p>
        </div>

        {/* Score Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2 relative z-10">
          {AXES.map(axis => (
            <div key={axis.id} className="flex items-center gap-2 text-[14px]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: axis.color }}></span>
              <span className="text-[#374151] font-semibold w-16">{axis.label}</span>
              <span className="text-[#9ca3af] font-medium">{scores[axis.label]}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}