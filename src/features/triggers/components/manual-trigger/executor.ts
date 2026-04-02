import type { NodeExecutor } from "@/features/executions/types";

type ManualTriggerData = Record<string, number>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
    nodeId,
    context,
    step,
}) => {
    // TODO: Publish Loading State manual Trigger

    const result = await step.run("manual-trigger", async () => context);

    // TODO: Publish "success" state for manual trigger

    return result;
}