import type { NodeExecutor } from "@/features/executions/types";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

type ManualTriggerData = Record<string, number>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
    nodeId,
    context,
    step,
    workflowId
}) => {
    const channel = manualTriggerChannel({workflowId})
    // TODO: Publish Loading State manual Trigger

    await step.realtime.publish("node-loading", channel.status,{
        nodeId,
        status:"loading"
    })
    const result = await step.run("manual-trigger", async () => context);

    // TODO: Publish "success" state for manual trigger
     await step.realtime.publish("node-success", channel.status, {
            nodeId,
            status:"success",
        });

    return result;
}