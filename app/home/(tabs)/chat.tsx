import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import CustomTabBar from '@/src/components/home/CustomTabBar';
import { useConversations, useMessages } from '@/src/services';
import { Conversation } from '@/src/services/modules/conversations/conversationTypes';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/services/queryClient';

export default function ChatScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const { data: conversations, isLoading, error } = useConversations();
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();

    // Filter conversations based on search query
    const filteredConversations = conversations?.filter(conv =>
        conv.stylist.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else if (diffInHours < 168) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const handleConversationPress = (conversationId: string) => {
        router.push({
            pathname: '/home/AIChat',
            params: { conversationId },
        } as any);
    };

    // Get last message for a conversation from cache
    const getLastMessage = (conversation: Conversation): string => {
        const messages = queryClient.getQueryData<any[]>(
            queryKeys.conversations.messages(conversation.id)
        );
        if (messages && messages.length > 0) {
            // Messages are in reverse order (oldest first), so get the last one
            const lastMsg = messages[messages.length - 1];
            return lastMsg.content || "Tap to view conversation";
        }
        return "Tap to view conversation";
    };

    // Get unread count (placeholder for now - API might not support this yet)
    const getUnreadCount = (conversation: Conversation): number => {
        // Placeholder - in the future, this might come from the API
        // For now, we can calculate based on messages if needed
        return 0;
    };

    const renderConversationItem = ({ item }: { item: Conversation }) => {
        const avatarSource = item.stylist.avatar_url 
            ? { uri: item.stylist.avatar_url }
            : require('@/assets/ava.png');
        
        const lastMessage = getLastMessage(item);
        const unreadCount = getUnreadCount(item);
        const isRead = unreadCount === 0;

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => handleConversationPress(item.id)}
                activeOpacity={0.7}
            >
                <Image
                    source={avatarSource}
                    style={styles.avatar}
                    resizeMode="cover"
                />
                <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                        <Text style={[styles.stylistName, { color: colors.text }]} numberOfLines={1}>
                            {item.stylist.name}
                        </Text>
                        <View style={styles.rightSection}>
                            {unreadCount > 0 && (
                                <View style={[styles.unreadBadge, { backgroundColor: colors.text }]}>
                                    <Text style={[styles.unreadCount, { color: colors.background }]}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                            {isRead && (
                                <Ionicons 
                                    name="checkmark-done" 
                                    size={scaleFontSize(16)} 
                                    color={colors.buttonPrimary} 
                                    style={styles.readIndicator}
                                />
                            )}
                            {item.last_message_at && (
                                <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                                    {formatDate(item.last_message_at)}
                                </Text>
                            )}
                        </View>
                    </View>
                    <Text 
                        style={[styles.lastMessage, { color: colors.textSecondary }]} 
                        numberOfLines={1}
                    >
                        {lastMessage}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => {
        if (isLoading) {
            return (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color={colors.text} />
                    <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                        Loading conversations...
                    </Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                        Failed to load conversations
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyState}>
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                    No conversations yet
                </Text>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    Start chatting with your stylist from the AI Chat screen
                </Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: scaleFontSize(40) + insets.top }]}>
                <Text style={[styles.title, { color: colors.text }]}>All Chats</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Your styling conversations, all in one place.{'\n'}Pick up right where you left off.
                </Text>
            </View>
            
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
                    <Ionicons 
                        name="search" 
                        size={scaleFontSize(20)} 
                        color={colors.textSecondary} 
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search"
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <FlatList
                data={filteredConversations}
                renderItem={renderConversationItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.listContent,
                    (!filteredConversations || filteredConversations.length === 0) && styles.emptyListContent,
                ]}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
            />
            <CustomTabBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: scaleFontSize(24),
        paddingTop: scaleFontSize(40),
        paddingBottom: scaleFontSize(16),
        alignItems: 'center',
    },
    title: {
        fontSize: scaleFontSize(32),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(8),
    },
    subtitle: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        lineHeight: scaleFontSize(20),
        textAlign: 'center',
    },
    searchContainer: {
        paddingHorizontal: scaleFontSize(24),
        paddingBottom: scaleFontSize(16),
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: scaleFontSize(12),
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(12),
        borderWidth: 1,
        borderColor: '#E3E5E5',
    },
    searchIcon: {
        marginRight: scaleFontSize(12),
    },
    searchInput: {
        flex: 1,
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
    },
    listContent: {
        paddingBottom: scaleFontSize(100),
    },
    emptyListContent: {
        flex: 1,
        justifyContent: 'center',
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(24),
        paddingVertical: scaleFontSize(16),
    },
    avatar: {
        width: scaleFontSize(56),
        height: scaleFontSize(56),
        borderRadius: scaleFontSize(28),
        marginRight: scaleFontSize(16),
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scaleFontSize(4),
    },
    stylistName: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
        flex: 1,
        marginRight: scaleFontSize(8),
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleFontSize(8),
    },
    unreadBadge: {
        minWidth: scaleFontSize(20),
        height: scaleFontSize(20),
        borderRadius: scaleFontSize(10),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(6),
    },
    unreadCount: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
    },
    readIndicator: {
        marginRight: scaleFontSize(4),
    },
    timestamp: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
    },
    lastMessage: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        lineHeight: scaleFontSize(20),
    },
    separator: {
        height: 1,
        marginLeft: scaleFontSize(88), // Align with content (avatar + margin)
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(24),
    },
    emptyStateTitle: {
        fontSize: scaleFontSize(20),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
        marginBottom: scaleFontSize(8),
    },
    emptyStateText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
});
