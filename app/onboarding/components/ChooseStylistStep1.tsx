import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Image } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.55;
const CARD_SPACING = scaleFontSize(10);
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;
const ITEM_WIDTH = CARD_WIDTH + CARD_SPACING;

export interface Stylist {
    id: string;
    name: string;
    description: string;
    image?: any;
}

interface ChooseStylistStep1Props {
    selectedStylist: Stylist | null;
    onSelectStylist: (stylist: Stylist) => void;
}

const DUMMY_STYLISTS: Stylist[] = [
    {
        id: '1',
        name: 'Celine',
        description: "Bonjour, darling. I'm your AI stylist, expertly trained in luxury fashion. From elevated streetwear to full-glam gala looks, I curate outfits that always look expensive, polished, and on point. I work with high-end designers, runway trends, and statement pieces to make sure you step out looking like a million dollars — no matter the occasion.",
        image: require('@/assets/s1.png'),
    },
    {
        id: '2',
        name: 'Harper',
        description: "Hello Lucia. I'm here to ensure you never leave the house looking anything less than extraordinary. Let's begin",
        image: require('@/assets/s2.png'),
    },
    {
        id: '3',
        name: 'Carlos',
        description: "Hey there! I'm Carlos, your go-to stylist for modern, versatile looks. I specialize in creating outfits that seamlessly transition from day to night, mixing classic pieces with contemporary trends.",
        image: require('@/assets/s3.png'),
    },
];

export default function ChooseStylistStep1({ selectedStylist, onSelectStylist }: ChooseStylistStep1Props) {
    const colors = useThemeColors();
    const t = translations.onboarding;
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (DUMMY_STYLISTS.length > 0 && !selectedStylist) {
            onSelectStylist(DUMMY_STYLISTS[0]);
        }
    }, []);

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / ITEM_WIDTH);
        const clampedIndex = Math.max(0, Math.min(index, DUMMY_STYLISTS.length - 1));
        if (clampedIndex !== currentIndex) {
            setCurrentIndex(clampedIndex);
        }
    };

    const handleMomentumScrollEnd = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const scrollPosition = contentOffsetX;
        const index = Math.round(scrollPosition / ITEM_WIDTH);
        const clampedIndex = Math.max(0, Math.min(index, DUMMY_STYLISTS.length - 1));
        if (DUMMY_STYLISTS[clampedIndex]) {
            onSelectStylist(DUMMY_STYLISTS[clampedIndex]);
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
            opacity = 0.5;
            scale = 0.95;
        } else if (distance > 1) {
            opacity = 0.3;
            scale = 0.9;
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
                    data={DUMMY_STYLISTS}
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

