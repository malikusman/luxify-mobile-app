import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    display: 'none',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarStyle: {
                        display: 'none',
                    },
                }}
            />
            <Tabs.Screen
                name="closet"
                options={{
                    tabBarStyle: {
                        display: 'none',
                    },
                }}
            />
            <Tabs.Screen
                name="outfits"
                options={{
                    tabBarStyle: {
                        display: 'none',
                    },
                }}
            />
            <Tabs.Screen
                name="shop"
                options={{
                    tabBarStyle: {
                        display: 'none',
                    },
                }}
            />
            <Tabs.Screen
                name="deals"
                options={{
                    tabBarStyle: {
                        display: 'none',
                    },
                }}
            />
        </Tabs>
    );
}

