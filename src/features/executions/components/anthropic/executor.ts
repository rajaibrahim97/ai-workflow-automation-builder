import Handlebars from "handlebars";
import { anthropic, NonRetriableError } from "inngest";
import { NodeExecutor } from "../../types";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { openaiChannel } from "@/inngest/channels/openai";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import { createAnthropic } from "@ai-sdk/anthropic";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encrypt";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);
    return safeString;
});

type AnthropicData = {
    variableName: string;
    credentialId?: string;
    systemPrompt?: string;
    userPrompt?: string
}

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
    data,
    nodeId,
    workflowId,
    context,
    step,
    userId
}) => {
    // Publish "Loading" state
    const channel = anthropicChannel({ workflowId })

    await step.realtime.publish(`node-loading-${nodeId}`, channel.status, {
        nodeId,
        status: "loading"
    })

    try {
        // SINGLE deterministic step boundary wrapping all execution
        const result = await step.run(`anthropic-execution-${nodeId}`, async () => {
            // === VALIDATION (inside step, like HTTP executor) ===
            if (!data.variableName?.trim()) {
                throw new NonRetriableError("Anthropic node: Variable name is missing");
            }
            if (!data.credentialId) {
                throw new NonRetriableError("Anthropic node: Credential is required");
            }
            if (!data.userPrompt?.trim()) {
                throw new NonRetriableError("Anthropic node: User prompt is missing");
            }

            // === CREDENTIAL FETCH (inside step, deterministic) ===
            const credential = await prisma.credential.findUnique({
                where: {
                    id: data.credentialId,
                    userId
                },
            });

            if (!credential) {
                throw new NonRetriableError("Anthropic node: Credential not found");
            }

            // === TEMPLATE COMPILATION ===
            const systemPrompt = data.systemPrompt
                ? Handlebars.compile(data.systemPrompt)(context)
                : "You are a helpful assistant.";
            const userPrompt = Handlebars.compile(data.userPrompt)(context);

            // === AI GENERATION (step.ai.wrap inside deterministic boundary) ===
            const anthropic = createAnthropic({
                apiKey: decrypt(credential.value),
            })
            const { steps } = await step.ai.wrap(
                `anthropic-generate-text-${nodeId}`,
                generateText,
                {
                    model: anthropic("claude-sonnet-4-5"),
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
                .content[0].text : "";

            return {
                ...context,
                [data.variableName]: {
                    text,
                },
            }
        });

        // === SUCCESS: Publish after step completes ===
        await step.realtime.publish(`node-success-${nodeId}`, channel.status, {
            nodeId,
            status: "success",
        });

        return result;

    } catch (error) {
        // === ERROR: Publish on any failure ===
        await step.realtime.publish(`node-error-${nodeId}`, channel.status, {
            nodeId,
            status: "error"
        });
        throw error;
    }
}