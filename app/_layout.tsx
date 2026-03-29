import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store, persistor } from '@/src/context/store';
import { PersistGate } from 'redux-persist/integration/react';
import { Platform, LogBox } from 'react-native';
import { useCustomFonts } from '@/src/hooks/useCustomFonts';
import { useSplashScreen } from '@/src/hooks/splash/useSplashScreen';
import { queryClient } from '@/src/services';
import { ToastProvider } from '@/src/context/ToastContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const fontsLoaded = useCustomFonts();
    useSplashScreen();

    useEffect(() => {
        LogBox.ignoreAllLogs();
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <SafeAreaProvider>
                            <Stack screenOptions={{
                                gestureEnabled: true,
                                gestureDirection: 'horizontal',
                                animation: Platform.OS === 'ios' ? 'fade' : 'none',
                                headerShown: false,
                            }}>
                                <Stack.Screen name="auth/SplashScreen" options={{ headerShown: false }} />
                                <Stack.Screen name="awareness" options={{ headerShown: false }} />
                                <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                                <Stack.Screen name="+not-found" />
                            </Stack>
                            <StatusBar style="auto" />
                        </SafeAreaProvider>
                    </ToastProvider>
                </QueryClientProvider>
            </PersistGate>
        </Provider>
    );
}
