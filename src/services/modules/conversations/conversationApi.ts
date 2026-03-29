import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '@/src/constants/api';
import {
    Conversation,
    ConversationResponse,
    ConversationsResponse,
    Message,
    MessagesResponse,
    SendMessageRequest,
    SendMessageResponse,
    CreateConversationResponse,
} from './conversationTypes';

export const conversationApi = {
    getAllConversations: async (): Promise<Conversation[]> => {
        // Interceptor extracts data field, so response is already Conversation[]
        const response = await apiClient.get<Conversation[]>(API_ENDPOINTS.CONVERSATIONS.ALL);
        return Array.isArray(response) ? response : [];
    },

    getConversation: async (id: string): Promise<Conversation> => {
        // Interceptor extracts data field, so response is already Conversation
        return await apiClient.get<Conversation>(API_ENDPOINTS.CONVERSATIONS.GET(id));
    },

    createConversation: async (stylistId: string): Promise<Conversation> => {
        if (!stylistId || stylistId === 'undefined') {
            throw new Error('Stylist ID is required to create a conversation');
        }
        // Interceptor extracts data field, so response is already Conversation
        return await apiClient.post<Conversation>(
            `${API_ENDPOINTS.CONVERSATIONS.CREATE}?stylist_id=${stylistId}`
        );
    },

    getMessages: async (conversationId: string): Promise<Message[]> => {
        // Interceptor extracts data field, so response is already Message[]
        // Messages are ordered by most recent first, we'll reverse them in the hook
        const response = await apiClient.get<Message[]>(
            API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId)
        );
        return Array.isArray(response) ? response : [];
    },

    sendMessage: async (
        conversationId: string,
        messageData: SendMessageRequest
    ): Promise<SendMessageResponse['data']> => {
        // Interceptor extracts data field, so response is { user_message, assistant_message, conversation_id }
        return await apiClient.post<SendMessageResponse['data']>(
            API_ENDPOINTS.CONVERSATIONS.SEND_MESSAGE(conversationId),
            messageData
        );
    },
};

