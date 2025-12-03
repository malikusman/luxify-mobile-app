import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import CustomButton from '@/src/components/common/CustomButton';
import BackButton from '@/src/components/common/BackButton';

export default function PhotoUpload() {
    const router = useRouter();
    const colors = useThemeColors();
    const t = translations.onboarding;
    const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

    const handleBack = () => {
        router.back();
    };

    const handleUploadPhotos = () => {
        console.log('Upload photos from gallery');
    };

    const handleTakePhoto = () => {
        console.log('Take photo with camera');
    };

    const handleNext = () => {
        console.log('Navigate to next screen');
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

                    <View style={styles.uploadSection}>
                        <View style={styles.photoPlaceholders}>
                            {[1, 2, 3].map((index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.photoPlaceholder,
                                        {
                                            borderColor: colors.border,
                                        },
                                    ]}
                                >
                                    <Image
                                        source={require('@/assets/placeholderImage.png')}
                                        style={styles.placeholderImage}
                                        resizeMode="cover"
                                    />
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.uploadButton,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                },
                            ]}
                            onPress={handleUploadPhotos}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.uploadButtonText, { color: colors.textSecondary }]}>
                                {t.uploadPhotos}
                            </Text>
                            <Ionicons
                                name="arrow-up"
                                size={scaleFontSize(20)}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.takePhotoSection}>
                        <Text style={[styles.orText, { color: colors.text }]}>
                            {t.orTakePhoto}
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.takePhotoButton,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                },
                            ]}
                            onPress={handleTakePhoto}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.takePhotoButtonText, { color: colors.textSecondary }]}>
                                {t.snapYourFit}
                            </Text>
                            <Ionicons
                                name="camera-outline"
                                size={scaleFontSize(20)}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>

                        <Text style={[styles.aiDescription, { color: colors.textSecondary }]}>
                            {t.aiDescription}
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
    uploadSection: {
        width: '100%',
        marginBottom: scaleFontSize(24),
    },
    photoPlaceholders: {
        flexDirection: 'row',
        gap: scaleFontSize(12),
        marginBottom: scaleFontSize(16),
    },
    photoPlaceholder: {
        flex: 1,
        aspectRatio: 0.75,
        borderRadius: 8,
        borderWidth: 2,
        overflow: 'hidden',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
    },
    uploadButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(14),
        borderRadius: 8,
        borderWidth: 1,
    },
    uploadButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    takePhotoSection: {
        width: '100%',
    },
    orText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(16),
        textAlign: 'center',
    },
    takePhotoButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(14),
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: scaleFontSize(16),
    },
    takePhotoButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    aiDescription: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        lineHeight: scaleFontSize(20),
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: scaleFontSize(24),
        paddingBottom: scaleFontSize(40),
    },
});
