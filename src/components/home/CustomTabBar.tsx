import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeIcon from '@/src/components/icons/HomeIcon';
import ClosetIcon from '@/src/components/icons/ClosetIcon';
import OutfitsIcon from '@/src/components/icons/OutfitsIcon';
import ShopIcon from '@/src/components/icons/ShopIcon';
import DealsIcon from '@/src/components/icons/DealsIcon';

interface TabItem {
    name: string;
    route: string;
    Icon: React.ComponentType<{ size?: number; color?: string }>;
    label: string;
}

const TABS: TabItem[] = [
    {
        name: 'home',
        route: '/home/(tabs)/',
        Icon: HomeIcon,
        label: 'Home',
    },
    {
        name: 'closet',
        route: '/home/(tabs)/closet',
        Icon: ClosetIcon,
        label: 'Closet',
    },
    {
        name: 'outfits',
        route: '/home/(tabs)/outfits',
        Icon: OutfitsIcon,
        label: 'Outfits',
    },
    {
        name: 'shop',
        route: '/home/(tabs)/shop',
        Icon: ShopIcon,
        label: 'Shop',
    },
    {
        name: 'deals',
        route: '/home/(tabs)/deals',
        Icon: DealsIcon,
        label: 'Deals',
    },
];

export default function CustomTabBar() {
    const router = useRouter();
    const pathname = usePathname();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    const getActiveTab = () => {
        const path = pathname.toLowerCase();
        if (path.includes('/closet')) return 'closet';
        if (path.includes('/outfits')) return 'outfits';
        if (path.includes('/shop')) return 'shop';
        if (path.includes('/deals')) return 'deals';
        return 'home';
    };

    const activeTab = getActiveTab();

    const handleTabPress = (route: string) => {
        router.push(route as any);
    };

    return (
        <View
            style={[
                styles.tabBarContainer,
                {
                    paddingBottom: scaleFontSize(10),
                },
            ]}
        >
            <View style={[styles.blurContainer, { backgroundColor: colors.tabBarBackground }]}>
                <View style={styles.tabBar}>
                    {TABS.map((tab) => {
                        const IconComponent = tab.Icon;
                        const isOutfitsTab = tab.name === 'outfits';
                        const isActive = activeTab === tab.name;

                        return (
                            <TouchableOpacity
                                key={tab.name}
                                style={styles.tabItem}
                                onPress={() => handleTabPress(tab.route)}
                                activeOpacity={0.7}
                            >
                                {!isOutfitsTab && isActive && (
                                    <View style={[styles.activeBar, { backgroundColor: colors.text }]} />
                                )}
                                <View style={styles.iconContainer}>
                                    {isOutfitsTab ? (
                                        <View style={[styles.activeTabIndicator, { backgroundColor: colors.text }]}>
                                            <IconComponent
                                                size={scaleFontSize(24)}
                                                color={colors.background}
                                            />
                                        </View>
                                    ) : (
                                        <IconComponent
                                            size={scaleFontSize(24)}
                                            color={colors.text}
                                        />
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    blurContainer: {
        borderRadius: scaleFontSize(150),
        overflow: 'hidden',
        marginHorizontal: scaleFontSize(24),
        marginBottom: scaleFontSize(8)
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: scaleFontSize(12),
        paddingHorizontal: scaleFontSize(8),
        position: 'relative',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: scaleFontSize(5),
        position: 'relative',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTabIndicator: {
        width: scaleFontSize(40),
        height: scaleFontSize(40),
        borderRadius: scaleFontSize(8),
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeBar: {
        position: 'absolute',
        top: scaleFontSize(-19),
        width: scaleFontSize(24),
        height: scaleFontSize(4),
        borderBottomLeftRadius: scaleFontSize(3),
        borderBottomRightRadius: scaleFontSize(3),
        alignSelf: 'center',
    },
});

