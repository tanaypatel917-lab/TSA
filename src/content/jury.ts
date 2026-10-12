export const juryCopy = {
  title: "Meet the models. Why do they disagree?",
  kicker: "Try it",
  spec: "Models: 6 scripted characters · Data: the training notes on each card · Every vote was written by us · Runs on your device",
  note: "No model is neutral: each one learned from the examples it was given. Bo, trained on the widest mix, makes the fewest mistakes. A panel only helps when its members learned from different, representative data.",
  chooseModels: "Pick 3 models for your panel",
  choosePhoto: "Pick a photo",
  ask: "Ask the panel",
  fullHint: "Your panel is full. Unpick one first.",
  tallyHeading: "Panel tally",
  trainingHeading: "Training notes behind this vote",
  hoodConclusion: "Each model's vote follows its training data, not the photo's truth."
} as const;

export const juryPhotos = [
  { id: "a", caption: "A golden retriever on grass, daytime", truth: "dog" },
  { id: "b", caption: "A black poodle on a sofa, at night", truth: "dog" },
  { id: "c", caption: "A cartoon dog in a comic", truth: "dog" },
  { id: "d", caption: "A Great Dane indoors", truth: "dog" },
  { id: "e", caption: "A fluffy cat on grass", truth: "not-dog" }
] as const;

export type JuryPhotoId = (typeof juryPhotos)[number]["id"];
export type JuryVoteLabel = "dog" | "not-dog";

export const juryModels = [
  {
    id: "max",
    name: "Max",
    trainedOn: "500 photos of golden retrievers",
    votes: {
      a: { label: "dog", confidence: 96, reason: "Looks just like my training photos" },
      b: { label: "not-dog", confidence: 71, reason: "No golden fur. I never saw a dog like this" },
      c: { label: "not-dog", confidence: 64, reason: "Too flat and bright" },
      d: { label: "dog", confidence: 58, reason: "Big, four legs, a bit like a retriever" },
      e: { label: "dog", confidence: 62, reason: "Fluffy, golden-ish and on grass. Close enough" }
    }
  },
  {
    id: "ivy",
    name: "Ivy",
    trainedOn: "cartoon dogs only",
    votes: {
      a: { label: "not-dog", confidence: 66, reason: "Too detailed to be a dog" },
      b: { label: "not-dog", confidence: 70, reason: "No bold outlines" },
      c: { label: "dog", confidence: 97, reason: "Bold outlines, just like my dogs" },
      d: { label: "not-dog", confidence: 68, reason: "Too realistic" },
      e: { label: "not-dog", confidence: 55, reason: "No outlines, so not a dog" }
    }
  },
  {
    id: "rex",
    name: "Rex",
    trainedOn: "dogs photographed outdoors on grass",
    votes: {
      a: { label: "dog", confidence: 94, reason: "Grass in the background" },
      b: { label: "not-dog", confidence: 80, reason: "No grass, so probably not a dog" },
      c: { label: "not-dog", confidence: 60, reason: "No grass" },
      d: { label: "not-dog", confidence: 72, reason: "Indoors. My dogs were always outside" },
      e: { label: "dog", confidence: 81, reason: "Grass in the background" }
    }
  },
  {
    id: "bo",
    name: "Bo",
    trainedOn: "dogs of every breed and size, indoors and outdoors, day and night",
    votes: {
      a: { label: "dog", confidence: 95, reason: "Dog shape, fur, snout" },
      b: { label: "dog", confidence: 84, reason: "Curly fur and a snout: a dog" },
      c: { label: "dog", confidence: 61, reason: "It's drawn, but the shape is a dog" },
      d: { label: "dog", confidence: 90, reason: "Very big, but clearly a dog" },
      e: { label: "not-dog", confidence: 92, reason: "Pointed ears and whiskers: a cat" }
    }
  },
  {
    id: "pim",
    name: "Pim",
    trainedOn: "small dogs only",
    votes: {
      a: { label: "not-dog", confidence: 63, reason: "Too big for a dog" },
      b: { label: "dog", confidence: 88, reason: "Small and curly, like my training dogs" },
      c: { label: "dog", confidence: 57, reason: "Small and cute" },
      d: { label: "not-dog", confidence: 85, reason: "Far too big to be a dog" },
      e: { label: "dog", confidence: 70, reason: "Small and furry" }
    }
  },
  {
    id: "lux",
    name: "Lux",
    trainedOn: "daytime photos only",
    votes: {
      a: { label: "dog", confidence: 93, reason: "Bright photo, dog shape" },
      b: { label: "not-dog", confidence: 74, reason: "Too dark to be one of my photos" },
      c: { label: "dog", confidence: 59, reason: "Bright colours, dog shape" },
      d: { label: "dog", confidence: 77, reason: "Well-lit, four legs" },
      e: { label: "dog", confidence: 58, reason: "Four legs, fur, bright photo" }
    }
  }
] as const;

export type JuryModelId = (typeof juryModels)[number]["id"];
export type JuryModel = (typeof juryModels)[number];

export function juryCorrectCount(model: JuryModel): number {
  return juryPhotos.filter((photo) => model.votes[photo.id].label === photo.truth).length;
}
