import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import CustomButton from '@/src/components/common/CustomButton';
import BackButton from '@/src/components/common/BackButton';
import {
    pickMultipleImagesFromGallery,
    takePhotoWithCamera,
    pickImageFromGallery,
    showImageSourceDialog,
} from '@/src/services/imagePickerService';

const MAX_PHOTOS = 3;

export default function PhotoUpload() {
    const router = useRouter();
    const colors = useThemeColors();
    const t = translations.onboarding;
    const imagePickerT = translations.imagePicker;
    const [uploadedPhotos, setUploadedPhotos] = useState<(string | undefined)[]>(Array(MAX_PHOTOS).fill(undefined));

    const handleBack = () => {
        router.back();
    };

    const handleUploadPhotos = async () => {
        const emptySlots = uploadedPhotos.filter(photo => !photo).length;
        if (emptySlots === 0) {
            Alert.alert(t.maximumPhotos, t.maximumPhotosMessage);
            return;
        }

        const result = await pickMultipleImagesFromGallery(emptySlots, {
            quality: 0.8,
        });

        if (result.success && result.uris) {
            setUploadedPhotos(prev => {
                const updated = [...prev];
                let photoIndex = 0;
                for (let i = 0; i < updated.length && photoIndex < result.uris!.length; i++) {
                    if (!updated[i]) {
                        updated[i] = result.uris![photoIndex];
                        photoIndex++;
                    }
                }
                return updated;
            });
        } else if (result.error && result.error !== imagePickerT.userCanceled && result.error !== imagePickerT.permissionsNotGranted) {
            Alert.alert(translations.common.error, result.error);
        }
    };

    const handleTakePhoto = async () => {
        const emptySlots = uploadedPhotos.filter(photo => !photo).length;
        if (emptySlots === 0) {
            Alert.alert(t.maximumPhotos, t.maximumPhotosMessage);
            return;
        }

        const result = await takePhotoWithCamera({
            quality: 0.8,
            allowsEditing: true,
        });

        if (result.success && result.uri) {
            setUploadedPhotos(prev => {
                const updated = [...prev];
                const firstEmptyIndex = updated.findIndex(photo => !photo);
                if (firstEmptyIndex !== -1) {
                    updated[firstEmptyIndex] = result.uri!;
                }
                return updated;
            });
        } else if (result.error && result.error !== imagePickerT.userCanceled && result.error !== imagePickerT.permissionsNotGranted) {
            Alert.alert(translations.common.error, result.error);
        }
    };

    const handlePhotoPress = (index: number) => {
        const hasPhoto = uploadedPhotos[index];
        const alertTitle = hasPhoto ? imagePickerT.replacePhoto : imagePickerT.addPhoto;

        const onTakePhoto = async () => {
            const result = await takePhotoWithCamera({
                quality: 0.8,
                allowsEditing: true,
            });

            if (result.success && result.uri) {
                setUploadedPhotos(prev => {
                    const updated = [...prev];
                    updated[index] = result.uri!;
                    return updated;
                });
            } else if (result.error && result.error !== imagePickerT.userCanceled && result.error !== imagePickerT.permissionsNotGranted) {
                Alert.alert('Error', result.error);
            }
        };

        const onPickFromGallery = async () => {
            const result = await pickImageFromGallery({
                quality: 0.8,
            });

            if (result.success && result.uri) {
                setUploadedPhotos(prev => {
                    const updated = [...prev];
                    updated[index] = result.uri!;
                    return updated;
                });
            } else if (result.error && result.error !== imagePickerT.userCanceled && result.error !== imagePickerT.permissionsNotGranted) {
                Alert.alert('Error', result.error);
            }
        };

        const onRemove = () => {
            setUploadedPhotos(prev => {
                const updated = [...prev];
                updated[index] = undefined;
                return updated;
            });
        };

        showImageSourceDialog(
            onTakePhoto,
            onPickFromGallery,
            hasPhoto ? onRemove : undefined,
            alertTitle
        );
    };

    const handleNext = () => {
        router.push('/onboarding/ChooseStylist');
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
                            {[0, 1, 2].map((index) => {
                                const photoUri = uploadedPhotos[index];
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.photoPlaceholder,
                                            {
                                                borderColor: colors.border,
                                            },
                                        ]}
                                        onPress={() => handlePhotoPress(index)}
                                        activeOpacity={0.7}
                                    >
                                        {photoUri ? (
                                            <Image
                                                source={{ uri: photoUri }}
                                                style={styles.placeholderImage}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <Image
                                                source={require('@/assets/placeholderImage.png')}
                                                style={styles.placeholderImage}
                                                resizeMode="cover"
                                            />
                                        )}
                                        {photoUri && (
                                            <View style={styles.removeButton}>
                                                <Ionicons
                                                    name="close-circle"
                                                    size={scaleFontSize(24)}
                                                    color="#FFFFFF"
                                                />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.uploadButton,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    opacity: uploadedPhotos.filter(photo => photo).length >= MAX_PHOTOS ? 0.5 : 1,
                                },
                            ]}
                            onPress={handleUploadPhotos}
                            activeOpacity={0.7}
                            disabled={uploadedPhotos.filter(photo => photo).length >= MAX_PHOTOS}
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
                                    opacity: uploadedPhotos.filter(photo => photo).length >= MAX_PHOTOS ? 0.5 : 1,
                                },
                            ]}
                            onPress={handleTakePhoto}
                            activeOpacity={0.7}
                            disabled={uploadedPhotos.filter(photo => photo).length >= MAX_PHOTOS}
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
        paddingHorizontal: scaleFontSize(20),
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
        borderRadius: scaleFontSize(8),
        borderWidth: scaleFontSize(2),
        overflow: 'hidden',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
    },
    removeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: scaleFontSize(12),
    },
    uploadButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(14),
        borderRadius: scaleFontSize(8),
        borderWidth: scaleFontSize(1),
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
        borderRadius: scaleFontSize(8),
        borderWidth: scaleFontSize(1),
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
        paddingHorizontal: scaleFontSize(20),
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: scaleFontSize(24),
        paddingBottom: scaleFontSize(40),
    },
});
