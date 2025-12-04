import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '@/src/components/common/Logo';
import CustomTabBar from '@/src/components/home/CustomTabBar';
import CalendarIcon from '@/src/components/icons/CalendarIcon';

export default function HomeScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const t = translations.home;

    return (
        <View style={[styles.container, { backgroundColor: "#f7f7f7" }]}>
            <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
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
                            <Ionicons name="help-circle-outline" size={scaleFontSize(24)} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Ionicons name="notifications-outline" size={scaleFontSize(24)} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ImageBackground
                    source={require('@/assets/placeholderImage.png')}
                    style={styles.backgroundImage}
                    imageStyle={styles.backgroundImageStyle}
                >
                    <View style={styles.content}>
                        <View style={styles.logoSection}>
                            <Logo size={scaleFontSize(120)} />
                        </View>
                        <Text style={[styles.welcomeText, { color: colors.text }]}>
                            {t.welcomeMessage}
                        </Text>
                        <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                            {t.instructionText}
                        </Text>

                        <View style={[styles.closetCard, { backgroundColor: colors.text }]}>
                            <View style={styles.closetHeader}>
                                <Text style={[styles.closetTitle, { color: colors.textSecondary }]}>
                                    {t.closet}
                                </Text>
                                <Text style={[styles.closetCount, { color: colors.surface }]}>
                                    0/5
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.addButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.addButtonText, { color: colors.text }]}>
                                    {t.addToCloset}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.helpSection}>
                            <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                                {t.dontKnowWhereToStart}
                            </Text>
                            <TouchableOpacity activeOpacity={0.7}>
                                <Text style={[styles.helpLink, { color: colors.buttonPrimary }]}>
                                    {t.getStyledByLuxify}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </ScrollView>

            <CustomTabBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
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
    timeText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
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
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleFontSize(16),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        minHeight: '100%',
    },
    backgroundImageStyle: {
        opacity: 0.1,
        resizeMode: 'cover',
    },
    content: {
        flex: 1,
        paddingHorizontal: scaleFontSize(24),
        paddingTop: scaleFontSize(40),
        paddingBottom: scaleFontSize(100),
        alignItems: 'center',
    },
    logoSection: {
        marginBottom: scaleFontSize(32),
    },
    welcomeText: {
        fontSize: scaleFontSize(28),
        lineHeight: scaleFontSize(36),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(8),
        textAlign: 'center',
    },
    instructionText: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        marginBottom: scaleFontSize(40),
        paddingHorizontal: scaleFontSize(20),
    },
    closetCard: {
        width: '80%',
        padding: scaleFontSize(20),
        marginBottom: scaleFontSize(24),
    },
    closetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scaleFontSize(16),
    },
    closetTitle: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.nunitoMedium,
        fontWeight: '400',
    },
    closetCount: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    addButton: {
        width: '100%',
        paddingVertical: scaleFontSize(16),
        borderWidth: scaleFontSize(1),
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
    },
    helpSection: {
        alignItems: 'center',
        gap: scaleFontSize(8),
    },
    helpText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
    helpLink: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
        textDecorationLine: 'underline',
    },
});

