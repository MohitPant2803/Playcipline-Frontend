// Central registry for all Playcipline Avatars and Personas.
// Structured for future scalability (unlocks, rarity, gamification).

export const avatarCategories = [
  {
    id: "coding",
    title: "Coding",
    description: "Builders and problem solvers",
    avatars: [
      { id: "coder", name: "Coder", seed: "Coder", style: "bottts", rarity: "common" },
      { id: "builder", name: "Builder", seed: "Builder", style: "bottts", rarity: "common" },
      { id: "architect", name: "Architect", seed: "Architect", style: "bottts", rarity: "rare" },
      { id: "hacker", name: "Hacker", seed: "Hacker", style: "bottts", rarity: "epic" }
    ]
  },
  {
    id: "discipline",
    title: "Discipline",
    description: "Masters of self-control",
    avatars: [
      { id: "monk", name: "Monk", seed: "Monk", style: "lorelei", rarity: "common" },
      { id: "stoic", name: "Stoic", seed: "Stoic", style: "lorelei", rarity: "rare" },
      { id: "samurai", name: "Samurai", seed: "Samurai", style: "lorelei", rarity: "epic" },
      { id: "shadow", name: "Shadow", seed: "Shadow", style: "lorelei", rarity: "legendary" }
    ]
  },
  {
    id: "fitness",
    title: "Fitness",
    description: "Relentless physical forces",
    avatars: [
      { id: "runner", name: "Runner", seed: "Runner", style: "avataaars", rarity: "common" },
      { id: "warrior", name: "Warrior", seed: "Warrior", style: "avataaars", rarity: "common" },
      { id: "spartan", name: "Spartan", seed: "Spartan", style: "avataaars", rarity: "rare" },
      { id: "titan", name: "Titan", seed: "Titan", style: "avataaars", rarity: "epic" }
    ]
  },
  {
    id: "knowledge",
    title: "Knowledge",
    description: "Seekers of truth and systems",
    avatars: [
      { id: "scholar", name: "Scholar", seed: "Scholar", style: "pixel-art", rarity: "common" },
      { id: "analyst", name: "Analyst", seed: "Analyst", style: "pixel-art", rarity: "common" },
      { id: "sage", name: "Sage", seed: "Sage", style: "pixel-art", rarity: "rare" },
      { id: "strategist", name: "Strategist", seed: "Strategist", style: "pixel-art", rarity: "epic" }
    ]
  },
  {
    id: "fun",
    title: "Fun",
    description: "Spirit animals and mascots",
    avatars: [
      { id: "panda", name: "Panda", seed: "Panda", style: "fun-emoji", rarity: "common" },
      { id: "penguin", name: "Penguin", seed: "Penguin", style: "fun-emoji", rarity: "common" },
      { id: "fox", name: "Fox", seed: "Fox", style: "fun-emoji", rarity: "rare" },
      { id: "sloth", name: "Sloth", seed: "Sloth", style: "fun-emoji", rarity: "legendary" }
    ]
  }
];