import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '@/src/theme/Colors';
import CustomTabBar from '@/src/components/home/CustomTabBar';

export default function ShopScreen() {
    const colors = useThemeColors();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomTabBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
