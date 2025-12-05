import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/context/store';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import Logo from '@/src/components/common/Logo';
import CustomTabBar from '@/src/components/home/CustomTabBar';
import Header from '@/src/components/home/Header';

export default function HomeScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const t = translations.home;
    const insets = useSafeAreaInsets();
    const { images, maxImages } = useSelector((state: RootState) => state.closet);
    
    const handleAddToCloset = () => {
        if (images.length >= maxImages) {
            // Navigate to closet tab (second tab)
            router.push('/home/(tabs)/closet' as any);
        } else {
            router.push('/home/AddToCloset' as any);
        }
    };

    return (
        <View style={styles.wrapper}>
            <StatusBar style="dark" backgroundColor="#FFFFFF" />
            <View style={[styles.statusBarBackground, { height: insets.top }]} />
            <ImageBackground
                source={require('@/assets/home_background.png')}
                style={styles.container}
                imageStyle={styles.backgroundImageStyle}
            >
                <Header />
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        <View style={styles.logoSection}>
                            <Logo size={scaleFontSize(120)} />
                        </View>
                        <Text style={[styles.welcomeText, { color: colors.text }]}>
                            {t.welcomeMessage}
                        </Text>
                        <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                            {t.instructionText}
                        </Text>

                        <View style={[styles.closetCard, { backgroundColor: colors.text }]}>
                            <View style={styles.closetHeader}>
                                <Text style={[styles.closetTitle, { color: colors.textSecondary }]}>
                                    {t.closet}
                                </Text>
                                <Text style={[styles.closetCount, { color: colors.surface }]}>
                                    {images.length}/{maxImages}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.addButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                                activeOpacity={0.7}
                                onPress={handleAddToCloset}
                            >
                                <Text style={[styles.addButtonText, { color: colors.text }]}>
                                    {images.length >= maxImages ? t.trackYourCloset : t.addToCloset}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.helpSection}>
                            <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                                {t.dontKnowWhereToStart}
                            </Text>
                            <TouchableOpacity activeOpacity={0.7}>
                                <Text style={[styles.helpLink, { color: colors.buttonPrimary }]}>
                                    {t.getStyledByLuxify}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                <CustomTabBar />
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    statusBarBackground: {
        backgroundColor: '#FFFFFF',
        width: '100%',
    },
    container: {
        flex: 1,
        width: '100%',
    },
    backgroundImageStyle: {
        resizeMode: 'cover',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: scaleFontSize(24),
        paddingTop: scaleFontSize(80),
        paddingBottom: scaleFontSize(100),
        alignItems: 'center',
    },
    logoSection: {
        marginBottom: scaleFontSize(16),
    },
    welcomeText: {
        fontSize: scaleFontSize(32),
        lineHeight: scaleFontSize(38),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(8),
        textAlign: 'center',
    },
    instructionText: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        marginBottom: scaleFontSize(40),
        paddingHorizontal: scaleFontSize(20),
    },
    closetCard: {
        width: '80%',
        padding: scaleFontSize(20),
        marginBottom: scaleFontSize(24),
    },
    closetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scaleFontSize(16),
    },
    closetTitle: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.nunitoMedium,
        fontWeight: '400',
    },
    closetCount: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    addButton: {
        width: '100%',
        paddingVertical: scaleFontSize(16),
        borderWidth: scaleFontSize(1),
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
    },
    helpSection: {
        alignItems: 'center',
        gap: scaleFontSize(8),
    },
    helpText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
    helpLink: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
        textDecorationLine: 'underline',
    },
});

