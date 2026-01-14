import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import { RootState } from '@/src/context/store';
import CalendarIcon from '@/src/components/icons/CalendarIcon';
import BellIcon from '@/src/components/icons/BellIcon';
import HelpCircleIcon from '@/src/components/icons/HelpCircleIcon';
import { useSignOut } from '@/src/services/modules/auth/authHooks';
import { persistor } from '@/src/context/store';
import { showLogoutDialog } from '@/src/components/common/ConfirmationDialog';
import { updateProfileData, resetProfile } from '@/src/context/slices/profileSlice';
import { useUserProfileSelector } from '@/src/services';

interface HeaderProps {
    centerContent?: ReactNode;
    rightContent?: ReactNode;
}

export default function Header({ centerContent, rightContent }: HeaderProps = {}) {
    const colors = useThemeColors();
    const router = useRouter();
    const dispatch = useDispatch();
    const signOutMutation = useSignOut();
    const user = useSelector((state: RootState) => state.auth?.user);
    const userProfile = useUserProfileSelector();

    console.log('userProfile', userProfile);

    const handleProfilePress = () => {
        // Parse user name to extract first and last name
        let firstName = '';
        let lastName = '';
        
        if (userProfile?.first_name && userProfile?.last_name) {
            firstName = userProfile.first_name;
            lastName = userProfile.last_name;
        } else if (user?.name) {
            const nameParts = user.name.trim().split(/\s+/);
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
        }

        // Reset onboarding to step 1 and update with user data
        dispatch(resetProfile());
        dispatch(updateProfileData({
            firstName,
            lastName,
            email: user?.email || userProfile?.email || '',
            avatar_url: userProfile?.avatar_url || null,
        }));

        // Navigate to onboarding flow
        router.push('/profile/OnboardingFlow');
    };

    const handleLogout = () => {
        showLogoutDialog(async () => {
            try {
                await signOutMutation.mutateAsync();
            } catch (error: any) {
            } finally {
                try {
                    await persistor.purge();
                } catch (purgeError) {
                    // Ignore purge errors
                    console.warn('Error purging persisted state:', purgeError);
                }
                // Navigate to login
                router.dismissAll();
                        router.replace('/auth/login');
            }
        });
    };

    return (
        <View style={styles.headerContainer}>
            <View style={[styles.header, { backgroundColor: colors.background, marginHorizontal: scaleFontSize(16) }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity 
                        onPress={handleProfilePress}
                        activeOpacity={0.7}
                    >
                        {userProfile?.avatar_url ? (
                            <Image
                                source={{ uri: userProfile.avatar_url }}
                                style={[styles.profileImage, styles.avatarImage]}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.profileImage, { backgroundColor: colors.border }]}>
                                <Ionicons name="person" size={scaleFontSize(20)} color={colors.textSecondary} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                <View style={styles.headerCenter}>
                    {centerContent || (
                        <>
                            <View style={[styles.calendarIconContainer, { backgroundColor: colors.text }]}>
                                <CalendarIcon size={scaleFontSize(18)} color={colors.background} />
                            </View>
                            <Text style={[styles.eventsText, { color: colors.text }]}>Events</Text>
                        </>
                    )}
                </View>
                <View style={styles.headerRight}>
                    {rightContent || (
                        <>
                            <TouchableOpacity>
                                <HelpCircleIcon size={scaleFontSize(20)} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <BellIcon size={scaleFontSize(20)} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleLogout}>
                                <Ionicons name="log-out-outline" size={scaleFontSize(20)} color={colors.text} />
                            </TouchableOpacity>
                        </>
                    )}
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
    avatarImage: {
        borderRadius: scaleFontSize(16),
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

