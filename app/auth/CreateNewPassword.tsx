import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Modal, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { resetPasswordSchema } from '@/src/validation/authSchemas';
import { FONTS } from '@/src/constants/fonts';
import CustomButton from '@/src/components/common/CustomButton';
import CustomInput from '@/src/components/common/CustomInput';
import BackButton from '@/src/components/common/BackButton';
import SuccessIcon from '@/src/components/icons/SuccessIcon';
import { useResetPassword } from '@/src/services';
import { toastErrorFromException, toastSuccess } from '@/src/utils/toast';
import { styles } from './styles/createNewPasswordStyles';

export default function CreateNewPassword() {
    const router = useRouter();
    const params = useLocalSearchParams<{ email?: string; code?: string; reset_password_token?: string }>();
    const colors = useThemeColors();
    const t = translations.auth;
    const insets = useSafeAreaInsets();
    const resetPasswordMutation = useResetPassword();

    const email = params.email || '';
    const code = params.code || '';
    const resetPasswordToken = params.reset_password_token || '';
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const confirmPasswordInputRef = useRef<any>(null);
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (showSuccessModal) {
            Animated.spring(slideAnim, {
                toValue: 1,
                useNativeDriver: true, 
                tension: 50,
                friction: 7,
            }).start();
        } else {
            slideAnim.setValue(0);
        }
    }, [showSuccessModal, slideAnim]);

    const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
        if (!email) {
            toastErrorFromException(new Error('Email is required'));
            return;
        }

        if (!code) {
            toastErrorFromException(new Error('Verification code is required'));
            return;
        }

        try {
            setIsSubmitting(true);
            await resetPasswordMutation.mutateAsync({
                email,
                code,
                password: values.password,
                password_confirmation: values.confirmPassword,
                ...(resetPasswordToken && { reset_password_token: resetPasswordToken }),
            });
            toastSuccess(t.passwordChanged || 'Password changed successfully');
            setShowSuccessModal(true);
        } catch (error) {
            toastErrorFromException(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackToHome = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setShowSuccessModal(false);
            router.dismissAll();
            router.dismissAll();
                        router.replace('/auth/LoginWIthEmail');
        });
    };

    const translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [400, 0],
    });

    return (
        <>
            <KeyboardAvoidingView
                style={[styles.wrapper, { backgroundColor: colors.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <View style={styles.backButtonContainer}>
                    <BackButton />
                </View>

                <Formik
                    initialValues={{ password: '', confirmPassword: '' }}
                    validationSchema={resetPasswordSchema}
                    onSubmit={handleSubmit}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => {
                        const isFormValid = values.password && values.confirmPassword && !errors.password && !errors.confirmPassword;

                        return (
                            <ScrollView
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View style={styles.container}>
                                    <Text style={[styles.titleText, { color: colors.text }]}>
                                        {t.createNewPassword}
                                    </Text>

                                    <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
                                        {t.createNewPasswordSubtitle}
                                    </Text>

                                    <View style={styles.inputContainer}>
                                        <CustomInput
                                            placeholder={t.newPassword}
                                            value={values.password}
                                            onChangeText={handleChange('password')}
                                            onBlur={handleBlur('password')}
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            returnKeyType="next"
                                            onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                                            icon={
                                                <Ionicons
                                                    name="lock-closed-outline"
                                                    size={scaleFontSize(20)}
                                                    color={values.password ? colors.text : colors.textSecondary}
                                                />
                                            }
                                            rightIcon={
                                                <Ionicons
                                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                                    size={scaleFontSize(20)}
                                                    color={colors.textSecondary}
                                                />
                                            }
                                            onRightIconPress={() => setShowPassword(!showPassword)}
                                        />
                                        {touched.password && errors.password && (
                                            <Text style={[styles.errorText, { color: colors.error }]}>
                                                {errors.password}
                                            </Text>
                                        )}

                                        <CustomInput
                                            ref={confirmPasswordInputRef}
                                            placeholder={t.confirmPassword}
                                            value={values.confirmPassword}
                                            onChangeText={handleChange('confirmPassword')}
                                            onBlur={handleBlur('confirmPassword')}
                                            secureTextEntry={!showConfirmPassword}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            returnKeyType="done"
                                            onSubmitEditing={() => handleSubmit()}
                                            icon={
                                                <Ionicons
                                                    name="lock-closed-outline"
                                                    size={scaleFontSize(20)}
                                                    color={values.confirmPassword ? colors.text : colors.textSecondary}
                                                />
                                            }
                                            rightIcon={
                                                <Ionicons
                                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                                    size={scaleFontSize(20)}
                                                    color={colors.textSecondary}
                                                />
                                            }
                                            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        />
                                        {touched.confirmPassword && errors.confirmPassword && (
                                            <Text style={[styles.errorText, { color: colors.error }]}>
                                                {errors.confirmPassword}
                                            </Text>
                                        )}
                                    </View>

                                    <View style={styles.buttonContainer}>
                                        <CustomButton
                                            title={t.confirm}
                                            backgroundColor={isFormValid && !isSubmitting ? colors.buttonPrimary : colors.textDisabled}
                                            textColor={isFormValid && !isSubmitting ? colors.buttonText : colors.textSecondary}
                                            borderColor={isFormValid && !isSubmitting ? colors.buttonPrimary : colors.textDisabled}
                                            onPress={() => handleSubmit()}
                                            disabled={!isFormValid || isSubmitting}
                                        />
                                    </View>
                                </View>
                            </ScrollView>
                        );
                    }}
                </Formik>
            </KeyboardAvoidingView>

            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={handleBackToHome}
            >
                <View style={styles.bottomSheetOverlay}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={handleBackToHome}
                    />
                    <Animated.View
                        style={[
                            styles.bottomSheetContent,
                            {
                                backgroundColor: colors.background,
                                transform: [{ translateY }],
                                paddingBottom: Math.max(insets.bottom, scaleFontSize(40)),
                            },
                        ]}
                    >
                        <View style={styles.bottomSheetHandle} />
                        
                        <View style={styles.bottomSheetIconContainer}>
                            <View style={[styles.iconBackground, { backgroundColor: colors.successIconBackground }]}>
                                <SuccessIcon
                                    size={scaleFontSize(50)}
                                    color={colors.text}
                                />
                            </View>
                        </View>

                        <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>
                            {t.passwordChanged}
                        </Text>

                        <Text style={[styles.bottomSheetSubtitle, { color: colors.textSecondary }]}>
                            {t.passwordChangedSubtitle}
                        </Text>

                        <View style={styles.bottomSheetButtonContainer}>
                            <CustomButton
                                title={t.backToHome}
                                backgroundColor={colors.buttonPrimary}
                                textColor={colors.buttonText}
                                borderColor={colors.buttonPrimary}
                                onPress={handleBackToHome}
                            />
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
}

