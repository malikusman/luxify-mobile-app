import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';

interface BackButtonProps {
    onPress?: () => void;
}

export default function BackButton({ onPress }: BackButtonProps) {
    const router = useRouter();
    const colors = useThemeColors();

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.back();
        }
    };

    return (
        <TouchableOpacity
            style={styles.backButton}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Ionicons
                name="chevron-back"
                size={scaleFontSize(24)}
                color={colors.text}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
});
