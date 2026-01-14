import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/context/store';
import { queryKeys } from '../../queryClient';
import { conversationApi } from './conversationApi';
import { Conversation, Message, SendMessageRequest } from './conversationTypes';
import { toastErrorFromException } from '@/src/utils/toast';

export const useConversations = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated ?? false);
    
    return useQuery({
        queryKey: queryKeys.conversations.list(),
        queryFn: async () => {
            const response = await conversationApi.getAllConversations();
            return Array.isArray(response) ? response : [];
        },
        enabled: isAuthenticated,
        staleTime: 10 * 60 * 1000, // 10 minutes - data is fresh for 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnMount: false, // Don't refetch on mount if data is fresh (respects staleTime)
        refetchOnReconnect: true, // Background refetch when network reconnects
    });
};

export const useConversation = (id: string | null) => {
    const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated ?? false);
    
    return useQuery({
        queryKey: queryKeys.conversations.detail(id!),
        queryFn: () => conversationApi.getConversation(id!),
        enabled: isAuthenticated && !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes - data is fresh for 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
        refetchOnMount: false, // Don't refetch on mount if data is fresh
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnReconnect: true, // Background refetch when network reconnects
    });
};

export const useMessages = (conversationId: string | null, options?: { enabled?: boolean }) => {
    const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated ?? false);
    const shouldPoll = options?.enabled !== false;
    
    return useQuery({
        queryKey: queryKeys.conversations.messages(conversationId!),
        queryFn: async () => {
            if (!conversationId) return [];
            const messages = await conversationApi.getMessages(conversationId);
            // Reverse to show oldest first
            const reversed = Array.isArray(messages) ? [...messages].reverse() : [];
            // Remove duplicates by ID to prevent duplicate messages
            const uniqueMessages = reversed.filter((msg, index, self) => 
                index === self.findIndex(m => m.id === msg.id)
            );
            return uniqueMessages;
        },
        enabled: isAuthenticated && !!conversationId && shouldPoll,
        staleTime: 2 * 60 * 1000, // 2 minutes - messages are fresh for 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
        // Only poll if enabled and use a longer interval to reduce API calls
        // TanStack Query will respect staleTime, so it won't refetch if data is fresh
        refetchInterval: shouldPoll ? 120000 : false, // Poll every 2 minutes (only if stale)
        refetchIntervalInBackground: true, // Allow background polling
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnMount: false, // Don't refetch on mount if data is fresh (respects staleTime)
        refetchOnReconnect: true, // Background refetch when network reconnects
    });
};

export const useCreateConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (stylistId: string) => conversationApi.createConversation(stylistId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() });
        },
        onError: (error) => {
            toastErrorFromException(error);
        },
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ conversationId, messageData }: { conversationId: string; messageData: SendMessageRequest }) =>
            conversationApi.sendMessage(conversationId, messageData),
        onSuccess: (data, variables) => {
            // Component handles all message updates in its onSuccess callback
            // We only need to invalidate the conversations list to update last_message_at
            queryClient.invalidateQueries({ 
                queryKey: queryKeys.conversations.list(),
                refetchType: 'none', // Don't refetch immediately, just mark as stale
            });
        },
        onError: (error, variables) => {
            toastErrorFromException(error);
            // On error, invalidate to refetch correct data
            queryClient.invalidateQueries({ 
                queryKey: queryKeys.conversations.messages(variables.conversationId),
            });
        },
    });
};

