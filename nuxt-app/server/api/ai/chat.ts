import { streamText, type UIMessage, convertToModelMessages } from "ai";
import { useAiSdk } from "~/composables/useAiSdk";

export default defineLazyEventHandler(async () => {
  const { googleAi } = useAiSdk();

  return defineEventHandler(async (event: any) => {
    const { messages }: { messages: UIMessage[] } = await readBody(event);

    const result = streamText({
      model: googleAi("gemini-2.5-flash"),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  });
});
