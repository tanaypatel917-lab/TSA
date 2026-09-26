export type GalaxyCluster = { id: string; label: string; words: string[] };

export const galaxyClusters: GalaxyCluster[] = [
  { id: "tech", label: "technology", words: ["ai", "model", "data", "algorithm", "computer", "robot", "chatbot", "chatgpt", "code", "program", "network", "software", "internet", "app", "prompt", "machine"] },
  { id: "truth", label: "truth", words: ["true", "false", "fact", "wrong", "right", "mistake", "error", "lie", "proof", "source", "evidence", "trust", "accurate", "fake", "real", "hallucination"] },
  { id: "ethics", label: "fairness", words: ["fair", "bias", "privacy", "safe", "rights", "people", "society", "justice", "harm", "equal", "law", "rules", "ethics", "cheat", "honest"] },
  { id: "work", label: "work", words: ["job", "work", "career", "boss", "money", "office", "business", "salary", "hire", "skill", "future", "company", "worker"] },
  { id: "school", label: "school", words: ["school", "homework", "teacher", "class", "essay", "test", "exam", "study", "grade", "lesson", "student", "notes", "quiz", "book", "learn"] },
  { id: "feelings", label: "feelings", words: ["happy", "sad", "angry", "scared", "worried", "excited", "nervous", "calm", "love", "fear", "lonely", "proud", "curious", "confused"] },
  { id: "art", label: "creativity", words: ["art", "music", "song", "paint", "draw", "story", "poem", "write", "design", "photo", "film", "dance", "creative", "image"] },
  { id: "games", label: "games", words: ["game", "soccer", "basketball", "play", "team", "win", "score", "chess", "video", "sport"] },
  { id: "food", label: "food", words: ["pizza", "apple", "bread", "rice", "cake", "soup", "coffee", "tea", "pasta", "taco", "cookie", "cheese", "banana", "salad"] },
  { id: "animals", label: "animals", words: ["dog", "cat", "bird", "fish", "horse", "lion", "tiger", "bear", "rabbit", "whale", "snake", "owl", "frog", "mouse"] },
  { id: "nature", label: "nature", words: ["climate", "energy", "water", "tree", "earth", "ocean", "weather", "planet", "environment", "carbon", "sun", "rain"] },
  { id: "health", label: "health", words: ["doctor", "health", "hospital", "medicine", "sick", "body", "brain", "heart", "nurse", "cancer"] }
];

export const introSuggestions = ["Can AI be wrong?", "Will AI take my job?", "How does ChatGPT learn?", "Is it cheating to use AI for homework?"];
