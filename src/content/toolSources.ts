export const toolSources = {
  system: ["touretzky-2019", "google-mlcc"],
  rules: ["google-mlcc"],
  chatbot: ["weizenbaum-1966"],
  tokens: ["openai-tokens", "sennrich-2016"],
  bias: ["buolamwini-2018", "dastin-2018"],
  claims: ["toureiffel-history", "toureiffel-330", "toureiffel-paint", "ji-2022"],
  prompt: ["openai-prompting", "openstax-bio"],
  vary: ["holtzman-2020"],
  redact: ["ed-privacy", "openai-data"],
  detector: ["openai-classifier-2023"],
  predictor: ["touvron-2023", "holtzman-2020"],
  galaxy: ["mikolov-2013"]
} as const;

export type ToolSourceKey = keyof typeof toolSources;
