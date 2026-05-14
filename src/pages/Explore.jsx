import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const DOMAINS = [
  { id: 'body', title: 'Body', subtitle: 'Strength & Vessel', icon: '💪', color: 'bg-gray-100 text-gray-700', tagline: 'Forge your physical vessel.', category: 'Fitness', quote: "Train when you don't feel like it.", description: "The mind gives up before the body. Push past your perceived limits, build unbreakable discipline, and forge your physical vessel.", align: "left", gradient: "from-[#020617] via-orange-950/30 to-[#020617]", glow: "bg-orange-600/30" },
  { id: 'mind', title: 'Mind', subtitle: 'Focus & Discipline', icon: '🧠', color: 'bg-gray-100 text-gray-700', tagline: 'Master your inner world.', category: 'Mind', quote: "Silence the noise.", description: "In a world of constant distraction, focus is a superpower. Cultivate calmness, master your attention, and claim your inner peace.", align: "right", gradient: "from-[#020617] via-cyan-950/30 to-[#020617]", glow: "bg-cyan-600/30" },
  { id: 'work', title: 'Work', subtitle: 'Ambition & Mastery', icon: '⚡', color: 'bg-gray-100 text-gray-700', tagline: 'Dominate your craft.', category: 'Work', quote: "Most people quit too early.", description: "Ambition means nothing without execution. Dive into deep work, build relentless momentum, and dominate your craft.", align: "left", gradient: "from-[#020617] via-indigo-950/30 to-[#020617]", glow: "bg-indigo-600/30" },
  { id: 'social', title: 'Social', subtitle: 'Connection & Tribe', icon: '🤝', color: 'bg-gray-100 text-gray-700', tagline: 'Build your tribe.', category: 'Social', quote: "True connection requires presence.", description: "Build confidence, communicate with impact, and forge relationships that elevate you. Find your tribe.", align: "right", gradient: "from-[#020617] via-emerald-950/30 to-[#020617]", glow: "bg-emerald-600/30" },
  { id: 'lifestyle', title: 'Lifestyle', subtitle: 'Systems & Control', icon: '🎯', color: 'bg-gray-100 text-gray-700', tagline: 'Design your environment.', category: 'Lifestyle', quote: "You fall to the level of your systems.", description: "Willpower is finite; habits are forever. Design your environment, master your routines, and build sustainable balance.", align: "left", gradient: "from-[#020617] via-purple-950/30 to-[#020617]", glow: "bg-purple-600/30" },
  { id: 'purpose', title: 'Purpose', subtitle: 'Meaning & Legacy', icon: '👁️', color: 'bg-gray-100 text-gray-700', tagline: 'Align with your destiny.', category: 'Purpose', quote: "Leave a legacy.", description: "Align your daily actions with your ultimate destiny. Find meaning, cast a long-term vision, and build something that outlasts you.", align: "center", gradient: "from-[#020617] via-rose-950/30 to-[#020617]", glow: "bg-rose-600/30" },
];

/*
export const ARCHETYPES = [
  { id: 'warrior', name: 'The Warrior', icon: '⚔️', description: 'Relentless forward motion. You forge your character through physical resistance and unbreakable discipline.', traits: ['Discipline', 'Physical Toughness', 'Consistency'], gradient: 'from-red-900/40 to-transparent', borderHover: 'hover:border-red-500/50', glow: 'bg-red-500/20', dot: 'bg-red-500' },
  { id: 'monk', name: 'The Monk', icon: '👁️', description: 'Mastery over the mind. You seek absolute clarity, unwavering focus, and internal peace amidst the noise.', traits: ['Focus', 'Clarity', 'Inner Control'], gradient: 'from-teal-900/40 to-transparent', borderHover: 'hover:border-teal-500/50', glow: 'bg-teal-500/20', dot: 'bg-teal-500' },
  { id: 'builder', name: 'The Builder', icon: '🏗️', description: 'Transforming vision into reality. You are driven by ambition and the desire to create lasting value.', traits: ['Ambition', 'Creation', 'Deep Work'], gradient: 'from-indigo-900/40 to-transparent', borderHover: 'hover:border-indigo-500/50', glow: 'bg-indigo-500/20', dot: 'bg-indigo-500' },
  { id: 'operator', name: 'The Operator', icon: '⚙️', description: 'Systems over motivation. You execute with surgical precision, optimizing every facet of your daily life.', traits: ['Execution', 'Precision', 'Systems'], gradient: 'from-purple-900/40 to-transparent', borderHover: 'hover:border-purple-500/50', glow: 'bg-purple-500/20', dot: 'bg-purple-500' },
  { id: 'balanced', name: 'The Balanced', icon: '⚖️', description: 'The marathon runner. You prioritize sustainable, holistic growth across all domains of life without burning out.', traits: ['Sustainable Growth', 'Calmness', 'Health'], gradient: 'from-emerald-900/40 to-transparent', borderHover: 'hover:border-emerald-500/50', glow: 'bg-emerald-500/20', dot: 'bg-emerald-500' },
];
*/

