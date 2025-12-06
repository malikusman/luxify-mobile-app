import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '@/src/theme/Colors';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';

interface SocialLoginButtonProps {
    icon: React.ReactNode;
    onPress?: () => void;
}

export default function SocialLoginButton({
    icon,
    onPress,
}: SocialLoginButtonProps) {
    const colors = useThemeColors();

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    borderColor: colors.border,
                    backgroundColor: 'transparent',
                },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {icon}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flex: 1,
        paddingVertical: scaleFontSize(16),
        paddingHorizontal: scaleFontSize(16),
        borderRadius: 4,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
