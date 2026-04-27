"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { Realtime } from "inngest";
import { openaiChannel } from "@/inngest/channels/openai";

type OpenAiToken = Realtime.Subscribe.Token< 
  typeof openaiChannel,
  ["status"]
  >;
export async function fetchOpenAiRealtimeToken(workflowId: string):Promise<OpenAiToken> {
    const token = await getClientSubscriptionToken(inngest, {
    channel: openaiChannel({ workflowId }),
    topics: ["status"],
  });
  return token as OpenAiToken
}