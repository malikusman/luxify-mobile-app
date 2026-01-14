import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import BackButton from '@/src/components/common/BackButton';
import VerificationCodeInput from '@/src/components/common/VerificationCodeInput';
import { useForgotPassword, useVerifyResetCode, useVerifyEmail } from '@/src/services';
import { toastErrorFromException, toastSuccess } from '@/src/utils/toast';
import { styles } from './styles/verificationCodeStyles';

type VerificationMode = 'password_reset' | 'email_verification';

export default function VerificationCode() {
    const router = useRouter();
    const params = useLocalSearchParams<{ email?: string; mode?: string }>();
    const colors = useThemeColors();
    const t = translations.auth;
    const verifyResetCodeMutation = useVerifyResetCode();
    const verifyEmailMutation = useVerifyEmail();
    const forgotPasswordMutation = useForgotPassword();

    const email = params.email || '';
    const mode: VerificationMode = (params.mode as VerificationMode) || 'password_reset';
    const isEmailVerificationMode = mode === 'email_verification';
    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(10); // 10 seconds countdown
    const [canResend, setCanResend] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [lastVerifiedCode, setLastVerifiedCode] = useState<string>(''); // Track last verified code to prevent loops

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [timer]);

    useEffect(() => {
        // Only verify if:
        // 1. Code is 6 digits
        // 2. Email is present
        // 3. Not currently verifying
        // 4. This is a different code than the last one we verified (prevents loops)
        if (code.length === 6 && email && !isVerifying && code !== lastVerifiedCode) {
            setLastVerifiedCode(code); // Mark this code as being verified
            handleVerifyCode(code);
        }
    }, [code, email, isVerifying, lastVerifiedCode]);

    const handleVerifyCode = async (verificationCode: string) => {
        if (!email) {
            toastErrorFromException(new Error('Email is required'));
            return;
        }

        try {
            setIsVerifying(true);
            
            let response: any;
            
            if (isEmailVerificationMode) {
                // Use email verification endpoint
                response = await verifyEmailMutation.mutateAsync({
                    email,
                    code: verificationCode,
                });
                
                console.log('Email verification response:', JSON.stringify(response, null, 2));
                
                // Handle email verification response
                // After interceptor extracts data, response structure: { user, token, message, has_style_profile }
                // API response: { success: true, data: { user, token, message, has_style_profile } }
                // After interceptor: { user, token, message, has_style_profile }
                const user = (response as any)?.user || (response as any)?.data?.user;
                const token = (response as any)?.token || (response as any)?.data?.token;
                const has_style_profile = (response as any)?.has_style_profile ?? (response as any)?.data?.has_style_profile ?? user?.has_style_profile ?? false;
                const success = (response as any)?.success !== false; // Default to true if not explicitly false
                
                // Consider it valid if we have user (token is optional as it's set in hook)
                // Or if success is explicitly true
                const isValid = 
                    !!user || 
                    !!token ||
                    success === true ||
                    (response as any)?.valid === true;
                
                console.log('Email verification validation:', { 
                    hasUser: !!user, 
                    hasToken: !!token, 
                    success, 
                    isValid,
                    has_style_profile
                });
                
                if (isValid) {
                    // Email verified successfully
                    // Credentials are set in the hook's onSuccess callback if token is present
                    // Small delay to ensure credentials are set before navigation
                    setTimeout(() => {
                        toastSuccess('Email verified successfully');
                        // Check if user has style profile to determine redirect
                        if (has_style_profile === true) {
                            router.dismissAll();
                        router.replace('/home/(tabs)');
                        } else {
                            router.dismissAll();
                        router.replace('/profile/OnboardingFlow');
                        }
                    }, 200);
                } else {
                    console.warn('Email verification failed validation:', response);
                    toastErrorFromException(new Error('Invalid verification code'));
                    setCode('');
                    setLastVerifiedCode(''); // Reset so user can try again
                }
            } else {
                // Use password reset verification endpoint
                response = await verifyResetCodeMutation.mutateAsync({
                    email,
                    code: verificationCode,
                });

                console.log('Password reset verification response:', JSON.stringify(response, null, 2));

                // Handle the actual API response structure:
                // { success: true, data: { valid: true }, message: "..." }
                // After interceptor extracts data, response becomes: { valid: true }
                const isValid = (response as any)?.valid === true;
                
                if (isValid) {
                    // Password reset mode - redirect to create new password
                    // Check for token in various possible locations
                    const resetToken = 
                        response?.reset_password_token || 
                        (response as any)?.reset_password_token ||
                        (response as any)?.data?.reset_password_token ||
                        (response as any)?.token;

                    // If code is valid but no token, use the code itself as the token
                    // (some APIs use the verification code as the reset token)
                    const tokenToUse = resetToken || verificationCode;
                    
                    router.push({
                        pathname: '/auth/CreateNewPassword',
                        params: {
                            email,
                            code: verificationCode,
                            reset_password_token: tokenToUse,
                        },
                    });
                } else {
                    toastErrorFromException(new Error('Invalid verification code'));
                    setCode('');
                    setLastVerifiedCode(''); // Reset so user can try again
                }
            }
        } catch (error: any) {
            console.error('Verification error:', error);
            console.error('Verification error details:', JSON.stringify(error, null, 2));
            
            // Check if this is actually a success response that was treated as an error
            // Sometimes the response structure might cause issues
            const errorResponse = error?.response?.data || error?.data;
            if (errorResponse?.user && errorResponse?.token) {
                // This is actually a success - credentials should be set by hook
                const has_style_profile = errorResponse?.has_style_profile ?? errorResponse?.user?.has_style_profile ?? false;
                console.log('Response treated as error but contains user and token, treating as success');
                console.log('has_style_profile:', has_style_profile);
                toastSuccess('Email verified successfully');
                setTimeout(() => {
                    // Check if user has style profile to determine redirect
                    if (has_style_profile === true) {
                        router.dismissAll();
                        router.replace('/home/(tabs)');
                    } else {
                        router.dismissAll();
                        router.replace('/profile/OnboardingFlow');
                    }
                }, 100);
            } else {
                toastErrorFromException(error);
                setCode('');
                setLastVerifiedCode(''); // Reset so user can try again
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            toastErrorFromException(new Error('Email is required'));
            return;
        }

        try {
            if (isEmailVerificationMode) {
                // For email verification, we might need a different endpoint
                // For now, try to trigger email verification resend
                // This might need to be implemented on the backend
                // As a fallback, we can try the forgot password endpoint if it also sends verification codes
                await forgotPasswordMutation.mutateAsync({ email });
                toastSuccess('Verification code sent to your email');
            } else {
                // Password reset mode - use forgot password endpoint
                await forgotPasswordMutation.mutateAsync({ email });
                toastSuccess('Reset instructions sent to your email');
            }
            setTimer(10);
            setCanResend(false);
            setCode('');
            setLastVerifiedCode(''); // Reset verified code when resending
        } catch (error) {
            toastErrorFromException(error);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <Text style={[styles.titleText, { color: colors.text }]}>
                        {t.verificationCode}
                    </Text>

                    <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
                        {isEmailVerificationMode 
                            ? 'Please enter the verification code sent to your email to confirm your account.'
                            : t.verificationCodeSubtitle}
                    </Text>

                    <View style={styles.codeInputContainer}>
                        <VerificationCodeInput
                            length={6}
                            onCodeChange={setCode}
                            autoFocus={true}
                        />
                    </View>

                    <View style={styles.resendContainer}>
                        {!canResend ? (
                            <Text style={[styles.resendText, { color: colors.textSecondary }]}>
                                {t.resendIn.replace('{time}', formatTime(timer))}
                            </Text>
                        ) : (
                            <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                                <Text style={[styles.resendLink, { color: colors.text }]}>
                                    {t.resendCode}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

