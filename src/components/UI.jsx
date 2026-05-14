import React from 'react';

export function Badge({ text, color = 'blue' }) {
  const colors = {
    blue: 'bg-indigo-50 text-[#6366F1] border border-indigo-100',
    green: 'bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7]',
    yellow: 'bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]',
    red: 'bg-[#FFF1F2] text-[#BE123C] border border-[#FFE4E6]',
    gray: 'bg-gray-50 text-gray-600 border border-gray-200'
  };

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${colors[color] || colors.blue}`}>
      {text}
    </span>
  );
}

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white rounded-[24px] border border-[#ECECEC] shadow-sm p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, disabled = false, variant = 'primary', size = 'md', className = '' }) {
  const variants = {
    primary: 'bg-[#6366F1] text-white hover:bg-[#4F46E5] disabled:opacity-50 shadow-sm border border-transparent',
    secondary: 'bg-white border border-[#ECECEC] text-gray-700 hover:bg-gray-50 disabled:opacity-50',
    danger: 'bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-50 disabled:opacity-50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-medium transition-colors duration-200 ${variants[variant]} ${sizes[size]} disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ current, total, percentage = false, color = 'purple' }) {
  const percent = percentage ? current : (current / total * 100);
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full bg-[#6366F1] transition-all duration-500 ease-out`}
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
}
