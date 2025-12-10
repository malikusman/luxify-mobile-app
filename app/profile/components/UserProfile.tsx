import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Formik, FormikProps } from 'formik';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { step1Schema } from '@/src/validation/authSchemas';
import { FONTS } from '@/src/constants/fonts';
import CustomInput from '@/src/components/common/CustomInput';
import Step1Icon from '@/src/components/icons/Step1Icon';
import { pickImageFromGallery, takePhotoWithCamera, showImageSourceDialog } from '@/src/services/imagePickerService';
import { useUpdateUser, useUserProfileSelector } from '@/src/services';
import { toastErrorFromException } from '@/src/utils/toast';
import { IMAGE_QUALITY } from '@/src/constants/constants';

interface UserProfileProps {
    initialValues: { firstName: string; lastName: string; avatar_url?: string | null };
    onSubmit: (values: { firstName: string; lastName: string }) => void;
}

export interface UserProfileRef {
    submitForm: () => void;
}

const UserProfile = forwardRef<UserProfileRef, UserProfileProps>(({ initialValues, onSubmit }, ref) => {
    const colors = useThemeColors();
    const t = translations.onboarding;
    const updateUserMutation = useUpdateUser();
    const userProfile = useUserProfileSelector();
    const [avatarUri, setAvatarUri] = useState<string | null>(initialValues.avatar_url || userProfile?.avatar_url || null);

    const formikRef = React.useRef<FormikProps<any>>(null);

    useEffect(() => {
        if (userProfile?.avatar_url && !initialValues.avatar_url) {
            setAvatarUri(userProfile.avatar_url);
        } else if (initialValues.avatar_url) {
            setAvatarUri(initialValues.avatar_url);
        }
    }, [userProfile?.avatar_url, initialValues.avatar_url]);

    useImperativeHandle(ref, () => ({
        submitForm: async () => {
            const formik = formikRef.current;
            if (!formik) return;

            const isDirty = formik.dirty || avatarUri !== (initialValues.avatar_url || null);

            if (isDirty) {
                try {
                    const updateData: any = {};
                    
                    if (formik.values.firstName !== initialValues.firstName) {
                        updateData.first_name = formik.values.firstName;
                    }
                    if (formik.values.lastName !== initialValues.lastName) {
                        updateData.last_name = formik.values.lastName;
                    }
                    if (avatarUri !== (initialValues.avatar_url || null)) {
                        updateData.avatar_url = avatarUri;
                    }

                    if (Object.keys(updateData).length > 0) {
                        await updateUserMutation.mutateAsync(updateData);
                    }
                } catch (error) {
                    toastErrorFromException(error);
                    return;
                }
            }

            formik.submitForm();
        },
    }));

    const handleImagePress = () => {
        const onTakePhoto = async () => {
            const result = await takePhotoWithCamera({
                quality: IMAGE_QUALITY.DEFAULT,
                allowsEditing: true,
            });

            if (result.success && result.uri) {
                setAvatarUri(result.uri);
            }
        };

        const onPickFromGallery = async () => {
            const result = await pickImageFromGallery({
                quality: IMAGE_QUALITY.DEFAULT,
            });

            if (result.success && result.uri) {
                setAvatarUri(result.uri);
            }
        };

        const onRemove = () => {
            setAvatarUri(null);
        };

        showImageSourceDialog(
            onTakePhoto,
            onPickFromGallery,
            avatarUri ? onRemove : undefined,
            avatarUri ? translations.imagePicker.replacePhoto : translations.imagePicker.addPhoto
        );
    };

    return (
        <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={step1Schema}
            onSubmit={onSubmit}
        >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.container}>
                    <View style={styles.topSection}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {t.step1Title}
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {t.step1Subtitle}
                        </Text>
                    </View>

                    <View style={styles.middleSection}>
                        <TouchableOpacity
                            style={styles.iconContainer}
                            onPress={handleImagePress}
                            activeOpacity={0.7}
                        >
                            {avatarUri ? (
                                <Image
                                    source={{ uri: avatarUri }}
                                    style={[styles.avatarImage, { width: scaleFontSize(80), height: scaleFontSize(80) }]}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Step1Icon 
                                    size={scaleFontSize(80)} 
                                    color={colors.textSecondary} 
                                    backgroundColor={colors.surface}
                                />
                            )}
                        </TouchableOpacity>

                        <CustomInput
                            placeholder={t.firstNamePlaceholder}
                            value={values.firstName}
                            onChangeText={handleChange('firstName')}
                            onBlur={handleBlur('firstName')}
                            autoCapitalize="words"
                            autoCorrect={false}
                            returnKeyType="next"
                        />
                        {touched.firstName && errors.firstName && (
                            <Text style={[styles.errorText, { color: colors.error }]}>
                                {errors.firstName}
                            </Text>
                        )}

                        <CustomInput
                            placeholder={t.lastNamePlaceholder}
                            value={values.lastName}
                            onChangeText={handleChange('lastName')}
                            onBlur={handleBlur('lastName')}
                            autoCapitalize="words"
                            autoCorrect={false}
                            returnKeyType="done"
                            onSubmitEditing={() => handleSubmit()}
                        />
                        {touched.lastName && errors.lastName && (
                            <Text style={[styles.errorText, { color: colors.error }]}>
                                {errors.lastName}
                            </Text>
                        )}
                    </View>
                </View>
            )}
        </Formik>
    );
});

UserProfile.displayName = 'UserProfile';

export default UserProfile;

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    topSection: {
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
        paddingHorizontal: 20,
    },
    middleSection: {
        width: '100%',
        alignItems: 'center',
        marginTop: scaleFontSize(32),
    },
    iconContainer: {
        marginBottom: scaleFontSize(32),
    },
    errorText: {
        width: '100%',
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginTop: -12,
        marginBottom: 8,
        paddingLeft: 4,
    },
    avatarImage: {
        borderRadius: scaleFontSize(40),
    },
});

