import { Node, NodeProps } from "@xyflow/react";
import { memo, useCallback, useMemo, useState } from "react";
import { BaseTriggerNode  } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";
import { fetchStripeTriggerRealtimeToken } from "./action";
import { StripeTriggerDialog } from "./dialog";

type StripeNodeData = {
    workflowId: string;
};

type GoogleFormTriggerNodeType = Node<StripeNodeData>;

export const StripeTriggerNode = memo((props:NodeProps<GoogleFormTriggerNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
     const channel = useMemo(()=>{
            return stripeTriggerChannel({
            workflowId:props.data.workflowId
        })
        },[props.data.workflowId]);
    
        const refreshToken =  useCallback(()=>{
            return fetchStripeTriggerRealtimeToken(props.data.workflowId)
        },[props.data.workflowId]);
    const nodeStatus = useNodeStatus({
        nodeId:props.id,
        channel,
        refreshToken,
    });
    
    

    const handleOpenSettings = () => setDialogOpen(true);

    return (
        <>
            <StripeTriggerDialog 
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
            <BaseTriggerNode 
                {...props}
                icon="/logos/stripe.svg"
                name="Stripe"
                description="When stripe event is captured"
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
});