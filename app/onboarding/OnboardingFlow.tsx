import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { RootState } from '@/src/context/store';
import {
    nextStep,
    previousStep,
    updateOnboardingData,
    setOnboardingCompleted,
    resetOnboarding,
    OnboardingData,
} from '@/src/context/slices/onboardingSlice';
import ProgressBar from '@/src/components/onboarding/ProgressBar';
import CustomButton from '@/src/components/common/CustomButton';
import BackButton from '@/src/components/common/BackButton';
import Step1, { Step1Ref } from './components/Step1';
import Step2, { Step2Ref } from './components/Step2';
import Step3, { Step3Ref } from './components/Step3';
import Step4, { Step4Ref } from './components/Step4';

export default function OnboardingFlow() {
    const router = useRouter();
    const dispatch = useDispatch();
    const colors = useThemeColors();
    const t = translations.onboarding;

    const { currentStep, totalSteps, data } = useSelector(
        (state: RootState) => state.onboarding
    );

    const step1FormRef = useRef<Step1Ref>(null);
    const step2FormRef = useRef<Step2Ref>(null);
    const step3FormRef = useRef<Step3Ref>(null);
    const step4FormRef = useRef<Step4Ref>(null);

    const handleStepSubmit = (stepData: Partial<OnboardingData>) => {
        dispatch(updateOnboardingData(stepData));

        if (currentStep < totalSteps) {
            dispatch(nextStep());
        } else {
            dispatch(resetOnboarding());
            router.push('/onboarding/PhotoUploadInfo');
        }
    };

    const handleNext = () => {
        switch (currentStep) {
            case 1:
                step1FormRef.current?.submitForm();
                break;
            case 2:
                step2FormRef.current?.submitForm();
                break;
            case 3:
                step3FormRef.current?.submitForm();
                break;
            case 4:
                step4FormRef.current?.submitForm();
                break;
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            dispatch(previousStep());
        } else {
            router.back();
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1
                        ref={step1FormRef}
                        initialValues={{
                            firstName: data.firstName,
                            lastName: data.lastName,
                        }}
                        onSubmit={(values) => handleStepSubmit(values)}
                    />
                );
            case 2:
                return (
                    <Step2
                        ref={step2FormRef}
                        initialValues={{ email: data.email }}
                        onSubmit={(values) => handleStepSubmit(values)}
                    />
                );
            case 3:
                return (
                    <Step3
                        ref={step3FormRef}
                        initialValues={{ occupation: data.occupation }}
                        onSubmit={(values) => handleStepSubmit(values)}
                    />
                );
            case 4:
                return (
                    <Step4
                        ref={step4FormRef}
                        initialValues={{ selectedBrands: data.selectedBrands }}
                        onSubmit={(values) => handleStepSubmit(values)}
                    />
                );
            default:
                return null;
        }
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
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.contentContainer}>{renderStep()}</View>
            </ScrollView>

            <View style={styles.bottomContainer}>
                <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
                <View style={styles.buttonContainer}>
                    <CustomButton
                        title={t.next}
                        backgroundColor={colors.buttonPrimary}
                        textColor={colors.buttonText}
                        borderColor={colors.buttonPrimary}
                        onPress={handleNext}
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
        paddingTop: 60,
        paddingLeft: 24,
        paddingBottom: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: scaleFontSize(24),
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
});

