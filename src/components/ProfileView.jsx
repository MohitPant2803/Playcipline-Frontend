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
    <div className="pb-20 sm:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-950">Profile</h1>
        </div>

        <Card className="mb-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative flex w-28 shrink-0 justify-center pb-5">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">
                      {(profile?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div
                    className="group absolute bottom-0 left-1/2 w-24 -translate-x-1/2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-md"
                    aria-label={`${levelInfo.totalXP}/${levelInfo.nextLevelXp} XP to next level`}
                  >
                    <div className="mb-0.5 text-center text-[10px] font-bold leading-none text-slate-900">
                      Level {levelInfo.level}
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${levelProgress}%` }}
                      />
                    </div>
                    <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                      {levelInfo.totalXP}/{levelInfo.nextLevelXp} XP
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{profile?.name}</h1>
                  {/* <p className="text-gray-600">{profile?.email}</p> */}
                  <p className="mt-2 text-gray-700">{profile?.location || 'Location not added'}</p>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-gray-700 line-clamp-3 break-words">
                    {profile?.bio || 'No bio added yet.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-5 text-sm">
                    <button
                      type="button"
                      onClick={() => onSocialClick?.('followers')}
                      className="text-left font-semibold text-gray-900 hover:text-blue-600"
                    >
                      <span className="block text-xl">{followerCount}</span>
                      followers
                    </button>
                    <button
                      type="button"
                      onClick={() => onSocialClick?.('following')}
                      className="text-left font-semibold text-gray-900 hover:text-blue-600"
                    >
                      <span className="block text-xl">{followingCount}</span>
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
                  <label className="grid gap-2 text-sm font-semibold text-gray-700">
                    Username
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) => onFormChange?.({ ...form, name: event.target.value })}
                      placeholder={profile?.name || 'Your name'}
                      className="rounded-lg border border-gray-300 px-4 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-gray-700">
                    Profile picture URL
                    <input
                      type="url"
                      value={form.avatar}
                      onChange={(event) => onFormChange?.({ ...form, avatar: event.target.value })}
                      placeholder={profile?.avatar || 'Google picture will be used if empty'}
                      className="rounded-lg border border-gray-300 px-4 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-gray-700">
                    Where are you from?
                    <input
                      type="text"
                      value={form.location}
                      onChange={(event) => onFormChange?.({ ...form, location: event.target.value })}
                      placeholder="City, Country"
                      className="rounded-lg border border-gray-300 px-4 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-gray-700">
                    Bio
                    <textarea
                      value={form.bio}
                      onChange={(event) => onFormChange?.({ ...form, bio: event.target.value.slice(0, 100) })}
                      placeholder="A short note about your habits, goals, or progress (max 100 characters)"
                      maxLength={100}
                      rows={3}
                      className="resize-none rounded-lg border border-gray-300 px-4 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-fit rounded-lg bg-green-600 px-5 py-2 font-semibold text-white transition hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {saving ? 'Saving...' : 'Save profile'}
                  </button>
                </form>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center shadow-none border border-gray-100">
                <p className="text-gray-600 text-sm">Badges Won</p>
                <p className="text-3xl font-bold text-yellow-600">{earnedBadges.length}</p>
              </Card>
              <Card className="text-center shadow-none border border-gray-100">
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              </Card>
              <Card className="text-center shadow-none border border-gray-100">
                <p className="text-gray-600 text-sm">Current Streak</p>
                <p className="text-3xl font-bold text-orange-600">{currentStreak}</p>
              </Card>
              <Card className="text-center shadow-none border border-gray-100">
                <p className="text-gray-600 text-sm">Longest Streak</p>
                <p className="text-3xl font-bold text-purple-600">{longestStreak}</p>
              </Card>
            </div>
          </div>
        </Card>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {earnedBadges.map(badge => (
              <Card key={badge} className="text-center bg-yellow-50 border-2 border-yellow-300">
                <p className="text-3xl mb-2">Trophy</p>
                <p className="font-bold text-yellow-700 capitalize">{formatBadgeName(badge)}</p>
              </Card>
            ))}
            {unearnedBadges.map(badge => (
              <Card key={badge} className="text-center opacity-50">
                <p className="text-3xl mb-2 grayscale">Trophy</p>
                <p className="font-bold text-gray-500 capitalize">{formatBadgeName(badge)}</p>
              </Card>
            ))}
          </div>
        </div>

        {showActivities && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Recent Activities</h2>
            {activities.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-gray-600">No activities yet.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {activities.map(activity => (
                  <Card key={activity._id} className="border-l-4 border-blue-500 shadow-sm">
                    <p className="font-semibold text-gray-800">{getActivityText?.(activity) || 'did something awesome'}</p>
                    <p className="mt-1 text-sm text-gray-600">{timeAgo?.(activity.createdAt) || ''}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {stats?.allChallenges && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Completed Challenges</h2>
            <div className="space-y-3">
              {completedChallenges.map(challenge => (
                <Card key={challenge._id}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold">{challenge.challengeId?.title}</h3>
                      <Badge text={challenge.mode} />
                      <p className="mt-2 text-sm text-gray-600">
                        Completed {challenge.completedDays || 0} times
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {challenge.challengeId?.duration} days
                    </p>
                  </div>
                </Card>
              ))}
              {completedChallenges.length === 0 && (
                <Card className="text-center py-8">
                  <p className="text-gray-600">No completed challenges yet.</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
