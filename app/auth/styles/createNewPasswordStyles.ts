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
    bottomSheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheetContent: {
        width: '100%',
        borderTopLeftRadius: scaleFontSize(24),
        borderTopRightRadius: scaleFontSize(24),
        paddingHorizontal: scaleFontSize(24),
        paddingTop: scaleFontSize(16),
        alignItems: 'center',
        maxHeight: '80%',
    },
    bottomSheetHandle: {
        width: scaleFontSize(40),
        height: scaleFontSize(4),
        borderRadius: scaleFontSize(2),
        backgroundColor: '#CCCCCC',
        marginBottom: scaleFontSize(24),
        marginTop: scaleFontSize(8),
    },
    bottomSheetIconContainer: {
        marginBottom: scaleFontSize(24),
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBackground: {
        width: scaleFontSize(120),
        height: scaleFontSize(120),
        borderRadius: scaleFontSize(60),
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomSheetTitle: {
        fontSize: scaleFontSize(24),
        lineHeight: scaleFontSize(32),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(8),
        textAlign: 'center',
    },
    bottomSheetSubtitle: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(24),
        textAlign: 'center',
    },
    bottomSheetButtonContainer: {
        width: '100%',
    },
});

