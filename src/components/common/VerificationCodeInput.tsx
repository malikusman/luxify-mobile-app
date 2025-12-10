import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';

interface VerificationCodeInputProps {
    length?: number;
    onCodeChange: (code: string) => void;
    autoFocus?: boolean;
}

export default function VerificationCodeInput({
    length = 4,
    onCodeChange,
    autoFocus = true,
}: VerificationCodeInputProps) {
    const colors = useThemeColors();
    const [codes, setCodes] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0]?.focus();
        }
    }, [autoFocus]);

    const handleChangeText = (text: string, index: number) => {
        // Only allow single digit
        const digit = text.replace(/[^0-9]/g, '').slice(-1);
        
        const newCodes = [...codes];
        newCodes[index] = digit;
        setCodes(newCodes);

        const codeString = newCodes.join('');
        onCodeChange(codeString);

        // Auto-focus next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !codes[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleFocus = (index: number) => {
        // Clear the current input when focused if it has a value
        if (codes[index]) {
            const newCodes = [...codes];
            newCodes[index] = '';
            setCodes(newCodes);
            const codeString = newCodes.join('');
            onCodeChange(codeString);
        }
    };

    return (
        <View style={styles.container}>
            {Array.from({ length }).map((_, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => {
                        inputRefs.current[index] = ref;
                    }}
                    style={[
                        styles.input,
                        {
                            backgroundColor: 'transparent',
                            borderColor: codes[index] ? colors.border : colors.borderLight,
                            color: colors.text,
                        },
                    ]}
                    value={codes[index]}
                    onChangeText={(text) => handleChangeText(text, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    onFocus={() => handleFocus(index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginBottom: scaleFontSize(24),
        gap: scaleFontSize(16),
    },
    input: {
        width: scaleFontSize(56),
        height: scaleFontSize(56),
        borderRadius: scaleFontSize(28),
        borderWidth: 1,
        textAlign: 'center',
        fontSize: scaleFontSize(24),
        fontFamily: FONTS.nunitoSemiBold,
    },
});

