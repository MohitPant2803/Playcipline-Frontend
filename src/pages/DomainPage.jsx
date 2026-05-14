import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DOMAINS } from './Explore';
import { challengeAPI, API_BASE_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function DomainPage() {
  const { domain } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const domainInfo = DOMAINS.find(d => d.id === domain);
  
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [toast, setToast] = useState(null);
  const [joining, setJoining] = useState(false);
  const [leavingId, setLeavingId] = useState(null);

  // Scroll to top when entering the domain page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [domain]);

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!domainInfo) return;
      setLoading(true);
      try {
        let res;
        try {
          res = user ? await challengeAPI.getEnrollable() : await challengeAPI.getAll();
        } catch (err) {
          res = await challengeAPI.getAll();
        }
        
        let challengesData = res.data || [];
        
        // Filter by the specific domain category
        challengesData = challengesData.filter(c => c.category === domainInfo.category);

        setChallenges(challengesData);
      } catch (err) {
        console.warn('Failed to load challenges:', err.message);
        setToast({ message: 'Failed to load challenges', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchChallenges();
  }, [user, domainInfo]);

  const handleJoin = async () => {
    if (!window.confirm("Are you sure you want to commit to this evolution path?")) return;
    
    setJoining(true);
    try {
      const res = await challengeAPI.join(selectedChallenge._id, selectedMode);
      setChallenges(currentChallenges => currentChallenges.map(challenge => (
        challenge._id === selectedChallenge._id
          ? {
              ...challenge,
              isJoined: true,
              enrollmentId: res.data._id,
              enrollmentMode: res.data.mode
            }
          : challenge
      )));
      setToast({ message: 'Challenge enrolled! Head to Dashboard.', type: 'success' });
      setSelectedChallenge(null);
      setSelectedMode(null);
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = `${API_BASE_URL}/api/auth/google`;
        return;
      }
      setToast({ message: err.response?.data?.error || 'Failed to join', type: 'error' });
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async (challenge) => {
    if (!challenge.enrollmentId) return;

    if (!window.confirm("Are you sure you want to abandon this path? Your progress will be lost.")) return;
    
    setLeavingId(challenge._id);
    try {
      await challengeAPI.leave(challenge.enrollmentId);
      setChallenges(currentChallenges => currentChallenges.map(item => (
        item._id === challenge._id
          ? {
              ...item,
              isJoined: false,
              enrollmentId: null,
              enrollmentMode: null
            }
          : item
      )));
      setToast({ message: 'You left the challenge.', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to de-enroll', type: 'error' });
    } finally {
      setLeavingId(null);
    }
  };

  const renderDifficulty = (difficulty) => {
    let color = 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    let label = 'Unknown';
    if (difficulty === 1) { color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'; label = 'Easy'; }
    else if (difficulty === 2) { color = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'; label = 'Medium'; }
    else if (difficulty === 3) { color = 'text-purple-400 bg-purple-500/10 border-purple-500/20'; label = 'Hard'; }
    else { color = 'text-rose-400 bg-rose-500/10 border-rose-500/20'; label = 'Hardcore'; }
    
    return <span className={`px-3 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest border ${color}`}>{label}</span>;
  };

  const getModes = (duration) => [
    { name: 'Easy', value: 'easy', desc: `${Math.floor(duration * 0.6)} days (60% of ${duration})`, xp: 10 },
    { name: 'Medium', value: 'medium', desc: `${Math.floor(duration * 0.8)} days (80% of ${duration})`, xp: 20 },
    { name: 'Hard', value: 'hard', desc: `${duration} days (100% - no missed days)`, xp: 30 }
  ];

  if (!domainInfo) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-black">Domain not found</div>;

  return (
    <div className="pt-32 pb-20 sm:pb-0 bg-[#020617] text-white font-sans min-h-screen relative overflow-hidden selection:bg-cyan-500/30">
      {/* Cinematic Ambient Background */}
      <div className="fixed inset-0 bg-[#020617] -z-20 pointer-events-none"></div>
      
      {/* Subtle Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 pointer-events-none"></div>
      
      {/* Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#020617]/80 to-[#020617] -z-10 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[500px] bg-purple-600/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen -z-10"></div>
      <div className="absolute top-1/4 left-0 w-[40vw] h-[40vw] max-w-[600px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse -z-10" style={{ animationDuration: '10s' }}></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <button onClick={() => navigate(-1)} className="mb-10 text-slate-500 hover:text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 transition-colors group w-fit">
          <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">←</span>
          Back to Explore
        </button>

        <div className="text-center mb-20 flex flex-col items-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[150px] bg-cyan-500/10 blur-[80px] pointer-events-none -z-10"></div>
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 backdrop-blur-md shadow-inner">
             <span className="text-2xl opacity-60 grayscale">{domainInfo.icon}</span>
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.05)] mb-4 px-4 py-2 -mx-4">{domainInfo.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-black tracking-[0.3em] uppercase">{domainInfo.tagline}</p>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-white/5 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <div className="animate-pulse text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Decoding Paths...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mb-16">
            {challenges.length === 0 ? (
              <div className="col-span-full text-center py-24 bg-[#12121c]/60 border border-white/[0.06] rounded-[28px] backdrop-blur-xl shadow-xl">
                <p className="text-slate-400 font-medium tracking-wide">
                  📭 No challenges available in this category yet.
                </p>
              </div>
            ) : challenges.map(challenge => (
              <div key={challenge._id} className="relative bg-[#12121c]/60 border border-white/[0.06] rounded-[28px] p-6 sm:p-8 backdrop-blur-xl transition-all duration-500 hover:bg-[#12121c]/80 hover:border-white/10 hover:-translate-y-1 hover:shadow-2xl group/card flex flex-col overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-[60px] -mr-24 -mt-24 group-hover/card:bg-cyan-500/10 transition-colors duration-700 pointer-events-none"></div>
                
                <div className="relative z-10 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1.5 text-[9px] font-black rounded-full bg-white/5 text-slate-300 uppercase tracking-[0.2em] border border-white/10 shadow-sm">
                      {challenge.category || 'Path'}
                    </span>
                    <span className="text-[10px] font-black text-cyan-400/70 uppercase tracking-widest flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {challenge.duration} Days
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-lg mb-3 leading-tight pr-4">{challenge.title}</h3>
                  <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium flex-grow">{challenge.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                    {renderDifficulty(challenge.baseDifficulty)}
                    {challenge.tags && challenge.tags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 text-[9px] font-bold rounded-full bg-white/[0.03] border border-white/5 text-slate-400 uppercase tracking-widest backdrop-blur-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="relative z-10 mt-auto pt-4 border-t border-white/5">
                  {challenge.isJoined ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-full flex-grow justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Engaged{challenge.enrollmentMode ? ` - ${challenge.enrollmentMode}` : ''}
                      </div>
                      <button
                        onClick={() => handleLeave(challenge)}
                        disabled={leavingId === challenge._id}
                        className="p-3 rounded-full text-slate-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group/leave"
                        title="Abandon Path"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedChallenge(challenge)}
                      className="w-full rounded-full py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all duration-500 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 backdrop-blur-md shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    >
                      Inspect Path
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedChallenge && (
          <div className="fixed inset-0 z-[100] bg-[#020617] overflow-y-auto overflow-x-hidden scroll-smooth animate-fade-in-fast selection:bg-cyan-500/30">
            {/* Cinematic Backgrounds */}
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-[#020617] to-[#020617]"></div>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[50vw] bg-cyan-600/5 blur-[150px] rounded-full mix-blend-screen"></div>
            </div>

            {/* Abort Button */}
            <button 
              onClick={() => { setSelectedChallenge(null); setSelectedMode(null); }} 
              className="fixed top-4 sm:top-6 left-4 sm:left-6 z-50 text-slate-500 hover:text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 transition-colors group bg-[#020617]/50 p-2 pr-4 rounded-full backdrop-blur-md border border-white/5 hover:border-white/20"
            >
              <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors shadow-inner">✕</span>
              Abort Protocol
            </button>

            {/* Scrollable Content Engine */}
            <div className="relative z-10 w-full min-h-screen flex flex-col items-center">
              
              {/* Hero Section */}
              <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 w-full max-w-5xl mx-auto pt-24 sm:pt-20">
                <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                  {selectedChallenge.category} Protocol
                </span>
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.05)] mb-8 px-4 -mx-4 py-2 leading-[0.9]">
                  {selectedChallenge.title}
                </h1>
                <p className="text-lg sm:text-2xl text-slate-300 font-medium max-w-3xl leading-relaxed mb-12 drop-shadow-md">
                  {selectedChallenge.description}
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#12121c]/60 border border-white/10 backdrop-blur-xl shadow-lg">
                    <span className="text-slate-500 text-lg">⏱️</span>
                    <span className="text-xs font-black text-white uppercase tracking-widest">{selectedChallenge.duration} Days</span>
                  </div>
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#12121c]/60 border border-white/10 backdrop-blur-xl shadow-lg">
                    <span className="text-slate-500 text-lg">⚡</span>
                    <span className="text-xs font-black text-white uppercase tracking-widest">{selectedChallenge.baseDifficulty === 1 ? 'Easy' : selectedChallenge.baseDifficulty === 2 ? 'Medium' : selectedChallenge.baseDifficulty === 3 ? 'Hard' : 'Hardcore'}</span>
                  </div>
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#12121c]/60 border border-white/10 backdrop-blur-xl shadow-lg">
                    <span className="text-slate-500 text-lg">🛡️</span>
                    <span className="text-xs font-black text-white uppercase tracking-widest">Active Cohort</span>
                  </div>
                </div>
              </div>

              {/* Transformation Hooks */}
              <div className="w-full bg-gradient-to-b from-transparent via-[#12121c]/80 to-transparent py-32 border-y border-white/5">
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-2xl shadow-inner">🧠</div>
                    <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4 drop-shadow-md">Mental Resilience</h3>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">Reprogram your baseline. When motivation fades, absolute discipline takes control.</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-2xl shadow-inner">⚔️</div>
                    <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4 drop-shadow-md">Identity Shift</h3>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">You are no longer trying. You are becoming. Consistency fundamentally alters who you are.</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-2xl shadow-inner">🔥</div>
                    <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4 drop-shadow-md">Compounding Output</h3>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">Small daily executions compound into monumental long-term reality.</p>
                  </div>
                </div>
              </div>

              {/* Progress Preview / Timeline */}
              <div className="w-full max-w-5xl mx-auto px-4 py-32 text-center">
                <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-4 drop-shadow-lg">The Evolution Arc</h2>
                <p className="text-slate-400 font-medium mb-20">Understand the journey before you take the first step.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
                  <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent -z-10"></div>
                  
                  <div className="flex flex-col items-center relative z-10 group">
                    <div className="w-24 h-24 rounded-full bg-[#020617] border-4 border-slate-800 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500">
                      <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Day 1</span>
                    </div>
                    <h4 className="text-lg font-black text-white uppercase tracking-widest mb-3">The Decision</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-[250px]">Motivation carries you through the start, but resistance is waiting.</p>
                  </div>
                  
                  <div className="flex flex-col items-center relative z-10 group">
                    <div className="w-24 h-24 rounded-full bg-[#020617] border-4 border-cyan-500/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,211,238,0.2)] group-hover:scale-110 transition-transform duration-500">
                      <span className="text-sm font-black text-cyan-400 uppercase tracking-widest">Day {Math.floor(selectedChallenge.duration / 2)}</span>
                    </div>
                    <h4 className="text-lg font-black text-white uppercase tracking-widest mb-3">The Crucible</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-[250px]">Excitement fades. This is where character is forged and the weak quit.</p>
                  </div>
                  
                  <div className="flex flex-col items-center relative z-10 group">
                    <div className="w-24 h-24 rounded-full bg-[#020617] border-4 border-white flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-500">
                      <span className="text-sm font-black text-white uppercase tracking-widest">Day {selectedChallenge.duration}</span>
                    </div>
                    <h4 className="text-lg font-black text-white uppercase tracking-widest mb-3">The New Baseline</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-[250px]">It's no longer a challenge. It's simply who you are now.</p>
                  </div>
                </div>
              </div>

              {/* Commitment Level */}
              <div className="w-full bg-white/[0.02] border-t border-white/5 py-32">
                <div className="max-w-6xl mx-auto px-4">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-4 drop-shadow-lg">Select Commitment Level</h2>
                    <p className="text-slate-400 font-medium">How far are you willing to push your baseline?</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    {getModes(selectedChallenge.duration).map(mode => (
                      <div
                        key={mode.value}
                        onClick={() => user && setSelectedMode(mode.value)}
                        className={`relative p-8 rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                          user ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl' : 'cursor-not-allowed opacity-60'
                        } ${
                          selectedMode === mode.value
                            ? 'bg-cyan-500/10 border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.15)] transform scale-[1.02]'
                            : 'bg-[#12121c]/80 border-white/10 hover:border-white/30 backdrop-blur-xl'
                        }`}
                      >
                        {selectedMode === mode.value && <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent pointer-events-none"></div>}
                        
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-8">
                            <h3 className={`text-2xl font-black uppercase tracking-widest ${selectedMode === mode.value ? 'text-cyan-400 drop-shadow-md' : 'text-white'}`}>{mode.name}</h3>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${selectedMode === mode.value ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                              +{mode.xp} XP
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-400 leading-relaxed flex-grow mb-8">{mode.desc}</p>
                          
                          <div className={`w-full h-1.5 rounded-full overflow-hidden bg-white/5`}>
                            <div className={`h-full rounded-full ${selectedMode === mode.value ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-slate-600'}`} style={{ width: mode.value === 'easy' ? '60%' : mode.value === 'medium' ? '80%' : '100%' }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Final CTA */}
              <div className="w-full py-32 flex flex-col items-center justify-center px-4 text-center">
                {!user && (
                  <p className="text-slate-400 mb-8 font-medium">Log in to select your commitment level and begin.</p>
                )}
                <button
                  onClick={user ? handleJoin : () => window.location.href = `${API_BASE_URL}/api/auth/google`}
                  disabled={user && (!selectedMode || joining)}
                  className={`group relative px-12 sm:px-16 py-6 sm:py-8 rounded-full border transition-all duration-500 ${
                    user && !selectedMode
                      ? 'bg-white/5 border-transparent text-slate-600 cursor-not-allowed'
                      : 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 shadow-[0_0_40px_rgba(34,211,238,0.1)] hover:shadow-[0_0_60px_rgba(34,211,238,0.3)] hover:-translate-y-1'
                  }`}
                >
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 transition-opacity duration-500 ${user && selectedMode ? 'group-hover:opacity-100' : ''}`}></div>
                  <span className={`relative z-10 font-black uppercase tracking-[0.3em] text-sm sm:text-xl transition-colors ${user && !selectedMode ? 'text-slate-600' : 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]'}`}>
                    {!user ? 'Log In To Commit' : joining ? 'Initializing Protocol...' : 'Begin Evolution'}
                  </span>
                </button>
                {user && selectedMode && (
                  <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">Ready for execution</p>
                )}
              </div>

            </div>
          </div>
        )}
        
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}