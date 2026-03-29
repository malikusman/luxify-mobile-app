import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import MicIcon from '@/src/components/icons/MicIcon';
import SendIcon from '@/src/components/icons/SendIcon';
import { ActivityIndicator } from 'react-native';
import { translations } from '@/src/constants/translations';

interface InputBarProps {
    messageText: string;
    onMessageTextChange: (text: string) => void;
    onSend: () => void;
    onMicPress: () => void;
    isSending: boolean;
    showRefineInput?: boolean;
}

export default function InputBar({
    messageText,
    onMessageTextChange,
    onSend,
    onMicPress,
    isSending,
    showRefineInput = false,
}: InputBarProps) {
    const colors = useThemeColors();

    return (
        <>
            <TextInput
                style={[
                    showRefineInput ? styles.refineInput : styles.messageInput,
                    { color: colors.text, borderColor: showRefineInput ? '#E3E5E5' : undefined }
                ]}
                placeholder={showRefineInput ? translations.aiChat.refinePlaceholder : "Type a message..."}
                placeholderTextColor={colors.textSecondary}
                value={messageText}
                onChangeText={onMessageTextChange}
                multiline={false}
                onSubmitEditing={onSend}
                returnKeyType="send"
                editable={!isSending}
            />
            <View style={styles.buttonsRow}>
                <View style={styles.leftButtons}>
                    <TouchableOpacity 
                        style={[styles.circleButton, { backgroundColor: colors.bottomBarButtonBackground }]} 
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={scaleFontSize(20)} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.circleButton, { backgroundColor: colors.bottomBarButtonBackground }]} 
                        activeOpacity={0.7}
                        onPress={onMicPress}
                    >
                        <MicIcon size={scaleFontSize(20)} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity 
                    style={[
                        styles.circleButton, 
                        { 
                            backgroundColor: messageText.trim() ? colors.buttonPrimary : colors.bottomBarButtonBackground 
                        }
                    ]} 
                    activeOpacity={0.7}
                    onPress={onSend}
                    disabled={!messageText.trim() || isSending}
                >
                    {isSending ? (
                        <ActivityIndicator size="small" color={colors.buttonText} />
                    ) : (
                        <SendIcon 
                            size={scaleFontSize(12)} 
                            color={messageText.trim() ? colors.buttonText : colors.textSecondary} 
                        />
                    )}
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    messageInput: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(12),
    },
    refineInput: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(12),
        borderWidth: 1,
        borderRadius: scaleFontSize(8),
        paddingHorizontal: scaleFontSize(12),
        paddingVertical: scaleFontSize(10),
    },
    buttonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleFontSize(12),
    },
    circleButton: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
});
