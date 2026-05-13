import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/client';

export default function Login() {
  const { user, loading, error } = useAuth();
  const navigate = useNavigate();

  const oauthUrl = `${API_BASE_URL}/api/auth/google`;

  const featureCards = [
    {
      title: 'Dashboard',
      value: 'Daily focus',
      description: 'Track active challenges, streak progress, check-ins, XP, and level growth from one place.',
      accent: 'border-blue-500'
    },
    {
      title: 'Leaderboard',
      value: 'Weekly rank',
      description: 'Compare progress with other members and keep your momentum visible every week.',
      accent: 'border-emerald-500'
    },
    {
      title: 'Completed',
      value: 'Proof of consistency',
      description: 'Turn finished challenges into a personal record of the habits you actually built.',
      accent: 'border-amber-500'
    }
  ];

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

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-gray-900 font-sans relative overflow-hidden">
      
      <header className="border-b border-[#ECECEC] bg-white/80 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Habit tracking, refined.</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">Playcipline</h1>
          </div>

          <div className="flex flex-row flex-wrap gap-3 sm:items-center">
            <a
              href={`${API_BASE_URL}/api/auth/google`}
              className="inline-flex items-center justify-center rounded-xl bg-[#6366F1] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
        <section className="mb-16">
          <p className="max-w-3xl text-2xl sm:text-3xl font-medium text-gray-800 leading-snug border-l-4 border-[#6366F1] pl-6">
            Build better habits with consistency. <br className="hidden sm:block"/> Track progress, stay accountable, and grow daily.
          </p>
          {error && (
            <p className="mt-6 max-w-3xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[24px] border border-[#ECECEC] bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-xs font-medium text-[#6366F1]">{card.title}</p>
              <h2 className="mt-3 text-xl font-semibold text-gray-900">{card.value}</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">{card.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
