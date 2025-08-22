import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const useAiSdk = () => {
  const apiKey = useRuntimeConfig().googleGenerativeAiApiKey;
  if (!apiKey) throw new Error("Missing Google Generative AI API key");

  const googleAi = createGoogleGenerativeAI({
    apiKey: apiKey,
  });

  return {
    googleAi,
  };
};
