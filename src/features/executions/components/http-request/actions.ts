"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { Realtime } from "inngest";

type HttpRequestTokken = Realtime.Subscribe.Token< 
  typeof httpRequestChannel,
  ["status"]
  >;
export async function fetchHttpWorkflowToken(workflowId: string):Promise<HttpRequestTokken> {
    const token = await getClientSubscriptionToken(inngest, {
    channel: httpRequestChannel({ workflowId }),
    topics: ["status"],
  });
  return token as HttpRequestTokken
}