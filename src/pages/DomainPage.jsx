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
    if (difficulty === 1) return <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-green-500 text-white uppercase tracking-wide">Easy</span>;
    if (difficulty === 2) return <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-yellow-500 text-white uppercase tracking-wide">Medium</span>;
    if (difficulty === 3) return <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500 text-white uppercase tracking-wide">Hard</span>;
    return <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-600 text-white uppercase tracking-wide">Hardcore</span>;
  };

  const getModes = (duration) => [
    { name: 'Easy', value: 'easy', desc: `${Math.floor(duration * 0.6)} days (60% of ${duration})`, xp: 10 },
    { name: 'Medium', value: 'medium', desc: `${Math.floor(duration * 0.8)} days (80% of ${duration})`, xp: 20 },
    { name: 'Hard', value: 'hard', desc: `${duration} days (100% - no missed days)`, xp: 30 }
  ];

  if (!domainInfo) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-black">Domain not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-8 text-purple-300 hover:text-white font-bold uppercase tracking-wide text-sm flex items-center gap-2 transition-colors">
          ← Back to Explore
        </button>
        <div className="text-center mb-16">
          <span className="text-6xl mb-6 block drop-shadow-2xl">{domainInfo.icon}</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-wider mb-4 drop-shadow-lg uppercase">{domainInfo.title}</h1>
          <p className="text-xl md:text-2xl text-purple-200 font-semibold max-w-2xl mx-auto">{domainInfo.tagline}</p>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-bounce text-2xl font-black text-white">Loading Challenges...</div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {challenges.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border-2 border-purple-500 shadow-2xl">
                <p className="text-white text-lg font-bold">
                  📭 No challenges available in this category yet.
                </p>
              </div>
            ) : challenges.map(challenge => (
              <div key={challenge._id} className="flex flex-col bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-purple-500 rounded-2xl p-6 shadow-2xl hover:border-pink-500 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-500 bg-opacity-30 text-purple-300 uppercase tracking-wide border border-purple-400">
                      {challenge.category || 'Challenge'}
                    </span>
                    <div className="flex gap-1">
                      <span className="text-xs font-bold text-cyan-300 bg-slate-600 px-3 py-1.5 rounded-lg uppercase tracking-wide">⏰ {challenge.duration}d</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 drop-shadow-lg">{challenge.title}</h3>
                  <p className="text-purple-200 text-sm mb-5 leading-relaxed font-semibold">{challenge.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {renderDifficulty(challenge.baseDifficulty)}
                    {challenge.tags && challenge.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-600 text-purple-300 uppercase tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {challenge.isJoined ? (
                  <div className="grid gap-2">
                    <button
                      disabled
                      className="w-full font-bold bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl py-3 cursor-not-allowed text-sm uppercase tracking-wide shadow-lg"
                    >
                       Joined{challenge.enrollmentMode ? ` (${challenge.enrollmentMode})` : ''}
                    </button>
                    <button
                      onClick={() => handleLeave(challenge)}
                      disabled={leavingId === challenge._id}
                      className="w-full font-bold bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-700 hover:to-orange-600 rounded-xl py-3 transition-all text-sm uppercase tracking-wide shadow-lg"
                    >
                      {leavingId === challenge._id ? '⏳ Leaving...' : 'Leave Challenge'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedChallenge(challenge)}
                    className="w-full font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl py-3 hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg text-sm uppercase tracking-wide"
                  >
                    View Details →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedChallenge && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-80 backdrop-blur-md p-4"
            onClick={() => setSelectedChallenge(null)}
          >
            <div
              className="w-full max-w-xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500 rounded-2xl shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b-2 border-purple-500 border-opacity-50 flex justify-between items-center rounded-t-2xl">
                <h2 className="text-2xl font-black text-white tracking-wider drop-shadow-lg uppercase">⚡ COMMITMENT</h2>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="text-purple-300 hover:text-white transition-colors text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <h3 className="text-xl font-bold text-cyan-300 mb-4">{selectedChallenge.title}</h3>
                <div className="space-y-3">
                  {getModes(selectedChallenge.duration).map(mode => (
                    <div
                      key={mode.value}
                      onClick={() => user && setSelectedMode(mode.value)}
                      className={`p-4 border-2 rounded-2xl transition-all duration-200 ${
                        user ? 'cursor-pointer' : 'cursor-not-allowed'
                      } ${
                        selectedMode === mode.value
                          ? 'border-purple-400 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-[1.02]'
                          : user
                          ? 'border-slate-600 bg-slate-700 hover:border-purple-500 text-purple-200 hover:shadow-lg'
                          : 'border-slate-600 bg-slate-800 opacity-50 text-gray-500'
                      }`}
                    >
                      <p className="font-black uppercase tracking-wide">{mode.name}</p>
                      <p className="text-sm font-semibold mt-1">{mode.desc}</p>
                      <p className={`text-sm font-bold mt-1 ${selectedMode === mode.value ? 'text-purple-100' : 'text-cyan-300'}`}>+{mode.xp} XP per check-in</p>
                    </div>
                  ))}
                </div>
                
                {!user && (
                  <div className="mt-4 p-4 bg-slate-700 border-2 border-purple-500 rounded-xl">
                    <p className="text-sm text-purple-300 font-bold">🔐 Log in to select your commitment level and start.</p>
                  </div>
                )}

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="flex-1 bg-slate-700 border-2 border-slate-600 text-white rounded-xl py-3 font-bold hover:bg-slate-600 hover:border-slate-500 transition-all text-sm uppercase tracking-wide shadow-lg"
                  >
                    Cancel
                  </button>
                  {user ? (
                    <button
                      onClick={handleJoin}
                      disabled={!selectedMode || joining}
                      className={`flex-1 rounded-xl py-3 border-2 font-bold transition-all text-sm uppercase tracking-wide ${!selectedMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed border-slate-600' : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-lg border-purple-400'}`}
                    >
                      {joining ? '⏳ Starting...' : '🚀 Start Challenge'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        window.location.href = `${API_BASE_URL}/api/auth/google`;
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl py-3 font-bold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg border-2 border-purple-400 text-sm uppercase tracking-wide"
                    >
                      Log in to Start
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}