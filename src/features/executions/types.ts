import { httpRequestChannel } from "@/inngest/channels/http-request";
import type { GetStepTools, Inngest } from "inngest";
export type WorkflowContext = Record<string, unknown>;

export type StepTools = GetStepTools<Inngest.Any>;

export interface NodeExecutorParams<TData = Record<string, unknown>> {
    data: TData;
    nodeId: string;
    context:WorkflowContext;
    step: StepTools;
    workflowId:string;
    userId: string,
    // publish: TODO Add realtime Later
    // publish: any;
    // channel: ReturnType<typeof httpRequestChannel>

};

export type NodeExecutor<TData = Record<string, unknown>> = (
    params: NodeExecutorParams<TData>,
) => Promise<WorkflowContext>;
