import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import { SocialMediaPhoto, socialMediaApi } from '@/src/services/modules/socialMedia/socialMediaApi';
import { SocialPlatform } from '@/src/services/modules/socialMedia/socialMediaService';

interface SocialMediaPhotoSelectorProps {
    visible: boolean;
    platform: SocialPlatform;
    accessToken: string;
    onClose: () => void;
    onSelectPhotos: (photoIds: string[]) => void;
    maxSelection?: number;
    instagramAccountId?: string; // For Instagram Graph API
}

export default function SocialMediaPhotoSelector({
    visible,
    platform,
    accessToken,
    onClose,
    onSelectPhotos,
    maxSelection = 10,
    instagramAccountId,
}: SocialMediaPhotoSelectorProps) {
    const colors = useThemeColors();
    const t = translations.onboarding;
    const [photos, setPhotos] = useState<SocialMediaPhoto[]>([]);
    const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible && accessToken) {
            // Console log when photo selector opens for Instagram
            if (platform === 'instagram') {
                console.log('=== INSTAGRAM PHOTO SELECTOR OPENING ===');
                console.log('Platform:', platform);
                console.log('Access Token (first 20 chars):', accessToken?.substring(0, 20) + '...');
                console.log('Access Token Length:', accessToken?.length || 0);
                console.log('Visible:', visible);
                console.log('=========================================');
            }
            fetchPhotos();
        } else {
            // Reset state when modal closes
            setPhotos([]);
            setSelectedPhotos(new Set());
            setError(null);
        }
    }, [visible, accessToken]);

    const fetchPhotos = async () => {
        setLoading(true);
        setError(null);

        try {
            // For Instagram Graph API, pass the Instagram Account ID
            const response = await socialMediaApi.fetchPhotos(
                platform, 
                accessToken,
                platform === 'instagram' ? instagramAccountId : undefined
            );

            // Console log for Instagram photos data
            if (platform === 'instagram') {
                console.log('=== INSTAGRAM PHOTOS FETCH RESPONSE ===');
                console.log('Full Response:', JSON.stringify(response, null, 2));
                console.log('Success:', response.success);
                console.log('Number of Photos:', response.photos?.length || 0);
                console.log('Photos Array:', JSON.stringify(response.photos, null, 2));
                if (response.error) {
                    console.log('Error:', response.error);
                }
                console.log('========================================');
            }

            if (response.success) {
                setPhotos(response.photos);
            } else {
                setError(response.error || t.fetchPhotosError);
            }
        } catch (err: any) {
            setError(err.message || t.fetchPhotosError);
        } finally {
            setLoading(false);
        }
    };

    const togglePhotoSelection = (photoId: string) => {
        setSelectedPhotos((prev) => {
            const newSelection = new Set(prev);

            if (newSelection.has(photoId)) {
                newSelection.delete(photoId);
            } else {
                if (newSelection.size >= maxSelection) {
                    Alert.alert(
                        t.maxSelectionReached,
                        t.maxSelectionMessage.replace('{max}', maxSelection.toString())
                    );
                    return prev;
                }
                newSelection.add(photoId);
            }

            return newSelection;
        });
    };

    const handleConfirm = () => {
        if (selectedPhotos.size === 0) {
            Alert.alert(t.noPhotosSelected, t.selectAtLeastOnePhoto);
            return;
        }

        onSelectPhotos(Array.from(selectedPhotos));
        onClose();
    };

    const handleCancel = () => {
        setSelectedPhotos(new Set());
        onClose();
    };

    const getPlatformName = () => {
        switch (platform) {
            case 'instagram':
                return 'Instagram';
            case 'facebook':
                return 'Facebook';
            case 'tiktok':
                return 'TikTok';
            default:
                return 'Social Media';
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleCancel}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {t.selectPhotosFrom.replace('{platform}', getPlatformName())}
                        </Text>
                        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                            <Ionicons name="close" size={scaleFontSize(24)} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Selection Info */}
                    <View style={[styles.selectionInfo, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.selectionText, { color: colors.textSecondary }]}>
                            {t.selectedPhotosCount.replace(
                                '{count}',
                                selectedPhotos.size.toString()
                            )}{' '}
                            / {maxSelection}
                        </Text>
                    </View>

                    {/* Content */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.buttonPrimary} />
                            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                {t.loadingPhotos}
                            </Text>
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons
                                name="alert-circle"
                                size={scaleFontSize(48)}
                                color={colors.error || colors.textSecondary}
                            />
                            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
                            <TouchableOpacity
                                onPress={fetchPhotos}
                                style={[styles.retryButton, { backgroundColor: colors.buttonPrimary }]}
                            >
                                <Text style={[styles.retryButtonText, { color: colors.buttonText }]}>
                                    {t.retry}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : photos.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name="images-outline"
                                size={scaleFontSize(64)}
                                color={colors.textSecondary}
                            />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                {t.noPhotosFound}
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.photosGrid}
                            showsVerticalScrollIndicator={false}
                        >
                            {photos.map((photo) => {
                                const isSelected = selectedPhotos.has(photo.id);
                                return (
                                    <TouchableOpacity
                                        key={photo.id}
                                        style={[
                                            styles.photoContainer,
                                            isSelected && [
                                                styles.photoContainerSelected,
                                                { borderColor: colors.buttonPrimary },
                                            ],
                                        ]}
                                        onPress={() => togglePhotoSelection(photo.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Image
                                            source={{ uri: photo.thumbnailUrl || photo.url }}
                                            style={styles.photo}
                                            resizeMode="cover"
                                        />
                                        {isSelected && (
                                            <View
                                                style={[
                                                    styles.selectedOverlay,
                                                    { backgroundColor: colors.buttonPrimary },
                                                ]}
                                            >
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={scaleFontSize(32)}
                                                    color={colors.buttonText}
                                                />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            onPress={handleCancel}
                            style={[styles.cancelButton, { borderColor: colors.border }]}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                                {translations.common.cancel}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleConfirm}
                            style={[
                                styles.confirmButton,
                                {
                                    backgroundColor:
                                        selectedPhotos.size > 0
                                            ? colors.buttonPrimary
                                            : colors.border,
                                },
                            ]}
                            disabled={selectedPhotos.size === 0}
                        >
                            <Text
                                style={[
                                    styles.confirmButtonText,
                                    {
                                        color:
                                            selectedPhotos.size > 0
                                                ? colors.buttonText
                                                : colors.textSecondary,
                                    },
                                ]}
                            >
                                {t.confirmSelection} ({selectedPhotos.size})
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '85%',
        borderTopLeftRadius: scaleFontSize(24),
        borderTopRightRadius: scaleFontSize(24),
        paddingTop: scaleFontSize(20),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(20),
        paddingBottom: scaleFontSize(16),
    },
    title: {
        fontSize: scaleFontSize(20),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        flex: 1,
    },
    closeButton: {
        padding: scaleFontSize(4),
    },
    selectionInfo: {
        paddingHorizontal: scaleFontSize(20),
        paddingVertical: scaleFontSize(12),
        marginHorizontal: scaleFontSize(20),
        borderRadius: scaleFontSize(8),
        marginBottom: scaleFontSize(16),
    },
    selectionText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scaleFontSize(60),
    },
    loadingText: {
        marginTop: scaleFontSize(16),
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scaleFontSize(60),
        paddingHorizontal: scaleFontSize(40),
    },
    errorText: {
        marginTop: scaleFontSize(16),
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: scaleFontSize(24),
        paddingHorizontal: scaleFontSize(24),
        paddingVertical: scaleFontSize(12),
        borderRadius: scaleFontSize(8),
    },
    retryButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoSemiBold,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scaleFontSize(60),
    },
    emptyText: {
        marginTop: scaleFontSize(16),
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: scaleFontSize(10),
        gap: scaleFontSize(8),
    },
    photoContainer: {
        width: '31%',
        aspectRatio: 1,
        borderRadius: scaleFontSize(8),
        overflow: 'hidden',
        borderWidth: scaleFontSize(2),
        borderColor: 'transparent',
    },
    photoContainerSelected: {
        borderWidth: scaleFontSize(2),
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    selectedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: scaleFontSize(20),
        paddingVertical: scaleFontSize(16),
        gap: scaleFontSize(12),
        borderTopWidth: scaleFontSize(1),
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: scaleFontSize(14),
        borderRadius: scaleFontSize(8),
        borderWidth: scaleFontSize(1),
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoSemiBold,
    },
    confirmButton: {
        flex: 2,
        paddingVertical: scaleFontSize(14),
        borderRadius: scaleFontSize(8),
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoSemiBold,
    },
});

