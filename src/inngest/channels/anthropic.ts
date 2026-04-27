// src/inngest/channels/http-request.ts
import { realtime } from "inngest";
import { z } from "zod";

export const anthropicChannel = realtime.channel({
  name: ({ workflowId }: { workflowId: string }) =>
    `anthropic-execution:${workflowId}`,

  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success", "error"]),
      }),
    },
  },
});