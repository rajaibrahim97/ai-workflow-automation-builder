import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from "ai";
import { NonRetriableError } from "inngest";
import { topologicalSort } from "./utils";
import { getExecutor } from "@/features/executions/executor-registry";
import { ExecutionStatus, NodeType } from "@/generated/prisma";
import { httpRequestChannel } from "./channels/http-request";



export const executeWorkflow = inngest.createFunction(
  { 
    id: "execute-workflow",
    retries:process.env.NODE_ENV === "production" ? 3 : 0,
    triggers: [{ event: "workflows/execute.workflow" } ],
    onFailure: async ({ event, step }) => {
      return prisma.execution.update({
        where: { inngestEventId: event.data.event.id },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      });
    },
  },
 

  async ({event, step}) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;

    if (!inngestEventId || !workflowId) {
        throw new NonRetriableError("Event ID or Workflow ID is missing");
    }
    
    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data:{
          workflowId,
          inngestEventId
        },
      });
    });

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where:{id:workflowId},
        include:{
          nodes: true,
          connections: true,
        },
      })
      return topologicalSort(workflow.nodes, workflow.connections);
      
      
    })

    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where:{id:workflowId},
        select:{
          userId: true,
        },
      });

      return workflow.userId;
    });
    // Initialize context with any initial data from the trigger
    let context = event.data.initialData || {};


   
    // Execute each node

    for (const node of sortedNodes){
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        userId,
        context,
        step,
        workflowId,
      })
    }

    await step.run("update-execution", async () => {
      return prisma.execution.update({
        where:{ inngestEventId, workflowId },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        }
      })
    })

    return {
      workflowId,
      result: context,
    };
  });