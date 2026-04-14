"use client";

import {Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { HttpRequestDialog, HttpRequestFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { fetchHttpWorkflowToken } from "./actions";

type HttpRequestNodeData = {
    workflowId: string;
    variableName?: string;
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: string;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();
    const channel = useMemo(()=>{
        return httpRequestChannel({
        workflowId:props.data.workflowId
    })
    },[props.data.workflowId]);

    const refreshToken =  useCallback(()=>{
        return fetchHttpWorkflowToken(props.data.workflowId)
    },[props.data.workflowId]);

const nodeStatus = useNodeStatus({
    nodeId:props.id,
    channel,
    refreshToken,
});

    const handleOpenSetttings = () => setDialogOpen(true);

    const handleSubmit = (values: HttpRequestFormValues) => {
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
    const description = nodeData?.endpoint ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
    : "Not configured";

    return (
        <>
        <HttpRequestDialog 
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            defaultValues={nodeData}
            />
        <BaseExecutionNode 
            {...props}
            id={props.id}
            icon={GlobeIcon}
            name="HTTP Request"
            status={nodeStatus}
            description={description}
            onSettings={handleOpenSetttings}
            onDoubleClick={handleOpenSetttings}
        />
        </>
    )
});

HttpRequestNode.displayName = "HttpRequestNode";



