import 'expo-constants';

declare module 'expo-constants' {
    export interface ExpoConfig {
        extra?: {
            apiUrl?: string;
        };
    }
}

