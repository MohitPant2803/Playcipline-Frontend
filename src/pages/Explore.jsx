import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { challengeAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { Card, Badge, Button } from '../components/UI';

export default function Explore() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [toast, setToast] = useState(null);
  const [joining, setJoining] = useState(false);
  const [challengeSearch, setChallengeSearch] = useState('');

  // Fallback sample challenges when API returns empty or fails
  const sampleChallenges = [
    {
      _id: 'sample1',
      title: 'Morning Meditation',
      description: 'Build a consistent meditation habit by practicing mindfulness every morning for 21 days.',
      duration: 21,
      baseDifficulty: 2,
      category: 'Wellness'
    },
    {
      _id: 'sample2',
      title: 'Daily Exercise',
      description: 'Commit to 30 minutes of physical activity every day. Choose any exercise you enjoy.',
      duration: 30,
      baseDifficulty: 3,
      category: 'Fitness'
    },
    {
      _id: 'sample3',
      title: 'Read More Books',
      description: 'Read at least 20 pages of a book every day to expand your knowledge and imagination.',
      duration: 14,
      baseDifficulty: 1,
      category: 'Learning'
    }
  ];

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await challengeAPI.getAll();
        // Use API data if available, otherwise use sample challenges
        const challengesData = res.data && res.data.length > 0 ? res.data : sampleChallenges;
        setChallenges(challengesData);
      } catch (err) {
        console.warn('Failed to load challenges from API, using sample data:', err.message);
        setChallenges(sampleChallenges);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await challengeAPI.join(selectedChallenge._id, selectedMode);
      setToast({ message: 'Challenge joined! Head to Dashboard.', type: 'success' });
      setSelectedChallenge(null);
      setSelectedMode(null);
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to join', type: 'error' });
    } finally {
      setJoining(false);
    }
  };

  const getDifficultyStars = (difficulty) => {
    return '⭐'.repeat(difficulty);
  };

  const getModes = (duration) => [
    {
      name: 'Easy',
      value: 'easy',
      desc: `${Math.floor(duration * 0.8)} days (80% of ${duration})`,
      xp: 10
    },
    {
      name: 'Medium',
      value: 'medium',
      desc: `${duration} days (full commitment)`,
      xp: 20
    },
    {
      name: 'Hard',
      value: 'hard',
      desc: `${duration} days (no missed days allowed)`,
      xp: 30
    }
  ];

  const filteredChallenges = challenges.filter(challenge => {
    const query = challengeSearch.trim().toLowerCase();

    if (!query) return true;

    return (
      challenge.title.toLowerCase().includes(query) ||
      challenge.description.toLowerCase().includes(query)
    );
  });

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="pb-20 sm:pb-0">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Explore Challenges</h1>
          <div className="w-full sm:max-w-md">
            <input
              type="search"
              value={challengeSearch}
              onChange={(event) => setChallengeSearch(event.target.value)}
              placeholder="Search challenges..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.length === 0 ? (
            <Card className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">
                {challengeSearch.trim()
                  ? 'No challenges match your search.'
                  : 'No challenges available at the moment.'}
              </p>
            </Card>
          ) : filteredChallenges.map(challenge => (
            <Card key={challenge._id} className="flex flex-col">
              <div className="flex-grow">
                <h3 className="text-lg font-bold mb-2">{challenge.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
                <div className="flex gap-2 mb-4">
                  <Badge text={`${challenge.duration} days`} />
                  <Badge text={getDifficultyStars(challenge.baseDifficulty)} color="yellow" />
                </div>
              </div>
              <Button
                onClick={() => setSelectedChallenge(challenge)}
                variant="primary"
                size="md"
                className="w-full"
              >
                Join Challenge
              </Button>
            </Card>
          ))}
        </div>

        {selectedChallenge && (
          <Modal
            isOpen={!!selectedChallenge}
            onClose={() => setSelectedChallenge(null)}
            title={`Choose Difficulty: ${selectedChallenge.title}`}
          >
            <div className="space-y-3">
              {getModes(selectedChallenge.duration).map(mode => (
                <div
                  key={mode.value}
                  onClick={() => user && setSelectedMode(mode.value)}
                  className={`p-4 border-2 rounded-lg transition ${
                    user ? 'cursor-pointer' : 'cursor-not-allowed'
                  } ${
                    selectedMode === mode.value
                      ? 'border-blue-500 bg-blue-50'
                      : user
                      ? 'border-gray-200 hover:border-gray-400'
                      : 'border-gray-200 opacity-60'
                  }`}
                >
                  <p className="font-bold">{mode.name}</p>
                  <p className="text-sm text-gray-600">{mode.desc}</p>
                  <p className="text-sm text-blue-600 font-medium">+{mode.xp} XP per check-in</p>
                </div>
              ))}
            </div>
            
            {!user && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">👤 Login to select difficulty and join this challenge</p>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <Button
                onClick={() => setSelectedChallenge(null)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              {user ? (
                <Button
                  onClick={handleJoin}
                  disabled={!selectedMode || joining}
                  className="flex-1"
                >
                  {joining ? 'Joining...' : 'Join Challenge'}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setSelectedChallenge(null);
                    navigate('/');
                  }}
                  variant="primary"
                  className="flex-1"
                >
                  Login to Join
                </Button>
              )}
            </div>
          </Modal>
        )}

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}
