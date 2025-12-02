import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';

interface CustomButtonProps {
    title: string;
    onPress?: () => void;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function CustomButton({
    title,
    onPress,
    backgroundColor = '#000000',
    textColor = '#FFFFFF',
    borderColor = 'transparent',
    icon,
    style,
    textStyle,
}: CustomButtonProps) {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor,
                    borderColor,
                },
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text
                style={[
                    styles.buttonText,
                    { color: textColor },
                    textStyle,
                ]}
            >
                {title}
            </Text>
            {icon && <View style={styles.iconPlaceholder} />}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        height: 56,
        borderRadius: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
    },
    iconContainer: {
        width: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: scaleFontSize(16),
        fontWeight: '500',
        flex: 1,
        textAlign: 'center',
    },
    iconPlaceholder: {
        width: 24,
    },
});
