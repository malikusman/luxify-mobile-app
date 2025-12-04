import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import CustomButton from '@/src/components/common/CustomButton';
import Logo from '@/src/components/common/Logo';
import GoogleIcon from '@/src/components/icons/GoogleIcon';

export default function Login() {
    const router = useRouter();
    const colors = useThemeColors();
    const t = translations.auth;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Logo size={scaleFontSize(80)} />

            <Text style={[styles.welcomeText, { color: colors.text }]}>
                {t.welcome}
            </Text>
            <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
                {t.welcomeSubtitle}
            </Text>

            <CustomButton
                title={t.continueWithGoogle}
                backgroundColor={colors.google}
                textColor={colors.text}
                borderColor={colors.googleBorder}
                icon={<GoogleIcon size={scaleFontSize(20)} />}
                onPress={() => router.push('/home/(tabs)')}
            />

            <CustomButton
                title={t.continueWithFacebook}
                backgroundColor={colors.facebook}
                textColor="#FFFFFF"
                borderColor={colors.facebook}
                icon={<FontAwesome name="facebook" size={scaleFontSize(20)} color="#FFFFFF" />}
            />

            <CustomButton
                title={t.continueWithApple}
                backgroundColor={colors.apple}
                textColor="#FFFFFF"
                borderColor={colors.apple}
                icon={<AntDesign name="apple" size={scaleFontSize(20)} color="#FFFFFF" />}
            />

            <View style={styles.dividerContainer}>
                <View style={{ width: '45%', height: 1, backgroundColor: colors.divider }} />
                <Text style={[styles.dividerText, { color: colors.textTertiary }]}>
                    {translations.common.or}
                </Text>
                <View style={{ width: '45%', height: 1, backgroundColor: colors.divider }} />
            </View>

            <CustomButton
                title={t.signInWithPassword}
                backgroundColor={colors.buttonPrimary}
                textColor={colors.buttonText}
                borderColor={colors.buttonPrimary}
            />

            <View style={styles.signupContainer}>
                <Text style={[styles.signupText, { color: colors.textSecondary }]}>
                    {t.dontHaveAccount}
                </Text>
                <TouchableOpacity onPress={() => router.push('/auth/Signup')} activeOpacity={0.7}>
                    <Text style={[styles.signupLink, { color: colors.text }]}>
                        {t.signUp}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: scaleFontSize(32),
        lineHeight: scaleFontSize(39),
        fontFamily: FONTS.hermannRegular,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitleText: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(25),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(40),
        textAlign: 'center',
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
    },
    signupContainer: {
        flexDirection: 'row',
        marginTop: scaleFontSize(24),
    },
    signupText: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.hermannRegular,
    },
    signupLink: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.hermannRegular,
    },
});
