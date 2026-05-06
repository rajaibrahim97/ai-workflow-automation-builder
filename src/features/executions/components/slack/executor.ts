import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { decode } from "html-entities";
import { NodeExecutor } from "../../types";
import ky from "ky";
import { discordChannel } from "@/inngest/channels/discord";
import { slackChannel } from "@/inngest/channels/slack";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);
    return safeString;
});

type SlacklData = {
    variableName?: string;
    webhookUrl?: string;
    content?: string;
    username?: string;
}

export const slackExecutor : NodeExecutor<SlacklData> = async ({
    data,
    nodeId,
    workflowId,
    context,
    step,
}) => {
    // Publish "Loading" state for discord
    const channel = slackChannel({ workflowId })

    await step.realtime.publish("node-loading", channel.status, {
        nodeId,
        status: "loading"
    })

    if (!data.content) {
        // Publish "error" state for discord
        await step.realtime.publish("node-error", channel.status, {
            nodeId,
            status: "error"
        });
        throw new NonRetriableError("Slack node: Message content is required");
    }

    const rawContent = Handlebars.compile(data.content)(context);
    const content = decode(rawContent)


    try {
        const result = await step.run("slack-webhook", async () => {
            if (!data.webhookUrl) {
                await step.realtime.publish("node-error", channel.status, {
                    nodeId,
                    status: "error"
                });
                throw new NonRetriableError("Slack node: Webhook URL is required");
            }

            await ky.post(data.webhookUrl, {
                json: {
                    content: content, // The key depends on workflow config
                },
            });

            if (!data.variableName) {
                await step.realtime.publish("node-error", channel.status, {
                    nodeId,
                    status: "error"
                });
                throw new NonRetriableError("Slack node: Variable name is missing");
            };

            return {
                ...context,
                [data.variableName]: {
                    messageContent: content.slice(0, 2000),
                },
            };

        });
        await step.realtime.publish("node-success", channel.status, {
            nodeId,
            status: "success",
        });
        return result;

    } catch (error) {
        await step.realtime.publish("node-error", channel.status, {
            nodeId,
            status: "error"
        });
        throw error
    }
}