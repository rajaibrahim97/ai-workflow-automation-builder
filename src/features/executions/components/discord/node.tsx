"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";;
import { useNodeStatus } from "../../hooks/use-node-status";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { DiscordDialog, DiscordFormValues } from "./dialog";
import { fetchDiscordRealtimeToken } from "./actions";
import { discordChannel } from "@/inngest/channels/discord";

type DiscordNodeData = {
    workflowId: string;
    webhookurl?: string;
    content?: string;
}

type DiscordNodeType = Node<DiscordNodeData>;

export const DiscordNode = memo((props: NodeProps<DiscordNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();
    const channel = useMemo(() => {
        return discordChannel({
            workflowId: props.data.workflowId
        })
    }, [props.data.workflowId]);

    const refreshToken = useCallback(() => {
        return fetchDiscordRealtimeToken(props.data.workflowId)
    }, [props.data.workflowId]);

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel,
        refreshToken,
    });

    console.log(nodeStatus)
    const handleOpenSetttings = () => setDialogOpen(true);

    const handleSubmit = (values: DiscordFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...values,
                    }
                }
            }
            return node;
        }))
    }

    const nodeData = props.data;
    const description = nodeData?.content ? `Send: ${nodeData.content.slice(0, 50)}...`
        : "Not configured";

    return (
        <>
            <DiscordDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/discord.svg"
                name="Discord"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSetttings}
                onDoubleClick={handleOpenSetttings}
            />
        </>
    )
});

DiscordNode.displayName = "DiscordNode";



