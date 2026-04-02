import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from "ai";
import { NonRetriableError } from "inngest";
import { topologicalSort } from "./utils";
import { getExecutor } from "@/features/executions/executor-registry";
import { NodeType } from "@/generated/prisma";

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();


export const execute = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflows/execute.workflow" },

  async ({event, step}) => {
    const workflowId = event.data.workflowId;

    if (!workflowId) {
        throw new NonRetriableError("Workflow ID is missing");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where:{id:workflowId},
        include:{
          nodes: true,
          connections: true,
        }
      })
      return topologicalSort(workflow.nodes, workflow.connections);
      
      // Execute each node
      
    })
    // Initialize context with any initial data from the trigger
    let context = event.data.initialData || {};

    // Execute each node

    for (const node of sortedNodes){
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
      })
    }

    return {
      workflowId,
      result: context,
    };
  });