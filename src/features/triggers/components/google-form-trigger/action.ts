"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { Realtime } from "inngest";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";

type GoogleFormTriggerToken = Realtime.Subscribe.Token<
  typeof googleFormTriggerChannel,
  ["status"]
>;
export async function fetchGoogleFormTriggerRealtimeToken(workflowId: string):Promise<GoogleFormTriggerToken> {
    const token = await getClientSubscriptionToken(inngest, {
    channel: googleFormTriggerChannel({workflowId}),
    topics: ["status"],
  });
  return token as GoogleFormTriggerToken
}