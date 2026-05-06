import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { user, loading, error } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Habit challenge platform</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-950">Streakify</h1>
          </div>

          <div className="flex flex-row flex-wrap gap-3 sm:items-center">
            <a
              href="/api/auth/google"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Login / Sign up
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <section className="mb-8">
          <p className="max-w-3xl text-lg text-slate-600">
            Build steady habits through daily challenges, visible progress, and friendly competition.
          </p>
          {error && (
            <p className="mt-4 max-w-3xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className={`rounded-lg border-l-4 ${card.accent} border-y border-r border-slate-200 bg-white p-5 shadow-sm`}
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{card.title}</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-950">{card.value}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
