"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { Realtime } from "inngest";
import { slackChannel } from "@/inngest/channels/slack";

type SlackToken = Realtime.Subscribe.Token< 
  typeof slackChannel,
  ["status"]
  >;
export async function fetchSlackRealtimeToken(workflowId: string):Promise<SlackToken> {
    const token = await getClientSubscriptionToken(inngest, {
    channel: slackChannel({ workflowId }),
    topics: ["status"],
  });
  return token as SlackToken
}