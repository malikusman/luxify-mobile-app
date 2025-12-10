import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Image } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import { STYLISTS, CAROUSEL, ANIMATION, type Stylist } from '@/src/constants/constants';

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

    useEffect(() => {
        if (STYLISTS.length > 0 && !selectedStylist) {
            onSelectStylist(STYLISTS[0]);
        }
    }, []);

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / ITEM_WIDTH);
        const clampedIndex = Math.max(0, Math.min(index, STYLISTS.length - 1));
        if (clampedIndex !== currentIndex) {
            setCurrentIndex(clampedIndex);
        }
    };

    const handleMomentumScrollEnd = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const scrollPosition = contentOffsetX;
        const index = Math.round(scrollPosition / ITEM_WIDTH);
        const clampedIndex = Math.max(0, Math.min(index, STYLISTS.length - 1));
        if (STYLISTS[clampedIndex]) {
            onSelectStylist(STYLISTS[clampedIndex]);
            const targetOffset = clampedIndex * ITEM_WIDTH;
            flatListRef.current?.scrollToOffset({ offset: targetOffset, animated: true });
        }
    };

    const renderStylistCard = ({ item, index }: { item: Stylist; index: number }) => {
        const isFocused = currentIndex === index;
        const distance = Math.abs(index - currentIndex);
        
        let opacity = 1;
        let scale = 1;
        
        if (distance === 1) {
            opacity = ANIMATION.OPACITY_SIDE_CARD;
            scale = ANIMATION.SCALE_SIDE_CARD;
        } else if (distance > 1) {
            opacity = ANIMATION.OPACITY_DISTANT_CARD;
            scale = ANIMATION.SCALE_DISTANT_CARD;
        }

        return (
            <View
                style={[
                    styles.card,
                    {
                        opacity,
                        transform: [{ scale }],
                    },
                ]}
            >
                {item.image && (
                    <Image source={item.image} style={styles.stylistImage} resizeMode="contain" />
                )}
                <View style={styles.cardContent}>
                    <Text style={[styles.stylistName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.stylistDescription, { color: colors.textSecondary }]}>
                        {item.description}
                    </Text>
                </View>
            </View>
        );
    };

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
                    data={STYLISTS}
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
    stylistName: {
        fontSize: scaleFontSize(24),
        lineHeight: scaleFontSize(32),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(12),
        textAlign: 'center',
    },
    stylistDescription: {
        fontSize: scaleFontSize(14),
        lineHeight: scaleFontSize(20),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
});

