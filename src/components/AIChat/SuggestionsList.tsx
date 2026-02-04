import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';

interface SuggestionsListProps {
    onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
    'Create a party look for me',
    'suggest me accessories',
    'I need shoes & bags',
];

export default function SuggestionsList({ onSuggestionClick }: SuggestionsListProps) {
    const colors = useThemeColors();

    return (
        <View style={styles.container}>
            {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                    key={index}
                    style={[styles.suggestionBubble, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => onSuggestionClick(suggestion)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.suggestionText, { color: colors.text }]}>
                        {suggestion}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: scaleFontSize(12),
        paddingHorizontal: scaleFontSize(20),
        marginTop: scaleFontSize(8),
    },
    suggestionBubble: {
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(12),
        borderRadius: scaleFontSize(20),
        borderWidth: 1,
        maxWidth: '100%',
    },
    suggestionText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        lineHeight: scaleFontSize(20),
    },
});
