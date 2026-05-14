import React from 'react';
import { getAvatarUrl } from '../../lib/getAvatarUrl';

export default function UserAvatar({ user, className = '', size = 'md' }) {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8 sm:w-10 sm:h-10',
    md: 'w-10 h-10 sm:w-12 sm:h-12',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-24 h-24 sm:w-32 sm:h-32',
    custom: '' // Use this if passing strictly through className
  };

  const sizeClass = sizes[size] || sizes.md;
  let avatarSrc = null;

  // Safe decoding process ensuring backwards compatibility and future-proof JSON logic
  if (user?.avatar) {
    if (typeof user.avatar === 'string') {
      if (user.avatar.startsWith('{')) {
        try {
          const parsed = JSON.parse(user.avatar);
          if (parsed.style && parsed.seed) avatarSrc = getAvatarUrl(parsed.style, parsed.seed);
        } catch (e) {}
      } else {
        avatarSrc = user.avatar; // Legacy direct URL string
      }
    } else if (typeof user.avatar === 'object') {
      if (user.avatar.style && user.avatar.seed) {
        avatarSrc = getAvatarUrl(user.avatar.style, user.avatar.seed);
      }
    }
  }

  if (avatarSrc) {
    return (
      <img
        src={avatarSrc}
        alt={user?.name || 'User Avatar'}
        className={`rounded-full object-cover shrink-0 ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/50 to-cyan-500/50 text-white font-black ${sizeClass} ${className}`}>
      <span className={size === 'xl' ? 'text-4xl' : size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-xs' : 'text-sm'}>
        {(user?.name || 'U').charAt(0).toUpperCase()}
      </span>
    </div>
  );
}