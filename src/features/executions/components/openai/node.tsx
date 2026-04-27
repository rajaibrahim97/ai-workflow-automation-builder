"use client";

import {Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";;
import { useNodeStatus } from "../../hooks/use-node-status";
import { openaiChannel } from "@/inngest/channels/openai";
import { OpenAiDialog, OpenAiFormValues } from "./dialog";
import { fetchOpenAiRealtimeToken } from "./actions";

type OpenaiNodeData = {
    workflowId: string;
    variableName?: string;
    systemPrompt?:string;
    userPrompt?:string;
}

type OpenaiNodeType = Node<OpenaiNodeData>;

export const OpenAiNode = memo((props: NodeProps<OpenaiNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();
    const channel = useMemo(()=>{
        return openaiChannel({
        workflowId:props.data.workflowId
    })
    },[props.data.workflowId]);

    const refreshToken =  useCallback(()=>{
        return fetchOpenAiRealtimeToken(props.data.workflowId)
    },[props.data.workflowId]);

const nodeStatus = useNodeStatus({
    nodeId:props.id,
    channel,
    refreshToken,
});

    const handleOpenSetttings = () => setDialogOpen(true);

    const handleSubmit = (values: OpenAiFormValues) => {
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
    const description = nodeData?.userPrompt ? `gpt-4: ${nodeData.userPrompt.slice(0,50) }`
    : "Not configured";

    return (
        <>
        <OpenAiDialog 
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            defaultValues={nodeData}
            />
        <BaseExecutionNode 
            {...props}
            id={props.id}
            icon="/logos/openai.svg"
            name="OpenAi"
            status={nodeStatus}
            description={description}
            onSettings={handleOpenSetttings}
            onDoubleClick={handleOpenSetttings}
        />
        </>
    )
});

OpenAiNode.displayName = "OpenAiNode";



