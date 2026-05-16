import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedAPI, challengeAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import { Card } from '../components/UI';
import UserAvatar from '../components/UserAvatar';

function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

const VisibilitySelector = ({ visibility, isOwner, onChange, activeDropdown, setActiveDropdown, activityId }) => {
  const options = [
    { value: 'personal', label: 'Personal', color: 'bg-rose-500' },
    { value: 'friends', label: 'Friends', color: 'bg-purple-500' },
    { value: 'global', label: 'Global', color: 'bg-cyan-500' }
  ];

  const current = options.find(o => o.value === (visibility || 'global')) || options[2];
  const isOpen = activeDropdown === `vis-${activityId}`;

  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && ref.current && !ref.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setActiveDropdown]);

  if (!isOwner) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.02] border border-white/5 text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">
        <span className={`w-1.5 h-1.5 rounded-full ${current.color}`}></span>
        {current.label}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          setActiveDropdown(isOpen ? null : `vis-${activityId}`); 
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1 mt-0.5 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm ${
          isOpen 
            ? 'bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
            : 'bg-[#12121c]/80 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${current.color} shadow-[0_0_8px_currentColor]`}></span>
        {current.label}
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-2 w-32 bg-[#12121c]/95 border border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden animate-fade-in-fast backdrop-blur-xl">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={(e) => {
                e.stopPropagation();
                onChange(activityId, opt.value);
                setActiveDropdown(null);
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                (visibility || 'global') === opt.value 
                  ? 'text-white bg-white/5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${opt.color}`}></span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Feed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedMode, setFeedMode] = useState('global'); // 'mine', 'friends', 'global'
  const [toast, setToast] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [postText, setPostText] = useState('');
  const [postChallenge, setPostChallenge] = useState('');
  const [myChallenges, setMyChallenges] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const [postImage, setPostImage] = useState(null);
  const [postVisibility, setPostVisibility] = useState('global');

  // Filter out activities from demo/test users
  const isDemoUser = (activity) => {
    const demoPatterns = ['demo', 'test', 'sample', 'fake', 'mock', 'placeholder'];
    const userName = (activity.userId?.name || '').toLowerCase();
    const userExists = activity.userId && activity.userId._id;
    // Filter out if no valid user or if user name contains demo patterns
    return !userExists || demoPatterns.some(pattern => userName.includes(pattern));
  };

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        let res;
        if (feedMode === 'mine') {
          if (!user) { setActivities([]); setLoading(false); return; }
          res = await feedAPI.getUserActivities(user._id);
        } else if (feedMode === 'friends') {
          if (!user) { setActivities([]); setLoading(false); return; }
          res = await feedAPI.getPersonalized();
        } else {
          res = await feedAPI.getAll();
        }
        
        // Filter out activities from demo/test users
        const filteredActivities = (res.data || []).filter(activity => !isDemoUser(activity));
        setActivities(filteredActivities);
      } catch (err) {
        if (err.response?.status !== 401) {
          setToast({ message: 'Failed to load feed', type: 'error' });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [feedMode, user]);

  useEffect(() => {
    if (user) {
      challengeAPI.getMyChall()
        .then(res => {
          setMyChallenges(res.data.filter(c => c.status === 'active'));
        })
        .catch(err => console.error('Failed to load user challenges', err));
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async (e, activityId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      const res = await feedAPI.like(activityId);
      setActivities(activities.map(a => 
        a._id === activityId 
          ? { ...a, likesCount: res.data.likesCount, likes: res.data.likes }
          : a
      ));
    } catch (err) {
      setToast({ message: 'Failed to like', type: 'error' });
    }
  };

  const handleComment = async (activityId) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    const text = commentText[activityId];
    if (!text?.trim()) return;

    try {
      const res = await feedAPI.comment(activityId, text);
      setActivities(activities.map(a => 
        a._id === activityId 
          ? { ...a, comments: res.data }
          : a
      ));
      setCommentText({ ...commentText, [activityId]: '' });
    } catch (err) {
      setToast({ message: 'Failed to comment', type: 'error' });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
       const reader = new FileReader();
       reader.onloadend = () => {
         setPostImage(reader.result);
       };
       reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!postText.trim() && !postImage) return;
    try {
      const res = await feedAPI.createPost({ 
        text: postText, 
        challengeId: postChallenge || null,
        image: postImage,
        visibility: postVisibility
      });
      setToast({ message: 'Post created!', type: 'success' });
      setActivities([res.data, ...activities]);
      setPostText('');
      setPostChallenge('');
      setPostImage(null);
    } catch (err) {
      setToast({ message: 'Failed to create post.', type: 'error' });
    }
  };

  const handleVisibilityChange = async (activityId, newVisibility) => {
    try {
      const res = await feedAPI.editPost(activityId, { visibility: newVisibility });
      setActivities(current => {
        const updated = current.map(a => a._id === activityId ? { ...a, ...res.data } : a);
        if (feedMode === 'global' && newVisibility !== 'global') {
          return updated.filter(a => a._id !== activityId);
        }
        if (feedMode === 'friends' && newVisibility === 'personal') {
          return updated.filter(a => a._id !== activityId);
        }
        return updated;
      });
    } catch (err) {
      setToast({ message: 'Failed to update visibility', type: 'error' });
    }
  };

  const handleEditPost = async (activityId) => {
    const activity = activities.find(a => a._id === activityId);
    const newText = window.prompt('Edit your post:', activity.text || activity.meta?.text || '');
    if (newText !== null && newText.trim() !== '') {
      try {
        const res = await feedAPI.editPost(activityId, { text: newText });
        setActivities(activities.map(a => a._id === activityId ? { ...a, ...res.data } : a));
        setToast({ message: 'Post updated.', type: 'success' });
      } catch (err) {
        setToast({ message: 'Failed to update post.', type: 'error' });
      }
    }
  };

  const handleDeletePost = async (activityId) => {
    if (!window.confirm("Are you sure you want to permanently delete this post?")) return;
    
    try {
      await feedAPI.deletePost(activityId);
      setToast({ message: 'Post deleted.', type: 'success' });
      setActivities(activities.filter(a => a._id !== activityId));
    } catch (error) {
      setToast({ message: 'Failed to delete post.', type: 'error' });
    }
  };

  const handleDeleteComment = async (activityId, commentId, idx) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      if (commentId) {
        await feedAPI.deleteComment(activityId, commentId);
      }
      setToast({ message: 'Comment deleted.', type: 'success' });
      setActivities(activities.map(a => {
        if (a._id === activityId) {
          return {
            ...a,
            comments: a.comments.filter((c, i) => (c._id ? c._id !== commentId : i !== idx))
          };
        }
        return a;
      }));
    } catch (error) {
      setToast({ message: 'Failed to delete comment.', type: 'error' });
    }
  };

  const getTagColor = (title) => {
    if (!title) return 'bg-white/5 border-white/10 text-slate-300';
    const colors = [
      'bg-purple-500/10 border-purple-500/20 text-purple-300',
      'bg-cyan-500/10 border-cyan-500/20 text-cyan-300',
      'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
      'bg-rose-500/10 border-rose-500/20 text-rose-300',
      'bg-blue-500/10 border-blue-500/20 text-blue-300',
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getActivityText = (activity) => {
    if (activity.type === 'post' || activity.text || activity.meta?.text) {
      return activity.text || activity.meta?.text;
    }

    const challenge = activity.challengeId?.title;

    if (activity.type === 'checkin') {
      return challenge 
        ? `Finished Day ${activity.meta?.day} of ${challenge}.`
        : `Finished Day ${activity.meta?.day}.`;
    } else if (activity.type === 'completed_challenge') {
      return challenge
        ? `Successfully completed the ${challenge} journey.`
        : `Successfully completed the challenge.`;
    } else if (activity.type === 'badge_earned') {
      const badgeName = (activity.meta?.badge || '').replace(/-/g, ' ');
      return `Unlocked the ${badgeName} badge.`;
    }
    return 'Made some solid progress today.';
  };

  const getLikeCount = (activity) => {
    if (typeof activity.likesCount === 'number') return activity.likesCount;
    return activity.likes?.length || 0;
  };

  return (
    <div className="pt-32 pb-20 sm:pb-0 bg-[#020617] text-white font-sans min-h-screen relative overflow-hidden selection:bg-purple-500/30">
      {/* Cinematic Ambient Background */}
      <div className="fixed inset-0 bg-[#020617] -z-20 pointer-events-none"></div>
      
      {/* Subtle Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 pointer-events-none"></div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-[#020617]/80 to-[#020617] -z-10 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen -z-10"></div>
      <div className="absolute top-1/3 left-0 w-[40vw] h-[40vw] max-w-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse -z-10" style={{ animationDuration: '10s' }}></div>
      <div className="absolute bottom-1/4 right-0 w-[40vw] h-[40vw] max-w-[600px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse -z-10" style={{ animationDuration: '14s' }}></div>

      <div className="max-w-[700px] mx-auto px-4 py-8 sm:py-12 relative z-10">
        <div className="mb-10 sm:mb-12 px-2 sm:px-0 text-center flex flex-col items-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[100px] bg-purple-500/10 blur-[60px] pointer-events-none -z-10"></div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.05)] mb-4">Evolution Network</h1>
          <p className="text-[10px] sm:text-xs text-slate-500 font-black tracking-[0.3em] uppercase">Document your trajectory.</p>
        </div>

        {/* Premium Cinematic Toggle */}
        <div className="flex justify-center mb-10 sm:mb-14 relative z-10">
          <div className="inline-flex p-1.5 rounded-full bg-[#12121c]/60 border border-white/[0.06] backdrop-blur-xl shadow-2xl">
            {['mine', 'friends', 'global'].map(mode => (
              <button
                key={mode}
                onClick={() => {
                  if ((mode === 'mine' || mode === 'friends') && !user) {
                    setShowLoginPrompt(true);
                    return;
                  }
                  setFeedMode(mode);
                }}
                className={`rounded-full px-6 sm:px-8 py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                  feedMode === mode
                    ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02] border border-transparent'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {feedMode === 'mine' && user && (
          <div className="bg-[#12121c]/60 border border-white/[0.06] rounded-[28px] p-6 sm:p-8 backdrop-blur-xl shadow-xl relative overflow-hidden group hover:shadow-2xl hover:bg-[#12121c]/80 hover:border-white/10 transition-all duration-500 ease-out mb-12">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors duration-700 pointer-events-none"></div>
            <div className="flex gap-4">
              <UserAvatar user={user} size="md" className="border-2 border-[#020617] relative z-10" />
              
              <div className="flex-grow min-w-0 relative z-10">
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="What did you improve today?"
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 resize-none focus:outline-none min-h-[60px] pt-2 tracking-wide font-medium"
                  rows={2}
                />
                
                {postImage && (
                  <div className="relative mt-3 rounded-2xl overflow-hidden border border-white/10 w-full max-w-[200px] shadow-lg">
                    <img src={postImage} alt="Upload preview" className="w-full h-auto object-cover" />
                    <button onClick={() => setPostImage(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/80 flex items-center justify-center w-6 h-6">✕</button>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                    />
                    <button 
                      title="Attach Image"
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2 rounded-full transition-colors ${postImage ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </button>

                    {myChallenges.length > 0 && (
                      <select
                        value={postChallenge}
                        onChange={(e) => setPostChallenge(e.target.value)}
                        className="bg-[#020617]/80 border border-white/10 focus:border-cyan-500/50 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 rounded-full px-4 py-2.5 focus:outline-none cursor-pointer hover:bg-white/5 transition-all max-w-[150px] sm:max-w-[200px] truncate backdrop-blur-xl shadow-lg"
                      >
                        <option className="bg-slate-900" value="">Tag Domain...</option>
                        {myChallenges.map(c => (
                          <option className="bg-slate-900" key={c.challengeId?._id} value={c.challengeId?._id}>
                            {c.challengeId?.title}
                          </option>
                        ))}
                      </select>
                    )}

                    <select
                      value={postVisibility}
                      onChange={(e) => setPostVisibility(e.target.value)}
                      className="bg-[#020617]/80 border border-white/10 focus:border-purple-500/50 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 rounded-full px-4 py-2.5 focus:outline-none cursor-pointer hover:bg-white/5 transition-all truncate backdrop-blur-xl shadow-lg"
                    >
                      <option className="bg-slate-900" value="global">🌍 Global</option>
                      <option className="bg-slate-900" value="friends">👥 Friends</option>
                      <option className="bg-slate-900" value="personal">🔒 Personal</option>
                    </select>
                  </div>

                  <button
                    onClick={handleCreatePost}
                    disabled={!postText.trim() && !postImage}
                    className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                      (postText.trim() || postImage)
                        ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:-translate-y-0.5'
                        : 'bg-white/5 text-slate-500 border border-transparent cursor-not-allowed'
                    }`}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6 sm:gap-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-white/5 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
              <div className="animate-pulse text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Syncing Network...</div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-24 bg-[#12121c]/60 border border-white/[0.06] rounded-[28px] backdrop-blur-xl shadow-xl flex flex-col items-center">
              {feedMode === 'mine' && (
                <>
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-slate-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3">Your journey starts here.</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">Document small wins consistently.</p>
                </>
              )}
              {feedMode === 'friends' && (
                <>
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3">No activity yet.</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">Connect with others to build your accountability circle.</p>
                </>
              )}
              {feedMode === 'global' && (
                <>
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3">Network Silent.</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">No signals found in the global network right now.</p>
                </>
              )}
            </div>
          ) : (
            activities.map((activity) => (
            <article key={activity._id} className={`relative bg-[#12121c]/60 border border-white/[0.06] rounded-[28px] p-6 sm:p-8 backdrop-blur-xl transition-all duration-500 hover:bg-[#12121c]/80 hover:border-white/10 hover:-translate-y-1 hover:shadow-2xl group/card ${activeDropdown?.includes(activity._id) ? 'z-50' : 'z-10'}`}>
                <div className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none z-0">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[60px] -mr-24 -mt-24 group-hover/card:bg-purple-500/10 transition-colors duration-700"></div>
                </div>
                {/* Activity Header */}
                <div className="flex items-start gap-4 relative z-10">
                  <UserAvatar user={activity.userId} size="md" className="border-2 border-[#020617]" />
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-3 min-w-0">
                        <p className="font-bold text-white text-base tracking-wide truncate leading-none">{activity.userId?.name || 'User'}</p>
                        <VisibilitySelector 
                          visibility={activity.visibility} 
                          isOwner={user?._id === activity.userId?._id} 
                          onChange={handleVisibilityChange}
                          activeDropdown={activeDropdown}
                          setActiveDropdown={setActiveDropdown}
                          activityId={activity._id}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">{timeAgo(activity.createdAt)}</p>
                        
                        {/* Options Dropdown */}
                        {user && user._id === activity.userId?._id && (
                          <div className="relative" ref={activeDropdown === `opt-${activity._id}` ? dropdownRef : null}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(activeDropdown === `opt-${activity._id}` ? null : `opt-${activity._id}`);
                              }}
                              className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-full transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                              </svg>
                            </button>
                            
                            {activeDropdown === `opt-${activity._id}` && (
                              <div className="absolute right-0 mt-1 w-36 bg-[#12121c]/95 border border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden origin-top-right animate-fade-in-fast backdrop-blur-xl">
                                <button onClick={() => { handleEditPost(activity._id); setActiveDropdown(null); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                  </svg>
                                  Edit Post
                                </button>
                                <button onClick={() => { handleDeletePost(activity._id); setActiveDropdown(null); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-[15px] sm:text-base text-slate-200 leading-relaxed mt-2 mb-5 font-semibold drop-shadow-sm">
                      {getActivityText(activity)}
                    </p>

                    {/* Post Image */}
                    {(activity.image || activity.meta?.image) && (
                      <div className="mb-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/40 relative group/img shadow-inner">
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
                        <img 
                          src={activity.image || activity.meta?.image} 
                          alt="Post attachment" 
                          className="w-full h-auto object-cover max-h-[500px] transition-transform duration-700 group-hover/img:scale-[1.02]"
                        />
                      </div>
                    )}

                    {/* Challenge Tag */}
                    {activity.challengeId?.title && (
                      <div className={`mb-5 inline-flex items-center px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors cursor-default ${getTagColor(activity.challengeId.title)}`}>
                        {activity.challengeId.title}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center gap-6 mb-5">
                      <button
                        onClick={(e) => handleLike(e, activity._id)}
                        className="group flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <div className={`p-1.5 rounded-full transition-colors ${
                          activity.likes?.includes(user?._id) 
                            ? 'text-rose-500 bg-rose-500/10 shadow-[0_0_10px_rgba(244,63,94,0.2)]' 
                            : 'text-slate-500 group-hover:bg-white/[0.05] group-hover:text-slate-300'
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill={activity.likes?.includes(user?._id) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                        </div>
                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${
                          activity.likes?.includes(user?._id) ? 'text-rose-500' : 'text-slate-500 group-hover:text-slate-300'
                        }`}>
                          {getLikeCount(activity)}
                        </span>
                      </button>
                    </div>

                    {/* Comments */}
                    {activity.comments && activity.comments.length > 0 && (
                      <div className="mb-4 space-y-2.5">
                        {activity.comments.map((comment, idx) => (
                          <div key={idx} className="group/comment text-sm leading-snug flex items-start gap-2 bg-white/[0.02] p-3 rounded-2xl border border-white/[0.02]">
                            <span className="font-bold text-sm text-slate-200 shrink-0">{comment.userId?.name || 'User'}</span>
                            <span className="text-[13px] sm:text-sm text-slate-200 font-medium break-words flex-grow drop-shadow-sm">{comment.text}</span>
                            {user && user._id === comment.userId?._id && (
                              <button 
                                onClick={() => handleDeleteComment(activity._id, comment._id, idx)}
                                className="opacity-0 group-hover/comment:opacity-100 p-0.5 text-slate-600 hover:text-red-400 transition-colors shrink-0"
                                title="Delete comment"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Input */}
                    <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                      <input
                        type="text"
                        placeholder={user ? "Add a comment..." : "Log in to comment"}
                        value={commentText[activity._id] || ''}
                        onChange={(e) => setCommentText({ ...commentText, [activity._id]: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleComment(activity._id);
                          }
                        }}
                        disabled={!user}
                        className={`flex-grow px-4 py-2.5 rounded-2xl text-[13px] sm:text-sm font-medium focus:outline-none transition-all ${
                          user
                            ? 'bg-[#020617]/50 border border-white/10 focus:border-cyan-500/50 text-white placeholder-slate-600 focus:bg-white/5 shadow-inner'
                            : 'bg-white/[0.02] border border-transparent text-slate-500 cursor-not-allowed'
                        }`}
                      />
                      <button
                        onClick={() => handleComment(activity._id)}
                        disabled={!user || !commentText[activity._id]?.trim()}
                        className={`px-5 py-2.5 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest ${
                          user && commentText[activity._id]?.trim()
                            ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                            : 'bg-white/[0.02] text-slate-500 border border-transparent cursor-not-allowed'
                        }`}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>

      <Modal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        title="LOG IN REQUIRED"
      >
        <div className="space-y-5">
          <p className="text-slate-300 font-medium">You need to be logged in to like and comment on activities.</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/20 uppercase tracking-widest flex-1 sm:flex-none text-center"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowLoginPrompt(false);
                navigate('/');
              }}
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-slate-200 shadow-lg uppercase tracking-widest flex-1 sm:flex-none text-center"
            >
              Log In
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
