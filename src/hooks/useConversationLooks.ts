import { useState, useCallback } from 'react';
import { Look } from '@/src/types/look';
import * as looksStorage from '@/src/services/looksStorage';

/**
 * In-memory looks by messageId, synced with AsyncStorage (keyed by userId + conversationId).
 * Use this hook instead of Redux for conversation looks so data persists per user across logout.
 */
export function useConversationLooks(userId: string | null, conversationId: string | null) {
    const [looksByMessageId, setLooksByMessageId] = useState<Record<string, Look[]>>({});

    const persist = useCallback(
        async (messageId: string, looks: Look[]) => {
            if (!userId || !conversationId) return;
            await looksStorage.setLooks(userId, conversationId, messageId, looks);
        },
        [userId, conversationId]
    );

    /** Load looks from AsyncStorage for the given message IDs, merge into state, and return the loaded map. */
    const hydrateForMessages = useCallback(
        async (messageIds: string[]): Promise<Record<string, Look[]>> => {
            if (!userId || !conversationId || messageIds.length === 0) return {};
            const entries: Record<string, Look[]> = {};
            await Promise.all(
                messageIds.map(async (messageId) => {
                    const looks = await looksStorage.getLooks(userId, conversationId, messageId);
                    if (looks != null && looks.length > 0) entries[messageId] = looks;
                })
            );
            if (Object.keys(entries).length > 0) {
                setLooksByMessageId((prev) => ({ ...prev, ...entries }));
            }
            return entries;
        },
        [userId, conversationId]
    );

    const getLooksForMessage = useCallback(
        (messageId: string): Look[] | null => {
            const looks = looksByMessageId[messageId];
            return looks != null && looks.length > 0 ? looks : null;
        },
        [looksByMessageId]
    );

    const setLooks = useCallback(
        async (messageId: string, looks: Look[]) => {
            setLooksByMessageId((prev) => ({ ...prev, [messageId]: looks }));
            await persist(messageId, looks);
        },
        [persist]
    );

    const updateLookLightX = useCallback(
        async (messageId: string, lookIndex: number, lightXImageUrl: string) => {
            setLooksByMessageId((prev) => {
                const list = prev[messageId];
                if (!list || lookIndex < 0 || lookIndex >= list.length) return prev;
                const next = [...list];
                next[lookIndex] = { ...next[lookIndex], lightXImageUrl, lightXError: undefined };
                const nextState = { ...prev, [messageId]: next };
                persist(messageId, next);
                return nextState;
            });
        },
        [persist]
    );

    const updateLookLightXError = useCallback(
        async (messageId: string, lookIndex: number, error: string) => {
            setLooksByMessageId((prev) => {
                const list = prev[messageId];
                if (!list || lookIndex < 0 || lookIndex >= list.length) return prev;
                const next = [...list];
                next[lookIndex] = { ...next[lookIndex], lightXError: error };
                const nextState = { ...prev, [messageId]: next };
                persist(messageId, next);
                return nextState;
            });
        },
        [persist]
    );

    return {
        looksByMessageId,
        hydrateForMessages,
        getLooksForMessage,
        setLooks,
        updateLookLightX,
        updateLookLightXError,
    };
}
