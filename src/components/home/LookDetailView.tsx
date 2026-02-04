import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import ArrowLeftIcon from '@/src/components/icons/ArrowLeftIcon';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/src/services/modules/conversations/conversationTypes';
import { Look } from '@/src/types/look';

interface LookDetailViewProps {
    look: Look;
    onClose: () => void;
    onBack: () => void;
}

export default function LookDetailView({ look, onClose, onBack }: LookDetailViewProps) {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    const handleProductPress = async (product: Product) => {
        if (product.product_url) {
            try {
                const canOpen = await Linking.canOpenURL(product.product_url);
                if (canOpen) {
                    await Linking.openURL(product.product_url);
                }
            } catch (error) {
                console.error('Error opening product URL:', error);
            }
        }
    };

    const renderProductItem = (product: Product, index: number) => {
        // Don't show Buy Item button for wardrobe items (product_url is null)
        const isWardrobeItem = product.product_url === null;
        
        return (
            <TouchableOpacity
                key={product.id}
                style={[styles.productItem, { backgroundColor: colors.card }]}
                onPress={() => !isWardrobeItem && handleProductPress(product)}
                activeOpacity={isWardrobeItem ? 1 : 0.7}
                disabled={isWardrobeItem}
            >
                <Image
                    source={{ uri: product.image_url }}
                    style={styles.productItemImage}
                    resizeMode="cover"
                />
                <View style={styles.productItemInfo}>
                    {product.brand && (
                        <Text style={[styles.productItemBrand, { color: colors.textSecondary }]} numberOfLines={1}>
                            {product.brand}
                        </Text>
                    )}
                    <Text style={[styles.productItemTitle, { color: colors.text }]} numberOfLines={2}>
                        {product.title}
                    </Text>
                    <Text style={[styles.productItemPrice, { color: colors.text }]}>
                        {product.price}
                    </Text>
                    {/* Only show Buy Item button if product_url exists (not a wardrobe item) */}
                    {!isWardrobeItem && (
                        <TouchableOpacity
                            style={[styles.buyItemButtonDetail, { backgroundColor: colors.buttonPrimary }]}
                            onPress={() => handleProductPress(product)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.buyItemButtonTextDetail, { color: colors.buttonText }]}>
                                BUY ITEM
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderHorizontalProductCard = (product: Product) => {
        // Don't show Buy Item button for wardrobe items (product_url is null)
        const isWardrobeItem = product.product_url === null;
        return (
            <TouchableOpacity
                key={product.id}
                style={[styles.horizontalCard, { backgroundColor: colors.card }]}
                onPress={() => !isWardrobeItem && handleProductPress(product)}
                activeOpacity={isWardrobeItem ? 1 : 0.7}
                disabled={isWardrobeItem}
            >
                <Image source={{ uri: product.image_url }} style={styles.horizontalCardImage} resizeMode="cover" />
                <View style={styles.horizontalCardInfo}>
                    <Text style={[styles.horizontalCardTitle, { color: colors.text }]} numberOfLines={2}>
                        {product.title}
                    </Text>
                    <Text style={[styles.horizontalCardPrice, { color: colors.textSecondary }]} numberOfLines={1}>
                        {product.price}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const isWardrobeLook = look.products?.[0]?.product_url === null;
    const hasGroups = isWardrobeLook && Array.isArray(look.productGroups) && look.productGroups.length > 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.statusBarBackground, { height: insets.top }]} />
            
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                    activeOpacity={0.7}
                >
                    <View style={styles.backButtonBackground}>
                        <ArrowLeftIcon size={scaleFontSize(12)} color="#A6A6A6" />
                    </View>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    ITEMS IN THIS LOOK
                </Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {look.lightXImageUrl && (
                    <View style={styles.mainImageContainer}>
                        <Image
                            source={{ uri: look.lightXImageUrl }}
                            style={styles.mainImage}
                            resizeMode="cover"
                        />
                    </View>
                )}

                {look.products.length > 0 && (
                    <View style={styles.productsSection}>
                        {/* Wardrobe + grouped online-products case */}
                        {hasGroups ? (
                            <>
                                {/* Show wardrobe item as the main item */}
                                {renderProductItem(look.products[0], 0)}

                                {/* Render each group as a separate horizontal row */}
                                {look.productGroups!.map((group, groupIndex) => (
                                    <View key={`group-${groupIndex}`} style={styles.groupSection}>
                                        <Text style={[styles.groupTitle, { color: colors.text }]} numberOfLines={1}>
                                            {look.groupTitles?.[groupIndex] ?? `Option ${groupIndex + 1}`}
                                        </Text>
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.groupRow}
                                        >
                                            {group.map(renderHorizontalProductCard)}
                                        </ScrollView>
                                    </View>
                                ))}
                            </>
                        ) : (
                            /* Default behavior: render all products vertically */
                            look.products.map((product, index) => renderProductItem(product, index))
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statusBarBackground: {
        width: '100%',
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(20),
        paddingTop: scaleFontSize(12),
        paddingBottom: scaleFontSize(16),
    },
    backButton: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonBackground: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: scaleFontSize(32),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: scaleFontSize(100),
    },
    mainImageContainer: {
        width: '100%',
        aspectRatio: 3 / 4,
        marginBottom: scaleFontSize(24),
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    productsSection: {
        paddingHorizontal: scaleFontSize(20),
    },
    groupSection: {
        marginTop: scaleFontSize(16),
    },
    groupTitle: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
        marginBottom: scaleFontSize(10),
    },
    groupRow: {
        gap: scaleFontSize(12),
        paddingRight: scaleFontSize(20),
    },
    horizontalCard: {
        width: scaleFontSize(160),
        borderRadius: scaleFontSize(12),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    horizontalCardImage: {
        width: '100%',
        height: scaleFontSize(120),
        backgroundColor: '#f0f0f0',
    },
    horizontalCardInfo: {
        padding: scaleFontSize(10),
    },
    horizontalCardTitle: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoMedium,
        fontWeight: '600',
        lineHeight: scaleFontSize(16),
        marginBottom: scaleFontSize(6),
    },
    horizontalCardPrice: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
    },
    productItem: {
        flexDirection: 'row',
        marginBottom: scaleFontSize(16),
        borderRadius: scaleFontSize(12),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productItemImage: {
        width: scaleFontSize(120),
        height: scaleFontSize(120),
        backgroundColor: '#f0f0f0',
    },
    productItemInfo: {
        flex: 1,
        padding: scaleFontSize(12),
        justifyContent: 'space-between',
    },
    productItemBrand: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(4),
    },
    productItemTitle: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
        fontWeight: '600',
        marginBottom: scaleFontSize(4),
        lineHeight: scaleFontSize(18),
    },
    productItemPrice: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
        marginBottom: scaleFontSize(8),
    },
    buyItemButtonDetail: {
        paddingVertical: scaleFontSize(10),
        paddingHorizontal: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        alignSelf: 'flex-start',
    },
    buyItemButtonTextDetail: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
    },
});

