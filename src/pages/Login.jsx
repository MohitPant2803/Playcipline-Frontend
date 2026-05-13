import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/client';

// High-Performance Cinematic Motion System
function useParallax(speed = 0.1) {
  const ref = useRef(null);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;
    let rafId;
    const handleScroll = () => {
      if (!ref.current || !ref.current.parentElement) return;
      const rect = ref.current.parentElement.getBoundingClientRect();
      const offset = rect.top * speed;
      rafId = requestAnimationFrame(() => {
        if (ref.current) ref.current.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [speed]);
  return ref;
}

function useScrollReveal(options = { threshold: 0.3 }) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
      else if (entry.boundingClientRect.top > 0) setInView(false);
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, [options.threshold]);
  return [ref, inView];
}

function Reveal({ children, delay = 0, className = '', direction = 'up', blur = false, threshold = 0.2 }) {
  const [ref, inView] = useScrollReveal({ threshold });
  const baseClass = "transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:blur-none";
  let hiddenClass = "opacity-0";
  let visibleClass = "opacity-100 scale-100 translate-y-0 translate-x-0 blur-none";
  if (direction === 'up') hiddenClass += " translate-y-16";
  if (direction === 'down') hiddenClass += " -translate-y-16";
  if (direction === 'left') hiddenClass += " -translate-x-16";
  if (direction === 'right') hiddenClass += " translate-x-16";
  if (blur) hiddenClass += " blur-[12px] scale-95";

  return (
    <div ref={ref} className={`${baseClass} ${inView ? visibleClass : hiddenClass} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function ParallaxOrb({ className, speed, animationDuration, animationDelay }) {
  const ref = useParallax(speed);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
      <div ref={ref} className={`rounded-full mix-blend-screen filter animate-pulse will-change-transform ${className}`} style={{ animationDuration, animationDelay }}></div>
    </div>
  );
}

function TimelineMilestone({ day, title, description, align = 'left', glowColor = 'cyan' }) {
  const [ref, inView] = useScrollReveal({ threshold: 0.4 });
  const isLeft = align === 'left';
  const glowClasses = {
    cyan: 'bg-cyan-400 border-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.8)]',
    purple: 'bg-purple-500 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.8)]',
    white: 'bg-white border-white shadow-[0_0_40px_rgba(255,255,255,0.9)]',
  };
  return (
    <div ref={ref} className="relative flex items-center w-full mb-32 last:mb-0 min-h-[150px] group">
      <div className={`absolute left-8 md:left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 ${inView ? glowClasses[glowColor] + ' scale-150' : 'bg-[#0f172a] border-slate-700 scale-100'}`}></div>
      <Reveal direction={isLeft ? 'left' : 'right'} className={`w-full md:w-1/2 flex ${isLeft ? 'md:justify-end md:pr-16' : 'md:justify-start md:pl-16 md:ml-auto'} pl-24 pr-4`}>
        <div className={`flex flex-col ${isLeft ? 'md:text-right' : 'md:text-left'} text-left`}>
          <span className={`text-sm sm:text-lg font-black uppercase tracking-[0.3em] mb-2 transition-colors duration-1000 ${inView ? `text-${glowColor}-400` : 'text-slate-800'}`}>{day}</span>
          <h3 className="text-2xl sm:text-4xl font-black text-white mb-4 tracking-tight drop-shadow-lg leading-tight">{title}</h3>
          <p className="text-base sm:text-lg text-slate-400 font-medium leading-relaxed">{description}</p>
        </div>
      </Reveal>
    </div>
  );
}

const ARCHETYPES = [
  { id: 'warrior', name: 'The Warrior', icon: '⚔️', description: 'Forge your character through physical resistance and discipline.', borderHover: 'hover:border-red-500/50', gradient: 'from-red-900/40 to-transparent' },
  { id: 'monk', name: 'The Monk', icon: '👁️', description: 'Seek absolute clarity, unwavering focus, and internal peace.', borderHover: 'hover:border-teal-500/50', gradient: 'from-teal-900/40 to-transparent' },
  { id: 'builder', name: 'The Builder', icon: '🏗️', description: 'Driven by ambition. Turn ideas into monumental reality.', borderHover: 'hover:border-indigo-500/50', gradient: 'from-indigo-900/40 to-transparent' },
];

export default function Login() {
  const { user, loading, error } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  const LoginPanel = ({ isMobile = false }) => (
    <div className={`flex flex-col items-center text-center w-full max-w-sm mx-auto ${isMobile ? 'py-20 px-4' : ''}`}>
      <span className="text-5xl drop-shadow-[0_0_20px_theme(colors.purple.500)] mb-6 animate-pulse">🎮</span>
      <h2 className="text-4xl font-black tracking-widest uppercase mb-4 text-white drop-shadow-lg">Playcipline</h2>
      <p className="text-slate-400 font-medium mb-12 text-lg">Your evolution begins here.</p>

      {error && (
        <div className="mb-8 w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400 backdrop-blur-md">
          {error}
        </div>
      )}

      <a
        href={`${API_BASE_URL}/api/auth/google`}
        className="group relative w-full px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-2xl overflow-hidden transition-all duration-500 transform hover:scale-[1.02] shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:shadow-[0_0_60px_rgba(168,85,247,0.3)]"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <span className="relative z-10 text-sm font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-4">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.02 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </span>
      </a>
      <p className="mt-8 text-xs font-semibold text-slate-500 uppercase tracking-widest">Join the top 1%</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans flex flex-col lg:flex-row selection:bg-purple-500/30 overflow-x-hidden">
      
      {/* Mobile Top Header (Quick Action) */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎮</span>
          <span className="font-black tracking-wider text-white">Playcipline</span>
        </div>
        <a href={`${API_BASE_URL}/api/auth/google`} className="text-xs font-black uppercase tracking-widest text-white bg-white/10 px-4 py-2 rounded-full border border-white/20">Sign In</a>
      </div>

      {/* LEFT SIDE: Cinematic Onboarding Scroll */}
      <div className="flex-1 w-full lg:w-[calc(100%-450px)] xl:w-[calc(100%-550px)] relative">
        
        {/* Section 1: Opening Atmosphere */}
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-[#020617] to-[#020617] -z-10"></div>
          <ParallaxOrb speed={-0.1} className="w-[60vw] h-[60vw] max-w-[600px] bg-purple-600/20 blur-[120px]" animationDuration="8s" />
          <ParallaxOrb speed={0.1} className="w-[50vw] h-[50vw] max-w-[500px] bg-cyan-600/10 blur-[100px] translate-x-1/2 translate-y-1/2" animationDuration="12s" animationDelay="2s" />
          
          <Reveal delay={100} blur>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 uppercase leading-[1.1] p-4 drop-shadow-2xl">
              Every transformation<br/>starts with a decision.
            </h1>
          </Reveal>
          <Reveal delay={300}>
            <p className="text-xl sm:text-3xl text-slate-300 font-medium tracking-wide drop-shadow-md">The next version of you is waiting.</p>
          </Reveal>

          <div className="absolute bottom-10 animate-bounce text-white/30 text-sm font-black uppercase tracking-[0.4em]">Scroll to Explore</div>
        </div>

        {/* Section 2: Current Reality */}
        <div className="py-32 sm:py-48 flex flex-col items-center text-center px-4 relative border-t border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-[#020617] to-[#020617] -z-10"></div>
          <Reveal blur delay={0}><h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-600 mb-8 tracking-tight">Another day distracted.</h2></Reveal>
          <Reveal blur delay={200}><h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-500 mb-16 tracking-tight">Another promise delayed.</h2></Reveal>
          <Reveal blur delay={400}>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.3)] uppercase tracking-tighter">
              Are you ready to change?
            </h2>
          </Reveal>
        </div>

        {/* Section 3: Identity & Archetypes (Combined for impact) */}
        <div className="py-32 sm:py-48 px-4 sm:px-12 relative border-t border-white/5 bg-black/50">
          <div className="text-center mb-24">
            <Reveal delay={0}><span className="text-xs sm:text-sm font-black uppercase tracking-[0.4em] text-cyan-500 mb-6 block">Identity Projection</span></Reveal>
            <Reveal delay={100}><h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 drop-shadow-2xl">Choose Your Future Self</h2></Reveal>
            <Reveal delay={200}><p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">Who do you need to become? Claim your identity before you begin.</p></Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {ARCHETYPES.map((arch, i) => (
              <Reveal key={arch.id} delay={i * 150} direction="up" className={`group relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] overflow-hidden ${arch.borderHover} transition-colors duration-500`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${arch.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                <div className="relative z-10 flex flex-col h-full text-center items-center">
                  <span className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-500">{arch.icon}</span>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-4">{arch.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{arch.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Section 4: Transformation Timeline */}
        <div className="py-32 sm:py-48 px-4 relative border-t border-white/5 overflow-hidden">
          <ParallaxOrb speed={0.1} className="w-[80vw] h-[80vw] max-w-[800px] bg-cyan-900/10 blur-[150px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" animationDuration="15s" />
          <div className="text-center mb-24 relative z-10">
            <Reveal delay={0}><h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6">The Anatomy of Growth</h2></Reveal>
          </div>
          
          <div className="relative max-w-3xl mx-auto z-10">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/0 via-cyan-500/50 to-white/0 -translate-x-1/2 z-0"></div>
            <TimelineMilestone day="Day 1" title="The Decision" description="Motivation is high, discipline is zero. The hardest part is starting." align="left" glowColor="cyan" />
            <TimelineMilestone day="Day 30" title="The Resistance" description="Excitement fades. You show up even when you don't want to. Character is built here." align="right" glowColor="purple" />
            <TimelineMilestone day="Day 90" title="The Transformation" description="The routine is natural. You have fundamentally rewired your identity." align="left" glowColor="white" />
          </div>
        </div>

        {/* Section 5: Social Momentum */}
        <div className="py-32 sm:py-48 px-4 relative border-t border-white/5 bg-gradient-to-b from-transparent to-purple-900/20 text-center flex flex-col items-center">
          <Reveal blur delay={0}><h2 className="text-6xl sm:text-8xl font-black text-white mb-6 tabular-nums drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">12,481+</h2></Reveal>
          <Reveal delay={200}><h3 className="text-2xl sm:text-4xl font-black text-slate-300 uppercase tracking-widest mb-8">Evolutions in Progress</h3></Reveal>
          <Reveal delay={400}><p className="text-xl text-slate-400 font-medium max-w-2xl">Momentum compounds daily. Join the individuals who refuse to stay the same.</p></Reveal>
        </div>

        {/* Section 6: Final Climax (Mobile Login Area) */}
        <div className="lg:hidden py-32 px-4 border-t border-white/10 bg-[#020617] relative z-20 shadow-[0_-40px_100px_rgba(0,0,0,1)]">
          <Reveal delay={0}>
            <h2 className="text-5xl sm:text-6xl font-black text-white text-center tracking-tighter mb-16 uppercase drop-shadow-2xl">Your Future Self <br/>is Waiting.</h2>
          </Reveal>
          <Reveal delay={200}>
            <LoginPanel isMobile={true} />
          </Reveal>
        </div>

      </div>

      {/* RIGHT SIDE: Fixed Login Panel (Desktop) */}
      <div className="hidden lg:flex w-[450px] xl:w-[550px] fixed right-0 top-0 h-screen border-l border-white/10 bg-slate-900/50 backdrop-blur-2xl flex-col items-center justify-center p-8 z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
         <LoginPanel isMobile={false} />
      </div>

    </div>
  );
}
