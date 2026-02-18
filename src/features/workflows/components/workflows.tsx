"use client"
import { EntityContainer, EntityHeader } from "@/components/entity-components";
import { useSuspenseWorkflows,useCreatedWorkflow } from "../hooks/use-workflows"
import { Children } from "react";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";

export const WorkFlowsList = () => {
    const workflows = useSuspenseWorkflows();

    return (
        <div className="flex-1 flex justify-center items-center">
            <p>
                {JSON.stringify(workflows.data, null, 2)}
            </p>
        </div>
    );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
    const createdWorkflow = useCreatedWorkflow();
    const router = useRouter();
    const {handleError, modal} = useUpgradeModal();

    const handleCreate = () => {
        createdWorkflow.mutate(undefined, {
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`);
            },
            onError:(error) => {
                // todo Open Upgrade model
                handleError(error);
            }
        })
    }
    return (
        <>  
            {modal}
            <EntityHeader
                title="Workflows"
                description="Create and manage your workflows"
                onNew={handleCreate}
                newButtonLabel="New workflow"
                isCreating={createdWorkflow.isPending}
                disabled={disabled}
            />
            <button onClick={handleCreate}>
            Test Create
            </button>
        </>
    );
};

export const WorkflowContainer = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <EntityContainer
            header={<WorkflowsHeader />}
            search={<></>}
            pagination={<></>}
        >
            {children}
        </EntityContainer>
    )
}