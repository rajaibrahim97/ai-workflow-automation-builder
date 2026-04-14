import { Node, NodeProps } from "@xyflow/react";
import { memo, useCallback, useMemo, useState } from "react";
import { BaseTriggerNode  } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import { fetchManualTriggerWorkflowToken } from "./action";

type ManualTriggerNodeData = {
    workflowId: string;
};

type ManualTriggerNodeType = Node<ManualTriggerNodeData>;

export const GoogleFormTrigger = memo((props:NodeProps<ManualTriggerNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
     const channel = useMemo(()=>{
            return manualTriggerChannel({
            workflowId:props.data.workflowId
        })
        },[props.data.workflowId]);
    
        const refreshToken =  useCallback(()=>{
            return fetchManualTriggerWorkflowToken(props.data.workflowId)
        },[props.data.workflowId]);
    // const nodeStatus = useNodeStatus({
    //     nodeId:props.id,
    //     channel,
    //     refreshToken,
    // });
    const nodeStatus = "initial"

    const handleOpenSettings = () => setDialogOpen(true);

    return (
        <>
            <ManualTriggerDialog 
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
            <BaseTriggerNode 
                {...props}
                icon="/logos/googleform.svg"
                name="When form is submitted"
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
});