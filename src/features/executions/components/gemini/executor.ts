import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { NodeExecutor } from "../../types";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encrypt";
import { geminiChannel } from "@/inngest/channels/gemini";

Handlebars.registerHelper("json", (context) => {
    return new Handlebars.SafeString(
        JSON.stringify(context, null, 2)
    );
});

type GeminiData = {
    variableName: string;
    credentialId?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
    data,
    nodeId,
    workflowId,
    context,
    step,
    userId,
}) => {

    const channel = geminiChannel({ workflowId });

    await step.realtime.publish(
        `node-loading-${nodeId}`,
        channel.status,
        {
            nodeId,
            status: "loading",
        }
    );

    try {

        const result = await step.run(
            `gemini-execution-${nodeId}`,
            async () => {

                if (!data.variableName?.trim()) {
                    throw new NonRetriableError(
                        "Gemini node: Variable name is missing"
                    );
                }

                if (!data.credentialId) {
                    throw new NonRetriableError(
                        "Gemini node: Credential is required"
                    );
                }

                if (!data.userPrompt?.trim()) {
                    throw new NonRetriableError(
                        "Gemini node: User prompt is missing"
                    );
                }

                const credential =
                    await prisma.credential.findUnique({
                        where: {
                            id: data.credentialId,
                            userId,
                        },
                    });

                if (!credential) {
                    throw new NonRetriableError(
                        "Gemini node: Credential not found"
                    );
                }

                const systemPrompt = data.systemPrompt
                    ? Handlebars.compile(
                        data.systemPrompt
                    )(context)
                    : "You are a helpful assistant.";

                const userPrompt = Handlebars.compile(
                    data.userPrompt
                )(context);

                const google =
                    createGoogleGenerativeAI({
                        apiKey: decrypt(credential.value),
                    });

                const { steps } = await step.ai.wrap(
                    `gemini-generate-text-${nodeId}`,
                    generateText,
                    {
                        model: google("gemini-2.5-flash"),
                        system: systemPrompt,
                        prompt: userPrompt,
                        experimental_telemetry: {
                            isEnabled: true,
                            recordInputs: true,
                            recordOutputs: true,
                        },
                    }
                );

                const text =
                    steps[0].content[0].type === "text"
                        ? steps[0].content[0].text
                        : "";

                return {
                    ...context,
                    [data.variableName]: {
                        text,
                    },
                };
            }
        );

        await step.realtime.publish(
            `node-success-${nodeId}`,
            channel.status,
            {
                nodeId,
                status: "success",
            }
        );

        return result;

    } catch (error) {

        await step.realtime.publish(
            `node-error-${nodeId}`,
            channel.status,
            {
                nodeId,
                status: "error",
            }
        );

        throw error;
    }
};