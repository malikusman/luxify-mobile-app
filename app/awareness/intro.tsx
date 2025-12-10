import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, StatusBar, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import CustomButton from '@/src/components/common/CustomButton';
import { introStyles } from './styles/introStyles';
import { preloadImage } from '@/src/utils/imagePreloader';

const { width, height } = Dimensions.get('window');

export default function IntroScreen() {
    const router = useRouter();
    const colors = useThemeColors();

    useEffect(() => {
        // Preload next page images
        preloadImage(require('@/assets/intro1.png'));
        preloadImage(require('@/assets/intro2.png'));
        preloadImage(require('@/assets/intro3.png'));
    }, []);

    const handleReady = () => {
        router.push('/awareness/stylist');
    };

    return (
        <View style={[introStyles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <Image
                source={require('@/assets/intro.png')}
                style={introStyles.backgroundImage}
                resizeMode="cover"
            />
            <View style={introStyles.overlay} />
            <View style={introStyles.logoContainer}>
                <Image
                    source={require('@/assets/logoLight.png')}
                    style={introStyles.logo}
                    resizeMode="contain"
                />
            </View>
            <View style={introStyles.contentContainer}>
                <View style={introStyles.textContainer}>
                    <View style={introStyles.titleContainer}>
                        <Text style={introStyles.titleText}>
                            {translations.awareness.introTitle}
                        </Text>
                    </View>
                    <View style={introStyles.subtitleContainer}>
                        <Text style={introStyles.subtitleText}>
                            {translations.awareness.introSubtitle}
                        </Text>
                    </View>
                </View>
                <View style={introStyles.buttonContainer}>
                    <CustomButton
                        title={translations.awareness.introButton}
                        onPress={handleReady}
                        backgroundColor={colors.buttonPrimary}
                        textColor={colors.buttonText}
                    />
                </View>
            </View>
        </View>
    );
}

