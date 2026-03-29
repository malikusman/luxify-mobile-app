import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import CustomButton from '@/src/components/common/CustomButton';
import BackButton from '@/src/components/common/BackButton';
import {
    takePhotoWithCamera,
    pickImageFromGallery,
} from '@/src/services/imagePickerService';
import { LIMITS, IMAGE_QUALITY } from '@/src/constants/constants';
import { 
    useStylePhotos, 
    useUploadStylePhoto, 
    useDeleteStylePhoto,
} from '@/src/services/modules/stylePhotos/stylePhotosHooks';
import Constants from 'expo-constants';

interface PhotoItem {
    id?: string;
    uri: string;
    position?: number;
    isUploaded?: boolean;
}

export default function PhotoUpload() {
    const router = useRouter();
    const colors = useThemeColors();
    const t = translations.onboarding;
    const imagePickerT = translations.imagePicker;
    
    const { data: stylePhotos = [], isLoading: isLoadingPhotos } = useStylePhotos();
    const uploadPhotoMutation = useUploadStylePhoto();
    const deletePhotoMutation = useDeleteStylePhoto();
    
    const [photo, setPhoto] = useState<PhotoItem | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    useEffect(() => {
        if (stylePhotos.length > 0) {
            const sortedPhotos = [...stylePhotos].sort((a, b) => a.position - b.position);
            if (sortedPhotos.length > 0) {
                const firstPhoto = sortedPhotos[0];
                setPhoto({
                    id: firstPhoto.id,
                    uri: firstPhoto.image_url,
                    position: firstPhoto.position,
                    isUploaded: true,
                });
            }
        }
    }, [stylePhotos]);

    const handleBack = () => {
        router.back();
    };

    const handleUploadPhoto = async () => {
        const result = await pickImageFromGallery({
            quality: IMAGE_QUALITY.DEFAULT,
        });

        if (result.success && result.uri) {
            const previousPhoto = photo;
            
            // Delete previous photo if exists
            if (photo && photo.id && photo.isUploaded) {
                try {
                    await deletePhotoMutation.mutateAsync(photo.id);
                } catch (error) {
                    // Continue even if delete fails
                }
            }
            
            setPhoto({
                uri: result.uri,
                isUploaded: false,
            });
            setIsUploading(true);
            
            try {
                const uploadedPhoto = await uploadPhotoMutation.mutateAsync(result.uri);
                setPhoto({
                    id: uploadedPhoto.id,
                    uri: uploadedPhoto.image_url,
                    position: uploadedPhoto.position,
                    isUploaded: true,
                });
            } catch (error) {
                // Revert to previous photo or clear
                if (previousPhoto && previousPhoto.id && previousPhoto.isUploaded) {
                    setPhoto(previousPhoto);
                } else {
                    setPhoto(null);
                }
                Alert.alert(translations.common.error, 'Failed to upload photo. Please try again.');
            } finally {
                setIsUploading(false);
            }
        } else if (result.error && result.error !== imagePickerT.userCanceled && result.error !== imagePickerT.permissionsNotGranted) {
            Alert.alert(translations.common.error, result.error);
        }
    };

    const handleTakePhoto = async () => {
        const result = await takePhotoWithCamera({
            quality: IMAGE_QUALITY.DEFAULT,
            allowsEditing: true,
        });

        if (result.success && result.uri) {
            const previousPhoto = photo;
            
            // Delete previous photo if exists
            if (photo && photo.id && photo.isUploaded) {
                try {
                    await deletePhotoMutation.mutateAsync(photo.id);
                } catch (error) {
                    // Continue even if delete fails
                }
            }
            
            setPhoto({
                uri: result.uri,
                isUploaded: false,
            });
            setIsUploading(true);
            
            try {
                const uploadedPhoto = await uploadPhotoMutation.mutateAsync(result.uri);
                setPhoto({
                    id: uploadedPhoto.id,
                    uri: uploadedPhoto.image_url,
                    position: uploadedPhoto.position,
                    isUploaded: true,
                });
            } catch (error) {
                // Revert to previous photo or clear
                if (previousPhoto && previousPhoto.id && previousPhoto.isUploaded) {
                    setPhoto(previousPhoto);
                } else {
                    setPhoto(null);
                }
                Alert.alert(translations.common.error, 'Failed to upload photo. Please try again.');
            } finally {
                setIsUploading(false);
            }
        } else if (result.error && result.error !== imagePickerT.userCanceled && result.error !== imagePickerT.permissionsNotGranted) {
            Alert.alert(translations.common.error, result.error);
        }
    };

    const handlePhotoPress = () => {
        handleUploadPhoto();
    };

    const handleNext = async () => {
        // Upload local photo if exists
        if (photo && photo.uri && !photo.isUploaded) {
            try {
                await uploadPhotoMutation.mutateAsync(photo.uri);
            } catch (error) {
                Alert.alert(
                    'Upload Error',
                    'Failed to upload photo. Please try again.'
                );
                return;
            }
        }
        
        router.push('/profile/ChooseStylist');
    };
    
    const isLoading = isLoadingPhotos || 
        uploadPhotoMutation.isPending || 
        deletePhotoMutation.isPending ||
        isUploading;

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
                        {isLoadingPhotos ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.buttonPrimary} />
                                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                    Loading photo...
                                </Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.photoPlaceholder,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                    },
                                ]}
                                onPress={handlePhotoPress}
                                activeOpacity={0.7}
                                disabled={isLoading}
                            >
                                {photo && photo.uri ? (
                                    <>
                                        <Image
                                            source={{ 
                                                uri: photo.uri.startsWith('http://') || photo.uri.startsWith('https://')
                                                    ? photo.uri
                                                    : `${Constants.expoConfig?.extra?.backendUrl}${photo.uri}`
                                            }}
                                            style={styles.placeholderImage}
                                            resizeMode="contain"
                                        />
                                        {isUploading && (
                                            <View style={styles.uploadingOverlay}>
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                            </View>
                                        )}
                                    </>
                                ) : (
                                    <View style={styles.placeholderContent}>
                                        <View style={[styles.dashedBorder, { borderColor: colors.border }]}>
                                            <Ionicons
                                                name="image-outline"
                                                size={scaleFontSize(48)}
                                                color={colors.textSecondary}
                                            />
                                        </View>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.uploadButton,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                },
                            ]}
                            onPress={handleUploadPhoto}
                            activeOpacity={0.7}
                            disabled={isLoading}
                        >
                            <Text style={[styles.uploadButtonText, { color: colors.textSecondary }]}>
                                Upload your any photo from Gallery
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
                            disabled={isLoading}
                        >
                            <Text style={[styles.takePhotoButtonText, { color: colors.textSecondary }]}>
                                Snap your fit
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
                    disabled={isLoading}
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
    photoPlaceholder: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: scaleFontSize(8),
        borderWidth: scaleFontSize(1),
        overflow: 'hidden',
        marginBottom: scaleFontSize(16),
    },
    placeholderContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dashedBorder: {
        width: '80%',
        aspectRatio: 1,
        borderRadius: scaleFontSize(8),
        borderWidth: scaleFontSize(2),
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
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
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scaleFontSize(40),
    },
    loadingText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(16),
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
