import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import { socialMediaService, SocialPlatform } from '@/src/services/modules/socialMedia/socialMediaService';
import { socialMediaApi } from '@/src/services/modules/socialMedia/socialMediaApi';
import SocialMediaPhotoSelector from '@/src/components/onboarding/SocialMediaPhotoSelector';
import { toastErrorFromException, toastSuccess } from '@/src/utils/toast';

interface SocialPlatformConfig {
    id: SocialPlatform;
    name: string;
    icon: string;
    translationKey: string;
}

interface ConnectedPlatform {
    platformId: SocialPlatform;
    accessToken: string;
    userId?: string;
}

interface ChooseStylistStep2Props {
    connectedPlatforms: string[];
    onConnectPlatform: (platformId: string) => void;
    onPhotosSelected?: (platformId: SocialPlatform, photoIds: string[]) => void;
}

const SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
    {
        id: 'instagram',
        name: 'Instagram',
        icon: 'logo-instagram',
        translationKey: 'connectInstagram',
    },
    {
        id: 'facebook',
        name: 'Facebook',
        icon: 'logo-facebook',
        translationKey: 'connectFacebook',
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        icon: 'musical-notes',
        translationKey: 'connectTiktok',
    },
];

export default function ChooseStylistStep2({
    connectedPlatforms,
    onConnectPlatform,
    onPhotosSelected,
}: ChooseStylistStep2Props) {
    const colors = useThemeColors();
    const t = translations.onboarding;
    const [connectedPlatformsData, setConnectedPlatformsData] = useState<Map<SocialPlatform, ConnectedPlatform>>(
        new Map()
    );
    const [loadingPlatform, setLoadingPlatform] = useState<SocialPlatform | null>(null);
    const [photoSelectorVisible, setPhotoSelectorVisible] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);

    const handleConnect = async (platformId: SocialPlatform) => {
        // If already connected, show photo selector
        if (connectedPlatforms.includes(platformId)) {
            const platformData = connectedPlatformsData.get(platformId);
            if (platformData) {
                setSelectedPlatform(platformId);
                setPhotoSelectorVisible(true);
            } else {
                // If we have the platform connected but no data, try to reconnect
                await connectPlatform(platformId);
            }
            return;
        }

        // Connect the platform
        await connectPlatform(platformId);
    };

    const connectPlatform = async (platformId: SocialPlatform) => {
        setLoadingPlatform(platformId);

        try {
            const result = await socialMediaService.connectPlatform(platformId);

            // Console log for Instagram connection data
            if (platformId === 'instagram') {
                console.log('=== INSTAGRAM CONNECTION DATA ===');
                console.log('Connection Result:', JSON.stringify(result, null, 2));
                console.log('Access Token:', result.accessToken);
                console.log('User ID:', result.userId);
                console.log('Success:', result.success);
                console.log('================================');
            }

            if (result.success && result.accessToken) {
                // Store connection data
                const platformData: ConnectedPlatform = {
                    platformId,
                    accessToken: result.accessToken,
                    userId: result.userId,
                };
                
                // Console log stored platform data for Instagram
                if (platformId === 'instagram') {
                    console.log('=== STORED INSTAGRAM PLATFORM DATA ===');
                    console.log('Platform Data:', JSON.stringify(platformData, null, 2));
                    console.log('======================================');
                }
                
                setConnectedPlatformsData((prev) => {
                    const newMap = new Map(prev);
                    newMap.set(platformId, platformData);
                    return newMap;
                });

                // Update parent component
                onConnectPlatform(platformId);

                // Show success message
                toastSuccess(t.platformConnectedSuccess.replace('{platform}', platformId));

                // Automatically open photo selector after connection
                setTimeout(() => {
                    setSelectedPlatform(platformId);
                    setPhotoSelectorVisible(true);
                }, 500);
            } else {
                const errorMessage = result.error || t.platformConnectionFailed;
                Alert.alert(t.connectionError, errorMessage);
            }
        } catch (error) {
            toastErrorFromException(error);
        } finally {
            setLoadingPlatform(null);
        }
    };

    const handlePhotosSelected = async (photoIds: string[]) => {
        if (!selectedPlatform) return;

        const platformData = connectedPlatformsData.get(selectedPlatform);
        if (!platformData) return;

        // Console log for Instagram selected photos
        if (selectedPlatform === 'instagram') {
            console.log('=== INSTAGRAM SELECTED PHOTOS ===');
            console.log('Selected Photo IDs:', JSON.stringify(photoIds, null, 2));
            console.log('Number of Photos:', photoIds.length);
            console.log('Platform Data:', JSON.stringify(platformData, null, 2));
            console.log('================================');
        }

        try {
            // Save selected photos to backend
            const response = await socialMediaApi.saveSelectedPhotos({
                platform: selectedPlatform,
                photoIds,
            });

            // Console log save response for Instagram
            if (selectedPlatform === 'instagram') {
                console.log('=== INSTAGRAM SAVE PHOTOS RESPONSE ===');
                console.log('Save Response:', JSON.stringify(response, null, 2));
                console.log('======================================');
            }

            if (response.success) {
                toastSuccess(
                    t.photosSavedSuccess.replace('{count}', photoIds.length.toString())
                );
                onPhotosSelected?.(selectedPlatform, photoIds);
            } else {
                Alert.alert(translations.common.error, t.photosSaveFailed);
            }
        } catch (error) {
            toastErrorFromException(error);
        }
    };

    const getPlatformAccessToken = (platformId: SocialPlatform): string | null => {
        const platformData = connectedPlatformsData.get(platformId);
        return platformData?.accessToken || null;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>{t.connectSocialTitle}</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {t.connectSocialSubtitle}
                </Text>
            </View>

            <View style={styles.platformsWrapper}>
                <View style={styles.platformsContainer}>
                    {SOCIAL_PLATFORMS.map((platform) => {
                        const isConnected = connectedPlatforms.includes(platform.id);
                        const platformText = (t as any)[platform.translationKey] || platform.name;
                        const isLoading = loadingPlatform === platform.id;

                        return (
                            <TouchableOpacity
                                key={platform.id}
                                style={[
                                    styles.platformButton,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: isConnected
                                            ? colors.buttonPrimary
                                            : colors.border,
                                        borderWidth: isConnected
                                            ? scaleFontSize(2)
                                            : scaleFontSize(1),
                                        opacity: isLoading ? 0.6 : 1,
                                    },
                                ]}
                                onPress={() => handleConnect(platform.id)}
                                activeOpacity={0.7}
                                disabled={isLoading}
                            >
                                <View style={styles.platformButtonContent}>
                                    <Ionicons
                                        name={platform.icon as any}
                                        size={scaleFontSize(24)}
                                        color={isConnected ? colors.buttonPrimary : colors.textSecondary}
                                        style={styles.platformIcon}
                                    />
                                    <Text style={[styles.platformText, { color: colors.text }]}>
                                        {platformText}
                                    </Text>
                                </View>
                                {isLoading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={colors.buttonPrimary}
                                    />
                                ) : isConnected ? (
                                    <View style={styles.connectedBadge}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={scaleFontSize(24)}
                                            color={colors.buttonPrimary}
                                        />
                                        <Ionicons
                                            name="images"
                                            size={scaleFontSize(20)}
                                            color={colors.buttonPrimary}
                                            style={styles.photosIcon}
                                        />
                                    </View>
                                ) : (
                                    <Ionicons
                                        name="link"
                                        size={scaleFontSize(24)}
                                        color={colors.textSecondary}
                                    />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Photo Selector Modal */}
            {selectedPlatform && (
                <SocialMediaPhotoSelector
                    visible={photoSelectorVisible}
                    platform={selectedPlatform}
                    accessToken={getPlatformAccessToken(selectedPlatform) || ''}
                    instagramAccountId={
                        selectedPlatform === 'instagram'
                            ? connectedPlatformsData.get(selectedPlatform)?.userId || undefined
                            : undefined
                    }
                    onClose={() => {
                        // Console log when closing photo selector for Instagram
                        if (selectedPlatform === 'instagram') {
                            console.log('=== INSTAGRAM PHOTO SELECTOR CLOSED ===');
                            console.log('Platform:', selectedPlatform);
                            console.log('======================================');
                        }
                        setPhotoSelectorVisible(false);
                        setSelectedPlatform(null);
                    }}
                    onSelectPhotos={handlePhotosSelected}
                    maxSelection={10}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
        // paddingHorizontal: scaleFontSize(24),
    },
    header: {
        width: '100%',
        alignItems: 'center',
        marginBottom: scaleFontSize(40),
    },
    platformsWrapper: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
    },
    title: {
        fontSize: scaleFontSize(24),
        lineHeight: scaleFontSize(32),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(8),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        paddingHorizontal: scaleFontSize(20),
    },
    platformsContainer: {
        width: '100%',
        gap: scaleFontSize(16),
        alignItems: 'center',
    },
    platformButton: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(20),
        paddingVertical: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
    },
    platformButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    platformIcon: {
        marginRight: scaleFontSize(12),
    },
    platformText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    connectedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleFontSize(4),
    },
    photosIcon: {
        marginLeft: scaleFontSize(4),
    },
});

