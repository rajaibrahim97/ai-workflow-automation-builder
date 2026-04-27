"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { Realtime } from "inngest";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

type StripeTriggerToken = Realtime.Subscribe.Token<
  typeof stripeTriggerChannel,
  ["status"]
>;
export async function fetchStripeTriggerRealtimeToken(workflowId: string):Promise<StripeTriggerToken> {
    const token = await getClientSubscriptionToken(inngest, {
    channel: stripeTriggerChannel({workflowId}),
    topics: ["status"],
  });
  return token as StripeTriggerToken
}