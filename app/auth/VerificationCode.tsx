import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import BackButton from '@/src/components/common/BackButton';
import VerificationCodeInput from '@/src/components/common/VerificationCodeInput';
import { useForgotPassword, useVerifyResetCode } from '@/src/services';
import { toastErrorFromException } from '@/src/utils/toast';
import { styles } from './styles/verificationCodeStyles';

export default function VerificationCode() {
    const router = useRouter();
    const params = useLocalSearchParams<{ email?: string }>();
    const colors = useThemeColors();
    const t = translations.auth;
    const verifyResetCodeMutation = useVerifyResetCode();
    const forgotPasswordMutation = useForgotPassword();

    const email = params.email || '';
    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(10); // 10 seconds countdown
    const [canResend, setCanResend] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

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
        if (code.length === 4 && email && !isVerifying) {
            handleVerifyCode(code);
        }
    }, [code, email]);

    const handleVerifyCode = async (verificationCode: string) => {
        if (!email) {
            toastErrorFromException(new Error('Email is required'));
            return;
        }

        try {
            setIsVerifying(true);
            const response = await verifyResetCodeMutation.mutateAsync({
                email,
                code: verificationCode,
            });

            if (response.reset_password_token) {
                router.push({
                    pathname: '/auth/CreateNewPassword',
                    params: {
                        email,
                        reset_password_token: response.reset_password_token,
                    },
                });
            } else {
                toastErrorFromException(new Error('Invalid verification code'));
                setCode('');
            }
        } catch (error) {
            toastErrorFromException(error);
            setCode('');
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
            await forgotPasswordMutation.mutateAsync({ email });
            setTimer(10);
            setCanResend(false);
            setCode('');
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
                        {t.verificationCodeSubtitle}
                    </Text>

                    <View style={styles.codeInputContainer}>
                        <VerificationCodeInput
                            length={4}
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

