import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

export function useSplashScreen(): void {
    useEffect(() => {
        const loadApp = async (): Promise<void> => {
            await new Promise(resolve => setTimeout(resolve, 1500));
            await SplashScreen.hideAsync();
        };
        loadApp();
    }, []);
}
