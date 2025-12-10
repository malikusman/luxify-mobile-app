import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/context/store';
import { preloadAwarenessImages } from '@/src/utils/imagePreloader';

export default function AwarenessIndex() {
    const router = useRouter();
    const hasSeenAwareness = useSelector((state: RootState) => state.awareness?.hasSeenAwareness);
    const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated);

    useEffect(() => {
        // Preload awareness images for better performance
        preloadAwarenessImages();
        
        // if (hasSeenAwareness || isAuthenticated) {
        //     router.replace('/auth/login');
        // } else {
            router.replace('/awareness/intro');
        // }
    }, [hasSeenAwareness, isAuthenticated]);

    return <View />;
}