export const PROGRESSION_STAGES = [
  { id: 'beginner', rank: 'Level 1-9', name: 'Beginner', desc: 'The hardest part is starting. You are fighting old habits and building new baselines. Motivation is fleeting, so you must rely on pure willpower.', traits: ['Starting', 'Uncertain', 'Curious'], colorClass: 'text-slate-400', glowClass: 'bg-slate-400', shadowClass: 'shadow-[0_0_30px_rgba(148,163,184,0.4)]', lineGradient: 'from-slate-500/50 to-blue-500/50' },
  { id: 'disciplined', rank: 'Level 10-24', name: 'Disciplined', desc: 'Motivation is gone, but the routine remains. You show up even when you do not want to. The compound effect begins to take root.', traits: ['Consistency', 'Momentum', 'Routine'], colorClass: 'text-blue-400', glowClass: 'bg-blue-400', shadowClass: 'shadow-[0_0_30px_rgba(96,165,250,0.4)]', lineGradient: 'from-blue-500/50 to-purple-500/50' },
  { id: 'relentless', rank: 'Level 25-49', name: 'Relentless', desc: 'The resistance fades. Your standards elevate. You are now driven by a deep internal fire that refuses to be extinguished.', traits: ['Intensity', 'Obsession', 'Drive'], colorClass: 'text-purple-400', glowClass: 'bg-purple-400', shadowClass: 'shadow-[0_0_30px_rgba(192,132,252,0.4)]', lineGradient: 'from-purple-500/50 to-pink-500/50' },
  { id: 'elite', rank: 'Level 50-99', name: 'Elite', desc: 'Mastery over the self. Your execution is surgical, your focus is unbreakable. You operate on a completely different frequency.', traits: ['Mastery', 'Standards', 'Control'], colorClass: 'text-pink-400', glowClass: 'bg-pink-400', shadowClass: 'shadow-[0_0_30px_rgba(244,114,182,0.4)]', lineGradient: 'from-pink-500/50 to-yellow-500/50' },
  { id: 'legendary', rank: 'Level 100+', name: 'Legendary', desc: 'Complete identity transformation. You are no longer building habits; you are building a legacy. You have become the architect of your reality.', traits: ['Legacy', 'Purpose', 'Transformation'], colorClass: 'text-yellow-400', glowClass: 'bg-yellow-400', shadowClass: 'shadow-[0_0_30px_rgba(250,204,21,0.4)]', lineGradient: 'from-yellow-500/50 to-transparent' },
];

// Unified Cinematic Motion System
function useParallax(speed = 0.1) {
  const ref = useRef(null);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    let rafId;
    const handleScroll = () => {
      if (!ref.current || !ref.current.parentElement) return;
      // Use parent bounding rect to prevent transform feedback loop jitter
      const rect = ref.current.parentElement.getBoundingClientRect();
      const offset = rect.top * speed;
      rafId = requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Trigger initial placement
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
    if (mediaQuery.matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
      } else if (entry.boundingClientRect.top > 0) {
        // Reset the animation only when scrolling back up past the element
        setInView(false);
      }
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [options.threshold, options.rootMargin]);

  return [ref, inView];
}

