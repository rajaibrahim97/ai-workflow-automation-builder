import { Node, NodeProps } from "@xyflow/react";
import { memo, useCallback, useMemo, useState } from "react";
import { BaseTriggerNode  } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { GoogleFormTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { fetchGoogleFormTriggerRealtimeToken } from "./action";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";

type GoogleFormNodeData = {
    workflowId: string;
};

type GoogleFormTriggerNodeType = Node<GoogleFormNodeData>;

export const GoogleFormTrigger = memo((props:NodeProps<GoogleFormTriggerNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
     const channel = useMemo(()=>{
            return googleFormTriggerChannel({
            workflowId:props.data.workflowId
        })
        },[props.data.workflowId]);
    
        const refreshToken =  useCallback(()=>{
            return fetchGoogleFormTriggerRealtimeToken(props.data.workflowId)
        },[props.data.workflowId]);
    const nodeStatus = useNodeStatus({
        nodeId:props.id,
        channel,
        refreshToken,
    });
    

    const handleOpenSettings = () => setDialogOpen(true);

    return (
        <>
            <GoogleFormTriggerDialog 
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
            <BaseTriggerNode 
                {...props}
                icon="/logos/googleform.svg"
                name="Google Form"
                description="When form is submitted"
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
});