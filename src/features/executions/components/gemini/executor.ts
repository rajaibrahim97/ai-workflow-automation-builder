import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { NodeExecutor } from "../../types";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);
    return safeString;
});

type GeminiData = {
    variableName: string;
    systemPrompt?: string;
    userPrompt?: string
}

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
    data,
    nodeId,
    workflowId,
    context,
    step,
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


    if (!data.userPrompt) {
        // Publish "error" state for http request
        console.log("[Executor] Publishing node-error", { nodeId });
        await step.realtime.publish("node-error", channel.status, {
            nodeId,
            status: "error"
        });
        throw new NonRetriableError("Gemini node: User prompt is missing");
    }

    // TODO : FETCH credential throw error if missing 
    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful assistant.";
    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    //TODO: Fetch credential that user selected
    const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
    const google = createGoogleGenerativeAI({
        apiKey: credentialValue
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