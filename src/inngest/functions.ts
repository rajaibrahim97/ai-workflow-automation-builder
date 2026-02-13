import prisma from "@/lib/db";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    //fetchin the video
    await step.sleep("wait-a-moment", "5s");

    //transcribing
    await step.sleep("wait-a-moment", "5s");

    // sending transcription
    return { message: `Hello ${event.data.email}!` };

    await stop.arguments("create-flow",() => {
        return prisma.workflow.create({
            data: {
                name:"test-workflow"
            }
        })
    })
  },
);