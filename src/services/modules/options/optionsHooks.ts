import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../queryClient';
import { optionsApi } from './optionsApi';
import type { QuestionnaireResponse } from './questionnaireTypes';

export const useQuestionnaireOptions = (
    enabled: boolean = true,
    gender?: 'female' | 'male'
) => {
    return useQuery({
        queryKey: queryKeys.options.questionnaire(gender),
        queryFn: async (): Promise<QuestionnaireResponse> => {
            return await optionsApi.getQuestionnaire(gender);
        },
        enabled,
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });
};

export const useOccasions = () => {
    return useQuery({
        queryKey: queryKeys.options.occasions(),
        queryFn: async () => {
            const response = await optionsApi.getOccasions();
            return Array.isArray(response) ? response : [];
        },
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });
};

export const useOccupations = () => {
    return useQuery({
        queryKey: queryKeys.options.occupations(),
        queryFn: async () => {
            const response = await optionsApi.getOccupations();
            return Array.isArray(response) ? response : [];
        },
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });
};

