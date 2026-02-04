import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import { translations } from '@/src/constants/translations';

interface EmptyChatViewProps {
    avatarSource: ImageSourcePropType;
    firstName: string;
    onSuggestionClick: (suggestion: string) => void;
}

export default function EmptyChatView({ avatarSource, firstName, onSuggestionClick }: EmptyChatViewProps) {
    const colors = useThemeColors();

    return (
        <View style={styles.container}>
            <Image
                source={avatarSource}
                style={styles.avatar}
                resizeMode="contain"
            />
            <Text style={[styles.greeting, { color: colors.text }]}>
                {translations.aiChat.greeting.replace('{firstName}', firstName)}
            </Text>
            <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                {translations.aiChat.instruction}
            </Text>
            <View style={styles.suggestionsContainer}>
                <TouchableOpacity
                    style={[styles.suggestionBubble, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => onSuggestionClick('Create a party look for me')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.suggestionText, { color: colors.text }]}>
                        Create a party look for me
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.suggestionBubble, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => onSuggestionClick('suggest me accessories')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.suggestionText, { color: colors.text }]}>
                        suggest me accessories
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.suggestionBubble, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => onSuggestionClick('I need shoes & bags')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.suggestionText, { color: colors.text }]}>
                        I need shoes & bags
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scaleFontSize(24),
    },
    avatar: {
        width: scaleFontSize(200),
        height: scaleFontSize(240),
        marginBottom: scaleFontSize(24),
    },
    greeting: {
        fontSize: scaleFontSize(32),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(16),
        textAlign: 'center',
    },
    instruction: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        lineHeight: scaleFontSize(24),
        textAlign: 'center',
        marginBottom: scaleFontSize(24),
        paddingHorizontal: scaleFontSize(20),
    },
    suggestionsContainer: {
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
