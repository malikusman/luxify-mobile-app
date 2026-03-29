import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { store, RootState } from '@/src/context/store';
import { setStyleProfile } from '@/src/context/slices/styleProfileSlice';
import { setHasStyleProfile } from '@/src/context/slices/authSlice';
import { queryKeys } from '../../queryClient';
import { styleProfileApi } from './styleProfileApi';
import { StyleProfile, CreateStyleProfileRequest, UpdateStyleProfileRequest } from './styleProfileTypes';
import { toastErrorFromException } from '@/src/utils/toast';

export const useStyleProfile = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated ?? false);
    
    const queryResult = useQuery({
        queryKey: queryKeys.styleProfile.get(),
        queryFn: styleProfileApi.getStyleProfile,
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (queryResult.data) {
            store.dispatch(setStyleProfile(queryResult.data));
        }
    }, [queryResult.data]);

    return queryResult;
};

export const useStyleProfileSelector = (): StyleProfile | null => {
    return useSelector((state: RootState) => state.styleProfile?.data ?? null);
};

export const useCreateStyleProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateStyleProfileRequest) => styleProfileApi.createStyleProfile(data),
        onSuccess: (response) => {
            if (response.data) {
                store.dispatch(setStyleProfile(response.data));
                // Update has_style_profile to true when style profile is created
                store.dispatch(setHasStyleProfile(true));
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.styleProfile.get() });
            // Also invalidate user profile to refresh has_style_profile from server
            queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
        },
        onError: (error) => {
            toastErrorFromException(error);
        },
    });
};

export const useUpdateStyleProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateStyleProfileRequest) => styleProfileApi.updateStyleProfile(data),
        onSuccess: (response) => {
            if (response.data) {
                store.dispatch(setStyleProfile(response.data));
                // Ensure has_style_profile is true when style profile is updated
                store.dispatch(setHasStyleProfile(true));
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.styleProfile.get() });
            // Also invalidate user profile to refresh has_style_profile from server
            queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
        },
        onError: (error) => {
            toastErrorFromException(error);
        },
    });
};

