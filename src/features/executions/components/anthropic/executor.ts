import Handlebars from "handlebars";
import { anthropic, NonRetriableError } from "inngest";
import { NodeExecutor } from "../../types";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { openaiChannel } from "@/inngest/channels/openai";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import { createAnthropic } from "@ai-sdk/anthropic";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);
    return safeString;
});

type AnthropicData = {
    variableName: string;
    systemPrompt?: string;
    userPrompt?: string
}

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
    data,
    nodeId,
    workflowId,
    context,
    step,
}) => {
    // Publish "Loading" state for http request
    const channel = anthropicChannel({ workflowId })
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
        throw new NonRetriableError("Anthropic node: Variable name is missing");
    }


    if (!data.userPrompt) {
        // Publish "error" state for http request
        console.log("[Executor] Publishing node-error", { nodeId });
        await step.realtime.publish("node-error", channel.status, {
            nodeId,
            status: "error"
        });
        throw new NonRetriableError("Anthropic node: User prompt is missing");
    }

    // TODO : FETCH credential throw error if missing 
    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful assistant.";
    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    //TODO: Fetch credential that user selected
    const credentialValue = process.env.ANTHROPIC_API_KEY!;
    const anthropic = createAnthropic({
        apiKey: credentialValue
    })
    try {
        const { steps } = await step.ai.wrap(
            "gemini-generate-text",
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