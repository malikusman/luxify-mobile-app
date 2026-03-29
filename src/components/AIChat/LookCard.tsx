import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import { Look } from '@/src/types/look';
import { Product } from '@/src/services/modules/conversations/conversationTypes';

interface LookCardProps {
    look: Look;
    isGenerating: boolean;
    /** When false, do not show try-on area (Preparing/Generating/Image); show only product list. Used when is_clothing is false. */
    showTryOnArea?: boolean;
    onPress: () => void;
    onBookmarkPress?: (look: Look) => void;
    /** Called when user taps Try again after a generation error. */
    onRetry?: () => void;
}

/**
 * Products to show in the right-side vertical list (Option 1 group, like detail page / ItemDetail).
 * - Wardrobe + productGroups: show Option 1 = productGroups[0] (one belt, one shoe, one bag, etc. —
 *   one product per category). Each productGroups[i] is already “Option i+1” with one item per type.
 * - Otherwise: look.products, capped at 3.
 */
function getRightSideProducts(look: Look): Product[] {
    if (look.productGroups && look.productGroups.length > 0) {
        const option1 = look.productGroups[0];
        return Array.isArray(option1) ? option1.filter((p): p is Product => p != null) : [];
    }
    return (look.products || []).slice(0, 3);
}

export default function LookCard({ look, isGenerating, showTryOnArea = true, onPress, onBookmarkPress, onRetry }: LookCardProps) {
    const colors = useThemeColors();
    const hasLightXImage = !!look.lightXImageUrl;
    const hasError = !!look.lightXError;
    const hasBuyableProducts = look.products.some(
        (p) => p.product_url !== null && p.product_url !== undefined
    );
    const hasProductGroups = !!(look.productGroups && look.productGroups.length > 0);
    const showBuyButton = hasBuyableProducts || hasProductGroups;
    const rightSideProducts = getRightSideProducts(look);

    const rightListHeight =
        rightSideProducts.length > 0
            ? rightSideProducts.length * RIGHT_THUMB_SIZE +
              (rightSideProducts.length - 1) * RIGHT_GAP
            : 0;
    const imageHeight =
        rightListHeight > 0
            ? Math.max(CARD_IMAGE_MIN_HEIGHT, rightListHeight)
            : CARD_IMAGE_MIN_HEIGHT;
    const imageContainerStyle =
        rightSideProducts.length > 0
            ? [styles.imageContainer, { height: imageHeight }]
            : [styles.imageContainer, styles.imageContainerAspect];

    const renderMainArea = () => {
        if (!showTryOnArea) return null;
        if (isGenerating || !hasLightXImage) {
            return (
                <View style={[imageContainerStyle, { backgroundColor: colors.card }]}>
                    {isGenerating ? (
                        <View style={styles.placeholder}>
                            <ActivityIndicator size="small" color={colors.textSecondary} />
                            <Text style={[styles.generatingText, { color: colors.textSecondary }]}>
                                Generating...
                            </Text>
                        </View>
                    ) : hasError ? (
                        <View style={styles.placeholder}>
                            <Ionicons name="alert-circle" size={scaleFontSize(24)} color="#FF6B6B" />
                            <Text style={[styles.errorText, { color: '#FF6B6B' }]} numberOfLines={3}>
                                {look.lightXError}
                            </Text>
                            {onRetry && (
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={onRetry}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.retryButtonText}>Try again</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View style={styles.placeholder}>
                            <Text style={[styles.generatingText, { color: colors.textSecondary }]}>
                                Preparing...
                            </Text>
                        </View>
                    )}
                </View>
            );
        }
        return (
            <TouchableOpacity
                style={[imageContainerStyle, { backgroundColor: colors.card }]}
                onPress={onPress}
                activeOpacity={0.9}
            >
                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri: look.lightXImageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
                {showBuyButton && (
                    <TouchableOpacity
                        style={styles.buyButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            onPress();
                        }}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buyButtonText}>BUY ITEM</Text>
                    </TouchableOpacity>
                )}
                {onBookmarkPress && (
                    <TouchableOpacity
                        style={styles.bookmarkButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            onBookmarkPress(look);
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="bookmark-outline" size={scaleFontSize(22)} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
                {renderMainArea()}
                {rightSideProducts.length > 0 && (
                    <View style={styles.rightList}>
                        {rightSideProducts.map((product) => (
                            <TouchableOpacity
                                key={product.id}
                                style={styles.productThumbShadow}
                                onPress={onPress}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.productThumb, { backgroundColor: '#FFFFFF' }]}>
                                    <Image
                                        source={{ uri: product.image_url }}
                                        style={styles.productThumbImage}
                                        resizeMode="cover"
                                    />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

const CARD_IMAGE_WIDTH = scaleFontSize(200);
const CARD_IMAGE_ASPECT = 3 / 4;
const CARD_IMAGE_MIN_HEIGHT = CARD_IMAGE_WIDTH / CARD_IMAGE_ASPECT;
const RIGHT_THUMB_SIZE = scaleFontSize(72);
const RIGHT_GAP = scaleFontSize(8);

const styles = StyleSheet.create({
    container: {
        marginRight: scaleFontSize(12),
        borderRadius: scaleFontSize(12),
        overflow: 'hidden',
        padding: scaleFontSize(4),
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    imageContainer: {
        width: CARD_IMAGE_WIDTH,
        borderRadius: scaleFontSize(10),
        overflow: 'hidden',
        position: 'relative',
    },
    imageContainerAspect: {
        aspectRatio: CARD_IMAGE_ASPECT,
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
        borderRadius: scaleFontSize(8),
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    generatingText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(12),
        textAlign: 'center',
        paddingHorizontal: scaleFontSize(8),
    },
    errorText: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(8),
        textAlign: 'center',
        paddingHorizontal: scaleFontSize(12),
    },
    retryButton: {
        marginTop: scaleFontSize(12),
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(10),
        backgroundColor: '#FF6B6B',
        borderRadius: scaleFontSize(8),
    },
    retryButtonText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    buyButton: {
        position: 'absolute',
        bottom: scaleFontSize(12),
        left: scaleFontSize(12),
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(10),
        borderRadius: scaleFontSize(8),
    },
    buyButtonText: {
        color: '#FFFFFF',
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
    },
    bookmarkButton: {
        position: 'absolute',
        bottom: scaleFontSize(12),
        right: scaleFontSize(12),
        width: scaleFontSize(36),
        height: scaleFontSize(36),
        borderRadius: scaleFontSize(18),
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightList: {
        marginLeft: RIGHT_GAP,
        gap: RIGHT_GAP,
        justifyContent: 'flex-start',
    },
    productThumbShadow: {
        width: RIGHT_THUMB_SIZE,
        height: RIGHT_THUMB_SIZE,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
        elevation: 4,
    },
    productThumb: {
        width: '100%',
        height: '100%',
        borderRadius: scaleFontSize(10),
        overflow: 'hidden',
    },
    productThumbImage: {
        width: '100%',
        height: '100%',
    },
});
