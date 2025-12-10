import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome, AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { signUpSchema } from '@/src/validation/authSchemas';
import { FONTS } from '@/src/constants/fonts';
import CustomButton from '@/src/components/common/CustomButton';
import CustomInput from '@/src/components/common/CustomInput';
import CustomCheckbox from '@/src/components/common/CustomCheckbox';
import BackButton from '@/src/components/common/BackButton';
import SocialLoginButton from '@/src/components/common/SocialLoginButton';
import Logo from '@/src/components/common/Logo';
import GoogleIcon from '@/src/components/icons/GoogleIcon';
import { useSignUp } from '@/src/services/modules/auth/authHooks';
import { useToast } from '@/src/context/ToastContext';
import { getErrorMessage } from '@/src/utils/errorHandler';

export default function SignUp() {
    const router = useRouter();
    const colors = useThemeColors();
    const t = translations.auth;
    const { showError } = useToast();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);
    const firstNameInputRef = useRef<TextInput>(null);
    const lastNameInputRef = useRef<TextInput>(null);

    const signUpMutation = useSignUp();

    const handleSignUp = async (values: { 
        email: string; 
        password: string; 
        password_confirmation: string;
        first_name: string;
        last_name: string;
        rememberMe: boolean;
    }) => {
        try {
            await signUpMutation.mutateAsync({
                email: values.email,
                password: values.password,
                password_confirmation: values.password_confirmation,
                first_name: values.first_name,
                last_name: values.last_name,
            });
            router.replace('/home/(tabs)');
        } catch (error: any) {
            const errorMessage = getErrorMessage(error);
            showError(errorMessage || 'An error occurred during sign up. Please try again.');
        }
    };

    const handleSignIn = () => {
        router.push('/auth/login');
    };

    return (
        <KeyboardAvoidingView
            style={[styles.wrapper, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <View style={styles.backButtonContainer}>
                <BackButton />
            </View>

            <Formik
                initialValues={{ 
                    email: '', 
                    password: '', 
                    password_confirmation: '',
                    first_name: '',
                    last_name: '',
                    rememberMe: false 
                }}
                validationSchema={signUpSchema}
                onSubmit={handleSignUp}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.container}>
                            <View style={styles.logoContainer}>
                                <Logo size={scaleFontSize(80)} />
                            </View>

                            <Text style={[styles.titleText, { color: colors.text }]}>
                                {t.createAccount}
                            </Text>

                            <CustomInput
                                ref={firstNameInputRef}
                                placeholder={translations.onboarding.firstNamePlaceholder}
                                value={values.first_name}
                                onChangeText={handleChange('first_name')}
                                onBlur={handleBlur('first_name')}
                                autoCapitalize="words"
                                autoCorrect={false}
                                returnKeyType="next"
                                onSubmitEditing={() => lastNameInputRef.current?.focus()}
                                icon={
                                    <Ionicons
                                        name="person-outline"
                                        size={scaleFontSize(20)}
                                        color={values.first_name ? colors.text : colors.textSecondary}
                                    />
                                }
                            />
                            {touched.first_name && errors.first_name && (
                                <Text style={[styles.errorText, { color: colors.error }]}>
                                    {errors.first_name}
                                </Text>
                            )}

                            <CustomInput
                                ref={lastNameInputRef}
                                placeholder={translations.onboarding.lastNamePlaceholder}
                                value={values.last_name}
                                onChangeText={handleChange('last_name')}
                                onBlur={handleBlur('last_name')}
                                autoCapitalize="words"
                                autoCorrect={false}
                                returnKeyType="next"
                                onSubmitEditing={() => passwordInputRef.current?.focus()}
                                icon={
                                    <Ionicons
                                        name="person-outline"
                                        size={scaleFontSize(20)}
                                        color={values.last_name ? colors.text : colors.textSecondary}
                                    />
                                }
                            />
                            {touched.last_name && errors.last_name && (
                                <Text style={[styles.errorText, { color: colors.error }]}>
                                    {errors.last_name}
                                </Text>
                            )}

                            <CustomInput
                                placeholder={t.emailPlaceholder}
                                value={values.email}
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="next"
                                onSubmitEditing={() => passwordInputRef.current?.focus()}
                                icon={
                                    <MaterialCommunityIcons
                                        name="email-outline"
                                        size={scaleFontSize(20)}
                                        color={values.email ? colors.text : colors.textSecondary}
                                    />
                                }
                            />
                            {touched.email && errors.email && (
                                <Text style={[styles.errorText, { color: colors.error }]}>
                                    {errors.email}
                                </Text>
                            )}

                            <CustomInput
                                ref={passwordInputRef}
                                placeholder={t.passwordPlaceholder}
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
                                placeholder="Confirm password"
                                value={values.password_confirmation}
                                onChangeText={handleChange('password_confirmation')}
                                onBlur={handleBlur('password_confirmation')}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="done"
                                onSubmitEditing={() => handleSubmit()}
                                icon={
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={scaleFontSize(20)}
                                        color={values.password_confirmation ? colors.text : colors.textSecondary}
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
                            {touched.password_confirmation && errors.password_confirmation && (
                                <Text style={[styles.errorText, { color: colors.error }]}>
                                    {errors.password_confirmation}
                                </Text>
                            )}

                            <View style={styles.checkboxContainer}>
                                <CustomCheckbox
                                    label={t.rememberMe}
                                    checked={values.rememberMe}
                                    onPress={() => setFieldValue('rememberMe', !values.rememberMe)}
                                />
                            </View>

                            <View style={styles.signUpButtonContainer}>
                                <CustomButton
                                    title={signUpMutation.isPending ? 'Signing up...' : t.signUp}
                                    backgroundColor={colors.buttonPrimary}
                                    textColor={colors.buttonText}
                                    borderColor={colors.buttonPrimary}
                                    onPress={() => handleSubmit()}
                                    disabled={signUpMutation.isPending}
                                />
                                {signUpMutation.isPending && (
                                    <ActivityIndicator 
                                        size="small" 
                                        color={colors.buttonText} 
                                        style={styles.loader}
                                    />
                                )}
                            </View>

                            <View style={styles.dividerContainer}>
                                <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
                                <Text style={[styles.dividerText, { color: colors.textTertiary }]}>
                                    {t.orContinueWith}
                                </Text>
                                <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
                            </View>

                            <View style={styles.socialContainer}>
                                <SocialLoginButton
                                    icon={<GoogleIcon size={scaleFontSize(24)} />}
                                />

                                <SocialLoginButton
                                    icon={
                                        <FontAwesome
                                            name="facebook"
                                            size={scaleFontSize(24)}
                                            color="#1877F2"
                                        />
                                    }
                                />

                                <SocialLoginButton
                                    icon={
                                        <AntDesign
                                            name="apple"
                                            size={scaleFontSize(24)}
                                            color={colors.text}
                                        />
                                    }
                                />
                            </View>

                            <View style={styles.signInContainer}>
                                <Text style={[styles.signInText, { color: colors.textSecondary }]}>
                                    {t.alreadyHaveAccount}
                                </Text>
                                <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
                                    <Text style={[styles.signInLink, { color: colors.text }]}>
                                        {t.signIn}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                )}
            </Formik>
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
    logoContainer: {
        marginTop: scaleFontSize(40),
    },
    titleText: {
        fontSize: scaleFontSize(32),
        lineHeight: scaleFontSize(39),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(32),
        textAlign: 'center',
    },
    errorText: {
        width: '100%',
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(-12),
        marginBottom: scaleFontSize(8),
        paddingLeft: scaleFontSize(4),
    },
    checkboxContainer: {
        width: '100%',
        alignItems: 'flex-start',
    },
    signUpButtonContainer: {
        width: '100%',
        marginTop: scaleFontSize(30),
    },
    dividerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: scaleFontSize(16),
        marginBottom: scaleFontSize(24),
    },
    dividerText: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.nunitoRegular,
        paddingHorizontal: 12,
    },
    socialContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: scaleFontSize(8),
        marginBottom: scaleFontSize(20),
    },
    signInContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    signInText: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
    },
    signInLink: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
    },
    loader: {
        marginTop: scaleFontSize(8),
    },
});
