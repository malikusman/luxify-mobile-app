import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store, persistor } from '@/src/context/store';
import { PersistGate } from 'redux-persist/integration/react';
import { Platform, LogBox } from 'react-native';
import { useSplashScreen } from '@/src/hooks/splash/useSplashScreen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

    useSplashScreen();
    useEffect(() => {
        LogBox.ignoreAllLogs();
        SplashScreen.hideAsync()
    }, []);

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <SafeAreaProvider>
                    <Stack screenOptions={{
                        gestureEnabled: true,
                        gestureDirection: 'horizontal',
                        animation: Platform.OS === 'ios' ? 'fade' : 'none',
                        headerShown: false,
                    }}>
                        <Stack.Screen name="auth/SplashScreen" options={{ headerShown: false }} />
                        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                        <Stack.Screen name="+not-found" />
                    </Stack>
                    <StatusBar style="auto" />
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
}
