import React from 'react';

export function Badge({ text, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700'
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colors[color] || colors.blue}`}>
      {text}
    </span>
  );
}

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, disabled = false, variant = 'primary', size = 'md', className = '' }) {
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-400'
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg font-medium transition ${variants[variant]} ${sizes[size]} disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ current, total, percentage = false }) {
  const percent = percentage ? current : (current / total * 100);
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="bg-green-500 h-full transition-all duration-300"
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
}
