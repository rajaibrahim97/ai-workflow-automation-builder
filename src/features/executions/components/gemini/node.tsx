"use client";

import {Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";;
import { useNodeStatus } from "../../hooks/use-node-status";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { GeminiDialog, GeminiFormValues } from "./dialog";
import { fetchGeminiRealtimeToken } from "./actions";

type GeminiNodeData = {
    workflowId: string;
    variableName?: string;
    systemPrompt?:string;
    userPrompt?:string;
}

type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();
    const channel = useMemo(()=>{
        return httpRequestChannel({
        workflowId:props.data.workflowId
    })
    },[props.data.workflowId]);

    const refreshToken =  useCallback(()=>{
        return fetchGeminiRealtimeToken(props.data.workflowId)
    },[props.data.workflowId]);

const nodeStatus = useNodeStatus({
    nodeId:props.id,
    channel,
    refreshToken,
});

    const handleOpenSetttings = () => setDialogOpen(true);

    const handleSubmit = (values: GeminiFormValues) => {
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
    const description = nodeData?.userPrompt ? `gemini-2.0-flash: ${nodeData.userPrompt.slice(0,50) }`
    : "Not configured";

    return (
        <>
        <GeminiDialog 
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            defaultValues={nodeData}
            />
        <BaseExecutionNode 
            {...props}
            id={props.id}
            icon="/logos/gemini.svg"
            name="Gemini"
            status={nodeStatus}
            description={description}
            onSettings={handleOpenSetttings}
            onDoubleClick={handleOpenSetttings}
        />
        </>
    )
});

GeminiNode.displayName = "GeminiNode";



