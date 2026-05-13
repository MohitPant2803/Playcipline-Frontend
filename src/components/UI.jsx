import React from 'react';

export function Badge({ text, color = 'blue' }) {
  const colors = {
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg',
    green: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg',
    yellow: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg',
    red: 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg',
    purple: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg',
    gold: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg'
  };

  return (
    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${colors[color] || colors.blue}`}>
      {text}
    </span>
  );
}

export function Card({ children, className = '', gradient = false, ...props }) {
  const bgClass = gradient 
    ? 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700' 
    : 'bg-white';
  return (
    <div className={`${bgClass} rounded-2xl shadow-xl p-6 backdrop-blur-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, disabled = false, variant = 'primary', size = 'md', className = '' }) {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 disabled:opacity-50 shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 shadow-lg hover:shadow-xl',
    danger: 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 disabled:opacity-50 shadow-lg hover:shadow-xl',
    ghost: 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-slate-900 disabled:opacity-50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 ${variants[variant]} ${sizes[size]} disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ current, total, percentage = false, color = 'purple' }) {
  const percent = percentage ? current : (current / total * 100);
  const colorMap = {
    purple: 'from-purple-600 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    gold: 'from-yellow-400 to-orange-500'
  };
  return (
    <div className="w-full bg-gradient-to-r from-slate-200 to-slate-300 rounded-full h-3 overflow-hidden shadow-inner">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${colorMap[color] || colorMap.purple} transition-all duration-500 ease-out shadow-lg`}
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
}
