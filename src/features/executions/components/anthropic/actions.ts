"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { Realtime } from "inngest";
import { anthropicChannel } from "@/inngest/channels/anthropic";


type AnthropicToken = Realtime.Subscribe.Token< 
  typeof anthropicChannel,
  ["status"]
  >;
export async function fetchAnthropicRealtimeToken(workflowId: string):Promise<AnthropicToken> {
    const token = await getClientSubscriptionToken(inngest, {
    channel: anthropicChannel({ workflowId }),
    topics: ["status"],
  });
  return token as AnthropicToken
}