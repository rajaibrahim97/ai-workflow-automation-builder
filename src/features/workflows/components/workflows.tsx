"use client"
import { EntityContainer, EntityHeader, EntityPagination, EntitySearch } from "@/components/entity-components";
import { useSuspenseWorkflows,useCreatedWorkflow } from "../hooks/use-workflows"
import { Children } from "react";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { Search } from "lucide-react";

export const WorkflowsSearch = () => {
    const [params,setParams] = useWorkflowsParams();
    const {searchValue, onSearchChange} = useEntitySearch({
        params,
        setParams,
    });

    return (
        <EntitySearch 
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search workflows"
        />
    )
};

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

export const WorkflowsPaginationn = () => {
    const workflows = useSuspenseWorkflows();

    const [params,setParams] = useWorkflowsParams();

    return (
        <EntityPagination 
            disabled={workflows.isFetching}
            totalPages={workflows.data.totalPages}
            page={workflows.data.page}
            onPageChange={(page)=> setParams({...params,page})}
        />
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
            search={<WorkflowsSearch/>}
            pagination={<></>}
        >
            {children}
        </EntityContainer>
    );
};