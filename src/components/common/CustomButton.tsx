import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View, ActivityIndicator } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { FONTS } from '@/src/constants/fonts';

interface CustomButtonProps {
    title: string;
    onPress?: () => void;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
    loading?: boolean;
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
    disabled = false,
    loading = false,
}: CustomButtonProps) {
    const isDisabled = disabled || loading;
    
    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor,
                    borderColor,
                    opacity: isDisabled ? 0.5 : 1,
                },
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={isDisabled}
        >
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={textColor} />
                </View>
            ) : (
                <Text
                    style={[
                        styles.buttonText,
                        { color: textColor },
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            )}
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
        fontFamily: FONTS.nunitoMedium,
        flex: 1,
        textAlign: 'center',
    },
    iconPlaceholder: {
        width: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
