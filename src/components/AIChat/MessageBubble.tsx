import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import { Message, Product } from '@/src/services/modules/conversations/conversationTypes';
import { Look } from '@/src/types/look';
import AudioMessagePlayer from './AudioMessagePlayer';
import LookCard from './LookCard';

export interface MessageBubbleProps {
    message: Message;
    isUser: boolean;
    avatarSource: ImageSourcePropType;
    looks: Look[];
    lookIndicesWithTryOn: Set<number>;
    generatingLightXImages: Set<string>;
    isPlaying: boolean;
    playbackPosition: number;
    messageDuration: number;
    onPlayAudio: () => void;
    onStopAudio: () => void;
    onLookPress: (messageId: string, lookIndex: number, look: Look) => void;
    onBookmarkLook?: (look: Look) => void;
    formatDuration: (seconds: number) => string;
}

const PRODUCT_TILE_SIZE = scaleFontSize(140);

export default function MessageBubble({
    message,
    isUser,
    avatarSource,
    looks,
    lookIndicesWithTryOn,
    generatingLightXImages,
    isPlaying,
    playbackPosition,
    messageDuration,
    onPlayAudio,
    onStopAudio,
    onLookPress,
    onBookmarkLook,
    formatDuration,
}: MessageBubbleProps) {
    const colors = useThemeColors();
    const isLoading = message.id.startsWith('loading-');
    const isVoiceMessage = message.message_type === 'voice' && message.audio_url;
    const hasLooks = looks.length > 0;
    const hasAnyTryOn = lookIndicesWithTryOn.size > 0;

    const renderLooksSection = () => {
        if (!hasLooks) return null;
        if (!hasAnyTryOn) {
            // All products are non-clothing (e.g. shoes): show product tiles only, no try-on / Preparing section
            const items: { product: Product; lookIndex: number; look: Look }[] = [];
            looks.forEach((look, lookIndex) => {
                (look.products || []).slice(0, 5).forEach((p) => items.push({ product: p, lookIndex, look }));
            });
            if (items.length === 0) return null;
            return (
                <View style={styles.messageLooksSection}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.looksScrollContainer}
                        style={styles.looksScrollView}
                    >
                        {items.map(({ product, lookIndex, look }, idx) => (
                            <TouchableOpacity
                                key={`${product.id}-${idx}`}
                                style={styles.productTile}
                                onPress={() => onLookPress(message.id, lookIndex, look)}
                                activeOpacity={0.8}
                            >
                                <Image
                                    source={{ uri: product.image_url }}
                                    style={styles.productTileImage}
                                    resizeMode="cover"
                                />
                                <Text style={[styles.productTileTitle, { color: colors.text }]} numberOfLines={2}>
                                    {product.title}
                                </Text>
                                {product.price && (
                                    <Text style={[styles.productTilePrice, { color: colors.textSecondary }]} numberOfLines={1}>
                                        {product.price}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            );
        }
        return (
            <View style={styles.messageLooksSection}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.looksScrollContainer}
                    style={styles.looksScrollView}
                >
                    {looks.map((look, lookIndex) => {
                        const lookKey = `${message.id}-${lookIndex}`;
                        const isGenerating = generatingLightXImages.has(lookKey);
                        const showTryOnArea = lookIndicesWithTryOn.has(lookIndex);
                        return (
                            <LookCard
                                key={lookIndex}
                                look={look}
                                isGenerating={isGenerating}
                                showTryOnArea={showTryOnArea}
                                onPress={() => onLookPress(message.id, lookIndex, look)}
                                onBookmarkPress={onBookmarkLook}
                            />
                        );
                    })}
                </ScrollView>
            </View>
        );
    };

    return (
        <View>
            <View
                style={[
                    styles.messageContainer,
                    isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
                ]}
            >
                {!isUser && (
                    <Image
                        source={avatarSource}
                        style={styles.messageAvatar}
                        resizeMode="cover"
                    />
                )}
                <View
                    style={[
                        styles.messageBubble,
                        isUser
                            ? { backgroundColor: colors.buttonPrimary }
                            : { backgroundColor: colors.card },
                        isVoiceMessage && styles.audioMessageBubble,
                    ]}
                >
                    {isLoading ? (
                        <View style={styles.loadingMessageContainer}>
                            <ActivityIndicator size="small" color={colors.textSecondary} />
                            <Text
                                style={[
                                    styles.messageText,
                                    { color: colors.textSecondary, marginLeft: scaleFontSize(8) },
                                ]}
                            >
                                {message.content}
                            </Text>
                        </View>
                    ) : isVoiceMessage ? (
                        <AudioMessagePlayer
                            isUser={isUser}
                            isPlaying={isPlaying}
                            playbackPosition={playbackPosition}
                            duration={messageDuration}
                            onPlay={onPlayAudio}
                            onStop={onStopAudio}
                            formatDuration={formatDuration}
                        />
                    ) : (
                        <Text
                            style={[
                                styles.messageText,
                                { color: isUser ? colors.buttonText : colors.text },
                            ]}
                        >
                            {message.content}
                        </Text>
                    )}
                </View>
            </View>
            
            {renderLooksSection()}
        </View>
    );
}

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: 'row',
        marginBottom: scaleFontSize(16),
        alignItems: 'flex-end',
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
    },
    assistantMessageContainer: {
        justifyContent: 'flex-start',
    },
    messageAvatar: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        marginRight: scaleFontSize(8),
    },
    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(12),
        borderRadius: scaleFontSize(16),
    },
    messageText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        lineHeight: scaleFontSize(20),
    },
    loadingMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    audioMessageBubble: {
        paddingHorizontal: scaleFontSize(12),
        paddingVertical: scaleFontSize(10),
        minWidth: scaleFontSize(200),
    },
    messageLooksSection: {
        marginTop: scaleFontSize(12),
        marginBottom: scaleFontSize(16),
    },
    looksScrollView: {
        marginHorizontal: scaleFontSize(-20),
    },
    looksScrollContainer: {
        paddingHorizontal: scaleFontSize(20),
        paddingRight: scaleFontSize(32),
    },
    productTile: {
        width: PRODUCT_TILE_SIZE,
        marginRight: scaleFontSize(14),
        backgroundColor: '#f5f5f5',
        borderRadius: scaleFontSize(12),
        overflow: 'hidden',
    },
    productTileImage: {
        width: '100%',
        height: PRODUCT_TILE_SIZE,
        backgroundColor: '#eee',
    },
    productTileTitle: {
        fontSize: scaleFontSize(13),
        fontFamily: FONTS.nunitoRegular,
        paddingHorizontal: scaleFontSize(8),
        paddingTop: scaleFontSize(8),
        paddingBottom: scaleFontSize(4),
    },
    productTilePrice: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        paddingHorizontal: scaleFontSize(8),
        paddingBottom: scaleFontSize(10),
    },
});
