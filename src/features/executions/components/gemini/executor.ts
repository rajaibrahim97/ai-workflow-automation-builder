import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { NodeExecutor } from "../../types";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encrypt";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);
    return safeString;
});

type GeminiData = {
    variableName: string;
    credentialId?: string;
    systemPrompt?: string;
    userPrompt?: string
}

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
    data,
    nodeId,
    workflowId,
    context,
    step,
    userId,
}) => {
    // Publish "Loading" state for http request
    const channel = httpRequestChannel({ workflowId })
    console.log("[Executor] Publishing node-loading", { nodeId });
    await step.realtime.publish("node-loading", channel.status, {
        nodeId,
        status: "loading"
    })

    if (!data.variableName) {
        // Publish "error" state for http request
        console.log("[Executor] Publishing node-error", { nodeId });
        await step.realtime.publish("node-error", channel.status, {
            nodeId,
            status: "error"
        });
        throw new NonRetriableError("Gemini node: Variable name is missing");
    }
    if (!data.credentialId) {
        // Publish "error" state for http request
        console.log("[Executor] Publishing node-error", { nodeId });
        await step.realtime.publish("node-error", channel.status, {
            nodeId,
            status: "error"
        });
        throw new NonRetriableError("Gemini node: Credential is is required");
    }


    if (!data.userPrompt) {
        // Publish "error" state for http request
        console.log("[Executor] Publishing node-error", { nodeId });
        await step.realtime.publish("node-error", channel.status, {
            nodeId,
            status: "error"
        });
        throw new NonRetriableError("Gemini node: User prompt is missing");
    }

    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful assistant.";
    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    const credential = await step.run("get-credential", () => {
        return prisma.credential.findUnique({
            where:{
                id: data.credentialId,
                userId
            }
        })
    });
    if (!credential){
        await step.realtime.publish("node-error", channel.status, {
            nodeId,
            status: "error"
        });
        throw new NonRetriableError("Gemini node: Credential not found");
    }

    const google = createGoogleGenerativeAI({
        apiKey: decrypt(credential.value),
    })
    try {
        const { steps } = await step.ai.wrap(
            "gemini-generate-text",
            generateText,
            {
                model: google("gemini-2.0-flash"),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry: {
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true,
                }
            }
        );

        const text = steps[0].content[0].type === "text" ? steps[0]
        .content[0].text: "";

        await step.realtime.publish("node-success", channel.status, {
            nodeId,
            status: "success",
        });

        return {
      ...context,
      [data.variableName]: {
        text,
      },
    }


    } catch (error) {
        await step.realtime.publish("node-error", channel.status, {
            nodeId,
            status: "error"
        });
        throw error
    }
}