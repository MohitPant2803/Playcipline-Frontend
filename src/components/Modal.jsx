import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-fast" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-800/80 shadow-2xl backdrop-blur-xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-white tracking-wide">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl transition-colors">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
