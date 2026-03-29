import React from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import BackButton from '@/src/components/common/BackButton';
import CustomButton from '@/src/components/common/CustomButton';
import Logo from '@/src/components/common/Logo';
import { URLS } from '@/src/constants/constants';

export default function Subscription() {
    const router = useRouter();
    const colors = useThemeColors();
    const t = translations.onboarding;

    const handleBack = () => {
        router.back();
    };

    const handleStartFreeTrial = () => {
        router.push('/home/(tabs)');
    };

    const handleRestorePurchases = () => {
        console.log('Restore purchases');
    };

    const handleTermsPress = () => {
        Linking.openURL(URLS.TERMS);
    };

    const handlePrivacyPress = () => {
        Linking.openURL(URLS.PRIVACY);
    };

    const renderDisclaimer = () => {
        const disclaimer = t.premiumDisclaimer;
        const parts = disclaimer.split(/(\*\*\$99\.99 annually\*\*|\$99\.99 annually|You can cancel anytime in your device's settings|Terms and Privacy Policy)/);
        
        return (
            <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
                {parts.map((part, index) => {
                    if (part === '**$99.99 annually**' || part === '$99.99 annually') {
                        return (
                            <Text key={index} style={[styles.disclaimerText, { fontWeight: 'bold', color: colors.text }]}>
                                $99.99 annually
                            </Text>
                        );
                    }
                    if (part === 'Terms and Privacy Policy') {
                        return (
                            <Text
                                key={index}
                                style={[styles.disclaimerText, { textDecorationLine: 'underline', color: colors.buttonPrimary }]}
                                onPress={handleTermsPress}
                            >
                                Terms and Privacy Policy
                            </Text>
                        );
                    }
                    if (part === "You can cancel anytime in your device's settings") {
                        return (
                            <Text
                                key={index}
                                style={[styles.disclaimerText, { textDecorationLine: 'underline', color: colors.buttonPrimary }]}
                            >
                                {part}
                            </Text>
                        );
                    }
                    return <Text key={index}>{part}</Text>;
                })}
            </Text>
        );
    };

    return (
        <KeyboardAvoidingView
            style={[styles.wrapper, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <View style={styles.backButtonContainer}>
                <BackButton onPress={handleBack} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {t.premiumTitle}
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {t.premiumSubtitle}
                        </Text>
                    </View>

                    <View style={styles.logoSection}>
                        <Logo />
                        <Text style={[styles.premiumText, { color: colors.text }]}>
                            {t.premiumPlan}
                        </Text>
                        <Text style={[styles.planText, { color: colors.text }]}>
                            {t.annualPlan}
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.text }]} />

                    <View style={styles.featuresSection}>
                        <View style={styles.featureItem}>
                            <Text style={[styles.featureText, { color: colors.text }]}>
                                {t.featureUnlimitedAI}
                            </Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={[styles.featureText, { color: colors.text }]}>
                                {t.featurePersonalized}
                            </Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={[styles.featureText, { color: colors.text }]}>
                                {t.featureAdvanced}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.text }]} />

                    <View style={styles.pricingSection}>
                        <Text style={[styles.pricingText, { color: colors.textSecondary }]}>
                            {t.startFreeTrial}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.bottomSection}>
                <View style={styles.buttonContainer}>
                    <CustomButton
                        title={t.startFreeTrialButton}
                        backgroundColor={colors.buttonPrimary}
                        textColor={colors.buttonText}
                        borderColor={colors.buttonPrimary}
                        onPress={handleStartFreeTrial}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.restoreButton, { borderColor: colors.border }]}
                    onPress={handleRestorePurchases}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.restoreButtonText, { color: colors.text }]}>
                        {t.restorePurchases}
                    </Text>
                </TouchableOpacity>

                <View style={styles.disclaimerContainer}>
                    {renderDisclaimer()}
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    backButtonContainer: {
        paddingTop: scaleFontSize(60),
        paddingLeft: scaleFontSize(24),
        paddingBottom: scaleFontSize(8),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: scaleFontSize(24),
        paddingTop: scaleFontSize(16),
        paddingBottom: scaleFontSize(40),
        alignItems: 'center',
    },
    header: {
        width: '100%',
        alignItems: 'center',
        marginBottom: scaleFontSize(40),
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
    logoSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: scaleFontSize(24),
    },
    premiumText: {
        fontSize: scaleFontSize(24),
        lineHeight: scaleFontSize(32),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginTop: scaleFontSize(16),
        textAlign: 'center',
    },
    planText: {
        fontSize: scaleFontSize(20),
        lineHeight: scaleFontSize(28),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginTop: scaleFontSize(4),
        textAlign: 'center',
    },
    divider: {
        width: '100%',
        height: scaleFontSize(1),
        marginVertical: scaleFontSize(24),
    },
    featuresSection: {
        width: '100%',
        gap: scaleFontSize(10),
    },
    featureItem: {
        width: '100%',
    },
    featureText: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.nunitoRegular,
    },
    pricingSection: {
        width: '100%',
        alignItems: 'center',
    },
    pricingText: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
    bottomSection: {
        width: '100%',
        paddingHorizontal: scaleFontSize(24),
        paddingBottom: scaleFontSize(40),
    },
    buttonContainer: {
        width: '100%',
    },
    restoreButton: {
        width: '100%',
        height: scaleFontSize(56),
        borderRadius: scaleFontSize(4),
        borderWidth: scaleFontSize(1),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scaleFontSize(24),
    },
    restoreButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoMedium,
    },
    disclaimerContainer: {
        width: '100%',
    },
    disclaimerText: {
        fontSize: scaleFontSize(12),
        lineHeight: scaleFontSize(18),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
});

