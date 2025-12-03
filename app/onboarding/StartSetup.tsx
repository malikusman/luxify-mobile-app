import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import CustomButton from '@/src/components/common/CustomButton';

export default function StartSetup() {
    const router = useRouter();
    const colors = useThemeColors();
    const t = translations.onboarding;

    const handleStartSetup = () => {
        router.push('/onboarding/OnboardingFlow');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.contentContainer}>
                <View style={styles.iconContainer}>
                    <View style={[styles.iconCircle, { borderColor: colors.success }]}>
                        <Ionicons
                            name="checkmark"
                            size={scaleFontSize(60)}
                            color={colors.success}
                        />
                    </View>
                </View>

                <Text style={[styles.titleText, { color: colors.text }]}>
                    {t.successful}
                </Text>

                <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                    {t.successMessage}
                </Text>

                <View style={styles.buttonContainer}>
                    <CustomButton
                        title={t.startSetup}
                        backgroundColor={colors.buttonPrimary}
                        textColor={colors.buttonText}
                        borderColor={colors.buttonPrimary}
                        onPress={handleStartSetup}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: scaleFontSize(24),
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        width: '100%',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: scaleFontSize(32),
    },
    iconCircle: {
        width: scaleFontSize(80),
        height: scaleFontSize(80),
        borderRadius: scaleFontSize(40),
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    titleText: {
        fontSize: scaleFontSize(32),
        lineHeight: scaleFontSize(39),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(16),
        textAlign: 'center',
    },
    messageText: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        paddingHorizontal: 20,
        marginBottom: scaleFontSize(48),
    },
    buttonContainer: {
        width: '100%',
    },
});
