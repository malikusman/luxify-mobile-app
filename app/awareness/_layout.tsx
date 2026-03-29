import { Stack } from 'expo-router';

export default function AwarenessLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="intro" />
            <Stack.Screen name="stylist" />
            <Stack.Screen name="discover" />
        </Stack>
    );
}

