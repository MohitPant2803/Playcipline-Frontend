import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const DOMAINS = [
  { id: 'body', title: 'Body', subtitle: 'Strength', icon: '💪', color: 'bg-gray-100 text-gray-700', tagline: 'Forge your physical vessel.', category: 'Fitness' },
  { id: 'mind', title: 'Mind', subtitle: 'Discipline', icon: '🧠', color: 'bg-gray-100 text-gray-700', tagline: 'Master your inner world.', category: 'Mind' },
  { id: 'work', title: 'Work', subtitle: 'Mastery', icon: '⚡', color: 'bg-gray-100 text-gray-700', tagline: 'Dominate your craft.', category: 'Work' },
  { id: 'social', title: 'Social', subtitle: 'Connection', icon: '🤝', color: 'bg-gray-100 text-gray-700', tagline: 'Build your tribe.', category: 'Social' },
  { id: 'lifestyle', title: 'Lifestyle', subtitle: 'Control', icon: '🎯', color: 'bg-gray-100 text-gray-700', tagline: 'Design your environment.', category: 'Lifestyle' },
  { id: 'purpose', title: 'Purpose', subtitle: 'Meaning', icon: '👁️', color: 'bg-gray-100 text-gray-700', tagline: 'Align with your destiny.', category: 'Purpose' },
];

function useScrollReveal(options = { threshold: 0.3 }) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [options.threshold]);

  return [ref, inView];
}

function IdentityPanel({ title, subtitle, description, align = 'left', gradient, glow, isLast }) {
  const [ref, inView] = useScrollReveal({ threshold: 0.4 });
  
  const alignClass = align === 'center' ? 'items-center text-center' : align === 'right' ? 'items-end text-right' : 'items-start text-left';
  
  return (
    <div ref={ref} className={`relative w-full ${isLast ? 'h-[120vh]' : 'h-[150vh]'}`}>
      <div className="sticky top-0 h-screen w-full flex items-center justify-center px-6 sm:px-12 overflow-hidden bg-[#020617]">
         <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${inView ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] rounded-full mix-blend-screen filter blur-[120px] ${glow}`}></div>
         </div>
         
         <div className={`relative z-10 max-w-5xl w-full flex flex-col ${alignClass}`}>
             <span className={`text-sm md:text-base font-black uppercase tracking-[0.4em] mb-6 text-white/50 transform transition-all duration-1000 ease-out ${inView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>{subtitle}</span>
             <h2 className={`text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 leading-[1.1] tracking-tight mb-8 transform transition-all duration-1000 delay-200 ease-out ${inView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>{title}</h2>
             <p className={`text-xl sm:text-2xl md:text-3xl text-white/70 max-w-2xl font-medium leading-relaxed transform transition-all duration-1000 delay-400 ease-out ${inView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>{description}</p>
         </div>
      </div>
    </div>
  );
}

export default function Explore() {
  const navigate = useNavigate();

  return (
    <div className="pb-20 sm:pb-0 bg-[#020617] text-white font-sans min-h-screen relative selection:bg-purple-500/30">
      {/* Cinematic Hero Section */}
      <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden">
        {/* Immersive Animated Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-purple-900/20 via-[#0f172a]/60 to-[#020617] z-10"></div>
          
          {/* Floating Atmospheric Orbs */}
          <div 
            className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" 
            style={{ animationDuration: '6s' }}
          ></div>
          <div 
            className="absolute bottom-1/4 right-1/4 w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-pink-600/10 rounded-full mix-blend-screen filter blur-[80px] animate-pulse" 
            style={{ animationDuration: '8s', animationDelay: '1s' }}
          ></div>
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-cyan-900/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"
            style={{ animationDuration: '10s', animationDelay: '2s' }}
          ></div>
        </div>

        {/* Hero Content */}
        <div className="max-w-5xl mx-auto relative z-20 text-center flex flex-col items-center mt-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 sm:mb-12 transition-transform hover:scale-105 cursor-default shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-bold text-cyan-50 uppercase tracking-[0.25em]">Your Evolution Awaits</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400 leading-[1.1] drop-shadow-2xl uppercase">
            Focus. Forge. Finish.
          </h1>

          <p className="text-lg sm:text-2xl text-slate-300 mb-16 leading-relaxed max-w-3xl font-medium tracking-wide drop-shadow-md">
            Select your domain. Build relentless habits, execute with precision, and become the architect of your own reality.
          </p>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer z-30 group"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-cyan-300 transition-colors">Begin Journey</span>
          <div className="w-6 h-10 border-2 border-slate-500 group-hover:border-cyan-400 rounded-full flex justify-center p-1 transition-colors">
            <div className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce mt-1"></div>
          </div>
        </div>
        
        {/* Fade transition to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#020617] to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* Identity Experience Scroll Journey */}
      <div className="relative z-20">
        <IdentityPanel 
           subtitle="The Physical Vessel"
           title={<>The Disciplined<br/>Athlete.</>}
           description="Unbreakable. Relentless. You build energy through motion and prove your commitments through sweat."
           align="left"
           gradient="from-[#020617] via-red-950/30 to-[#020617]"
           glow="bg-red-600/20"
        />
        <IdentityPanel 
           subtitle="The Inner World"
           title={<>The Calm<br/>Thinker.</>}
           description="Unbothered by chaos. You master your attention, starve distractions, and cultivate absolute clarity."
           align="right"
           gradient="from-[#020617] via-teal-950/20 to-[#020617]"
           glow="bg-teal-600/20"
        />
        <IdentityPanel 
           subtitle="The Mastery of Craft"
           title={<>The Unstoppable<br/>Builder.</>}
           description="You don't wait for inspiration. You execute. You turn ambition into reality, one deep work session at a time."
           align="left"
           gradient="from-[#020617] via-indigo-950/30 to-[#020617]"
           glow="bg-indigo-600/20"
        />
        <IdentityPanel 
           subtitle="The Final Evolution"
           title={<>The Version of You<br/>That Never Quits.</>}
           description="This is who you are becoming. The path is mapped. Now, you just have to walk it."
           align="center"
           gradient="from-[#020617] via-purple-950/30 to-[#020617]"
           glow="bg-purple-600/20"
           isLast={true}
        />
      </div>

      <div className="relative z-30 bg-[#020617] pt-20 sm:pt-32 pb-24 shadow-[0_-40px_100px_rgba(2,6,23,1)]">
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-16 relative">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">Choose Your Domain</h2>
            <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">Where will your transformation begin?</p>
          </div>

          {/* Domains Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative">
          {/* Ambient glow behind grid */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          {DOMAINS.map((domain) => (
            <div
              key={domain.id}
              onClick={() => navigate(`/explore/${domain.id}`)}
              className="group relative overflow-hidden p-8 sm:p-10 rounded-[2rem] cursor-pointer transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] bg-slate-800/40 border border-slate-700/50 hover:border-purple-500/50 shadow-2xl hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] backdrop-blur-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-700/50 group-hover:bg-purple-500/20 transition-colors duration-300 border border-slate-500/30 group-hover:border-purple-400/50">
                    <span className="text-3xl drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">{domain.icon}</span>
                  </div>
                  <span className="text-xs font-black text-slate-400 group-hover:text-purple-300 tracking-widest uppercase transition-colors duration-300">
                    {domain.subtitle}
                  </span>
                </div>
                
                <h3 className="font-black text-3xl text-white mb-3 tracking-wide drop-shadow-lg">{domain.title}</h3>
                <p className="text-sm sm:text-base text-purple-200/70 font-medium leading-relaxed group-hover:text-purple-100 transition-colors duration-300">
                  {domain.tagline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
