import React, { useRef, useState, useEffect } from 'react';
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
    updateProfileData,
    setProfileCompleted,
    resetProfile,
    ProfileData,
} from '@/src/context/slices/profileSlice';
import ProgressBar from '@/src/components/onboarding/ProgressBar';
import CustomButton from '@/src/components/common/CustomButton';
import BackButton from '@/src/components/common/BackButton';
import UserProfile, { UserProfileRef } from './components/UserProfile';
import SelectEmail, { SelectEmailRef } from './components/SelectEmail';
import SelectOccupation, { SelectOccupationRef } from './components/SelectOccupation';
import SelectBrand, { SelectBrandRef } from './components/SelectBrand';
import SelectGender, { SelectGenderRef } from './components/SelectGender';
import SelectOccasion, { SelectOccasionRef } from './components/SelectOccasion';
import ChooseStylistStep2 from './components/ChooseStylistStep2';
import { LIMITS } from '@/src/constants/constants';
import { SocialPlatform } from '@/src/services/modules/socialMedia/socialMediaService';
import { useUserProfileSelector, useCreateStyleProfile, useUpdateStyleProfile, useStyleProfileSelector } from '@/src/services';
import { toastErrorFromException, toastSuccess } from '@/src/utils/toast';

export default function OnboardingFlow() {
    const router = useRouter();
    const dispatch = useDispatch();
    const colors = useThemeColors();
    const t = translations.onboarding;

    const { currentStep, totalSteps, data } = useSelector(
        (state: RootState) => state.profile
    );
    const userProfile = useUserProfileSelector();
    const styleProfile = useStyleProfileSelector();
    const createStyleProfileMutation = useCreateStyleProfile();
    const updateStyleProfileMutation = useUpdateStyleProfile();

    // Helper function to map style profile data to form data
    const getInitialGender = (): string => {
        if (data.gender) return data.gender;
        if (styleProfile?.gender) {
            // Convert lowercase to capitalized (e.g., "male" -> "Male", "female" -> "Female")
            return styleProfile.gender.charAt(0).toUpperCase() + styleProfile.gender.slice(1).toLowerCase();
        }
        return '';
    };

    const getInitialOccasion = (): string => {
        if (data.occasion) return data.occasion;
        if (styleProfile?.occasions && styleProfile.occasions.length > 0) {
            // Take first occasion and capitalize it (e.g., "daily" -> "Daily")
            const occasion = styleProfile.occasions[0];
            return occasion.charAt(0).toUpperCase() + occasion.slice(1).toLowerCase();
        }
        return '';
    };

    const getInitialOccupation = (): string => {
        if (data.occupation) return data.occupation;
        return styleProfile?.occupation || '';
    };

    const getInitialSelectedBrands = (): string[] => {
        if (data.selectedBrands && data.selectedBrands.length > 0) return data.selectedBrands;
        if (styleProfile?.style_preferences?.selected_brands) {
            return styleProfile.style_preferences.selected_brands;
        }
        return [];
    };

    const userProfileFormRef = useRef<UserProfileRef>(null);
    const step2FormRef = useRef<SelectEmailRef>(null);
    const step3FormRef = useRef<SelectOccupationRef>(null);
    const step4FormRef = useRef<SelectBrandRef>(null);
    const selectGenderRef = useRef<SelectGenderRef>(null);
    const selectOccasionRef = useRef<SelectOccasionRef>(null);
    
    // Track connected platforms for Step 3 (ChooseStylistStep2)
    const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
    
    // Track Step7 brand selection state
    const [brandSelectionState, setBrandSelectionState] = useState({
        selectedCount: currentStep === 7 ? (data.selectedBrands?.length || 0) : 0,
        hasMinimum: currentStep === 7 ? ((data.selectedBrands?.length || 0) >= LIMITS.MIN_BRANDS) : false,
    });
    
    // Track Step4 loading state
    const [isStep4Loading, setIsStep4Loading] = useState(false);
    
    // Reset loading state when leaving step 7
    React.useEffect(() => {
        if (currentStep !== 7) {
            setIsStep4Loading(false);
        }
    }, [currentStep]);

    // Initialize profile data from user profile on mount if available
    useEffect(() => {
        if (userProfile && (!data.firstName || !data.lastName)) {
            const initialData: Partial<ProfileData> = {};
            
            if (userProfile.first_name && !data.firstName) {
                initialData.firstName = userProfile.first_name;
            }
            
            if (userProfile.last_name && !data.lastName) {
                initialData.lastName = userProfile.last_name;
            }
            
            if (userProfile.avatar_url && !data.avatar_url) {
                initialData.avatar_url = userProfile.avatar_url;
            }
            
            if (userProfile.email && !data.email) {
                initialData.email = userProfile.email;
            }
            
            if (Object.keys(initialData).length > 0) {
                dispatch(updateProfileData(initialData));
            }
        }
    }, [userProfile]); // Run when userProfile becomes available

    // Initialize profile data from style profile on mount if available
    useEffect(() => {
        if (styleProfile && !data.gender && !data.occupation && !data.occasion && (!data.selectedBrands || data.selectedBrands.length === 0)) {
            const initialData: Partial<ProfileData> = {};
            
            if (styleProfile.gender) {
                initialData.gender = styleProfile.gender.charAt(0).toUpperCase() + styleProfile.gender.slice(1).toLowerCase();
            }
            
            if (styleProfile.occupation) {
                initialData.occupation = styleProfile.occupation;
            }
            
            if (styleProfile.occasions && styleProfile.occasions.length > 0) {
                const occasion = styleProfile.occasions[0];
                initialData.occasion = occasion.charAt(0).toUpperCase() + occasion.slice(1).toLowerCase();
            }
            
            if (styleProfile.style_preferences?.selected_brands) {
                initialData.selectedBrands = styleProfile.style_preferences.selected_brands;
            }
            
            if (Object.keys(initialData).length > 0) {
                dispatch(updateProfileData(initialData));
            }
        }
    }, [styleProfile]); // Only run when styleProfile changes

    // Reset brand selection state when step changes
    useEffect(() => {
        if (currentStep === 7) {
            const count = data.selectedBrands?.length || 0;
            setBrandSelectionState({
                selectedCount: count,
                hasMinimum: count >= LIMITS.MIN_BRANDS,
            });
        } else {
            setBrandSelectionState({ selectedCount: 0, hasMinimum: false });
        }
    }, [currentStep, data.selectedBrands]);

    const handleStepSubmit = async (stepData: Partial<ProfileData>) => {
        dispatch(updateProfileData(stepData));

        if (currentStep < totalSteps) {
            dispatch(nextStep());
        } else {
            await handleCreateStyleProfile();
        }
    };

    // Helper function to check if form data has changed compared to existing style profile
    const hasDataChanged = (formData: any, existingProfile: any): boolean => {
        // Compare gender
        const formGender = formData.gender?.toLowerCase();
        const existingGender = existingProfile.gender?.toLowerCase();
        if (formGender !== existingGender) return true;

        // Compare occupation
        if (formData.occupation !== existingProfile.occupation) return true;

        // Compare occasions
        const formOccasions = formData.occasion ? [formData.occasion.toLowerCase()] : [];
        const existingOccasions = existingProfile.occasions || [];
        if (JSON.stringify(formOccasions.sort()) !== JSON.stringify([...existingOccasions].sort())) {
            return true;
        }

        // Compare selected brands
        const formBrands = formData.selectedBrands || [];
        const existingBrands = existingProfile.style_preferences?.selected_brands || [];
        if (JSON.stringify(formBrands.sort()) !== JSON.stringify([...existingBrands].sort())) {
            return true;
        }

        return false;
    };

    const handleCreateStyleProfile = async () => {
        try {
            const styleProfileData: any = {};

            if (data.gender) {
                styleProfileData.gender = data.gender.toLowerCase();
            }

            if (data.occupation) {
                styleProfileData.occupation = data.occupation;
            }

            if (data.occasion) {
                styleProfileData.occasions = [data.occasion.toLowerCase()];
            }

            if (data.selectedBrands && data.selectedBrands.length > 0) {
                styleProfileData.style_preferences = {
                    selected_brands: data.selectedBrands,
                };
            }

            // Check if style profile already exists
            if (styleProfile) {
                // Check if data has changed
                if (hasDataChanged(data, styleProfile)) {
                    // Update existing profile
                    await updateStyleProfileMutation.mutateAsync(styleProfileData);
                    toastSuccess('Style profile updated successfully');
                }
                // No changes, skip API call and proceed without toast
            } else {
                // Create new profile
                await createStyleProfileMutation.mutateAsync(styleProfileData);
                toastSuccess('Style profile created successfully');
            }

            dispatch(resetProfile());
            router.push('/profile/PhotoUploadInfo');
        } catch (error) {
            toastErrorFromException(error);
        }
    };

    const handleNext = () => {
        switch (currentStep) {
            case 1:
                userProfileFormRef.current?.submitForm();
                break;
            case 2:
                step2FormRef.current?.submitForm();
                break;
            case 3:
                // ChooseStylistStep2 - no form submission needed, just proceed
                handleStepSubmit({});
                break;
            case 4:
                selectGenderRef.current?.submitForm();
                break;
            case 5:
                step3FormRef.current?.submitForm();
                break;
            case 6:
                selectOccasionRef.current?.submitForm();
                break;
            case 7:
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
        // You can add additional logic here to store selected photos
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <UserProfile
                        ref={userProfileFormRef}
                        initialValues={{
                            firstName: data.firstName || userProfile?.first_name || '',
                            lastName: data.lastName || userProfile?.last_name || '',
                            avatar_url: data.avatar_url || userProfile?.avatar_url || null,
                        }}
                        onSubmit={(values) => handleStepSubmit(values)}
                    />
                );
            case 2:
                return (
                    <SelectEmail
                        ref={step2FormRef}
                        initialValues={{ email: data.email }}
                        onSubmit={(values) => handleStepSubmit(values)}
                    />
                );
            case 3:
                return (
                    <ChooseStylistStep2
                        connectedPlatforms={connectedPlatforms}
                        onConnectPlatform={handleConnectPlatform}
                        onPhotosSelected={handlePhotosSelected}
                    />
                );
            case 4:
                return (
                    <SelectGender
                        ref={selectGenderRef}
                        initialValues={{ gender: getInitialGender() }}
                        onSubmit={(values) => handleStepSubmit(values)}
                    />
                );
            case 5:
                return (
                    <SelectOccupation
                        ref={step3FormRef}
                        initialValues={{ occupation: getInitialOccupation() }}
                        onSubmit={(values) => handleStepSubmit(values)}
                    />
                );
            case 6:
                return (
                    <SelectOccasion
                        ref={selectOccasionRef}
                        initialValues={{ occasion: getInitialOccasion() }}
                        onSubmit={(values) => handleStepSubmit(values)}
                    />
                );
            case 7:
                return (
                    <SelectBrand
                        ref={step4FormRef}
                        initialValues={{ selectedBrands: getInitialSelectedBrands() }}
                        onSubmit={(values) => handleStepSubmit(values)}
                        onBrandSelectionChange={(count, hasMinimum) => {
                            setBrandSelectionState({ selectedCount: count, hasMinimum });
                        }}
                        onLoadingChange={(isLoading) => {
                            setIsStep4Loading(isLoading);
                        }}
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
                        title={
                            currentStep === 7
                                ? brandSelectionState.selectedCount > 0
                                    ? brandSelectionState.hasMinimum
                                        ? t.next
                                        : `${brandSelectionState.selectedCount} brand${brandSelectionState.selectedCount !== 1 ? 's' : ''} selected (optional)`
                                    : t.next + ' (Skip)'
                                : t.next
                        }
                        backgroundColor={colors.buttonPrimary}
                        textColor={colors.buttonText}
                        borderColor={colors.buttonPrimary}
                        onPress={handleNext}
                        disabled={false}
                        loading={currentStep === 7 && isStep4Loading}
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

