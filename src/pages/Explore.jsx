import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { challengeAPI, API_BASE_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { Card, Badge, Button } from '../components/UI';

const DOMAINS = [
  { id: 'body', title: 'Body', subtitle: 'Strength', icon: '💪', color: 'bg-gray-100 text-gray-700', tagline: 'Forge your physical vessel.', category: 'Fitness' },
  { id: 'mind', title: 'Mind', subtitle: 'Discipline', icon: '🧠', color: 'bg-gray-100 text-gray-700', tagline: 'Master your inner world.', category: 'Mind' },
  { id: 'work', title: 'Work', subtitle: 'Mastery', icon: '⚡', color: 'bg-gray-100 text-gray-700', tagline: 'Dominate your craft.', category: 'Work' },
  { id: 'social', title: 'Social', subtitle: 'Connection', icon: '🤝', color: 'bg-gray-100 text-gray-700', tagline: 'Build your tribe.', category: 'Social' },
  { id: 'lifestyle', title: 'Lifestyle', subtitle: 'Control', icon: '🎯', color: 'bg-gray-100 text-gray-700', tagline: 'Design your environment.', category: 'Lifestyle' },
  { id: 'purpose', title: 'Purpose', subtitle: 'Meaning', icon: '👁️', color: 'bg-gray-100 text-gray-700', tagline: 'Align with your destiny.', category: 'Purpose' },
];

const sampleChallenges = [
  // BODY -> Fitness
  {
    _id: '100000000000000000000001',
    title: '75 Hard Challenge',
    description: 'Two workouts, a gallon of water, 10 pages of reading, no cheat meals, progress pic daily. No compromises.',
    duration: 75,
    baseDifficulty: 3,
    category: 'Fitness',
    tags: ['Hardcore', 'Trending']
  },
  {
    _id: '100000000000000000000002',
    title: '30-Day Push-Up Progression',
    description: 'Build upper body strength by following a progressive push-up plan for 30 days.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Fitness',
    tags: ['Strength']
  },
  {
    _id: '100000000000000000000003',
    title: 'Cold Shower 21-Day Challenge',
    description: 'Build mental resilience and boost your energy by taking a cold shower every day for 21 days.',
    duration: 21,
    baseDifficulty: 2,
    category: 'Fitness',
    tags: ['Discipline', 'Reset']
  },
  {
    _id: '100000000000000000000004',
    title: '10,000 Steps Daily',
    description: 'Improve your overall health and activity levels by walking at least 10,000 steps every day.',
    duration: 30,
    baseDifficulty: 1,
    category: 'Fitness',
    tags: ['Activity', 'Beginner']
  },
  {
    _id: '100000000000000000000005',
    title: 'No Junk Food 30 Days',
    description: 'Reset your diet and break bad habits by eliminating all junk food for 30 days.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Fitness',
    tags: ['Nutrition', 'Reset']
  },
  {
    _id: '100000000000000000000006',
    title: 'Sleep Optimization Protocol',
    description: 'Improve your sleep quality and energy levels by following a strict sleep hygiene protocol for 21 days.',
    duration: 21,
    baseDifficulty: 2,
    category: 'Fitness',
    tags: ['Recovery', 'Health']
  },
  {
    _id: '100000000000000000000007',
    title: 'Morning Workout Streak',
    description: 'Start your day strong by completing a workout every morning for 30 days straight.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Fitness',
    tags: ['Habit', 'Fitness']
  },
  {
    _id: '100000000000000000000008',
    title: 'Winter Arc (Bulk & Build)',
    description: 'Use the winter season to build serious muscle and strength. A 90-day plan for bulking and building.',
    duration: 90,
    baseDifficulty: 3,
    category: 'Fitness',
    tags: ['Seasonal', 'Body']
  },
  {
    _id: '100000000000000000000009',
    title: 'Summer Shred Challenge',
    description: 'Get lean and defined for the summer. A 90-day challenge focused on fat loss and conditioning.',
    duration: 90,
    baseDifficulty: 3,
    category: 'Fitness',
    tags: ['Seasonal', 'Body']
  },
  {
    _id: '100000000000000000000010',
    title: 'Hydration Reset (3L/day)',
    description: 'Boost your energy and health by ensuring you drink at least 3 liters of water every day.',
    duration: 14,
    baseDifficulty: 1,
    category: 'Fitness',
    tags: ['Health', 'Beginner']
  },
  {
    _id: '100000000000000000000011',
    title: 'Intermittent Fasting Sprint',
    description: 'Experiment with intermittent fasting to improve metabolic health and discipline. 14-day sprint.',
    duration: 14,
    baseDifficulty: 2,
    category: 'Fitness',
    tags: ['Nutrition', 'Intermediate']
  },
  {
    _id: '100000000000000000000012',
    title: '6-Week Body Recomposition',
    description: 'A 6-week intensive program to simultaneously build muscle and lose fat.',
    duration: 42,
    baseDifficulty: 3,
    category: 'Fitness',
    tags: ['Transformation', 'Hardcore']
  },

  // MIND -> Mind
  {
    _id: '100000000000000000000013',
    title: 'Dopamine Detox',
    description: 'Starve your brain of cheap pleasure. No scrolling, junk food, or mindless entertainment. Reset your receptors.',
    duration: 7,
    baseDifficulty: 2,
    category: 'Mind',
    tags: ['Reset', 'Discipline']
  },
  {
    _id: '100000000000000000000014',
    title: 'No Social Media 30-Day Challenge',
    description: 'Delete the apps. Reclaim your attention span and reconnect with the real world around you.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Mind',
    tags: ['Digital Minimalism']
  },
  {
    _id: '100000000000000000000015',
    title: '30-Day Meditation Streak',
    description: 'Cultivate inner peace and focus by meditating every day for 30 days.',
    duration: 30,
    baseDifficulty: 1,
    category: 'Mind',
    tags: ['Habit', 'Mindfulness']
  },
  {
    _id: '100000000000000000000016',
    title: 'Journaling Every Day for 21 Days',
    description: 'Gain mental clarity and self-awareness by journaling your thoughts every day for 21 days.',
    duration: 21,
    baseDifficulty: 1,
    category: 'Mind',
    tags: ['Clarity', 'Habit']
  },
  {
    _id: '100000000000000000000017',
    title: 'Digital Minimalism Challenge',
    description: 'Radically reduce your digital consumption and reclaim your time and attention.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Mind',
    tags: ['Focus', 'Lifestyle']
  },
  {
    _id: '100000000000000000000018',
    title: 'Read 1 Book Per Week',
    description: 'Expand your mind by committing to reading one full book every week for a month.',
    duration: 28,
    baseDifficulty: 2,
    category: 'Mind',
    tags: ['Learning', 'Knowledge']
  },
  {
    _id: '100000000000000000000019',
    title: 'Focus Blocks (90-min deep sessions)',
    description: 'Train your focus by completing one uninterrupted 90-minute deep work session daily.',
    duration: 14,
    baseDifficulty: 2,
    category: 'Mind',
    tags: ['Productivity', 'Deep Work']
  },
  {
    _id: '100000000000000000000020',
    title: 'No Negativity 30 Days',
    description: 'Rewire your brain for positivity by consciously avoiding all forms of negative self-talk and complaining.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Mind',
    tags: ['Mindset', 'Positive Psychology']
  },
  {
    _id: '100000000000000000000021',
    title: 'Gratitude Practice 21 Days',
    description: 'Improve your well-being by writing down three things you are grateful for each day.',
    duration: 21,
    baseDifficulty: 1,
    category: 'Mind',
    tags: ['Mindset', 'Beginner']
  },
  {
    _id: '100000000000000000000022',
    title: 'Stoicism 30-Day Practice',
    description: 'Apply stoic principles to your daily life to build emotional resilience and wisdom.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Mind',
    tags: ['Philosophy', 'Resilience']
  },
  {
    _id: '100000000000000000000023',
    title: 'Brain Dump + Mental Clarity Reset',
    description: 'A 7-day challenge to clear your mind by externalizing all your thoughts, tasks, and worries.',
    duration: 7,
    baseDifficulty: 1,
    category: 'Mind',
    tags: ['Clarity', 'Reset']
  },
  {
    _id: '100000000000000000000024',
    title: '7-Day Silence Challenge',
    description: 'Experience profound inner quiet and self-reflection by committing to a week of silence.',
    duration: 7,
    baseDifficulty: 3,
    category: 'Mind',
    tags: ['Hardcore', 'Mindfulness']
  },

  // WORK -> Work
  {
    _id: '100000000000000000000025',
    title: 'Deep Work Sprint',
    description: 'Achieve massive output by dedicating 4 hours to uninterrupted deep work every day for 30 days.',
    duration: 30,
    baseDifficulty: 3,
    category: 'Work',
    tags: ['Productivity', 'Hardcore']
  },
  {
    _id: '100000000000000000000026',
    title: 'Learn One Skill in 30 Days',
    description: 'Dedicate focused effort to acquiring a new valuable skill in just 30 days.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Work',
    tags: ['Skill', 'Growth']
  },
  {
    _id: '100000000000000000000027',
    title: 'Ship One Project in 30 Days',
    description: 'Go from idea to launch. Build and ship a personal or professional project in 30 days.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Work',
    tags: ['Execution', 'Project']
  },
  {
    _id: '100000000000000000000028',
    title: 'No Procrastination Week',
    description: 'Break the cycle of procrastination by tackling tasks immediately for one full week.',
    duration: 7,
    baseDifficulty: 2,
    category: 'Work',
    tags: ['Productivity', 'Reset']
  },
  {
    _id: '100000000000000000000029',
    title: 'Inbox Zero Challenge',
    description: 'Reclaim control over your email by achieving and maintaining an empty inbox for 7 days.',
    duration: 7,
    baseDifficulty: 1,
    category: 'Work',
    tags: ['Organization', 'Productivity']
  },
  {
    _id: '100000000000000000000030',
    title: '90-Day Career Leveling Plan',
    description: 'Execute a 90-day strategic plan to significantly advance your career and skills.',
    duration: 90,
    baseDifficulty: 3,
    category: 'Work',
    tags: ['Career', 'Growth']
  },
  {
    _id: '100000000000000000000031',
    title: 'Wake Up at 5 AM for 21 Days',
    description: 'Build an iron will and gain extra productive hours by waking up at 5 AM every day.',
    duration: 21,
    baseDifficulty: 2,
    category: 'Work',
    tags: ['Discipline', 'Habit']
  },
  {
    _id: '100000000000000000000032',
    title: 'Time Audit Week',
    description: 'Track every minute of your time for a week to understand where it goes and how to optimize it.',
    duration: 7,
    baseDifficulty: 1,
    category: 'Work',
    tags: ['Productivity', 'Clarity']
  },
  {
    _id: '100000000000000000000033',
    title: 'No Meetings Week (async only)',
    description: 'Experience a full week of deep work by replacing all meetings with asynchronous communication.',
    duration: 7,
    baseDifficulty: 2,
    category: 'Work',
    tags: ['Productivity', 'Focus']
  },
  {
    _id: '100000000000000000000034',
    title: 'Build in Public 30-Day Challenge',
    description: 'Share your progress, wins, and losses publicly as you build a project for 30 days.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Work',
    tags: ['Accountability', 'Project']
  },
  {
    _id: '100000000000000000000035',
    title: 'Side Project Launch Challenge',
    description: 'Take a side project from concept to launch in 30 days. No excuses.',
    duration: 30,
    baseDifficulty: 3,
    category: 'Work',
    tags: ['Execution', 'Entrepreneurship']
  },
  {
    _id: '100000000000000000000036',
    title: '100-Day Consistency Sprint',
    description: 'Prove your commitment by showing up and doing the work on one key goal for 100 days straight.',
    duration: 100,
    baseDifficulty: 3,
    category: 'Work',
    tags: ['Discipline', 'Hardcore']
  },

  // SOCIAL -> Social
  {
    _id: '100000000000000000000037',
    title: 'Reach Out to 1 Person Daily',
    description: 'Strengthen your network and relationships by intentionally reaching out to one person every day.',
    duration: 30,
    baseDifficulty: 1,
    category: 'Social',
    tags: ['Networking', 'Connection']
  },
  {
    _id: '100000000000000000000038',
    title: 'No Phone During Meals (30 Days)',
    description: 'Be more present with your food and companions by putting your phone away during all meals.',
    duration: 30,
    baseDifficulty: 1,
    category: 'Social',
    tags: ['Presence', 'Habit']
  },
  {
    _id: '100000000000000000000039',
    title: 'Compliment Someone Every Day',
    description: 'Brighten someone\'s day and build positive social habits by giving a genuine compliment daily.',
    duration: 21,
    baseDifficulty: 1,
    category: 'Social',
    tags: ['Positivity', 'Connection']
  },
  {
    _id: '100000000000000000000040',
    title: 'Reconnect with 5 Old Friends',
    description: 'Rekindle old friendships by reaching out to 5 people you\'ve lost touch with over 14 days.',
    duration: 14,
    baseDifficulty: 1,
    category: 'Social',
    tags: ['Relationships', 'Connection']
  },
  {
    _id: '100000000000000000000041',
    title: 'Say No 30-Day Boundary Challenge',
    description: 'Learn to protect your time and energy by practicing saying \'no\' to non-essential requests.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Social',
    tags: ['Boundaries', 'Self-respect']
  },
  {
    _id: '100000000000000000000042',
    title: 'Public Speaking Practice (weekly)',
    description: 'Overcome your fear of public speaking by practicing once a week for a month.',
    duration: 28,
    baseDifficulty: 2,
    category: 'Social',
    tags: ['Confidence', 'Skill']
  },
  {
    _id: '100000000000000000000043',
    title: 'Weekly Date/Quality Time Commitment',
    description: 'Nurture your primary relationship by committing to one dedicated block of quality time each week.',
    duration: 28,
    baseDifficulty: 1,
    category: 'Social',
    tags: ['Relationships', 'Connection']
  },
  {
    _id: '100000000000000000000044',
    title: 'Network: Message 1 New Person Daily',
    description: 'Expand your professional circle by sending a thoughtful message to one new person in your field daily.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Social',
    tags: ['Networking', 'Career']
  },
  {
    _id: '100000000000000000000045',
    title: 'Gratitude Letters (write 10 in 30 days)',
    description: 'Deepen your relationships by writing and sending 10 heartfelt gratitude letters.',
    duration: 30,
    baseDifficulty: 1,
    category: 'Social',
    tags: ['Relationships', 'Gratitude']
  },
  {
    _id: '100000000000000000000046',
    title: 'Listen More Challenge (30 days, no interrupting)',
    description: 'Become a better communicator by practicing active listening and not interrupting others.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Social',
    tags: ['Communication', 'Presence']
  },
  {
    _id: '100000000000000000000047',
    title: 'Social Confidence 21-Day Sprint',
    description: 'Systematically build your social confidence through a series of daily challenges.',
    duration: 21,
    baseDifficulty: 2,
    category: 'Social',
    tags: ['Confidence', 'Growth']
  },
  {
    _id: '100000000000000000000048',
    title: 'Mentor Someone for 30 Days',
    description: 'Give back and develop your leadership skills by mentoring someone for 30 days.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Social',
    tags: ['Leadership', 'Contribution']
  },

  // LIFESTYLE -> Lifestyle
  {
    _id: '100000000000000000000049',
    title: 'Monk Mode 30-Day Challenge',
    description: 'A period of intense focus and discipline. Isolate yourself from distractions and work on your goals.',
    duration: 30,
    baseDifficulty: 3,
    category: 'Lifestyle',
    tags: ['Discipline', 'Hardcore']
  },
  {
    _id: '100000000000000000000050',
    title: 'Clean Space Every Night (21 Days)',
    description: 'Bring order to your environment and mind by tidying up your space every night before bed.',
    duration: 21,
    baseDifficulty: 1,
    category: 'Lifestyle',
    tags: ['Habit', 'Organization']
  },
  {
    _id: '100000000000000000000051',
    title: 'No Alcohol 30 Days',
    description: 'Experience improved clarity, energy, and health by abstaining from alcohol for 30 days.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Lifestyle',
    tags: ['Health', 'Reset']
  },
  {
    _id: '100000000000000000000052',
    title: 'No Porn / NoFap 90-Day Reset',
    description: 'Reclaim your focus, energy, and sexual health with a 90-day reset from porn and masturbation.',
    duration: 90,
    baseDifficulty: 3,
    category: 'Lifestyle',
    tags: ['Discipline', 'Hardcore']
  },
  {
    _id: '100000000000000000000053',
    title: 'Financial Audit + No Spend Week',
    description: 'Gain control of your finances by auditing your spending and completing a \'no spend\' week.',
    duration: 7,
    baseDifficulty: 2,
    category: 'Lifestyle',
    tags: ['Finance', 'Reset']
  },
  {
    _id: '100000000000000000000054',
    title: 'Morning Routine Lock-In (21 Days)',
    description: 'Design and execute your ideal morning routine without fail for 21 days to lock it in.',
    duration: 21,
    baseDifficulty: 2,
    category: 'Lifestyle',
    tags: ['Habit', 'Productivity']
  },
  {
    _id: '100000000000000000000055',
    title: 'Night Routine Challenge',
    description: 'Optimize your sleep and recovery by creating and sticking to a relaxing night routine.',
    duration: 21,
    baseDifficulty: 1,
    category: 'Lifestyle',
    tags: ['Habit', 'Sleep']
  },
  {
    _id: '100000000000000000000056',
    title: 'Minimalism 30-Day Declutter',
    description: 'Simplify your life and reduce stress by decluttering one area of your home each day.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Lifestyle',
    tags: ['Minimalism', 'Organization']
  },
  {
    _id: '100000000000000000000057',
    title: 'Screen Time Under 2 Hours Daily',
    description: 'Reclaim your time and attention by limiting non-work screen time to under 2 hours per day.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Lifestyle',
    tags: ['Digital Minimalism', 'Focus']
  },
  {
    _id: '100000000000000000000058',
    title: 'Cook Every Meal for 30 Days',
    description: 'Take full control of your diet and improve your cooking skills by preparing every meal at home.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Lifestyle',
    tags: ['Nutrition', 'Skill']
  },
  {
    _id: '100000000000000000000059',
    title: 'No Complaining 21-Day Challenge',
    description: 'Rewire your brain for proactivity and positivity by eliminating all complaining for 21 days.',
    duration: 21,
    baseDifficulty: 2,
    category: 'Lifestyle',
    tags: ['Mindset', 'Positivity']
  },
  {
    _id: '100000000000000000000060',
    title: 'Capsule Wardrobe Challenge',
    description: 'Simplify your life and reduce decision fatigue by living with a limited, curated wardrobe for 30 days.',
    duration: 30,
    baseDifficulty: 1,
    category: 'Lifestyle',
    tags: ['Minimalism', 'Simplicity']
  },

  // PURPOSE -> Purpose
  {
    _id: '100000000000000000000061',
    title: 'Identity Reset 21-Day Challenge',
    description: 'A 21-day deep dive to consciously redefine and step into your desired identity.',
    duration: 21,
    baseDifficulty: 3,
    category: 'Purpose',
    tags: ['Transformation', 'Identity']
  },
  {
    _id: '100000000000000000000062',
    title: 'Hero Arc Journey',
    description: 'Frame your self-improvement as a hero\'s journey, with clear stages, trials, and triumphs.',
    duration: 90,
    baseDifficulty: 3,
    category: 'Purpose',
    tags: ['Story', 'Transformation']
  },
  {
    _id: '100000000000000000000063',
    title: 'Define Your 5-Year Vision',
    description: 'Dedicate a week of deep work to create a clear and compelling vision for your life in 5 years.',
    duration: 7,
    baseDifficulty: 2,
    category: 'Purpose',
    tags: ['Clarity', 'Vision']
  },
  {
    _id: '100000000000000000000064',
    title: 'Ikigai Discovery Challenge',
    description: 'A 14-day guided process to find your Ikigai - your reason for being.',
    duration: 14,
    baseDifficulty: 2,
    category: 'Purpose',
    tags: ['Purpose', 'Clarity']
  },
  {
    _id: '100000000000000000000065',
    title: 'Value Clarification Week',
    description: 'Spend a week identifying and prioritizing your core values to guide your decisions.',
    duration: 7,
    baseDifficulty: 1,
    category: 'Purpose',
    tags: ['Clarity', 'Values']
  },
  {
    _id: '100000000000000000000066',
    title: 'Create Your Personal Mission Statement',
    description: 'Craft a powerful personal mission statement that acts as your life\'s constitution.',
    duration: 7,
    baseDifficulty: 1,
    category: 'Purpose',
    tags: ['Vision', 'Clarity']
  },
  {
    _id: '100000000000000000000067',
    title: 'Fear-Facing 30-Day Challenge',
    description: 'Systematically identify and face your fears, big and small, every day for 30 days.',
    duration: 30,
    baseDifficulty: 3,
    category: 'Purpose',
    tags: ['Courage', 'Growth']
  },
  {
    _id: '100000000000000000000068',
    title: 'Legacy Building 90-Day Plan',
    description: 'A 90-day sprint to start building a project or body of work that will outlast you.',
    duration: 90,
    baseDifficulty: 3,
    category: 'Purpose',
    tags: ['Vision', 'Impact']
  },
  {
    _id: '100000000000000000000069',
    title: 'Gratitude + Abundance Mindset 30 Days',
    description: 'Shift from a scarcity to an abundance mindset through daily gratitude and visualization practices.',
    duration: 30,
    baseDifficulty: 1,
    category: 'Purpose',
    tags: ['Mindset', 'Gratitude']
  },
  {
    _id: '100000000000000000000070',
    title: 'Life Audit (all 6 domains in one week)',
    description: 'A comprehensive one-week audit of all major life domains to identify strengths and areas for growth.',
    duration: 7,
    baseDifficulty: 2,
    category: 'Purpose',
    tags: ['Clarity', 'Reset']
  },
  {
    _id: '100000000000000000000071',
    title: 'Forgiveness & Letting Go 21 Days',
    description: 'A 21-day practice to release past grudges and emotional baggage for greater peace.',
    duration: 21,
    baseDifficulty: 2,
    category: 'Purpose',
    tags: ['Healing', 'Mindset']
  },
  {
    _id: '100000000000000000000072',
    title: 'Design Your Ideal Day',
    description: 'Consciously design your perfect daily schedule and then live it out for 30 consecutive days.',
    duration: 30,
    baseDifficulty: 2,
    category: 'Purpose',
    tags: ['Lifestyle', 'Design']
  },
];

export default function Explore() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [toast, setToast] = useState(null);
  const [joining, setJoining] = useState(false);
  const [leavingId, setLeavingId] = useState(null);
  const [challengeSearch, setChallengeSearch] = useState('');
  const [activeDomain, setActiveDomain] = useState(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        let res;
        try {
          res = user ? await challengeAPI.getEnrollable() : await challengeAPI.getAll();
        } catch (err) {
          res = await challengeAPI.getAll();
        }
        // Use API data if available, otherwise use sample challenges
        let challengesData = sampleChallenges;
        
        if (res.data && res.data.length > 0) {
          challengesData = res.data.map(apiChall => {
            if (!apiChall.category) {
              const match = sampleChallenges.find(s => s._id === apiChall._id);
              return {
                ...apiChall,
                category: match ? match.category : 'Lifestyle',
                tags: match ? match.tags : []
              };
            }
            return apiChall;
          });
        }

        setChallenges(challengesData);
      } catch (err) {
        console.warn('Failed to load challenges from API, using sample data:', err.message);
        setChallenges(sampleChallenges);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, [user]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await challengeAPI.join(selectedChallenge._id, selectedMode);
      setChallenges(currentChallenges => currentChallenges.map(challenge => (
        challenge._id === selectedChallenge._id
          ? {
              ...challenge,
              isJoined: true,
              enrollmentId: res.data._id,
              enrollmentMode: res.data.mode
            }
          : challenge
      )));
      setToast({ message: 'Challenge enrolled! Head to Dashboard.', type: 'success' });
      setSelectedChallenge(null);
      setSelectedMode(null);
    } catch (err) {
      // Trigger Google auth if unauthorized
      if (err.response?.status === 401) {
        window.location.href = `${API_BASE_URL}/api/auth/google`;
        return;
      }
      setToast({ message: err.response?.data?.error || 'Failed to join', type: 'error' });
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async (challenge) => {
    if (!challenge.enrollmentId) return;

    setLeavingId(challenge._id);
    try {
      await challengeAPI.leave(challenge.enrollmentId);
      setChallenges(currentChallenges => currentChallenges.map(item => (
        item._id === challenge._id
          ? {
              ...item,
              isJoined: false,
              enrollmentId: null,
              enrollmentMode: null
            }
          : item
      )));
      setToast({ message: 'You left the challenge.', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to de-enroll', type: 'error' });
    } finally {
      setLeavingId(null);
    }
  };

  const renderDifficulty = (difficulty) => {
    if (difficulty === 1) return <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-green-50 text-green-700">Easy</span>;
    if (difficulty === 2) return <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-yellow-50 text-yellow-700">Medium</span>;
    if (difficulty === 3) return <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-700">Hard</span>;
    return <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-50 text-purple-700">Hardcore</span>;
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
    const matchesSearch = !query || (
      challenge.title.toLowerCase().includes(query) ||
      challenge.description.toLowerCase().includes(query)
    );
    const matchesDomain = !activeDomain || challenge.category?.toLowerCase() === activeDomain.toLowerCase();
    
    return matchesSearch && matchesDomain;
  });

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="pb-20 sm:pb-0 bg-[#FAFAF8] text-gray-900 font-sans min-h-screen">
      {/* Hero Section */}
      <div className="relative border-b border-[#ECECEC] bg-white px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="max-w-3xl text-center mx-auto">
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 mb-6">
              Discover Challenges
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 text-gray-900 leading-tight">
              What will you accomplish <br className="hidden sm:block" /> next?
            </h1>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto">
              Find the right path for your personal growth. Choose a category, start a challenge, and build better habits.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Domains Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Categories</h2>
            {activeDomain && (
              <button onClick={() => setActiveDomain(null)} className="text-sm font-medium text-[#6366F1] hover:text-indigo-700 transition">
                Clear Filter ✕
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {DOMAINS.map((domain) => (
              <div
                key={domain.id}
                onClick={() => setActiveDomain(domain.category)}
                className={`relative overflow-hidden p-6 rounded-[24px] cursor-pointer transition-all duration-200 border 
                  ${activeDomain === domain.category 
                    ? `border-[#6366F1] bg-indigo-50 shadow-sm` 
                    : `bg-white border-[#ECECEC] hover:border-gray-300 hover:shadow-sm`}
                `}
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${domain.color}`}>
                  <span className="text-xl">{domain.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{domain.title}</h3>
                <p className="text-sm text-gray-500 leading-tight">{domain.tagline}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transformation Systems & Trending Grid */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
              {activeDomain ? `${activeDomain} Challenges` : 'Trending Challenges'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Discover habits hand-crafted for steady growth.</p>
          </div>
          <div className="w-full sm:max-w-xs relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              🔍
            </div>
            <input
              type="search"
              value={challengeSearch}
              onChange={(event) => setChallengeSearch(event.target.value)}
              placeholder="Search challenges..."
              className="w-full rounded-xl border border-[#ECECEC] bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredChallenges.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white border border-[#ECECEC] rounded-[24px]">
              <p className="text-gray-500 text-lg font-medium">
                {challengeSearch.trim()
                  ? 'No challenges match your search.'
                  : 'No challenges available in this category.'}
              </p>
              {activeDomain && (
                <button onClick={() => setActiveDomain(null)} className="mt-4 bg-gray-100 text-gray-600 rounded-xl px-6 py-2 font-medium hover:bg-gray-200 transition-all">
                  View All Challenges
                </button>
              )}
            </div>
          ) : filteredChallenges.map(challenge => (
            <div key={challenge._id} className="flex flex-col bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-50 text-gray-600">
                    {challenge.category || 'Challenge'}
                  </span>
                  <div className="flex gap-1">
                    <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">{challenge.duration} Days</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">{challenge.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {renderDifficulty(challenge.baseDifficulty)}
                  {challenge.tags && challenge.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-50 text-gray-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {challenge.isJoined ? (
                <div className="grid gap-2">
                  <button
                    disabled
                    className="w-full font-medium bg-green-50 text-green-700 rounded-xl py-2.5 cursor-not-allowed text-sm"
                  >
                    Joined{challenge.enrollmentMode ? ` (${challenge.enrollmentMode})` : ''}
                  </button>
                  <button
                    onClick={() => handleLeave(challenge)}
                    disabled={leavingId === challenge._id}
                    className="w-full font-medium bg-white border border-[#ECECEC] text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl py-2.5 transition-colors text-sm"
                  >
                    {leavingId === challenge._id ? 'Leaving...' : 'Leave Challenge'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedChallenge(challenge)}
                  className="w-full font-medium bg-[#6366F1] text-white rounded-xl py-2.5 hover:bg-indigo-700 transition-colors shadow-sm text-sm"
                >
                  View Details
                </button>
              )}
            </div>
          ))}
        </div>

        {selectedChallenge && (
          <Modal
            isOpen={!!selectedChallenge}
            onClose={() => setSelectedChallenge(null)}
            title={`Select Commitment: ${selectedChallenge.title}`}
          >
            <div className="space-y-3">
              {getModes(selectedChallenge.duration).map(mode => (
                <div
                  key={mode.value}
                  onClick={() => user && setSelectedMode(mode.value)}
                  className={`p-4 border rounded-2xl transition-all ${
                    user ? 'cursor-pointer' : 'cursor-not-allowed'
                  } ${
                    selectedMode === mode.value
                      ? 'border-[#6366F1] bg-indigo-50 shadow-sm'
                      : user
                      ? 'border-[#ECECEC] bg-white hover:border-gray-300'
                      : 'border-[#ECECEC] bg-gray-50 opacity-50'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{mode.name}</p>
                  <p className="text-sm text-gray-500">{mode.desc}</p>
                  <p className="text-sm text-[#6366F1] font-medium mt-1">+{mode.xp} XP per check-in</p>
                </div>
              ))}
            </div>
            
            {!user && (
              <div className="mt-4 p-4 bg-gray-50 border border-[#ECECEC] rounded-xl">
                <p className="text-sm text-gray-600 font-medium">Log in to select your commitment level and start.</p>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setSelectedChallenge(null)}
                className="flex-1 bg-white border border-[#ECECEC] text-gray-700 rounded-xl py-2.5 font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              {user ? (
                <button
                  onClick={handleJoin}
                  disabled={!selectedMode || joining}
                  className={`flex-1 rounded-xl py-2.5 font-medium transition-colors text-sm ${!selectedMode ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#6366F1] text-white hover:bg-indigo-700 shadow-sm'}`}
                >
                  {joining ? 'Starting...' : 'Start Challenge'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    window.location.href = `${API_BASE_URL}/api/auth/google`;
                  }}
                  className="flex-1 bg-[#6366F1] text-white rounded-xl py-2.5 font-medium hover:bg-indigo-700 transition-colors shadow-sm text-sm"
                >
                  Log in to Start
                </button>
              )}
            </div>
          </Modal>
        )}

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}
