import { CredentialView } from "@/features/credentials/components/credential";
import { CredentialItem, CredentialsError, CredentialsList, CredentialsLoading } from "@/features/credentials/components/credentials";
import { ExecutionsContainer, ExecutionsError, ExecutionsList, ExecutionsLoading } from "@/features/executions/components/executions";
import { executionsParamsLoader } from "@/features/executions/server/params-loader";
import { prefetchExecutions } from "@/features/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils"
import { HydrateClient, prefetch } from "@/trpc/server";
import { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
    searchParams: Promise<SearchParams>
}

const Page = async ({ searchParams }: Props) => {
    await requireAuth()

    const params = await executionsParamsLoader(searchParams);
    prefetchExecutions(params);
    return (
        <ExecutionsContainer>
            <HydrateClient>
                <ErrorBoundary fallback={<ExecutionsError/>}>
                    <Suspense fallback={<ExecutionsLoading/>}>
                        <ExecutionsList/>
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>
        </ExecutionsContainer>
    )
}

export default Page