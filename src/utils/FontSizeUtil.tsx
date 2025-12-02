import { Dimensions, Platform } from 'react-native';
const { width, height } = Dimensions.get('window');

const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;

export const scaleFontSize = (fontSize: number) => {
    if (Platform.OS === 'web') {
        const scaleWidth = width / guidelineBaseWidth;
        const scaleHeight = height / guidelineBaseHeight;
        const scale = Math.min(scaleWidth, scaleHeight);
        return Math.round(fontSize * scale);
    } else {
        const scale = width / guidelineBaseWidth;

        const isIPad = Platform.OS === 'ios' && Platform.constants.interfaceIdiom === 'pad';
        const isAndroidTablet = Platform.OS === 'android' && width >= 600;

        if (isIPad || isAndroidTablet) {
            const isLargeTablet = width >= 1024;
            const isSmallTablet = width <= 768;

            if (isLargeTablet) {
                return Math.round(fontSize * (scale * 0.6))
            } else if (isSmallTablet) {
                return Math.round(fontSize * (scale * 0.8))
            } else {
                return Math.round(fontSize * (scale * 0.7))
            }
        }

        const minScale = 0.85;
        const adjustedScale = Math.max(scale, minScale);

        return Math.round(fontSize * adjustedScale);
    }
};
