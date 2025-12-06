import React, { useState, forwardRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';

interface CustomInputProps extends TextInputProps {
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
}

const CustomInput = forwardRef<TextInput, CustomInputProps>(({
    icon,
    rightIcon,
    onRightIconPress,
    style,
    ...props
}, ref) => {
    const colors = useThemeColors();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.surface,
                    borderColor: isFocused ? colors.border : 'transparent',
                },
                style,
            ]}
        >
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <TextInput
                ref={ref}
                style={[
                    styles.input,
                    {
                        color: colors.text,
                    },
                ]}
                placeholderTextColor={colors.textSecondary}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props}
            />
            {rightIcon && (
                <TouchableOpacity
                    style={styles.rightIconContainer}
                    onPress={onRightIconPress}
                    activeOpacity={0.7}
                >
                    {rightIcon}
                </TouchableOpacity>
            )}
        </View>
    );
});

CustomInput.displayName = 'CustomInput';

export default CustomInput;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 56,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    iconContainer: {
        width: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    rightIconContainer: {
        width: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
});
