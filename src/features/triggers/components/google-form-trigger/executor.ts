import type { NodeExecutor } from "@/features/executions/types";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";


type GoogleFormTriggerData = Record<string, number>;

export const googleFormTriggerExecutor: NodeExecutor<GoogleFormTriggerData> = async ({
    nodeId,
    context,
    step,
    workflowId
}) => {
    const channel = googleFormTriggerChannel({workflowId})
    // Publish Loading State 

    await step.realtime.publish(`node-loading-${nodeId}`, channel.status,{
        nodeId,
        status:"loading"
    })
    const result = await step.run("google-form-trigger", async () => context);

    // Publish "success" state for  trigger
     await step.realtime.publish(`node-success-${nodeId}`, channel.status, {
            nodeId,
            status:"success",
        });

    return result;
}