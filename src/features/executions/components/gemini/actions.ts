"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { Realtime } from "inngest";
import { geminiChannel } from "@/inngest/channels/gemini";

type GeminiToken = Realtime.Subscribe.Token<
  typeof geminiChannel,
  ["status"]
>;

export async function fetchGeminiRealtimeToken(
  workflowId: string
): Promise<GeminiToken> {

  const token = await getClientSubscriptionToken(inngest, {
    channel: geminiChannel({ workflowId }),
    topics: ["status"],
  });

  return token as GeminiToken;
}