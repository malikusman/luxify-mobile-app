import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { forgotPasswordSchema } from '@/src/validation/authSchemas';
import { FONTS } from '@/src/constants/fonts';
import CustomButton from '@/src/components/common/CustomButton';
import CustomInput from '@/src/components/common/CustomInput';
import BackButton from '@/src/components/common/BackButton';
import { useForgotPassword } from '@/src/services';
import { toastErrorFromException, toastSuccess } from '@/src/utils/toast';
import { styles } from './styles/forgotPasswordStyles';

export default function ForgotPassword() {
    const router = useRouter();
    const colors = useThemeColors();
    const t = translations.auth;
    const forgotPasswordMutation = useForgotPassword();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values: { email: string }) => {
        try {
            setIsSubmitting(true);
            await forgotPasswordMutation.mutateAsync({ email: values.email });
            toastSuccess('Reset instructions sent to your email');
            router.push({
                pathname: '/auth/VerificationCode',
                params: { email: values.email },
            });
        } catch (error) {
            toastErrorFromException(error);
        } finally {
            setIsSubmitting(false);
        }
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
                initialValues={{ email: '' }}
                validationSchema={forgotPasswordSchema}
                onSubmit={handleSubmit}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.container}>
                            <Text style={[styles.titleText, { color: colors.text }]}>
                                {t.forgotPasswordTitle}
                            </Text>

                            <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
                                {t.forgotPasswordSubtitle}
                            </Text>

                            <View style={styles.inputContainer}>
                                <CustomInput
                                    placeholder={t.enterYourEmail}
                                    value={values.email}
                                    onChangeText={handleChange('email')}
                                    onBlur={handleBlur('email')}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="send"
                                    onSubmitEditing={() => handleSubmit()}
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
                            </View>

                            <View style={styles.buttonContainer}>
                                <CustomButton
                                    title={t.sendInstructions}
                                    backgroundColor={isSubmitting ? colors.textDisabled : colors.buttonPrimary}
                                    textColor={isSubmitting ? colors.textSecondary : colors.buttonText}
                                    borderColor={isSubmitting ? colors.textDisabled : colors.buttonPrimary}
                                    onPress={() => handleSubmit()}
                                    disabled={isSubmitting}
                                />
                            </View>
                        </View>
                    </ScrollView>
                )}
            </Formik>
        </KeyboardAvoidingView>
    );
}

