import React, { useState, useRef, useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar, TouchableOpacity, Text, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import CustomButton from '@/src/components/common/CustomButton';
import { discoverStyles } from './styles/discoverStyles';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { FONTS } from '@/src/constants/fonts';
import { useDispatch } from 'react-redux';
import { setAwarenessSeen } from '@/src/context/slices/awarenessSlice';
import { preloadImage } from '@/src/utils/imagePreloader';

const { width } = Dimensions.get('window');

const discoverItems = [
    { id: 1, image: require('@/assets/intro1.png') },
    { id: 2, image: require('@/assets/intro2.png') },
    { id: 3, image: require('@/assets/intro3.png') },
];

export default function DiscoverScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const colors = useThemeColors();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleSkip = () => {
        dispatch(setAwarenessSeen());
        router.dismissAll();
                        router.replace('/auth/login');
    };

    const handleNext = () => {
        dispatch(setAwarenessSeen());
        router.dismissAll();
                        router.replace('/auth/login');
    };

    useEffect(() => {
        // Preload all discover images
        discoverItems.forEach((item) => {
            preloadImage(item.image);
        });
    }, []);

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const cardWidth = width - scaleFontSize(100);
        const index = Math.round(contentOffsetX / (cardWidth + scaleFontSize(20)));
        setCurrentIndex(index);
    };

    return (
        <View style={[discoverStyles.container, { backgroundColor: colors.awarenessBackground }]}>
            <StatusBar barStyle="dark-content" />
            <View style={discoverStyles.header}>
                <TouchableOpacity onPress={handleSkip} style={discoverStyles.skipButton}>
                    <Text style={[discoverStyles.skipText, { color: colors.textSecondary }]}>
                        {translations.awareness.skip}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={discoverStyles.contentContainer}>
                <View style={discoverStyles.textSection}>
                    <View style={discoverStyles.titleContainer}>
                        <Text style={[discoverStyles.title, { color: colors.text }]}>
                            {translations.awareness.discoverTitle}
                        </Text>
                    </View>
                    <View style={discoverStyles.subtitleContainer}>
                        <Text style={[discoverStyles.subtitle, { color: colors.textSecondary }]}>
                            {translations.awareness.discoverSubtitle}
                        </Text>
                    </View>
                </View>
                <View style={discoverStyles.sliderContainer}>
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        style={discoverStyles.scrollView}
                        contentContainerStyle={discoverStyles.scrollContent}
                        snapToInterval={width - scaleFontSize(100) + scaleFontSize(20)}
                        decelerationRate="fast"
                        snapToAlignment="start"
                    >
                        {discoverItems.map((item, index) => (
                            <View key={item.id} style={[discoverStyles.slideContainer]}>
                                <View style={[discoverStyles.imageCard, { backgroundColor: "#E7E8E9" }]}>
                                    <View style={discoverStyles.imageContainer}>
                                        <Image
                                            source={item.image}
                                            style={discoverStyles.image}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
                <View style={discoverStyles.paginationContainer}>
                    {discoverItems.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                discoverStyles.paginationDot,
                                { backgroundColor: index === currentIndex ? colors.text : colors.background },
                                index === currentIndex && discoverStyles.paginationDotActive,
                            ]}
                        />
                    ))}
                </View>
            </View>
            <View style={discoverStyles.buttonContainer}>
                <CustomButton
                    title={translations.awareness.next}
                    onPress={handleNext}
                    backgroundColor={colors.buttonPrimary}
                    textColor={colors.buttonText}
                />
            </View>
        </View>
    );
}

