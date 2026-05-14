import React, { useState } from 'react';
import { avatarCategories } from './avatars';
import UserAvatar from './UserAvatar';

export default function PersonaSelector({ currentPersona, userName, userLevel, onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState(avatarCategories[0].id);
  const [selectedPersona, setSelectedPersona] = useState(
    currentPersona || avatarCategories[0].avatars[0]
  );

  const category = avatarCategories.find(c => c.id === activeCategory);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-xl p-4 sm:p-8 animate-fade-in-fast" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-6xl h-[90vh] bg-[#12121c]/90 border border-white/10 rounded-[2rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        {/* Left: Cinematic Live Preview Area */}
        <div className="w-full lg:w-1/3 bg-black/40 border-r border-white/10 p-6 sm:p-8 flex flex-col">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase mb-8 shrink-0">Live Identity</h2>
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {/* Profile Card Preview */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none"></div>
              <UserAvatar user={{ avatar: selectedPersona, name: userName }} size="custom" className="w-20 h-20 border-2 border-cyan-400/30 bg-[#020617] shadow-[0_0_20px_rgba(34,211,238,0.3)]" />
              <div className="relative z-10">
                <h3 className="font-black text-xl text-white tracking-wide truncate max-w-[150px]">{userName || 'Your Name'}</h3>
                <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest mt-1">Level {userLevel || 1}</p>
                <p className="text-slate-400 text-xs font-medium mt-2">{selectedPersona?.name} Persona</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-8 border-t border-white/10 flex gap-3 shrink-0">
            <button 
              onClick={onClose} 
              className="flex-1 px-6 py-3.5 rounded-full border border-white/10 text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSelect(selectedPersona)} 
              className="flex-1 px-6 py-3.5 rounded-full bg-cyan-500 text-[#020617] font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:bg-cyan-400 hover:-translate-y-0.5 transition-all"
            >
              Confirm
            </button>
          </div>
        </div>

        {/* Right: Persona Selection Grid */}
        <div className="w-full lg:w-2/3 flex flex-col h-full overflow-hidden">
          <div className="flex overflow-x-auto gap-2 p-6 border-b border-white/10 hide-scrollbar">
            {avatarCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeCategory === cat.id 
                    ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                    : 'bg-transparent text-slate-500 hover:text-slate-300 border border-transparent hover:bg-white/5'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="mb-8">
              <h3 className="text-2xl font-black text-white">{category.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{category.description}</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {category.avatars.map(avatar => {
                const isSelected = selectedPersona?.id === avatar.id;
                return (
                  <div
                    key={avatar.id}
                    onClick={() => setSelectedPersona(avatar)}
                    className={`relative flex flex-col items-center p-4 rounded-3xl border cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'bg-white/10 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)] transform -translate-y-1' 
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-0.5'
                    }`}
                  >
                    {avatar.rarity !== 'common' && <span className={`absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${avatar.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' : avatar.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{avatar.rarity}</span>}
                    <UserAvatar user={{ avatar }} size="custom" className="w-16 h-16 sm:w-20 sm:h-20 mb-4 bg-transparent border-none" />
                    <p className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${isSelected ? 'text-cyan-400' : 'text-slate-300'}`}>{avatar.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}