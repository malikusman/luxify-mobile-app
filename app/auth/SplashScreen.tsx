import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/context/store';
import { preloadAwarenessImages } from '@/src/utils/imagePreloader';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const router = useRouter();
    const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated);
    const accessToken = useSelector((state: RootState) => state.auth?.accessToken);
    const hasSeenAwareness = useSelector((state: RootState) => state.awareness?.hasSeenAwareness);

    useEffect(() => {
        // Preload awareness images early for better performance
        if (!hasSeenAwareness) {
            preloadAwarenessImages();
        }

        // Wait for Redux state to be available (rehydrated)
        // Check both isAuthenticated and accessToken to ensure user is logged in
        const timer = setTimeout(() => {
            if (isAuthenticated && accessToken) {
                router.replace('/home/(tabs)');
            } else if (!hasSeenAwareness) {
                router.replace('/awareness');
            } else {
                // router.replace('/auth/login');
                router.replace('/awareness');

            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [isAuthenticated, accessToken, hasSeenAwareness]);

    return (
        <View style={styles.container}>
            <Image
                source={require('@/assets/splash.png')}
                style={styles.logo}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        width: width,
        height: height,
    },
    logo: {
        width: 150,
        height: 150,
    },
});
