import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import CustomButton from '@/src/components/common/CustomButton';
import BackButton from '@/src/components/common/BackButton';

export default function PhotoUploadInfo() {
    const router = useRouter();
    const colors = useThemeColors();
    const t = translations.onboarding;

    const handleNext = () => {
        router.push('/profile/PhotoUpload');
    };

    const handleBack = () => {
        router.back();
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
            >
                <View style={styles.container}>
                    <View style={styles.topSection}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {t.photoUploadTitle}
                        </Text>
                        <Text style={[styles.instructions, { color: colors.textSecondary }]}>
                            {t.photoUploadInstructions}
                        </Text>
                    </View>

                    <View style={styles.imageGrid}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={require('@/assets/correctImage1.png')}
                                style={styles.image}
                                resizeMode="cover"
                            />
                            <View style={[styles.statusBadge, styles.correctBadge]}>
                                <Ionicons name="checkmark" size={scaleFontSize(16)} color="#FFFFFF" />
                            </View>
                        </View>

                        <View style={styles.imageContainer}>
                            <Image
                                source={require('@/assets/correctImage2.png')}
                                style={styles.image}
                                resizeMode="cover"
                            />
                            <View style={[styles.statusBadge, styles.correctBadge]}>
                                <Ionicons name="checkmark" size={scaleFontSize(16)} color="#FFFFFF" />
                            </View>
                        </View>

                        <View style={styles.imageContainer}>
                            <Image
                                source={require('@/assets/wrongImage1.png')}
                                style={styles.image}
                                resizeMode="cover"
                            />
                            <View style={[styles.statusBadge, styles.wrongBadge]}>
                                <Ionicons name="close" size={scaleFontSize(16)} color="#FFFFFF" />
                            </View>
                        </View>

                        <View style={styles.imageContainer}>
                            <Image
                                source={require('@/assets/wrongImage2.png')}
                                style={styles.image}
                                resizeMode="cover"
                            />
                            <View style={[styles.statusBadge, styles.wrongBadge]}>
                                <Ionicons name="close" size={scaleFontSize(16)} color="#FFFFFF" />
                            </View>
                        </View>
                    </View>

                    <View style={[styles.tipContainer]}>
                        <Text style={[styles.tipLabel, { color: colors.text }]}>
                            {t.tip}
                        </Text>
                        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                            {t.photoUploadTip}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <CustomButton
                    title={t.next}
                    backgroundColor={colors.buttonPrimary}
                    textColor={colors.buttonText}
                    borderColor={colors.buttonPrimary}
                    onPress={handleNext}
                />
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
    container: {
        flex: 1,
        paddingHorizontal: scaleFontSize(24),
        paddingTop: scaleFontSize(16),
        paddingBottom: scaleFontSize(40),
    },
    topSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: scaleFontSize(32),
    },
    title: {
        fontSize: scaleFontSize(24),
        lineHeight: scaleFontSize(32),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(8),
        textAlign: 'center',
    },
    instructions: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    imageGrid: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scaleFontSize(12),
        marginBottom: scaleFontSize(24),
    },
    imageContainer: {
        width: '47%',
        aspectRatio: 1,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    statusBadge: {
        position: 'absolute',
        top: scaleFontSize(8),
        left: scaleFontSize(8),
        width: scaleFontSize(24),
        height: scaleFontSize(24),
        borderRadius: scaleFontSize(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    correctBadge: {
        backgroundColor: '#4CAF50',
    },
    wrongBadge: {
        backgroundColor: '#F44336',
    },
    tipContainer: {
        width: '100%',
        paddingVertical: scaleFontSize(10),
        paddingHorizontal: scaleFontSize(16),
        borderRadius: 8,
        flexDirection: 'row',
    },
    tipLabel: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoSemiBold,
        marginBottom: scaleFontSize(4),
    },
    tipText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        lineHeight: scaleFontSize(20),
        marginLeft: scaleFontSize(5),
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: scaleFontSize(24),
        paddingBottom: scaleFontSize(40),
    },
});

