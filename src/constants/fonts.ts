// Font family constants for the Luxify app
// Usage: import { FONTS } from '@/src/constants/fonts';

export const FONTS = {
    // Nunito font family
    nunitoExtraLight: 'Nunito-ExtraLight',
    nunitoLight: 'Nunito-Light',
    nunitoRegular: 'Nunito-Regular',
    nunitoMedium: 'Nunito-Medium',
    nunitoSemiBold: 'Nunito-SemiBold',
    nunitoBold: 'Nunito-Bold',
    nunitoExtraBold: 'Nunito-ExtraBold',
    nunitoBlack: 'Nunito-Black',

    // Hermann font family
    hermannRegular: 'Hermann-Regular',
    // Note: Use Nunito-Bold as fallback for Hermann bold text
};

// Font weight mapping for easier usage
export const FONT_WEIGHTS = {
    extraLight: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
} as const;
