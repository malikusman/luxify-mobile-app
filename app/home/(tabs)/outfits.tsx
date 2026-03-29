import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function OutfitsScreen() {
    const router = useRouter();

    useEffect(() => {
        // Navigate to AI Chat screen when this tab is accessed
        router.dismissAll();
                        router.replace('/home/AIChat' as any);
    }, []);

    return <View />;
}

const styles = StyleSheet.create({

});

