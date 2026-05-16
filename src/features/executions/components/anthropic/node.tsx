"use client";

import {Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";;
import { useNodeStatus } from "../../hooks/use-node-status";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import { AnthropicDialog, AnthropicFormValues } from "./dialog";
import { fetchAnthropicRealtimeToken } from "./actions";

type AnthropicNodeData = {
    workflowId: string;
    variableName?: string;
    redentialId?: string;
    systemPrompt?:string;
    userPrompt?:string;
}

type AnthropicNodeType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();
    const channel = useMemo(()=>{
        return anthropicChannel({
        workflowId:props.data.workflowId
    })
    },[props.data.workflowId]);

    const refreshToken =  useCallback(()=>{
        return fetchAnthropicRealtimeToken(props.data.workflowId)
    },[props.data.workflowId]);

const nodeStatus = useNodeStatus({
    nodeId:props.id,
    channel,
    refreshToken,
});

    const handleOpenSetttings = () => setDialogOpen(true);

    const handleSubmit = (values: AnthropicFormValues) => {
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
    const description = nodeData?.userPrompt ? `claude-sonnet-4-5: ${nodeData.userPrompt.slice(0,50) }`
    : "Not configured";

    return (
        <>
        <AnthropicDialog 
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            defaultValues={nodeData}
            />
        <BaseExecutionNode 
            {...props}
            id={props.id}
            icon="/logos/anthropic.svg"
            name="Anthropic"
            status={nodeStatus}
            description={description}
            onSettings={handleOpenSetttings}
            onDoubleClick={handleOpenSetttings}
        />
        </>
    )
});

AnthropicNode.displayName = "AnthropicNode";



