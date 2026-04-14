"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import { Realtime } from "inngest";

type ManualTriggerToken = Realtime.Subscribe.Token<
  typeof manualTriggerChannel,
  ["status"]
>;
export async function fetchManualTriggerWorkflowToken(workflowId: string):Promise<ManualTriggerToken> {
    const token = await getClientSubscriptionToken(inngest, {
    channel: manualTriggerChannel({workflowId}),
    topics: ["status"],
  });
  return token as ManualTriggerToken
}