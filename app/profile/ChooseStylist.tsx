import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import ProgressBar from '@/src/components/onboarding/ProgressBar';
import CustomButton from '@/src/components/common/CustomButton';
import BackButton from '@/src/components/common/BackButton';
import ChooseStylistStep1, { Stylist } from './components/ChooseStylistStep1';
import ChooseStylistStep2 from './components/ChooseStylistStep2';
import { ONBOARDING } from '@/src/constants/constants';
import { SocialPlatform } from '@/src/services/modules/socialMedia/socialMediaService';

export default function ChooseStylist() {
    const router = useRouter();
    const colors = useThemeColors();
    const t = translations.onboarding;
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
    const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (!selectedStylist) {
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            router.push('/premium/Subscription');
        }
    };

    const handleSelectStylist = (stylist: Stylist) => {
        setSelectedStylist(stylist);
    };

    const handleConnectPlatform = (platformId: string) => {
        setConnectedPlatforms((prev) => {
            if (prev.includes(platformId)) {
                return prev.filter((id) => id !== platformId);
            }
            return [...prev, platformId];
        });
    };

    const handlePhotosSelected = (platformId: SocialPlatform, photoIds: string[]) => {
        // Handle selected photos - can be saved to state or sent to backend
        console.log(`Selected ${photoIds.length} photos from ${platformId}`);
        // You can add additional logic here to store selected photos
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ChooseStylistStep1
                        selectedStylist={selectedStylist}
                        onSelectStylist={handleSelectStylist}
                    />
                );
            case 2:
                return (
                    <ChooseStylistStep2
                        connectedPlatforms={connectedPlatforms}
                        onConnectPlatform={handleConnectPlatform}
                        onPhotosSelected={handlePhotosSelected}
                    />
                );
            default:
                return null;
        }
    };

    const isNextDisabled = currentStep === 1 && !selectedStylist;

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
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.contentContainer}>{renderStep()}</View>
            </ScrollView>

            {currentStep === 1 && (
                <View style={[styles.infoBox, { borderColor: colors.text, backgroundColor: colors.cardSecondary }]}>
                    <Text style={[styles.infoText, { color: colors.text }]}>
                        {t.stylistLearningInfo}
                    </Text>
                </View>
            )}

            <View style={styles.bottomContainer}>
                <ProgressBar currentStep={currentStep} totalSteps={ONBOARDING.TOTAL_STEPS} />
                <View style={styles.buttonContainer}>
                    <CustomButton
                        title={t.next}
                        backgroundColor={colors.buttonPrimary}
                        textColor={colors.buttonText}
                        borderColor={colors.buttonPrimary}
                        onPress={handleNext}
                        disabled={isNextDisabled}
                    />
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
    contentContainer: {
        flex: 1,
        // paddingHorizontal: scaleFontSize(24),
        paddingTop: scaleFontSize(16),
        paddingBottom: scaleFontSize(40),
        alignItems: 'center',
    },
    bottomContainer: {
        width: '100%',
        paddingHorizontal: scaleFontSize(24),
        paddingBottom: scaleFontSize(10),
        marginTop: scaleFontSize(16),
    },
    buttonContainer: {
        width: '100%',
        marginTop: scaleFontSize(16),
    },
    infoBox: {
        padding: scaleFontSize(10),
        borderWidth: scaleFontSize(1),
        marginHorizontal: scaleFontSize(24),
        borderRadius: scaleFontSize(5)
    },
    infoText: {
        fontSize: scaleFontSize(10),
        lineHeight: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        fontWeight: '400',
        textAlign: 'center',
    },
});

