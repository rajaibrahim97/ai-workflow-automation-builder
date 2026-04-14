import type { NodeStatus } from "@/components/react-flow/node-status-indicator";
import { useRealtime } from "inngest/react";
import { useCallback, useMemo, useState } from "react";
import { fetchHttpWorkflowToken } from "../components/http-request/actions";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { Realtime } from "inngest";



// interface UseNodeStatusOptions<TChannel> {
//     nodeId: string;
//     workflowId: string;
//     refreshToken:Promise<Realtime.Subscribe.Token>;
//     channel:TChannel;
// };
interface UseNodeStatusOptions<
  TChannel extends Realtime.ChannelInput
> {
  nodeId: string;
  channel: TChannel;
  refreshToken: () => Promise<Realtime.Subscribe.Token>;
}

type StatusMessage = {
  kind: "data";
  topic: "status";
  channel: string;
  createdAt: Date;
  data: {
    nodeId: string;
    status: NodeStatus;
  };
};

export function useNodeStatus<
TChannel extends Realtime.ChannelInput
>(
    { nodeId,channel,refreshToken }: UseNodeStatusOptions<TChannel>
) {
    // const currentChannel = useMemo(() => channel({ workflowId }), [workflowId])
    console.log("[useNodeStatus] Subscribing to:", {
        nodeId,
        channel: channel,
    });
    const topics = useMemo(() => ["status", "tokens"] as const, []);
    const token = useCallback(() => {
     return refreshToken();
    }, [refreshToken]);

    const { messages, connectionStatus } = useRealtime({
        channel,
        topics,
        token,
    });
    console.log("CONNECTION:", connectionStatus);
    console.log("[useNodeStatus] Raw messages:", messages);
    console.log("[useNodeStatus] Status topic:", messages.byTopic.status);

   const latestMessageForNode = useMemo(() => {
  let latest: StatusMessage | null = null;

  for (const msg of messages.all) {
    if (msg.kind !== "data") continue;

    const dataMsg = msg as StatusMessage;

    if (
      dataMsg.topic === "status" &&
      dataMsg.data.nodeId === nodeId
    ) {
      if (
        !latest ||
        new Date(dataMsg.createdAt) >
          new Date(latest.createdAt)
      ) {
        latest = dataMsg;
      }
    }
  }

  return latest;
}, [messages.all, nodeId]);

return (latestMessageForNode?.data.status as NodeStatus) ?? "initial";


}