"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { Realtime } from "inngest";

type GeminiToken = Realtime.Subscribe.Token< 
  typeof httpRequestChannel,
  ["status"]
  >;
export async function fetchGeminiRealtimeToken(workflowId: string):Promise<GeminiToken> {
    const token = await getClientSubscriptionToken(inngest, {
    channel: httpRequestChannel({ workflowId }),
    topics: ["status"],
  });
  return token as GeminiToken
}