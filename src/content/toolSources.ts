export const toolSources = {
  system: ["touretzky-2019", "google-mlcc"],
  rules: ["google-mlcc"],
  tokens: ["openai-tokens", "sennrich-2016"],
  bias: ["buolamwini-2018", "dastin-2018"],
  claims: ["toureiffel-history", "toureiffel-330", "toureiffel-paint", "ji-2022"],
  prompt: ["openai-prompting", "openstax-bio"],
  vary: ["holtzman-2020"],
  redact: ["ed-privacy", "openai-data"],
  predictor: ["touvron-2023", "holtzman-2020"],
  galaxy: ["mikolov-2013"]
} as const;

export type ToolSourceKey = keyof typeof toolSources;
