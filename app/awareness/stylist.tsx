import React, { useEffect } from 'react';
import { View, ScrollView, StatusBar, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import CustomButton from '@/src/components/common/CustomButton';
import { stylistStyles } from './styles/stylistStyles';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { FONTS } from '@/src/constants/fonts';
import { setAwarenessSeen } from '@/src/context/slices/awarenessSlice';
import StylistImageCard from './components/StylistImageCard';
import { preloadImage } from '@/src/utils/imagePreloader';

const introImages = [
    require('@/assets/intro1.png'),
    require('@/assets/intro2.png'),
    require('@/assets/intro3.png'),
];

export default function StylistScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const colors = useThemeColors();

    useEffect(() => {
        // Preload discover page images
        introImages.forEach((image) => {
            preloadImage(image);
        });
    }, []);

    const handleSkip = () => {
        dispatch(setAwarenessSeen());
        router.replace('/auth/login');
    };

    const handleNext = () => {
        router.push('/awareness/discover');
    };

    return (
        <View style={[stylistStyles.container, { backgroundColor: colors.awarenessBackground }]}>
            <StatusBar barStyle="dark-content" />
            <View style={stylistStyles.header}>
                <TouchableOpacity onPress={handleSkip} style={stylistStyles.skipButton}>
                    <Text style={[stylistStyles.skipText, { color: colors.textSecondary }]}>
                        {translations.awareness.skip}
                    </Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                contentContainerStyle={stylistStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={stylistStyles.titleContainer}>
                    <Text style={[stylistStyles.title, { color: colors.text }]}>
                        {translations.awareness.stylistTitle}
                    </Text>
                </View>
                <View style={stylistStyles.subtitleContainer}>
                    <Text style={[stylistStyles.subtitle, { color: colors.textSecondary }]}>
                        {translations.awareness.stylistSubtitle}
                    </Text>
                </View>
                <View style={stylistStyles.imagesContainer}>
                    {/* Left Image */}
                    <View style={stylistStyles.leftImageWrapper}>
                        <StylistImageCard
                            source={introImages[0]}
                            width={120}
                            height={300}
                            rotation={-8}
                        />
                    </View>
                    {/* Center Image */}
                    <View style={stylistStyles.centerImageWrapper}>
                        <StylistImageCard
                            source={introImages[1]}
                            width={200}
                            height={380}
                            rotation={0}
                        />
                    </View>
                    {/* Right Image */}
                    <View style={stylistStyles.rightImageWrapper}>
                        <StylistImageCard
                            source={introImages[2]}
                            width={120}
                            height={300}
                            rotation={8}
                        />
                    </View>
                </View>
            </ScrollView>
            <View style={stylistStyles.buttonContainer}>
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

