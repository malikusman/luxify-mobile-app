import { useFonts } from 'expo-font';

export const useCustomFonts = () => {
    const [fontsLoaded] = useFonts({
        // Nunito fonts
        'Nunito-ExtraLight': require('../../assets/fonts/Nunito-ExtraLight.ttf'),
        'Nunito-Light': require('../../assets/fonts/Nunito-Light.ttf'),
        'Nunito-Regular': require('../../assets/fonts/Nunito-Regular.ttf'),
        'Nunito-Medium': require('../../assets/fonts/Nunito-Medium.ttf'),
        'Nunito-SemiBold': require('../../assets/fonts/Nunito-SemiBold.ttf'),
        'Nunito-Bold': require('../../assets/fonts/Nunito-Bold.ttf'),
        'Nunito-ExtraBold': require('../../assets/fonts/Nunito-ExtraBold.ttf'),
        'Nunito-Black': require('../../assets/fonts/Nunito-Black.ttf'),

        // Hermann font
        'Hermann-Regular': require('../../assets/fonts/Hermann-Regular.ttf'),
    });

    return fontsLoaded;
};
