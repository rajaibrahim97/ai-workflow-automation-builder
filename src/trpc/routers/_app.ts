import { email, z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const appRouter = createTRPCRouter({
  testAi: baseProcedure.mutation(async () => {
    await inngest.send({
      name:"execute/ai",
    })
    return { success: true, message: "Job Queued" }
  }),
  getWorkflows: protectedProcedure.query(() => {
    return prisma.workflow.findMany();
  }),
  createdWorkflow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "rjmibrahim906@gmail.com"
      }
    })
    return { success: true, message: "Job Queued" }
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;