function Reveal({ children, delay = 0, className = '', direction = 'up', blur = false, threshold = 0.2, as = 'div' }) {
  const [ref, inView] = useScrollReveal({ threshold, rootMargin: '100px' });
  
  const baseClass = "transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:blur-none";
  
  let hiddenClass = "opacity-0";
  let visibleClass = "opacity-100 scale-100 translate-y-0 translate-x-0 blur-none";
  
  if (direction === 'up') hiddenClass += " translate-y-16";
  if (direction === 'down') hiddenClass += " -translate-y-16";
  if (direction === 'left') hiddenClass += " -translate-x-16";
  if (direction === 'right') hiddenClass += " translate-x-16";
  if (blur) hiddenClass += " blur-[12px] scale-95";

  const Component = as;
  return (
    <Component ref={ref} className={`${baseClass} ${inView ? visibleClass : hiddenClass} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Component>
  );
}

function ParallaxOrb({ className, speed, animationDuration, animationDelay }) {
  const ref = useParallax(speed);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
      <div 
        ref={ref}
        className={`rounded-full mix-blend-screen filter animate-pulse will-change-transform ${className}`} 
        style={{ animationDuration, animationDelay }}
      ></div>
    </div>
  );
}

function CinematicDomain({ domain }) {
  const [ref, inView] = useScrollReveal({ threshold: 0.1, rootMargin: '100px' });
  const navigate = useNavigate();
  const parallaxRef = useParallax(0.08);
  
  const { id, title, subtitle, icon, quote, description, align, gradient, glow } = domain;
  
  const alignClass = align === 'center' 
    ? 'items-center text-center' 
    : align === 'right' 
    ? 'items-end text-right md:ml-auto' 
    : 'items-start text-left';
  
  const flexClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

  const baseTransition = "transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform";
  const hiddenState = "opacity-0 translate-y-12";
  const visibleState = "opacity-100 translate-y-0";

  return (
    <div ref={ref} className="relative w-full py-32 sm:py-48 flex items-center px-6 sm:px-12 lg:px-24 overflow-hidden">
         {/* Ambient Backgrounds */}
         <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${inView ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`}></div>
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
               <div ref={parallaxRef} className={`w-[90vw] h-[90vw] max-w-[1000px] max-h-[1000px] rounded-full mix-blend-screen filter blur-[120px] opacity-60 ${glow} animate-pulse will-change-transform`} style={{ animationDuration: '8s' }}></div>
            </div>
         </div>
         
         {/* Content */}
         <div className={`relative z-10 w-full flex ${flexClass}`}>
           <div className={`max-w-3xl flex flex-col ${alignClass}`}>
              <div className={`flex items-center gap-4 mb-6 ${baseTransition} ${inView ? visibleState : hiddenState}`} style={{ transitionDelay: '0ms' }}>
                <span className="text-5xl sm:text-6xl drop-shadow-2xl">{icon}</span>
                <span className="text-sm md:text-base font-black uppercase tracking-[0.5em] text-white/50">{subtitle}</span>
              </div>
             
              <h2 className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 leading-[0.9] tracking-tighter mb-8 uppercase ${baseTransition} ${inView ? visibleState : hiddenState}`} style={{ transitionDelay: '100ms' }}>{title}</h2>
             
              <p className={`text-2xl sm:text-3xl md:text-4xl text-white font-bold leading-tight mb-6 ${baseTransition} ${inView ? visibleState : hiddenState}`} style={{ transitionDelay: '200ms' }}>"{quote}"</p>
             
              <p className={`text-lg sm:text-xl text-slate-400 font-medium leading-relaxed mb-12 max-w-2xl ${baseTransition} ${inView ? visibleState : hiddenState}`} style={{ transitionDelay: '300ms' }}>{description}</p>
             
              <div className={`${baseTransition} ${inView ? visibleState : hiddenState}`} style={{ transitionDelay: '400ms' }}>
                <button 
                  onClick={() => navigate(`/explore/${id}`)}
                  className={`group relative px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-full overflow-hidden transition-all duration-500 transform hover:scale-105 shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${glow}`}></div>
                  <span className="relative z-10 text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                    Enter Domain 
                    <span className="group-hover:translate-x-2 transition-transform duration-500">→</span>
                  </span>
                </button>
              </div>
           </div>
         </div>
    </div>
  );
}

function IdentityPanel({ title, subtitle, description, align = 'left', gradient, glow }) {
  const [ref, inView] = useScrollReveal({ threshold: 0.1, rootMargin: '100px' });
  const parallaxRef = useParallax(0.08);
  
  const alignClass = align === 'center' ? 'items-center text-center' : align === 'right' ? 'items-end text-right' : 'items-start text-left';
  
  return (
    <div ref={ref} className="relative w-full py-32 sm:py-48 flex items-center justify-center px-6 sm:px-12 overflow-hidden">
         <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${inView ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`}></div>
            <div ref={parallaxRef} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full mix-blend-screen filter blur-[100px] opacity-70 ${glow} will-change-transform`}></div>
         </div>
         
         <div className={`relative z-10 max-w-5xl w-full flex flex-col ${alignClass}`}>
             <Reveal delay={0}><span className="text-sm md:text-base font-black uppercase tracking-[0.4em] mb-6 text-white/50">{subtitle}</span></Reveal>
             <Reveal delay={100}><h2 className="text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 leading-[1.1] tracking-tight mb-8">{title}</h2></Reveal>
             <Reveal delay={200}><p className="text-xl sm:text-2xl md:text-3xl text-white/70 max-w-2xl font-medium leading-relaxed">{description}</p></Reveal>
         </div>
    </div>
  );
}

function TimelineMilestone({ day, title, description, align = 'left', glowColor = 'cyan' }) {
  const [ref, inView] = useScrollReveal({ threshold: 0.2, rootMargin: '100px' });

  const isLeft = align === 'left';
  
  const glowClasses = {
    cyan: 'bg-cyan-400 border-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.8)]',
    purple: 'bg-purple-500 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.8)]',
    pink: 'bg-pink-500 border-pink-400 shadow-[0_0_30px_rgba(236,72,153,0.8)]',
    white: 'bg-white border-white shadow-[0_0_40px_rgba(255,255,255,0.9)]',
  };
  const textGlowClasses = {
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    pink: 'text-pink-400',
    white: 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]',
  };

  return (
    <div ref={ref} className="relative flex items-center w-full mb-32 last:mb-0 min-h-[200px] group">
      {/* Glowing Milestone Dot */}
      <div className={`absolute left-8 md:left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 ${inView ? glowClasses[glowColor] + ' scale-150' : 'bg-[#0f172a] border-slate-700 scale-100'}`}></div>

      {/* Cinematic Content Card */}
      <Reveal direction={isLeft ? 'left' : 'right'} className={`w-full md:w-1/2 flex ${isLeft ? 'md:justify-end md:pr-24' : 'md:justify-start md:pl-24 md:ml-auto'} pl-24 pr-4`}>
        <div className={`flex flex-col ${isLeft ? 'md:text-right' : 'md:text-left'} text-left`}>
          <span className={`text-xl sm:text-2xl font-black uppercase tracking-[0.3em] mb-4 transition-colors duration-1000 ${inView ? textGlowClasses[glowColor] : 'text-slate-800'}`}>{day}</span>
          <h3 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight drop-shadow-lg leading-tight">{title}</h3>
          <p className="text-lg sm:text-xl text-slate-400 font-medium leading-relaxed">{description}</p>
        </div>
      </Reveal>
    </div>
  );
}

function ReflectiveText({ text, subtext, actionButton = null }) {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 sm:px-12 relative z-10">
      <Reveal blur delay={0}>
        <h3 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter leading-[1.1] p-4">
         {text}
        </h3>
      </Reveal>
      {subtext && (
        <Reveal delay={200}>
          <p className="mt-8 text-xl sm:text-2xl md:text-3xl text-slate-500 font-medium max-w-3xl leading-relaxed">
          {subtext}
          </p>
        </Reveal>
      )}
      {actionButton && (
         <Reveal delay={400}>
           <div className="mt-16">
           {actionButton}
           </div>
         </Reveal>
      )}
    </div>
  );
}

/*
function ArchetypeCard({ archetype, delayIdx }) {
  return (
    <Reveal 
      delay={(delayIdx % 3) * 100}
      direction="up"
      className={`group relative w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-lg flex flex-col p-8 sm:p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] overflow-hidden cursor-pointer ${archetype.borderHover}`} 
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${archetype.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
      <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${archetype.glow}`}></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <span className="text-5xl sm:text-6xl drop-shadow-2xl block mb-8 transform group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500 ease-out">{archetype.icon}</span>
        <h3 className="text-3xl font-black text-white tracking-tight mb-4 drop-shadow-md">{archetype.name}</h3>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-10 group-hover:text-slate-300 transition-colors duration-300 flex-grow">{archetype.description}</p>
        
        <div className="space-y-3 mt-auto">
          {archetype.traits.map((trait, i) => (
            <div key={trait} className="flex items-center gap-3 text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-all duration-500 transform translate-x-0 group-hover:translate-x-2" style={{ transitionDelay: `${i * 50}ms` }}>
              <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] ${archetype.dot}`}></span>
              {trait}
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
*/

function ProgressionStage({ stage, index, isLast }) {
  const [ref, inView] = useScrollReveal({ threshold: 0.1, rootMargin: '100px' });

  return (
    <div ref={ref} className="relative flex flex-col items-center text-center w-full pt-16 pb-24 sm:pb-32 z-10">
      {/* Central Glowing Node */}
      <div className={`relative z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-4 border-[#020617] bg-[#020617] flex items-center justify-center mb-10 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${inView ? 'scale-100 opacity-100 ' + stage.shadowClass : 'scale-50 opacity-0'}`}>
        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${stage.glowClass} ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-0'} transition-all duration-1000 delay-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}></div>
      </div>

      {/* Ambient background glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] rounded-full blur-[120px] opacity-0 transition-opacity duration-1000 pointer-events-none ${stage.glowClass} ${inView ? 'opacity-15' : 'opacity-0'}`}></div>

      {/* Text Content */}
      <Reveal delay={100} className="px-4">
        <span className={`text-sm sm:text-base font-black uppercase tracking-[0.4em] mb-4 block ${stage.colorClass} drop-shadow-lg`}>{stage.rank}</span>
        <h3 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-8 drop-shadow-2xl uppercase">{stage.name}</h3>
        
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
          {stage.traits.map((trait, i) => (
            <span key={trait} className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-300 backdrop-blur-sm transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform" style={{ transitionDelay: `${inView ? (i * 100) + 200 : 0}ms`, opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)' }}>
              {trait}
            </span>
          ))}
        </div>
        
        <p className="text-lg sm:text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">{stage.desc}</p>
      </Reveal>
      
      {/* Vertical connector line pointing down to the next node */}
      {!isLast && (
        <div className={`absolute top-20 bottom-[-5rem] left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b ${stage.lineGradient} transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top -z-10 ${inView ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`} style={{ transitionDelay: '300ms' }}></div>
      )}
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
            className="absolute top-1/4 left-1/4" 
          >
             <ParallaxOrb speed={-0.1} className="w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-purple-600/20 blur-[100px]" animationDuration="6s" />
          </div>
          <div 
            className="absolute bottom-1/4 right-1/4" 
          >
             <ParallaxOrb speed={0.15} className="w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-pink-600/10 blur-[80px]" animationDuration="8s" animationDelay="1s" />
          </div>
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
             <ParallaxOrb speed={0.05} className="w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-cyan-900/10 blur-[120px]" animationDuration="10s" animationDelay="2s" />
          </div>
        </div>

        {/* Hero Content */}
        <div className="max-w-5xl mx-auto relative z-20 text-center flex flex-col items-center mt-10">
          <Reveal delay={100} blur>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 sm:mb-12 transition-transform hover:scale-105 cursor-default shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-bold text-cyan-50 uppercase tracking-[0.25em]">Your Evolution Awaits</span>
          </div>
          </Reveal>

          <Reveal delay={200} blur>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400 leading-[1.1] drop-shadow-2xl uppercase">
              Focus. Forge. Finish.
            </h1>
          </Reveal>

          <Reveal delay={300}>
            <p className="text-lg sm:text-2xl text-slate-300 mb-16 leading-relaxed max-w-3xl font-medium tracking-wide drop-shadow-md">
              Select your domain. Build relentless habits, execute with precision, and become the architect of your own reality.
            </p>
          </Reveal>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer z-30 group"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-cyan-300 transition-colors">Select Domain</span>
          <div className="w-6 h-10 border-2 border-slate-500 group-hover:border-cyan-400 rounded-full flex justify-center p-1 transition-colors">
            <div className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce mt-1"></div>
          </div>
        </div>

        {/* Right Side Quick Jump */}
        <div className="absolute right-2 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 flex flex-col items-center z-40 opacity-60 hover:opacity-100 transition-opacity duration-500">
          <style>{`
            @keyframes glow-flow {
              0% { top: -10%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 110%; opacity: 0; }
            }
            .animate-glow-flow {
              animation: glow-flow 4s ease-in-out infinite;
            }
          `}</style>
          
          <div className="relative flex flex-col items-center">
            {/* Continuous background track */}
            <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent -z-10"></div>
            
            {/* The traveling glow drop */}
            <div className="absolute left-1/2 -translate-x-1/2 w-[2px] h-16 md:h-20 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-glow-flow z-0"></div>
            
            <div className="h-16 md:h-24"></div>

            <button 
              onClick={() => document.getElementById('domains-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group flex flex-col items-center gap-2 md:gap-4 focus:outline-none py-2 relative z-10"
              title="Jump to Domains"
            >
              <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.4em] text-white/50 group-hover:text-cyan-400 transition-colors duration-500" style={{ writingMode: 'vertical-rl' }}>
                Explore Domains
              </span>
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/10 group-hover:border-cyan-400 flex items-center justify-center transition-all duration-500 bg-[#020617] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:bg-cyan-900/20">
                <span className="text-white/50 group-hover:text-cyan-400 group-hover:translate-y-1 transition-all duration-500 text-[10px] md:text-xs">↓</span>
              </div>
            </button>

            <div className="h-16 md:h-24"></div>
          </div>
        </div>
        
        {/* Fade transition to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#020617] to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* Identity Experience Scroll Journey */}
      <div className="relative z-20 bg-[#020617] flex flex-col pb-20">
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
        />
      </div>

      {/* Transformation Timeline Section */}
      <div className="relative z-20 bg-[#020617] pt-24 pb-40 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-32">
            {/* <span className="text-xs sm:text-sm font-black uppercase tracking-[0.4em] text-slate-500 mb-6 block">The Timeline</span> */}
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-8 drop-shadow-2xl">The Anatomy of <br className="hidden sm:block"/>Transformation</h2>
            <p className="text-lg sm:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">It doesn't happen overnight. It happens day by day, choice by choice.</p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Master Vertical Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent -translate-x-1/2 z-0"></div>
            
            <TimelineMilestone 
              day="Day 1"
              title="The Decision."
              description="Motivation is high, but discipline is zero. You face the resistance of your old habits. The hardest part is simply starting."
              align="left"
              glowColor="cyan"
            />
            <TimelineMilestone 
              day="Day 14"
              title="The Resistance."
              description="The initial excitement fades. Your mind begs you to quit, to return to comfort. Pushing through this phase builds the foundation of your new character."
              align="right"
              glowColor="purple"
            />
            <TimelineMilestone 
              day="Day 45"
              title="The Shift."
              description="The routine begins to feel natural. You stop negotiating with yourself. Clarity improves, and the compounding effects become undeniable."
              align="left"
              glowColor="pink"
            />
            <TimelineMilestone 
              day="Day 90"
              title="The New Baseline."
              description="What used to be a challenge is now your standard. You have fundamentally rewired your identity. You are not trying to be disciplined; you ARE disciplined."
              align="right"
              glowColor="white"
            />
          </div>
        </div>
      </div>

      {/* Cinematic Domain Showcases */}
      <div id="domains-section" className="relative z-30 bg-[#020617] flex flex-col pb-0">
        <div className="text-center pt-32 pb-16 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">Choose Your Path</h2>
          <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">Six domains. Infinite possibilities. Where will your transformation begin?</p>
        </div>

        {DOMAINS.map((domain) => (
          <CinematicDomain key={domain.id} domain={domain} />
        ))}
      </div>

      {/* Cost of Staying the Same Section */}
      <div className="relative z-40 bg-black py-20 overflow-hidden">
        {/* Ambient atmospheric gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-black to-[#020617] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[100vw] h-[100vw] max-w-[1200px] bg-red-900/5 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[1000px] bg-cyan-900/5 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '15s' }}></div>

        <div className="relative max-w-7xl mx-auto">
          <ReflectiveText 
            text="What happens if nothing changes?"
            subtext="If today becomes your everyday. If the habits you tolerate become the life you are forced to live."
          />
          <ReflectiveText 
            text="1 year from now?"
            subtext="The same routines. The same excuses. The same energy. The pain of discipline weighs ounces, but the pain of regret weighs tons."
          />
          <ReflectiveText 
            text="5 years from now?"
            subtext="Time passes regardless of what you do with it. You are either actively building your ideal self, or passively accepting your default self."
          />
          <ReflectiveText 
            text="Your future is being built right now."
            subtext="Every choice is a brick. Start laying them intentionally."
            actionButton={
              <button 
                onClick={() => document.getElementById('domains-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-full overflow-hidden transition-all duration-500 transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:shadow-[0_0_60px_rgba(255,255,255,0.15)]"
              >
                <span className="relative z-10 text-sm sm:text-base font-black uppercase tracking-[0.3em] text-white flex items-center gap-4">
                  Make Your Choice
                  <span className="group-hover:-translate-y-2 transition-transform duration-500 text-xl">↑</span>
                </span>
              </button>
            }
          />
        </div>
      </div>

      {/* Choose Your Archetype Section 
      <div className="relative z-50 bg-[#020617] py-32 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-[#020617] to-[#020617] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-24">
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.4em] text-slate-500 mb-6 block">Identity Projection</span>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 drop-shadow-2xl">Choose Your Archetype</h2>
            <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">Who do you need to become to achieve your ultimate vision? Claim your identity.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            {ARCHETYPES.map((arch, i) => (
              <ArchetypeCard key={arch.id} archetype={arch} delayIdx={i} />
            ))}
          </div>
        </div>
      </div>
      */}

      {/* Progression Universe Section */}
      <div className="relative z-50 bg-[#020617] py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/30 via-[#020617] to-[#020617] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-24">
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.4em] text-slate-500 mb-6 block">The Long Game</span>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 drop-shadow-2xl">Progression Universe</h2>
            <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">Turn self-improvement into a visible long-term journey. Earn XP, rank up, and evolve.</p>
          </div>

          <div className="relative flex flex-col items-center max-w-5xl mx-auto">
            <div className="w-[2px] h-24 bg-gradient-to-b from-transparent to-slate-500/50 mb-0 -z-10"></div>
            {PROGRESSION_STAGES.map((stage, i) => (
              <ProgressionStage key={stage.id} stage={stage} index={i} isLast={i === PROGRESSION_STAGES.length - 1} />
            ))}
          </div>

          <div className="mt-24 sm:mt-32 text-center flex flex-col items-center">
            <p className="text-slate-500 font-medium mb-8 text-lg">The path is long. The reward is everything.</p>
            <button 
              onClick={() => document.getElementById('domains-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-full overflow-hidden transition-all duration-500 transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:shadow-[0_0_60px_rgba(255,255,255,0.15)]"
            >
              <span className="relative z-10 text-sm sm:text-base font-black uppercase tracking-[0.3em] text-white flex items-center gap-4">
                Begin Your Progression
                <span className="group-hover:-translate-y-2 transition-transform duration-500 text-xl">↑</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
