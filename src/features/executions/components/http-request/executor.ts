import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { NodeExecutor } from "../../types";
import ky, { type Options as KyOptions } from "ky";
import { httpRequestChannel } from "@/inngest/channels/http-request";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);
    return safeString;
});

type HttpRequestData = {
    variableName: string;
    endpoint: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: string;
}

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
    data,
    nodeId,
    workflowId,
    context,
    step,
}) => {
    console.log("HTTP EXECUTOR START");
    // Publish "Loading" state for http request
    const channel = httpRequestChannel({ workflowId })

    await step.realtime.publish(`node-loading-${nodeId}`, channel.status, {
        nodeId,
        status: "loading"
    })


    try {
        const result = await step.run("http-request", async () => {
            if (!data.endpoint?.trim()) {
                // Publish "error" state for http request
                // await step.realtime.publish("node-error", channel.status, {
                //     nodeId,
                //     status: "error"
                // });
                throw new NonRetriableError("HTTP Request node: No endpoint configured");
            }
            if (!data.variableName?.trim()) {
                // Publish "error" state for http request
                console.log("[Executor] Publishing node-error", { nodeId });
                // await step.realtime.publish("node-error", channel.status, {
                //     nodeId,
                //     status: "error"
                // });
                throw new NonRetriableError("Variable name not configured");
            }

            if (!data.method) {
                // Publish "error" state for http request
                console.log("[Executor] Publishing node-error", { nodeId });
                // await step.realtime.publish("node-error", channel.status, {
                //     nodeId,
                //     status: "error"
                // });
                throw new NonRetriableError("Method not configured");
            }
            const endpoint = Handlebars.compile(data.endpoint)(context)?.trim();
            // Runtime validation
            if (!endpoint) {
                throw new NonRetriableError(
                    "Resolved endpoint is empty"
                );
            }

            // URL validation
            try {
                new URL(endpoint);
            } catch {
                throw new NonRetriableError(
                    `Invalid URL: ${endpoint}`
                );
            }
            const method = data.method;
            const options: KyOptions = { method };

            if (["POST", "PUT", "PATCH"].includes(method)) {
                const resolved = Handlebars.compile(data.body || "{}")(context);
                JSON.parse(resolved);
                options.body = resolved;
                options.headers = {
                    "Content-Type": "application/json",
                }
            }
            console.log("BEFORE REQUEST", {
                endpoint,
                options,
            });
            const response = await ky(endpoint, options);
            console.log("AFTER REQUEST");
            const contentType = response.headers.get("content-type")
            const responseData = contentType?.includes("application/json")
                ? await response.json() : await response.text()
            const responsePayload = {
                httpResponse: {
                    status: response.status,
                    statusText: response.statusText,
                    data: responseData
                }
            };


            return {
                ...context,
                [data.variableName]: responsePayload
            }

        });

        // Publish "success" state for http request
        console.log("[Executor] Publishing node-success", { nodeId });
        await step.realtime.publish(`node-success-${nodeId}`, channel.status, {
            nodeId,
            status: "success",
        });

        return result;
    } catch (error) {
        await step.realtime.publish(`node-error-${nodeId}`, channel.status, {
            nodeId,
            status: "error"
        });
        throw error;
    }

}