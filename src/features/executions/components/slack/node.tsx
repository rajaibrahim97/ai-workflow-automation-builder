"use client";

import {Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";;
import { useNodeStatus } from "../../hooks/use-node-status";
import { discordChannel } from "@/inngest/channels/discord";
import { SlackDialog, SlackFormValues } from "./dialog";
import { fetchSlackRealtimeToken } from "./actions";

type SlackNodeData = {
    workflowId: string;
    webhookurl?:string;
    content?:string;
    username?: string;
}

type SlackNodeType = Node<SlackNodeData>;

export const SlackNode = memo((props: NodeProps<SlackNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();
    const channel = useMemo(()=>{
        return discordChannel({
        workflowId:props.data.workflowId
    })
    },[props.data.workflowId]);

    const refreshToken =  useCallback(()=>{
        return fetchSlackRealtimeToken(props.data.workflowId)
    },[props.data.workflowId]);

const nodeStatus = useNodeStatus({
    nodeId:props.id,
    channel,
    refreshToken,
});

    const handleOpenSetttings = () => setDialogOpen(true);

    const handleSubmit = (values: SlackFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if(node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ... values,
                    }
                }
            }
            return node;
        }))
    }

    const nodeData = props.data;
    const description = nodeData?.content ? `Send: ${nodeData.content.slice(0,50)}...`
    : "Not configured";

    return (
        <>
        <SlackDialog 
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            defaultValues={nodeData}
        />
        <BaseExecutionNode 
            {...props}
            id={props.id}
            icon="/logos/slack.svg"
            name="Slack"
            status={nodeStatus}
            description={description}
            onSettings={handleOpenSetttings}
            onDoubleClick={handleOpenSetttings}
        />
        </>
    )
});

SlackNode.displayName = "SlackNode";



