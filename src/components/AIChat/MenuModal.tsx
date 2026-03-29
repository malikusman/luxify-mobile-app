import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';

interface MenuModalProps {
    visible: boolean;
    onClose: () => void;
    onViewChatHistory: () => void;
    onChangeStylist: () => void;
}

export default function MenuModal({
    visible,
    onClose,
    onViewChatHistory,
    onChangeStylist,
}: MenuModalProps) {
    const colors = useThemeColors();

    if (!visible) return null;

    return (
        <>
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            />
            <View style={[styles.menu, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                    style={styles.option}
                    onPress={onViewChatHistory}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.optionText, { color: colors.text }]}>
                        View chat history
                    </Text>
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <TouchableOpacity
                    style={styles.option}
                    onPress={onChangeStylist}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.optionText, { color: colors.text }]}>
                        Change your stylist
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
    },
    menu: {
        position: 'absolute',
        top: scaleFontSize(60),
        right: scaleFontSize(20),
        minWidth: scaleFontSize(200),
        borderRadius: scaleFontSize(12),
        paddingVertical: scaleFontSize(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 1000,
    },
    option: {
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(12),
    },
    optionText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        lineHeight: scaleFontSize(22),
    },
    divider: {
        height: 1,
        marginVertical: scaleFontSize(4),
    },
});
