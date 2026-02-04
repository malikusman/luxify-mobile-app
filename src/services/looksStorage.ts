import AsyncStorage from '@react-native-async-storage/async-storage';
import { Look } from '@/src/types/look';

const KEY_PREFIX = 'looks';

function getKey(userId: string, conversationId: string, messageId: string): string {
    return `${KEY_PREFIX}:${userId}:${conversationId}:${messageId}`;
}

/**
 * Get persisted looks for a message. Returns null if not found or invalid.
 */
export async function getLooks(
    userId: string,
    conversationId: string,
    messageId: string
): Promise<Look[] | null> {
    if (!userId || !conversationId || !messageId) return null;
    try {
        const key = getKey(userId, conversationId, messageId);
        const raw = await AsyncStorage.getItem(key);
        if (raw == null) return null;
        const parsed = JSON.parse(raw) as Look[];
        return Array.isArray(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

/**
 * Persist looks for a message. Overwrites any existing value.
 */
export async function setLooks(
    userId: string,
    conversationId: string,
    messageId: string,
    looks: Look[]
): Promise<void> {
    if (!userId || !conversationId || !messageId) return;
    const key = getKey(userId, conversationId, messageId);
    await AsyncStorage.setItem(key, JSON.stringify(looks));
}
