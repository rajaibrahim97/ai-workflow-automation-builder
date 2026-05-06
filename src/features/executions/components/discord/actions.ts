"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { Realtime } from "inngest";
import { discordChannel } from "@/inngest/channels/discord";

type DiscordToken = Realtime.Subscribe.Token< 
  typeof discordChannel,
  ["status"]
  >;
export async function fetchDiscordRealtimeToken(workflowId: string):Promise<DiscordToken> {
    const token = await getClientSubscriptionToken(inngest, {
    channel: discordChannel({ workflowId }),
    topics: ["status"],
  });
  return token as DiscordToken
}