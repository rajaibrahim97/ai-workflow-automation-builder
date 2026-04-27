import type { NodeExecutor } from "@/features/executions/types";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";


type StripeTriggerData = Record<string, number>;

export const stripeTriggerExecutor: NodeExecutor<StripeTriggerData> = async ({
    nodeId,
    context,
    step,
    workflowId
}) => {
    const channel = stripeTriggerChannel({workflowId})
    // Publish Loading State 

    await step.realtime.publish("node-loading", channel.status,{
        nodeId,
        status:"loading"
    })
    const result = await step.run("google-form-trigger", async () => context);

    // Publish "success" state for  trigger
     await step.realtime.publish("node-success", channel.status, {
            nodeId,
            status:"success",
        });

    return result;
}