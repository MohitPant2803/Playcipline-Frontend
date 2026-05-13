import React from 'react';
import { Card, Badge } from './UI';
import { getLevelInfo } from '../utils/leveling';

const ALL_BADGES = ['7-day', '21-day', '75-hard', 'hard-mode', 'perfect-streak'];

function formatBadgeName(badge) {
  return String(badge || '').replace(/-/g, ' ');
}

export default function ProfileView({
  profile,
  stats,
  actions,
  isEditing = false,
  form,
  saving = false,
  onFormChange,
  onSaveProfile,
  onSocialClick,
  activities = [],
  showActivities = false,
  getActivityText,
  timeAgo
}) {
  const earnedBadges = profile?.badges || [];
  const unearnedBadges = ALL_BADGES.filter(badge => !earnedBadges.includes(badge));
  const followerCount = profile?.followerCount ?? profile?.followers ?? 0;
  const followingCount = profile?.followingCount ?? profile?.following ?? 0;
  const completedChallenges = stats?.allChallenges?.filter(challenge => challenge.status === 'completed') || [];
  const completedCount = stats?.completedChallenges ?? completedChallenges.length;
  const currentStreak = stats?.currentStreak ?? profile?.globalStreak ?? 0;
  const longestStreak = stats?.longestStreak ?? profile?.longestStreak ?? 0;
  const levelInfo = getLevelInfo(profile?.totalXP || 0);
  const levelProgress = levelInfo.xpRange > 0
    ? Math.min(100, Math.max(0, (levelInfo.xpIntoLevel / levelInfo.xpRange) * 100))
    : 100;

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile</h1>
        </div>

        <div className="bg-white border border-[#ECECEC] rounded-[24px] p-8 shadow-sm mb-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative flex w-28 shrink-0 justify-center pb-5">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-24 w-24 rounded-full object-cover border border-[#ECECEC]"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-3xl font-bold text-gray-600">
                      {(profile?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div
                    className="group absolute bottom-0 left-1/2 w-24 -translate-x-1/2 rounded-full border border-[#ECECEC] bg-white px-2 py-1 shadow-sm"
                    aria-label={`${levelInfo.totalXP}/${levelInfo.nextLevelXp} XP to next level`}
                  >
                    <div className="mb-0.5 text-center text-[10px] font-semibold text-gray-900">
                      Level {levelInfo.level}
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-[#6366F1]"
                        style={{ width: `${levelProgress}%` }}
                      />
                    </div>
                    <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition group-hover:opacity-100">
                      {levelInfo.totalXP}/{levelInfo.nextLevelXp} XP
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1 text-gray-900">{profile?.name}</h1>
                  <p className="text-sm text-gray-500">{profile?.location || 'Location not added'}</p>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-600 line-clamp-3 break-words">
                    {profile?.bio || 'No bio added yet.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-5 text-sm">
                    <button
                      type="button"
                      onClick={() => onSocialClick?.('followers')}
                      className="text-left text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      <span className="block text-xl text-gray-900 mb-1 tabular-nums font-semibold">{followerCount}</span>
                      followers
                    </button>
                    <button
                      type="button"
                      onClick={() => onSocialClick?.('following')}
                      className="text-left text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      <span className="block text-xl text-gray-900 mb-1 tabular-nums font-semibold">{followingCount}</span>
                      following
                    </button>
                  </div>
                </div>
              </div>

              {actions && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {actions}
                </div>
              )}

              {isEditing && form && (
                <form onSubmit={onSaveProfile} className="mt-6 grid gap-4">
                  <label className="grid gap-2 text-xs font-medium text-gray-700">
                    Username
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) => onFormChange?.({ ...form, name: event.target.value })}
                      placeholder={profile?.name || 'Your name'}
                      className="rounded-xl bg-gray-50 border border-[#ECECEC] text-gray-900 placeholder-gray-400 px-4 py-3 font-normal outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                    />
                  </label>
                  <label className="grid gap-2 text-xs font-medium text-gray-700">
                    Profile picture URL
                    <input
                      type="url"
                      value={form.avatar}
                      onChange={(event) => onFormChange?.({ ...form, avatar: event.target.value })}
                      placeholder={profile?.avatar || 'Google picture will be used if empty'}
                      className="rounded-xl bg-gray-50 border border-[#ECECEC] text-gray-900 placeholder-gray-400 px-4 py-3 font-normal outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                    />
                  </label>
                  <label className="grid gap-2 text-xs font-medium text-gray-700">
                    Where are you from?
                    <input
                      type="text"
                      value={form.location}
                      onChange={(event) => onFormChange?.({ ...form, location: event.target.value })}
                      placeholder="City, Country"
                      className="rounded-xl bg-gray-50 border border-[#ECECEC] text-gray-900 placeholder-gray-400 px-4 py-3 font-normal outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                    />
                  </label>
                  <label className="grid gap-2 text-xs font-medium text-gray-700">
                    Bio
                    <textarea
                      value={form.bio}
                      onChange={(event) => onFormChange?.({ ...form, bio: event.target.value.slice(0, 100) })}
                      placeholder="A short note about your habits, goals, or progress (max 100 characters)"
                      maxLength={100}
                      rows={3}
                      className="resize-none rounded-xl bg-gray-50 border border-[#ECECEC] text-gray-900 placeholder-gray-400 px-4 py-3 font-normal outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-fit rounded-xl bg-[#6366F1] text-white px-6 py-2 text-sm font-medium transition hover:bg-indigo-700 disabled:opacity-50 mt-2 shadow-sm"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-gray-50 rounded-2xl p-5">
                <p className="text-gray-500 text-xs font-medium">Badges Earned</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{earnedBadges.length}</p>
              </div>
              <div className="text-center bg-gray-50 rounded-2xl p-5">
                <p className="text-gray-500 text-xs font-medium">Completed Challenges</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{completedCount}</p>
              </div>
              <div className="text-center bg-gray-50 rounded-2xl p-5">
                <p className="text-gray-500 text-xs font-medium">Current Streak</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{currentStreak}</p>
              </div>
              <div className="text-center bg-gray-50 rounded-2xl p-5">
                <p className="text-gray-500 text-xs font-medium">Longest Streak</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{longestStreak}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {earnedBadges.map(badge => (
              <div key={badge} className="text-center bg-white border border-[#ECECEC] rounded-[20px] p-6 shadow-sm">
                <p className="text-3xl mb-2">Trophy</p>
                <p className="font-medium text-gray-900 text-sm capitalize">{formatBadgeName(badge)}</p>
              </div>
            ))}
            {unearnedBadges.map(badge => (
              <div key={badge} className="text-center bg-gray-50 border border-[#ECECEC] rounded-[20px] p-6 opacity-50">
                <p className="text-3xl mb-2 grayscale">Trophy</p>
                <p className="font-medium text-gray-500 text-sm capitalize">{formatBadgeName(badge)}</p>
              </div>
            ))}
          </div>
        </div>

        {showActivities && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Recent Activity</h2>
            {activities.length === 0 ? (
              <div className="text-center py-8 bg-white border border-[#ECECEC] rounded-[24px]">
                <p className="text-gray-500 text-sm">No actions recorded.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map(activity => (
                  <div key={activity._id} className="bg-white border border-[#ECECEC] rounded-[20px] p-5 shadow-sm">
                    <p className="font-medium text-gray-800 text-sm">{getActivityText?.(activity) || 'Action logged'}</p>
                    <p className="mt-1 text-xs text-gray-500">{timeAgo?.(activity.createdAt) || ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {stats?.allChallenges && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Completed Challenges</h2>
            <div className="space-y-3">
              {completedChallenges.map(challenge => (
                <div key={challenge._id} className="bg-white border border-[#ECECEC] rounded-[20px] p-5 shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{challenge.challengeId?.title}</h3>
                      <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-50 text-gray-600">
                        {challenge.mode} Mode
                      </span>
                      <p className="mt-3 text-xs text-gray-500">
                        Executed {challenge.completedDays || 0} times
                      </p>
                    </div>
                    <p className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                      {challenge.challengeId?.duration} days
                    </p>
                  </div>
                </div>
              ))}
              {completedChallenges.length === 0 && (
                <div className="text-center py-8 bg-white border border-[#ECECEC] rounded-[24px]">
                  <p className="text-gray-500 text-sm">No completed challenges found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
