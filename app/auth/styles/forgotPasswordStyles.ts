import { StyleSheet } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { FONTS } from '@/src/constants/fonts';

export const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    backButtonContainer: {
        paddingTop: scaleFontSize(60),
        paddingLeft: scaleFontSize(24),
        paddingBottom: scaleFontSize(8),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: scaleFontSize(24),
        paddingTop: scaleFontSize(40),
        paddingBottom: scaleFontSize(40),
    },
    titleText: {
        fontSize: scaleFontSize(32),
        lineHeight: scaleFontSize(39),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(16),
        textAlign: 'left',
    },
    subtitleText: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(32),
        textAlign: 'left',
    },
    inputContainer: {
        width: '100%',
        marginBottom: scaleFontSize(24),
    },
    errorText: {
        width: '100%',
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(-12),
        marginBottom: scaleFontSize(8),
        paddingLeft: scaleFontSize(4),
    },
    buttonContainer: {
        width: '100%',
        marginTop: scaleFontSize(8),
    },
});

