import 'expo-constants';

declare module 'expo-constants' {
    export interface ExpoConfig {
        extra?: {
            apiUrl?: string;
            backendUrl?: string;
            googleClientId?: string;
            googleClientSecret?: string;
            facebookAppId?: string;
            facebookAppSecret?: string;
            /** Google Vertex AI Virtual Try-On (client-side). Prefer backend proxy in production. */
            googleVertexClientEmail?: string;
            googleVertexPrivateKey?: string;
            googleVertexProjectId?: string;
            googleVertexRegion?: string;
        };
    }
}

