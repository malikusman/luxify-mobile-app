import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';

interface SocialPlatform {
    id: string;
    name: string;
    icon: string;
    translationKey: string;
}

interface ChooseStylistStep2Props {
    connectedPlatforms: string[];
    onConnectPlatform: (platformId: string) => void;
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
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

export default function ChooseStylistStep2({ connectedPlatforms, onConnectPlatform }: ChooseStylistStep2Props) {
    const colors = useThemeColors();
    const t = translations.onboarding;

    const handleConnect = (platformId: string) => {
        onConnectPlatform(platformId);
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

                    return (
                        <TouchableOpacity
                            key={platform.id}
                            style={[
                                styles.platformButton,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: isConnected ? colors.buttonPrimary : colors.border,
                                    borderWidth: isConnected ? scaleFontSize(2) : scaleFontSize(1),
                                },
                            ]}
                            onPress={() => handleConnect(platform.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.platformText, { color: colors.text }]}>
                                {platformText}
                            </Text>
                            {isConnected ? (
                                <Ionicons
                                    name="checkmark-circle"
                                    size={scaleFontSize(24)}
                                    color={colors.buttonPrimary}
                                />
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(24),
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
    platformText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
});

