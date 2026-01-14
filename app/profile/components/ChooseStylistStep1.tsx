import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import { CAROUSEL, ANIMATION } from '@/src/constants/constants';
import { useStylists, useSelectStylist, useDeselectStylist, useMyStylist } from '@/src/services/modules/stylists/stylistHooks';
import { Stylist } from '@/src/services/modules/stylists/stylistTypes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * CAROUSEL.CARD_WIDTH_RATIO;
const CARD_SPACING = scaleFontSize(CAROUSEL.CARD_SPACING);
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;
const ITEM_WIDTH = CARD_WIDTH + CARD_SPACING;

interface ChooseStylistStep1Props {
    selectedStylist: Stylist | null;
    onSelectStylist: (stylist: Stylist) => void;
}

export default function ChooseStylistStep1({ selectedStylist, onSelectStylist }: ChooseStylistStep1Props) {
    const colors = useThemeColors();
    const t = translations.onboarding;
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const { data: allStylists = [], isLoading, isError } = useStylists();
    const { data: myStylist } = useMyStylist();
    const selectStylistMutation = useSelectStylist();
    const deselectStylistMutation = useDeselectStylist();

    // Filter to only active stylists
    const stylists = React.useMemo(() => {
        return allStylists.filter((stylist) => stylist.is_active !== false);
    }, [allStylists]);

    // Initialize with my selected stylist if available
    useEffect(() => {
        if (stylists.length > 0 && !isLoading) {
            // Extract stylist from myStylist response (could be direct Stylist or { stylist: Stylist, user_stylist: {...} })
            const selectedStylistData = (myStylist as any)?.stylist || myStylist;
            
            if (selectedStylistData && selectedStylistData.id) {
                const stylistInList = stylists.find(s => s.id === selectedStylistData.id);
                if (stylistInList) {
                    onSelectStylist(stylistInList);
                    // Scroll to the selected stylist
                    const index = stylists.findIndex(s => s.id === selectedStylistData.id);
                    if (index >= 0) {
                        setCurrentIndex(index);
                        // Use a longer timeout to ensure FlatList is fully rendered
                        setTimeout(() => {
                            flatListRef.current?.scrollToOffset({ 
                                offset: index * ITEM_WIDTH, 
                                animated: true 
                            });
                        }, 300);
                    }
                    return;
                }
            }
            
            // If no selected stylist found, select the first stylist by default (at least one required)
            if (!selectedStylist) {
                onSelectStylist(stylists[0]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stylists, myStylist, isLoading]);

    // Sync carousel position with selected stylist
    useEffect(() => {
        if (selectedStylist && stylists.length > 0) {
            const index = stylists.findIndex(s => s.id === selectedStylist.id);
            if (index >= 0 && index !== currentIndex) {
                setCurrentIndex(index);
                flatListRef.current?.scrollToOffset({ offset: index * ITEM_WIDTH, animated: true });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStylist]);

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / ITEM_WIDTH);
        const clampedIndex = Math.max(0, Math.min(index, stylists.length - 1));
        if (clampedIndex !== currentIndex) {
            setCurrentIndex(clampedIndex);
        }
    };

    const handleMomentumScrollEnd = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const scrollPosition = contentOffsetX;
        const index = Math.round(scrollPosition / ITEM_WIDTH);
        const clampedIndex = Math.max(0, Math.min(index, stylists.length - 1));
        if (stylists[clampedIndex]) {
            const targetOffset = clampedIndex * ITEM_WIDTH;
            flatListRef.current?.scrollToOffset({ offset: targetOffset, animated: true });
            // Update selected stylist when user scrolls to a new one
            const newSelectedStylist = stylists[clampedIndex];
            if (newSelectedStylist && newSelectedStylist.id !== selectedStylist?.id) {
                onSelectStylist(newSelectedStylist);
            }
        }
    };

    const handleToggleStylist = async (stylist: Stylist) => {
        const isSelected = selectedStylist?.id === stylist.id;
        
        if (isSelected) {
            // If deselecting the current selection, select the first available stylist instead
            // (at least one stylist must be selected)
            const otherStylist = stylists.find(s => s.id !== stylist.id);
            if (otherStylist) {
                onSelectStylist(otherStylist);
                selectStylistMutation.mutate(otherStylist.id);
                // Scroll to the newly selected stylist
                const index = stylists.findIndex(s => s.id === otherStylist.id);
                if (index >= 0) {
                    setCurrentIndex(index);
                    flatListRef.current?.scrollToOffset({ offset: index * ITEM_WIDTH, animated: true });
                }
            }
        } else {
            // Select the new stylist (replaces previous selection)
            onSelectStylist(stylist);
            selectStylistMutation.mutate(stylist.id);
            // Scroll to the selected stylist
            const index = stylists.findIndex(s => s.id === stylist.id);
            if (index >= 0) {
                setCurrentIndex(index);
                flatListRef.current?.scrollToOffset({ offset: index * ITEM_WIDTH, animated: true });
            }
        }
    };

    const renderStylistCard = ({ item, index }: { item: Stylist; index: number }) => {
        const isFocused = currentIndex === index;
        const distance = Math.abs(index - currentIndex);
        const isSelected = selectedStylist?.id === item.id;
        
        let opacity = 1;
        let scale = 1;
        
        if (distance === 1) {
            opacity = ANIMATION.OPACITY_SIDE_CARD;
            scale = ANIMATION.SCALE_SIDE_CARD;
        } else if (distance > 1) {
            opacity = ANIMATION.OPACITY_DISTANT_CARD;
            scale = ANIMATION.SCALE_DISTANT_CARD;
        }

        // Handle image source - can be URL from API or local require
        const backendUrl = Constants.expoConfig?.extra?.backendUrl;
        const imageSource = item.avatar_url 
            ? { uri: backendUrl ? `${backendUrl}${item.avatar_url}` : item.avatar_url } 
            : require('@/assets/ava.png');

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleToggleStylist(item)}
                style={[
                    styles.card,
                    {
                        opacity,
                        transform: [{ scale }],
                    },
                ]}
            >
                <Image source={imageSource} style={styles.stylistImage} resizeMode="contain" />
                <View style={styles.cardContent}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.stylistName, { color: colors.text }]}>{item.name}</Text>
                    </View>
                    {item.specialization && (
                        <Text style={[styles.specialization, { color: colors.buttonPrimary }]}>
                            {item.specialization.charAt(0).toUpperCase() + item.specialization.slice(1)}
                        </Text>
                    )}
                    <Text style={[styles.stylistDescription, { color: colors.textSecondary }]} numberOfLines={3}>
                        {item.personality_description}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={colors.buttonPrimary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Loading stylists...
                </Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={[styles.container, styles.errorContainer]}>
                <Text style={[styles.errorText, { color: colors.text }]}>
                    Failed to load stylists. Please try again.
                </Text>
            </View>
        );
    }

    if (stylists.length === 0) {
        return (
            <View style={[styles.container, styles.errorContainer]}>
                <Text style={[styles.errorText, { color: colors.text }]}>
                    No stylists available.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>{t.chooseStylistTitle}</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {t.chooseStylistSubtitle}
                </Text>
            </View>

            <View style={styles.carouselContainer}>
                <FlatList
                    ref={flatListRef}
                    data={stylists}
                    renderItem={renderStylistCard}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    onScroll={handleScroll}
                    onMomentumScrollEnd={handleMomentumScrollEnd}
                    scrollEventThrottle={16}
                    contentContainerStyle={styles.carouselContent}
                    getItemLayout={(data, index) => ({
                        length: ITEM_WIDTH,
                        offset: ITEM_WIDTH * index,
                        index,
                    })}
                />
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    header: {
        width: '100%',
        alignItems: 'center',
        marginBottom: scaleFontSize(32),
    },
    title: {
        fontSize: scaleFontSize(24),
        lineHeight: scaleFontSize(32),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(8),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        paddingHorizontal: scaleFontSize(20),
    },
    carouselContainer: {
        width: '100%',
        marginBottom: scaleFontSize(32),
        overflow: 'visible',
    },
    carouselContent: {
        paddingLeft: SIDE_PADDING,
        paddingRight: SIDE_PADDING,
    },
    card: {
        width: CARD_WIDTH,
        marginRight: CARD_SPACING,
        alignItems: 'center',
    },
    stylistImage: {
        width: '100%',
        height: scaleFontSize(250),
        marginBottom: scaleFontSize(16),
    },
    cardContent: {
        width: '100%',
        paddingHorizontal: scaleFontSize(8),
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: scaleFontSize(12),
        gap: scaleFontSize(8),
    },
    stylistName: {
        fontSize: scaleFontSize(24),
        lineHeight: scaleFontSize(32),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        textAlign: 'center',
    },
    specialization: {
        fontSize: scaleFontSize(12),
        lineHeight: scaleFontSize(16),
        fontFamily: FONTS.nunitoMedium,
        textAlign: 'center',
        marginBottom: scaleFontSize(8),
        textTransform: 'capitalize',
    },
    stylistDescription: {
        fontSize: scaleFontSize(14),
        lineHeight: scaleFontSize(20),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scaleFontSize(60),
    },
    loadingText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(16),
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scaleFontSize(60),
        paddingHorizontal: scaleFontSize(24),
    },
    errorText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
});

// Export Stylist type for use in parent component
export type { Stylist };

