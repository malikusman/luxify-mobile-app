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
import SelectRegion, { SelectRegionRef } from './components/SelectRegion';
import AdditionalInformation, { AdditionalInformationRef } from './components/AdditionalInformation';
import SelectQuestionOption, { SelectQuestionOptionRef } from './components/SelectQuestionOption';
import { LIMITS } from '@/src/constants/constants';
import { useUserProfileSelector, useCreateStyleProfile, useUpdateStyleProfile, useStyleProfileSelector } from '@/src/services';
import { useQuestionnaireOptions } from '@/src/services/modules/options/optionsHooks';
import { toastErrorFromException, toastSuccess } from '@/src/utils/toast';

const BRAND_STEP = 10;

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
    const resolvedGender = (data.gender || styleProfile?.gender || '').toLowerCase();
    const questionnaireGender: 'female' | 'male' | undefined =
        resolvedGender === 'female' || resolvedGender === 'male' ? resolvedGender : undefined;
    const { data: questionnaire } = useQuestionnaireOptions(true, questionnaireGender);

    useEffect(() => {
        if (userProfile?.id && userProfile?.email) {
            if (data.email && data.email !== userProfile.email) {
                dispatch(resetProfile());
            }
        }
    }, [userProfile?.id, userProfile?.email]);

    useEffect(() => {
        if (currentStep === 1 && questionnaire != null) {
            console.log('Questionnaire options (step 1):', JSON.stringify(questionnaire, null, 2));
        }
    }, [currentStep, questionnaire]);

    const getInitialGender = (): string => {
        if (data.gender) return typeof data.gender === 'string' ? data.gender.toLowerCase() : data.gender;
        return styleProfile?.gender?.toLowerCase() ?? '';
    };

    const getInitialOccasion = (): string => {
        if (data.occasion) return data.occasion;
        if (styleProfile?.occasions && styleProfile.occasions.length > 0) {
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

    const getInitialRegion = (): string => {
        if (data.region) return data.region;
        return styleProfile?.location || '';
    };

    const getInitialFavoriteColors = (): string[] => {
        if (data.favoriteColors && data.favoriteColors.length > 0) return data.favoriteColors;
        return styleProfile?.favorite_colors || [];
    };

    const getInitialBodyHighlightAreas = (): string[] => {
        if (data.bodyHighlightAreas && data.bodyHighlightAreas.length > 0) return data.bodyHighlightAreas;
        return (
            styleProfile?.body_areas_to_highlight ??
            styleProfile?.style_preferences?.body_highlight_areas ??
            []
        );
    };

    const getInitialLocationPreference = (): string[] =>
        data.locationPreference ??
        styleProfile?.location_preference ??
        styleProfile?.style_preferences?.location_preference ??
        [];
    const getInitialLifestylePreference = (): string[] =>
        data.lifestylePreference ??
        styleProfile?.lifestyle_preference ??
        styleProfile?.style_preferences?.lifestyle_preference ??
        [];
    const getInitialColorPreference = (): string[] =>
        data.colorPreference ??
        styleProfile?.color_preference ??
        styleProfile?.style_preferences?.color_preference ??
        [];
    const getInitialStyleIdentity = (): string[] =>
        data.styleIdentity ??
        styleProfile?.style_identity ??
        styleProfile?.style_preferences?.style_identity ??
        [];
    const getInitialComfortPreference = (): string[] =>
        data.comfortPreference ??
        styleProfile?.comfort_preference ??
        styleProfile?.style_preferences?.comfort_preference ??
        [];
    const getInitialStyleInspiration = (): string => {
        const raw = data.styleInspiration ?? styleProfile?.style_inspiration ?? styleProfile?.style_preferences?.style_inspiration;
        return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
    };

    const getQuestionById = (id: string) => questionnaire?.questions?.find((q) => q.id === id);
    const getStyleInspirationOptions = (): { value: string; label: string }[] => {
        const gender = (data.gender || styleProfile?.gender || '').toLowerCase();
        const key = gender === 'male' ? 'men' : 'women';
        return questionnaire?.style_inspirations?.[key] ?? [];
    };

    const getInitialAdditionalInfo = () => {
        return {
            dateOfBirth: data.dateOfBirth || '',
            height: data.height || '',
            size: data.size || '',
            budgetRange: data.budgetRange || styleProfile?.budget_range || '',
            bodyType: data.bodyType || styleProfile?.body_type || '',
            waist: data.waist || '',
            hips: data.hips || '',
            shoulders: data.shoulders || '',
            chest: data.chest || '',
        };
    };

    const userProfileFormRef = useRef<UserProfileRef>(null);
    const step2FormRef = useRef<SelectEmailRef>(null);
    const step3FormRef = useRef<SelectOccupationRef>(null);
    const step4FormRef = useRef<SelectBrandRef>(null);
    const selectGenderRef = useRef<SelectGenderRef>(null);
    const selectOccasionRef = useRef<SelectOccasionRef>(null);
    const selectRegionRef = useRef<SelectRegionRef>(null);
    const additionalInfoRef = useRef<AdditionalInformationRef>(null);
    const selectBodyHighlightAreasRef = useRef<SelectQuestionOptionRef>(null);
    const selectLocationPrefRef = useRef<SelectQuestionOptionRef>(null);
    const selectLifestylePrefRef = useRef<SelectQuestionOptionRef>(null);
    const selectColorPrefRef = useRef<SelectQuestionOptionRef>(null);
    const selectStyleIdentityRef = useRef<SelectQuestionOptionRef>(null);
    const selectComfortPrefRef = useRef<SelectQuestionOptionRef>(null);
    const selectStyleInspirationRef = useRef<SelectQuestionOptionRef>(null);

    const [brandSelectionState, setBrandSelectionState] = useState({
        selectedCount: currentStep === BRAND_STEP ? (data.selectedBrands?.length || 0) : 0,
        hasMinimum: currentStep === BRAND_STEP ? ((data.selectedBrands?.length || 0) >= LIMITS.MIN_BRANDS) : false,
    });

    const [isBrandStepLoading, setIsBrandStepLoading] = useState(false);

    React.useEffect(() => {
        if (currentStep !== BRAND_STEP) {
            setIsBrandStepLoading(false);
        }
    }, [currentStep]);

    useEffect(() => {
        if (userProfile && (!data.firstName || !data.lastName)) {
            const initialData: Partial<ProfileData> = {};
            
            if (userProfile.first_name && !data.firstName) {
                initialData.firstName = userProfile.first_name;
            }
            
            if (userProfile.last_name && !data.lastName) {
                initialData.lastName = userProfile.last_name;
            }
            
            if (userProfile.email && !data.email) {
                initialData.email = userProfile.email;
            }
            
            if (Object.keys(initialData).length > 0) {
                dispatch(updateProfileData(initialData));
            }
        }
    }, [userProfile]);

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

            if (styleProfile.location) {
                initialData.region = styleProfile.location;
            }

            if (styleProfile.favorite_colors) {
                initialData.favoriteColors = styleProfile.favorite_colors;
            }

            if (styleProfile.budget_range) {
                initialData.budgetRange = styleProfile.budget_range;
            }

            if (styleProfile.body_type) {
                initialData.bodyType = styleProfile.body_type;
            }

            if (styleProfile.style_preferences) {
                const prefs = styleProfile.style_preferences;
                
                if (prefs.date_of_birth) {
                    initialData.dateOfBirth = prefs.date_of_birth;
                }
                
                if (prefs.height) {
                    initialData.height = prefs.height;
                }
                
                if (prefs.size) {
                    initialData.size = prefs.size;
                }
                
                if (prefs.measurements) {
                    const measurements = prefs.measurements;
                    if (measurements.waist) initialData.waist = measurements.waist;
                    if (measurements.hips) initialData.hips = measurements.hips;
                    if (measurements.shoulders) initialData.shoulders = measurements.shoulders;
                    if (measurements.chest) initialData.chest = measurements.chest;
                }

                if (prefs.body_highlight_areas) {
                    initialData.bodyHighlightAreas = prefs.body_highlight_areas;
                }
                if (prefs.location_preference) {
                    initialData.locationPreference = prefs.location_preference;
                }
                if (prefs.lifestyle_preference) {
                    initialData.lifestylePreference = prefs.lifestyle_preference;
                }
                if (prefs.color_preference) {
                    initialData.colorPreference = prefs.color_preference;
                }
                if (prefs.style_identity) {
                    initialData.styleIdentity = prefs.style_identity;
                }
                if (prefs.comfort_preference) {
                    initialData.comfortPreference = prefs.comfort_preference;
                }
                if (prefs.style_inspiration) {
                    const si = prefs.style_inspiration;
                    initialData.styleInspiration = Array.isArray(si) ? (si[0] ?? '') : (si ?? '');
                }
            }
            // Top-level preference fields (GET /style_profile returns these at top level)
            if (styleProfile.location_preference?.length) {
                initialData.locationPreference = styleProfile.location_preference;
            }
            if (styleProfile.lifestyle_preference?.length) {
                initialData.lifestylePreference = styleProfile.lifestyle_preference;
            }
            if (styleProfile.color_preference?.length) {
                initialData.colorPreference = styleProfile.color_preference;
            }
            if (styleProfile.body_areas_to_highlight?.length) {
                initialData.bodyHighlightAreas = styleProfile.body_areas_to_highlight;
            }
            if (styleProfile.style_identity?.length) {
                initialData.styleIdentity = styleProfile.style_identity;
            }
            if (styleProfile.comfort_preference?.length) {
                initialData.comfortPreference = styleProfile.comfort_preference;
            }
            if (styleProfile.style_inspiration?.length) {
                initialData.styleInspiration = styleProfile.style_inspiration[0] ?? '';
            }
            
            if (Object.keys(initialData).length > 0) {
                dispatch(updateProfileData(initialData));
            }
        }
    }, [styleProfile]);

    // Always sync questionnaire/preference fields from styleProfile when missing in data
    // (so color, lifestyle, style identity, comfort, etc. show as selected when re-entering flow)
    useEffect(() => {
        if (!styleProfile) return;
        const initialData: Partial<ProfileData> = {};
        if ((!data.locationPreference || data.locationPreference.length === 0) && styleProfile.location_preference?.length) {
            initialData.locationPreference = styleProfile.location_preference;
        }
        if ((!data.lifestylePreference || data.lifestylePreference.length === 0) && styleProfile.lifestyle_preference?.length) {
            initialData.lifestylePreference = styleProfile.lifestyle_preference;
        }
        if ((!data.colorPreference || data.colorPreference.length === 0) && styleProfile.color_preference?.length) {
            initialData.colorPreference = styleProfile.color_preference;
        }
        if ((!data.bodyHighlightAreas || data.bodyHighlightAreas.length === 0) && styleProfile.body_areas_to_highlight?.length) {
            initialData.bodyHighlightAreas = styleProfile.body_areas_to_highlight;
        }
        if ((!data.styleIdentity || data.styleIdentity.length === 0) && styleProfile.style_identity?.length) {
            initialData.styleIdentity = styleProfile.style_identity;
        }
        if ((!data.comfortPreference || data.comfortPreference.length === 0) && styleProfile.comfort_preference?.length) {
            initialData.comfortPreference = styleProfile.comfort_preference;
        }
        if (!data.styleInspiration && styleProfile.style_inspiration?.length) {
            initialData.styleInspiration = styleProfile.style_inspiration[0] ?? '';
        }
        if (Object.keys(initialData).length > 0) {
            dispatch(updateProfileData(initialData));
        }
    }, [styleProfile]);

    useEffect(() => {
        if (currentStep === BRAND_STEP) {
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
            const mergedData: Partial<ProfileData> = {
                firstName: stepData.firstName ?? data.firstName,
                lastName: stepData.lastName ?? data.lastName,
                email: stepData.email ?? data.email,
                region: stepData.region ?? data.region,
                gender: stepData.gender ?? data.gender,
                occupation: stepData.occupation ?? data.occupation,
                occasion: stepData.occasion ?? data.occasion,
                favoriteColors: stepData.favoriteColors ? [...stepData.favoriteColors] : (data.favoriteColors ? [...data.favoriteColors] : []),
                selectedBrands: stepData.selectedBrands ? [...stepData.selectedBrands] : (data.selectedBrands ? [...data.selectedBrands] : []),
                dateOfBirth: stepData.dateOfBirth ?? data.dateOfBirth,
                height: stepData.height ?? data.height,
                size: stepData.size ?? data.size,
                budgetRange: stepData.budgetRange ?? data.budgetRange,
                bodyType: stepData.bodyType ?? data.bodyType,
                waist: stepData.waist ?? data.waist,
                hips: stepData.hips ?? data.hips,
                shoulders: stepData.shoulders ?? data.shoulders,
                chest: stepData.chest ?? data.chest,
                bodyHighlightAreas: stepData.bodyHighlightAreas ? [...stepData.bodyHighlightAreas] : (data.bodyHighlightAreas ? [...data.bodyHighlightAreas] : []),
                locationPreference: stepData.locationPreference ?? data.locationPreference ?? [],
                lifestylePreference: stepData.lifestylePreference ?? data.lifestylePreference ?? [],
                colorPreference: stepData.colorPreference ?? data.colorPreference ?? [],
                styleIdentity: stepData.styleIdentity ?? data.styleIdentity ?? [],
                comfortPreference: stepData.comfortPreference ?? data.comfortPreference ?? [],
                styleInspiration: stepData.styleInspiration ?? data.styleInspiration ?? '',
            };
            await handleCreateStyleProfile(mergedData);
        }
    };

    const hasDataChanged = (formData: any, existingProfile: any): boolean => {
        const formGender = formData.gender?.toLowerCase();
        const existingGender = existingProfile.gender?.toLowerCase();
        if (formGender !== existingGender) return true;

        if (formData.occupation !== existingProfile.occupation) return true;

        const formOccasions = formData.occasion ? [formData.occasion.toLowerCase()] : [];
        const existingOccasions = existingProfile.occasions || [];
        if (JSON.stringify(formOccasions.sort()) !== JSON.stringify([...existingOccasions].sort())) {
            return true;
        }

        if (formData.region !== existingProfile.location) return true;

        const formColors = formData.favoriteColors || [];
        const existingColors = existingProfile.favorite_colors || [];
        if (JSON.stringify(formColors.sort()) !== JSON.stringify([...existingColors].sort())) {
            return true;
        }

        const formBrands = formData.selectedBrands || [];
        const existingBrands = existingProfile.style_preferences?.selected_brands || [];
        if (JSON.stringify(formBrands.sort()) !== JSON.stringify([...existingBrands].sort())) {
            return true;
        }

        if (formData.budgetRange !== existingProfile.budget_range) return true;

        if (formData.bodyType !== existingProfile.body_type) return true;

        const existingPrefs = existingProfile.style_preferences || {};
        const formPrefs: any = {};
        
        if (formData.dateOfBirth) formPrefs.date_of_birth = formData.dateOfBirth;
        if (formData.height) formPrefs.height = formData.height;
        if (formData.size) formPrefs.size = formData.size;
        
        const formMeasurements: any = {};
        if (formData.waist) formMeasurements.waist = formData.waist;
        if (formData.hips) formMeasurements.hips = formData.hips;
        if (formData.shoulders) formMeasurements.shoulders = formData.shoulders;
        if (formData.chest) formMeasurements.chest = formData.chest;
        
        if (Object.keys(formMeasurements).length > 0) {
            formPrefs.measurements = formMeasurements;
        }

        if (formPrefs.date_of_birth !== existingPrefs.date_of_birth) return true;
        
        if (formPrefs.height !== existingPrefs.height) return true;
        
        if (formPrefs.size !== existingPrefs.size) return true;
        
        const existingMeasurements = existingPrefs.measurements || {};
        if (JSON.stringify(formMeasurements) !== JSON.stringify(existingMeasurements)) {
            return true;
        }

        const formHighlightAreas = formData.bodyHighlightAreas || [];
        const existingHighlightAreas =
            existingProfile.body_areas_to_highlight ?? existingPrefs.body_highlight_areas ?? [];
        if (JSON.stringify(formHighlightAreas.sort()) !== JSON.stringify([...existingHighlightAreas].sort())) {
            return true;
        }

        const arr = (a: string[]) => JSON.stringify((a || []).sort());
        const loc = existingProfile.location_preference ?? existingPrefs.location_preference ?? [];
        if (arr(formData.locationPreference || []) !== arr(loc)) return true;
        const life = existingProfile.lifestyle_preference ?? existingPrefs.lifestyle_preference ?? [];
        if (arr(formData.lifestylePreference || []) !== arr(life)) return true;
        const col = existingProfile.color_preference ?? existingPrefs.color_preference ?? [];
        if (arr(formData.colorPreference || []) !== arr(col)) return true;
        const ident = existingProfile.style_identity ?? existingPrefs.style_identity ?? [];
        if (arr(formData.styleIdentity || []) !== arr(ident)) return true;
        const comfort = existingProfile.comfort_preference ?? existingPrefs.comfort_preference ?? [];
        if (arr(formData.comfortPreference || []) !== arr(comfort)) return true;
        const insp = existingProfile.style_inspiration ?? existingPrefs.style_inspiration ?? [];
        const existingInsp = Array.isArray(insp) ? (insp[0] ?? '') : (insp || '');
        if ((formData.styleInspiration || '') !== existingInsp) return true;

        return false;
    };

    const handleCreateStyleProfile = async (overrideData?: Partial<ProfileData>) => {
        try {
            const profileData = overrideData || data;
            const styleProfileData: any = {};

            if (profileData.gender) {
                styleProfileData.gender = profileData.gender.toLowerCase();
            }

            if (profileData.occupation) {
                styleProfileData.occupation = profileData.occupation;
            }

            if (profileData.occasion) {
                styleProfileData.occasions = [profileData.occasion.toLowerCase()];
            }

            if (profileData.region) {
                styleProfileData.location = profileData.region;
            }

            if (profileData.favoriteColors && profileData.favoriteColors.length > 0) {
                styleProfileData.favorite_colors = profileData.favoriteColors;
            }

            if (profileData.budgetRange) {
                styleProfileData.budget_range = profileData.budgetRange;
            }

            if (profileData.bodyType) {
                styleProfileData.body_type = profileData.bodyType;
            }

            // Preference fields at top level per API doc (arrays; use values from questionnaire)
            const toArray = (v: string[] | undefined): string[] =>
                Array.isArray(v) ? v : v ? [v].filter(Boolean) : [];
            styleProfileData.location_preference = toArray(profileData.locationPreference);
            styleProfileData.lifestyle_preference = toArray(profileData.lifestylePreference);
            styleProfileData.color_preference = toArray(profileData.colorPreference);
            styleProfileData.body_areas_to_highlight = toArray(profileData.bodyHighlightAreas);
            styleProfileData.style_identity = toArray(profileData.styleIdentity);
            styleProfileData.comfort_preference = toArray(profileData.comfortPreference);
            styleProfileData.style_inspiration = profileData.styleInspiration?.trim()
                ? [profileData.styleInspiration.trim()]
                : [];

            const stylePreferences: any = styleProfile?.style_preferences ? { ...styleProfile.style_preferences } : {};
            if (profileData.selectedBrands && profileData.selectedBrands.length > 0) {
                stylePreferences.selected_brands = profileData.selectedBrands;
            }
            if (profileData.dateOfBirth && profileData.dateOfBirth.trim() !== '') {
                stylePreferences.date_of_birth = profileData.dateOfBirth;
            }
            if (profileData.height && profileData.height.trim() !== '') {
                stylePreferences.height = profileData.height;
            }
            if (profileData.size && profileData.size.trim() !== '') {
                stylePreferences.size = profileData.size;
            }
            const measurements: any = {};
            if (profileData.waist && profileData.waist.trim() !== '') measurements.waist = profileData.waist;
            if (profileData.hips && profileData.hips.trim() !== '') measurements.hips = profileData.hips;
            if (profileData.shoulders && profileData.shoulders.trim() !== '') measurements.shoulders = profileData.shoulders;
            if (profileData.chest && profileData.chest.trim() !== '') measurements.chest = profileData.chest;
            if (Object.keys(measurements).length > 0) {
                stylePreferences.measurements = measurements;
            }
            if (Object.keys(stylePreferences).length > 0) {
                styleProfileData.style_preferences = stylePreferences;
            }

            console.log('=== Style Profile API Call ===');
            console.log('Profile Data being used:', JSON.stringify(profileData, null, 2));
            console.log('Style Profile Data being sent:', JSON.stringify(styleProfileData, null, 2));

            const isAlreadyExistsError = (err: any) => {
                const status = err?.statusCode ?? err?.response?.status;
                const message = (err?.message ?? err?.response?.data?.message ?? '').toLowerCase();
                return status === 422 && (message.includes('already exist') || message.includes('style profile'));
            };

            if (styleProfile) {
                if (hasDataChanged(profileData, styleProfile)) {
                    await updateStyleProfileMutation.mutateAsync(styleProfileData);
                    toastSuccess('Style profile updated successfully');
                }
            } else {
                try {
                    await createStyleProfileMutation.mutateAsync(styleProfileData);
                    toastSuccess('Style profile created successfully');
                } catch (createError: any) {
                    if (isAlreadyExistsError(createError)) {
                        await updateStyleProfileMutation.mutateAsync(styleProfileData);
                        toastSuccess('Style profile updated successfully');
                    } else {
                        throw createError;
                    }
                }
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
                selectRegionRef.current?.submitForm();
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
                selectLocationPrefRef.current?.submitForm();
                break;
            case 8:
                selectLifestylePrefRef.current?.submitForm();
                break;
            case 9:
                selectColorPrefRef.current?.submitForm();
                break;
            case 10:
                step4FormRef.current?.submitForm();
                break;
            case 11:
                selectBodyHighlightAreasRef.current?.submitForm();
                break;
            case 12:
                selectStyleIdentityRef.current?.submitForm();
                break;
            case 13:
                selectComfortPrefRef.current?.submitForm();
                break;
            case 14:
                selectStyleInspirationRef.current?.submitForm();
                break;
            case 15:
                additionalInfoRef.current?.submitForm();
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
                    <UserProfile
                        ref={userProfileFormRef}
                        initialValues={{
                            firstName: data.firstName || userProfile?.first_name || '',
                            lastName: data.lastName || userProfile?.last_name || '',
                            avatar_url: userProfile?.avatar_url || null,
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
                    <SelectRegion
                        ref={selectRegionRef}
                        initialValues={{ region: getInitialRegion() }}
                        onSubmit={(values) => handleStepSubmit(values)}
                    />
                );
            case 4:
                return (
                    <SelectGender
                        ref={selectGenderRef}
                        initialValues={{ gender: getInitialGender() }}
                        onSubmit={(values) => handleStepSubmit(values)}
                        genderField={questionnaire?.form_fields?.gender}
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
            case 7: {
                const q = getQuestionById('location_preference');
                return q ? (
                    <SelectQuestionOption
                        ref={selectLocationPrefRef}
                        title={q.question}
                        options={q.options}
                        multiple={true}
                        fieldName="locationPreference"
                        initialValues={{ locationPreference: getInitialLocationPreference() }}
                        onSubmit={(v) => handleStepSubmit({ locationPreference: v.locationPreference as string[] })}
                    />
                ) : (
                    <SelectQuestionOption
                        ref={selectLocationPrefRef}
                        title="Where do you live most of the year?"
                        options={[]}
                        multiple={true}
                        fieldName="locationPreference"
                        initialValues={{ locationPreference: getInitialLocationPreference() }}
                        onSubmit={(v) => handleStepSubmit({ locationPreference: (v.locationPreference as string[]) || [] })}
                    />
                );
            }
            case 8: {
                const q = getQuestionById('lifestyle_preference');
                return q ? (
                    <SelectQuestionOption
                        ref={selectLifestylePrefRef}
                        title={q.question}
                        options={q.options}
                        multiple={true}
                        fieldName="lifestylePreference"
                        initialValues={{ lifestylePreference: getInitialLifestylePreference() }}
                        onSubmit={(v) => handleStepSubmit({ lifestylePreference: v.lifestylePreference as string[] })}
                    />
                ) : (
                    <SelectQuestionOption
                        ref={selectLifestylePrefRef}
                        title="What do you mostly get dressed for?"
                        options={[]}
                        multiple={true}
                        fieldName="lifestylePreference"
                        initialValues={{ lifestylePreference: getInitialLifestylePreference() }}
                        onSubmit={(v) => handleStepSubmit({ lifestylePreference: (v.lifestylePreference as string[]) || [] })}
                    />
                );
            }
            case 9: {
                const q = getQuestionById('color_preference');
                return q ? (
                    <SelectQuestionOption
                        ref={selectColorPrefRef}
                        title={q.question}
                        options={q.options}
                        multiple={true}
                        fieldName="colorPreference"
                        initialValues={{ colorPreference: getInitialColorPreference() }}
                        onSubmit={(v) => handleStepSubmit({ colorPreference: (v.colorPreference as string[]) || [] })}
                    />
                ) : (
                    <SelectQuestionOption
                        ref={selectColorPrefRef}
                        title="What are the colors you prefer?"
                        options={[]}
                        multiple={true}
                        fieldName="colorPreference"
                        initialValues={{ colorPreference: getInitialColorPreference() }}
                        onSubmit={(v) => handleStepSubmit({ colorPreference: (v.colorPreference as string[]) || [] })}
                    />
                );
            }
            case 10:
                return (
                    <SelectBrand
                        ref={step4FormRef}
                        initialValues={{ selectedBrands: getInitialSelectedBrands() }}
                        onSubmit={(values) => handleStepSubmit(values)}
                        onBrandSelectionChange={(count, hasMinimum) => {
                            setBrandSelectionState({ selectedCount: count, hasMinimum });
                        }}
                        onLoadingChange={(isLoading) => {
                            setIsBrandStepLoading(isLoading);
                        }}
                    />
                );
            case 11: {
                const q = getQuestionById('body_areas_to_highlight');
                return q ? (
                    <SelectQuestionOption
                        ref={selectBodyHighlightAreasRef}
                        title={q.question}
                        options={q.options}
                        multiple={true}
                        fieldName="bodyHighlightAreas"
                        initialValues={{ bodyHighlightAreas: getInitialBodyHighlightAreas() }}
                        onSubmit={(v) => handleStepSubmit({ bodyHighlightAreas: (v.bodyHighlightAreas as string[]) || [] })}
                    />
                ) : (
                    <SelectQuestionOption
                        ref={selectBodyHighlightAreasRef}
                        title="Which areas of your body do you love to highlight?"
                        options={[]}
                        multiple={true}
                        fieldName="bodyHighlightAreas"
                        initialValues={{ bodyHighlightAreas: getInitialBodyHighlightAreas() }}
                        onSubmit={(v) => handleStepSubmit({ bodyHighlightAreas: (v.bodyHighlightAreas as string[]) || [] })}
                    />
                );
            }
            case 12: {
                const q = getQuestionById('style_identity');
                return q ? (
                    <SelectQuestionOption
                        ref={selectStyleIdentityRef}
                        title={q.question}
                        options={q.options}
                        multiple={true}
                        fieldName="styleIdentity"
                        initialValues={{ styleIdentity: getInitialStyleIdentity() }}
                        onSubmit={(v) => handleStepSubmit({ styleIdentity: (v.styleIdentity as string[]) || [] })}
                    />
                ) : (
                    <SelectQuestionOption
                        ref={selectStyleIdentityRef}
                        title="Which style best describes the look you want to achieve?"
                        options={[]}
                        multiple={true}
                        fieldName="styleIdentity"
                        initialValues={{ styleIdentity: getInitialStyleIdentity() }}
                        onSubmit={(v) => handleStepSubmit({ styleIdentity: (v.styleIdentity as string[]) || [] })}
                    />
                );
            }
            case 13: {
                const q = getQuestionById('comfort_preference');
                return q ? (
                    <SelectQuestionOption
                        ref={selectComfortPrefRef}
                        title={q.question}
                        options={q.options}
                        multiple={true}
                        fieldName="comfortPreference"
                        initialValues={{ comfortPreference: getInitialComfortPreference() }}
                        onSubmit={(v) => handleStepSubmit({ comfortPreference: (v.comfortPreference as string[]) || [] })}
                    />
                ) : (
                    <SelectQuestionOption
                        ref={selectComfortPrefRef}
                        title="When it comes to clothes, you usually prefer:"
                        options={[]}
                        multiple={true}
                        fieldName="comfortPreference"
                        initialValues={{ comfortPreference: getInitialComfortPreference() }}
                        onSubmit={(v) => handleStepSubmit({ comfortPreference: (v.comfortPreference as string[]) || [] })}
                    />
                );
            }
            case 14: {
                const options = getStyleInspirationOptions();
                const q = getQuestionById('style_inspiration');
                const title = q?.question ?? "Whose style do you love the most?";
                return (
                    <SelectQuestionOption
                        ref={selectStyleInspirationRef}
                        title={title}
                        options={options}
                        multiple={false}
                        fieldName="styleInspiration"
                        initialValues={{ styleInspiration: getInitialStyleInspiration() }}
                        onSubmit={(v) => handleStepSubmit({ styleInspiration: (v.styleInspiration as string) || '' })}
                    />
                );
            }
            case 15:
                return (
                    <AdditionalInformation
                        ref={additionalInfoRef}
                        initialValues={getInitialAdditionalInfo()}
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
                        disabled={false}
                        loading={currentStep === BRAND_STEP && isBrandStepLoading}
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

