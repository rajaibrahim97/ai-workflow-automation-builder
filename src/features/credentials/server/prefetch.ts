import type { inferInput } from "@trpc/tanstack-react-query";
import {prefetch, trpc} from "@/trpc/server";

type Input = inferInput<typeof trpc.credentials.getMany>;

/**
 * Prefetch all workflows
 */

export const prefetchCredentials = (params: Input) => {
    return prefetch(trpc.credentials.getMany.queryOptions(params))
}

/**
 * Prefetch single workflow
 */

export const prefetchCredential = (id:string) => {
    return prefetch(trpc.credentials.getOne.queryOptions({id}))
};

