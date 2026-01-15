export const MODELS = {
  // Fast + cheap structured extraction (intent → JSON)
  parse: process.env.OPENAI_MODEL_PARSE ?? "gpt-5-mini",

  // Premium user-facing answers
  chat: process.env.OPENAI_MODEL_CHAT ?? "gpt-5.2",

  // Premium structured report writing
  report: process.env.OPENAI_MODEL_REPORT ?? "gpt-5.2",
} as const;
