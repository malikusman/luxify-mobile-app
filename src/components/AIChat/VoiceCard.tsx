import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import MicIcon from '@/src/components/icons/MicIcon';
import SendIcon from '@/src/components/icons/SendIcon';
import { ActivityIndicator } from 'react-native';

interface VoiceCardProps {
    isRecording: boolean;
    recordedAudioUri: string | null;
    recordingDuration: number;
    playbackPosition: number;
    isPlaying: boolean;
    isSending: boolean;
    maxDuration: number;
    onMicToggle: () => void;
    onCancel: () => void;
    onPlay: () => void;
    onStopPlayback: () => void;
    onSend: () => void;
    formatDuration: (seconds: number) => string;
}

export default function VoiceCard({
    isRecording,
    recordedAudioUri,
    recordingDuration,
    playbackPosition,
    isPlaying,
    isSending,
    maxDuration,
    onMicToggle,
    onCancel,
    onPlay,
    onStopPlayback,
    onSend,
    formatDuration,
}: VoiceCardProps) {
    const colors = useThemeColors();

    return (
        <View style={styles.container}>
            {(isRecording || recordedAudioUri) && (
                <View style={styles.progressBarContainer}>
                    <View 
                        style={[
                            styles.progressBar, 
                            { 
                                width: isRecording 
                                    ? `${Math.min((recordingDuration / maxDuration) * 100, 100)}%`
                                    : recordingDuration > 0
                                        ? `${Math.min((recordingDuration / maxDuration) * 100, 100)}%`
                                        : '0%',
                                backgroundColor: isRecording ? colors.buttonPrimary : '#E3E5E5'
                            }
                        ]} 
                    />
                    {recordedAudioUri && !isRecording && recordingDuration > 0 && (
                        <View 
                            style={[
                                styles.progressBarDot,
                                { 
                                    left: recordingDuration > 0 
                                        ? `${Math.min((playbackPosition / recordingDuration) * 100, 100)}%`
                                        : '0%',
                                    backgroundColor: colors.buttonPrimary,
                                    opacity: isPlaying ? 1 : 0.5
                                }
                            ]} 
                        />
                    )}
                </View>
            )}
            <View style={styles.content}>
                {isRecording ? (
                    <>
                        <View style={styles.left}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: '#FF6B6B' }]}
                                onPress={onMicToggle}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="stop" size={scaleFontSize(20)} color="#FFFFFF" />
                            </TouchableOpacity>
                            <Text style={[styles.duration, { color: colors.text }]}>
                                {formatDuration(recordingDuration)}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: colors.bottomBarButtonBackground }]}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={scaleFontSize(16)} color={colors.text} />
                        </TouchableOpacity>
                    </>
                ) : recordedAudioUri ? (
                    <>
                        <View style={styles.left}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.buttonPrimary }]}
                                onPress={isPlaying ? onStopPlayback : onPlay}
                                activeOpacity={0.8}
                            >
                                <Ionicons 
                                    name={isPlaying ? "stop" : "play"} 
                                    size={scaleFontSize(20)} 
                                    color={colors.buttonText} 
                                />
                            </TouchableOpacity>
                            <Text style={[styles.duration, { color: colors.text }]}>
                                {formatDuration(isPlaying ? playbackPosition : recordingDuration)}
                            </Text>
                        </View>
                        <View style={styles.right}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { backgroundColor: colors.bottomBarButtonBackground }]}
                                onPress={onCancel}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close" size={scaleFontSize(16)} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sendButton, { backgroundColor: colors.buttonPrimary }]}
                                onPress={onSend}
                                activeOpacity={0.8}
                                disabled={isSending}
                            >
                                {isSending ? (
                                    <ActivityIndicator size="small" color={colors.buttonText} />
                                ) : (
                                    <SendIcon size={scaleFontSize(12)} color={colors.buttonText} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: scaleFontSize(12),
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleFontSize(12),
        flex: 1,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleFontSize(8),
    },
    button: {
        width: scaleFontSize(40),
        height: scaleFontSize(40),
        borderRadius: scaleFontSize(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
    duration: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
    },
    cancelButton: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButton: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarContainer: {
        width: '100%',
        height: scaleFontSize(3),
        backgroundColor: '#E3E5E5',
        borderRadius: scaleFontSize(1.5),
        overflow: 'visible',
        marginBottom: scaleFontSize(12),
        position: 'relative',
    },
    progressBar: {
        height: '100%',
        borderRadius: scaleFontSize(1.5),
    },
    progressBarDot: {
        position: 'absolute',
        top: scaleFontSize(-4),
        width: scaleFontSize(11),
        height: scaleFontSize(11),
        borderRadius: scaleFontSize(5.5),
        marginLeft: scaleFontSize(-5.5),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
});
