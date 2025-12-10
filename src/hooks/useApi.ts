import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/src/services';

export function useApiQuery<TData = any, TError = any>(
    queryKey: readonly unknown[],
    endpoint: string,
    options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
    return useQuery<TData, TError>({
        queryKey,
        queryFn: () => apiClient.get<TData>(endpoint),
        ...options,
    });
}

export function useApiMutation<TData = any, TVariables = any, TError = any>(
    endpoint: string,
    options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>
) {
    return useMutation<TData, TError, TVariables>({
        mutationFn: (variables: TVariables) => apiClient.post<TData>(endpoint, variables),
        ...options,
    });
}

export function useApiPut<TData = any, TVariables = any, TError = any>(
    endpoint: string,
    options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>
) {
    return useMutation<TData, TError, TVariables>({
        mutationFn: (variables: TVariables) => apiClient.put<TData>(endpoint, variables),
        ...options,
    });
}

export function useApiPatch<TData = any, TVariables = any, TError = any>(
    endpoint: string,
    options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>
) {
    return useMutation<TData, TError, TVariables>({
        mutationFn: (variables: TVariables) => apiClient.patch<TData>(endpoint, variables),
        ...options,
    });
}

export function useApiDelete<TData = any, TError = any>(
    endpoint: string,
    options?: Omit<UseMutationOptions<TData, TError, void>, 'mutationFn'>
) {
    return useMutation<TData, TError, void>({
        mutationFn: () => apiClient.delete<TData>(endpoint),
        ...options,
    });
}

