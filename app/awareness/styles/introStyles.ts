import { StyleSheet, Dimensions } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { FONTS } from '@/src/constants/fonts';

const { width, height } = Dimensions.get('window');

export const introStyles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        height: height,
    },
    backgroundImage: {
        position: 'absolute',
        width: width,
        height: height,
        top: 0,
        left: 0,
    },
    overlay: {
        position: 'absolute',
        width: width,
        height: height,
        backgroundColor: '#00000080',
    },
    logoContainer: {
        position: 'absolute',
        top: scaleFontSize(60),
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1,
    },
    logo: {
        width: scaleFontSize(100),
        height: scaleFontSize(100),
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: scaleFontSize(50),
        paddingHorizontal: scaleFontSize(20),
    },
    textContainer: {
        marginBottom: scaleFontSize(30),
    },
    titleContainer: {
        marginBottom: scaleFontSize(12),
    },
    titleText: {
        fontSize: scaleFontSize(28),
        fontFamily: FONTS.hermannRegular,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    subtitleContainer: {
        marginTop: scaleFontSize(8),
    },
    subtitleText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: scaleFontSize(22),
    },
    buttonContainer: {
        paddingHorizontal: 0,
    },
});

