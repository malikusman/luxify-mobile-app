import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';

interface AudioMessagePlayerProps {
    isUser: boolean;
    isPlaying: boolean;
    playbackPosition: number;
    duration: number;
    onPlay: () => void;
    onStop: () => void;
    formatDuration: (seconds: number) => string;
}

export default function AudioMessagePlayer({
    isUser,
    isPlaying,
    playbackPosition,
    duration,
    onPlay,
    onStop,
    formatDuration,
}: AudioMessagePlayerProps) {
    const colors = useThemeColors();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.playButton,
                    { backgroundColor: isUser ? 'rgba(255, 255, 255, 0.2)' : colors.buttonPrimary },
                ]}
                onPress={isPlaying ? onStop : onPlay}
                activeOpacity={0.8}
            >
                <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={scaleFontSize(16)}
                    color={isUser ? colors.buttonText : '#FFFFFF'}
                />
            </TouchableOpacity>
            <View style={styles.content}>
                <View style={styles.progressBarContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            {
                                width: duration > 0
                                    ? `${Math.min((playbackPosition / duration) * 100, 100)}%`
                                    : '0%',
                                backgroundColor: isUser ? 'rgba(255, 255, 255, 0.5)' : colors.buttonPrimary,
                            },
                        ]}
                    />
                </View>
                <Text
                    style={[
                        styles.duration,
                        { color: isUser ? colors.buttonText : colors.text },
                    ]}
                >
                    {duration > 0 
                        ? `${formatDuration(isPlaying ? playbackPosition : 0)} / ${formatDuration(duration)}`
                        : formatDuration(0)
                    }
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleFontSize(12),
    },
    playButton: {
        width: scaleFontSize(36),
        height: scaleFontSize(36),
        borderRadius: scaleFontSize(18),
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        gap: scaleFontSize(4),
    },
    progressBarContainer: {
        width: '100%',
        height: scaleFontSize(3),
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: scaleFontSize(1.5),
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: scaleFontSize(1.5),
    },
    duration: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(2),
    },
});
