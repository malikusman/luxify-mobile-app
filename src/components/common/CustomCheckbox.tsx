import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';

interface CustomCheckboxProps {
    label: string;
    checked: boolean;
    onPress: () => void;
}

export default function CustomCheckbox({
    label,
    checked,
    onPress,
}: CustomCheckboxProps) {
    const colors = useThemeColors();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View
                style={[
                    styles.checkbox,
                    {
                        backgroundColor: checked ? colors.buttonPrimary : 'transparent',
                        borderColor: checked ? colors.buttonPrimary : colors.border,
                    },
                ]}
            >
                {checked && (
                    <Ionicons
                        name="checkmark"
                        size={scaleFontSize(16)}
                        color={colors.buttonText}
                    />
                )}
            </View>
            <Text style={[styles.label, { color: colors.text }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    label: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
});
