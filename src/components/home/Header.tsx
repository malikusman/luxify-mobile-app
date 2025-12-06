import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import CalendarIcon from '@/src/components/icons/CalendarIcon';
import BellIcon from '@/src/components/icons/BellIcon';
import HelpCircleIcon from '@/src/components/icons/HelpCircleIcon';

export default function Header() {
    const colors = useThemeColors();

    return (
        <View style={styles.headerContainer}>
            <View style={[styles.header, { backgroundColor: colors.background, marginHorizontal: scaleFontSize(16) }]}>
                <View style={styles.headerLeft}>
                    <View style={[styles.profileImage, { backgroundColor: colors.border }]}>
                        <Ionicons name="person" size={scaleFontSize(20)} color={colors.textSecondary} />
                    </View>
                </View>
                <View style={styles.headerCenter}>
                    <View style={[styles.calendarIconContainer, { backgroundColor: colors.text }]}>
                        <CalendarIcon size={scaleFontSize(18)} color={colors.background} />
                    </View>
                    <Text style={[styles.eventsText, { color: colors.text }]}>Events</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity>
                        <HelpCircleIcon size={scaleFontSize(20)} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <BellIcon size={scaleFontSize(20)} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(20),
        paddingBottom: scaleFontSize(12),
        paddingTop: scaleFontSize(12),
        borderBottomLeftRadius: scaleFontSize(20),
        borderBottomRightRadius: scaleFontSize(20),
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleFontSize(12),
    },
    profileImage: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleFontSize(8),
    },
    calendarIconContainer: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventsText: {
        fontSize: scaleFontSize(15),
        lineHeight: scaleFontSize(20),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleFontSize(16),
    },
});

