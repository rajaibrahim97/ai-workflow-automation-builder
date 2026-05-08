import type { inferInput } from "@trpc/tanstack-react-query";
import {prefetch, trpc} from "@/trpc/server";

type Input = inferInput<typeof trpc.credentials.getMany>;

/**
 * Prefetch all executions
 */

export const prefetchExecutions = (params: Input) => {
    return prefetch(trpc.executions.getMany.queryOptions(params))
}

/**
 * Prefetch single execution
 */

export const prefetchExecution = (id:string) => {
    return prefetch(trpc.executions.getOne.queryOptions({id}))
};

