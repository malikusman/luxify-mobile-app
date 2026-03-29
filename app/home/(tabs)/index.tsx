import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import { translations } from '@/src/constants/translations';
import CustomTabBar from '@/src/components/home/CustomTabBar';
import Header from '@/src/components/home/Header';
import Logo from '@/src/components/common/Logo';
import { useUserProfile, useUserProfileSelector, useStyleProfile, useStyleProfileSelector } from '@/src/services';
import { Ionicons } from '@expo/vector-icons';
import { preloadHomeImages } from '@/src/utils/imagePreloader';

export default function HomeScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    const { isLoading: isLoadingUserProfile, error: userProfileError } = useUserProfile();
    const userProfile = useUserProfileSelector();
    const { isLoading: isLoadingStyleProfile, error: styleProfileError } = useStyleProfile();
    const styleProfile = useStyleProfileSelector();

    // Preload home screen images on mount
    useEffect(() => {
        preloadHomeImages();
    }, []);

    useEffect(() => {
        if (userProfile) {
            console.log('=== User Profile (Available across app) ===');
            console.log(JSON.stringify(userProfile, null, 2));
        }
        
        if (styleProfile) {
            console.log('=== Style Profile (Available across app) ===');
            console.log(JSON.stringify(styleProfile, null, 2));
        }
        
        if (isLoadingUserProfile) {
            console.log('Loading user profile...');
        }
        
        if (isLoadingStyleProfile) {
            console.log('Loading style profile...');
        }
        
        if (userProfileError) {
            console.error('Error loading user profile:', userProfileError);
        }
        
        if (styleProfileError) {
            console.error('Error loading style profile:', styleProfileError);
        }
    }, [userProfile, styleProfile, isLoadingUserProfile, isLoadingStyleProfile, userProfileError, styleProfileError]);


    const handleClosetPress = () => {
        router.push('/home/(tabs)/closet' as any);
    };

    const handleLookbookPress = () => {
        router.push('/home/(tabs)/outfits' as any);
    };

    const handleTalkToStylist = () => {
        router.push('/home/AIChat' as any);
    };

    const handleGetStyledByLuxify = () => {
        router.push('/home/AIChat' as any);
    };

    return (
        <View style={styles.wrapper}>
            <StatusBar style="dark" backgroundColor={colors.background} />
            <View style={[styles.statusBarBackground, { height: insets.top, backgroundColor: colors.background }]} />
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header variant="dark" />
                <ScrollView
                    style={[styles.scrollView, { backgroundColor: colors.background }]}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        {/* Brand: Logo and Slogan */}
                        <View style={styles.brandSection}>
                            <Logo size={scaleFontSize(72)} style={styles.brandLogo} />
                            <Text style={[styles.brandSlogan, { color: colors.text }]}>
                                {translations.home.brandSlogan}
                            </Text>
                        </View>

                        {/* AI Stylist Card */}
                        <View style={[styles.aiStylistCard, { backgroundColor: colors.homeCardBackground }]}>
                            <View style={[styles.aiStylistLeft, { backgroundColor: colors.homeCardBackground }]}>
                                <View style={styles.aiStylistHeader}>
                                    <Ionicons name="sparkles" size={scaleFontSize(14)} color={colors.homeCardText} />
                                    <View style={styles.aiStylistTitleWrap}>
                                        <Text style={[styles.aiStylistTitle, { color: colors.homeCardText }]}>{translations.home.aiStylistTitleLine1}</Text>
                                        <Text style={[styles.aiStylistTitle, styles.aiStylistTitleSecond, { color: colors.homeCardText }]}>{translations.home.aiStylistTitleLine2}</Text>
                                    </View>
                                    <Ionicons name="sparkles" size={scaleFontSize(14)} color={colors.homeCardText} />
                                </View>
                                <Text style={[styles.aiStylistSubtitle, { color: colors.homeCardSubtitle }]}>
                                    {translations.home.aiStylistSubtitle}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.aiStylistButton, { backgroundColor: colors.homeTalkToStylistButton }]}
                                    onPress={handleTalkToStylist}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.aiStylistButtonText, { color: colors.buttonText }]}>
                                        {translations.home.talkToStylist}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.aiStylistImageWrap, { backgroundColor: colors.homeImagePlaceholderBg }]}>
                                <ImageBackground
                                    source={require('@/assets/home-group.png')}
                                    style={styles.aiStylistImage}
                                    imageStyle={styles.aiStylistImageStyle}
                                />
                            </View>
                        </View>

                        {/* Our Premium Services */}
                        <Text style={[styles.premiumServicesTitle, { color: colors.text }]}>
                            {translations.home.ourPremiumServices}
                        </Text>
                        <View style={styles.closetLookbookRow}>
                            <TouchableOpacity
                                style={styles.closetLookbookCard}
                                onPress={handleClosetPress}
                                activeOpacity={0.9}
                            >
                                <ImageBackground
                                    source={require('@/assets/closet.png')}
                                    style={styles.closetLookbookImage}
                                    imageStyle={styles.closetLookbookImageStyle}
                                >
                                    <View style={[styles.closetLookbookOverlay, { backgroundColor: colors.homeOverlay }]}>
                                        <Text style={[styles.closetLookbookTitle, { color: colors.homeClosetCardTitle }]}>
                                            {translations.home.closet}
                                        </Text>
                                    </View>
                                </ImageBackground>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.closetLookbookCard}
                                onPress={handleLookbookPress}
                                activeOpacity={0.9}
                            >
                                <ImageBackground
                                    source={require('@/assets/lookbook.png')}
                                    style={styles.closetLookbookImage}
                                    imageStyle={styles.closetLookbookImageStyle}
                                >
                                    <View style={[styles.closetLookbookOverlay, { backgroundColor: colors.homeOverlay }]}>
                                        <Text style={[styles.closetLookbookTitle, { color: colors.homeClosetCardTitle }]}>
                                            {translations.home.lookbook}
                                        </Text>
                                    </View>
                                </ImageBackground>
                            </TouchableOpacity>
                        </View>

                        {/* CTA: Get styled by Luxify */}
                        <View style={styles.ctaSection}>
                            <Text style={[styles.ctaQuestion, { color: colors.homeCardSubtitle }]}>
                                {translations.home.dontKnowWhereToStart}
                            </Text>
                            <TouchableOpacity onPress={handleGetStyledByLuxify} activeOpacity={0.7}>
                                <Text style={[styles.ctaLink, { color: colors.text }]}>
                                    {translations.home.getStyledByLuxify}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                <CustomTabBar />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    statusBarBackground: {
        width: '100%',
    },
    container: {
        flex: 1,
        width: '100%',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: scaleFontSize(100),
    },
    content: {
        paddingHorizontal: scaleFontSize(20),
        paddingTop: scaleFontSize(16),
    },
    brandSection: {
        alignItems: 'center',
        marginBottom: scaleFontSize(24),
        paddingHorizontal: scaleFontSize(8),
    },
    brandLogo: {
        marginBottom: scaleFontSize(12),
    },
    brandSlogan: {
        fontSize: scaleFontSize(18),
        lineHeight: scaleFontSize(26),
        marginVertical: scaleFontSize(12),
        fontFamily: FONTS.hermannRegular,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    aiStylistCard: {
        width: '100%',
        borderRadius: scaleFontSize(24),
        overflow: 'hidden',
        marginBottom: scaleFontSize(20),
        height: scaleFontSize(200),
        flexDirection: 'row',
    },
    aiStylistLeft: {
        flex: 1,
        paddingVertical: scaleFontSize(24),
        paddingHorizontal: scaleFontSize(20),
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    aiStylistHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scaleFontSize(6),
    },
    aiStylistTitleWrap: {
        alignItems: 'center',
    },
    aiStylistTitle: {
        fontSize: scaleFontSize(22),
        lineHeight: scaleFontSize(28),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        textAlign: 'center',
    },
    aiStylistTitleSecond: {
        marginLeft: scaleFontSize(12),
    },
    aiStylistSubtitle: {
        fontSize: scaleFontSize(12),
        lineHeight: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
    aiStylistButton: {
        paddingVertical: scaleFontSize(12),
        paddingHorizontal: scaleFontSize(16),
        borderRadius: scaleFontSize(12),
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        marginTop: scaleFontSize(4),
    },
    aiStylistButtonText: {
        fontSize: scaleFontSize(13),
        fontFamily: FONTS.nunitoSemiBold,
        fontWeight: '600',
    },
    aiStylistImageWrap: {
        width: '45%',
        height: '100%',
        overflow: 'hidden',
        borderTopRightRadius: scaleFontSize(24),
        borderBottomRightRadius: scaleFontSize(24),
        justifyContent: 'center',
        alignItems: 'center',
    },
    aiStylistImage: {
        width: '100%',
        height: '100%',
    },
    aiStylistImageStyle: {
        resizeMode: 'contain',
    },
    premiumServicesTitle: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(14),
    },
    closetLookbookRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: scaleFontSize(12),
        marginBottom: scaleFontSize(24),
    },
    closetLookbookCard: {
        flex: 1,
        maxWidth: '48%',
    },
    closetLookbookImage: {
        width: '100%',
        height: scaleFontSize(140),
        borderRadius: scaleFontSize(20),
    },
    closetLookbookImageStyle: {
        resizeMode: 'cover',
        borderRadius: scaleFontSize(20),
    },
    closetLookbookOverlay: {
        width: '100%',
        height: '100%',
        borderRadius: scaleFontSize(20),
        justifyContent: 'flex-end',
        padding: scaleFontSize(12),
    },
    closetLookbookTitle: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
    },
    ctaSection: {
        alignItems: 'center',
        paddingVertical: scaleFontSize(8),
    },
    ctaQuestion: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(4),
    },
    ctaLink: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoSemiBold,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
