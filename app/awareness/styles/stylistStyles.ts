import { StyleSheet, Dimensions } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { FONTS } from '@/src/constants/fonts';

const { width } = Dimensions.get('window');

export const stylistStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: scaleFontSize(60),
        paddingHorizontal: scaleFontSize(20),
        paddingBottom: scaleFontSize(10),
        alignItems: 'flex-end',
    },
    skipButton: {
        paddingVertical: scaleFontSize(8),
        paddingHorizontal: scaleFontSize(12),
    },
    skipText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoMedium,
    },
    scrollContent: {
        flexGrow: 1
    },
    titleContainer: {
        marginTop: scaleFontSize(20),
        marginBottom: scaleFontSize(12),
    },
    title: {
        fontSize: scaleFontSize(28),
        fontFamily: FONTS.hermannRegular,
        textAlign: 'center',
        lineHeight: scaleFontSize(34),
    },
    subtitleContainer: {
        marginBottom: scaleFontSize(40),
    },
    subtitle: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        lineHeight: scaleFontSize(22),
        paddingHorizontal: scaleFontSize(20),
    },
    imagesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginVertical: scaleFontSize(30),
        height: scaleFontSize(400),
        position: 'relative',
    },
    leftImageWrapper: {
        position: 'absolute',
        left: scaleFontSize(10),
        bottom: scaleFontSize(20),
        zIndex: 1,
    },
    centerImageWrapper: {
        position: 'absolute',
        left: (width - scaleFontSize(200)) / 2,
        bottom: 0,
        zIndex: 3,
    },
    rightImageWrapper: {
        position: 'absolute',
        right: scaleFontSize(10),
        bottom: scaleFontSize(20),
        zIndex: 1,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: scaleFontSize(20),
        marginBottom: scaleFontSize(30),
    },
    paginationDot: {
        width: scaleFontSize(8),
        height: scaleFontSize(8),
        borderRadius: scaleFontSize(4),
        backgroundColor: '#CCCCCC',
        marginHorizontal: scaleFontSize(4),
    },
    paginationDotActive: {
        backgroundColor: '#000000',
        width: scaleFontSize(24),
    },
    buttonContainer: {
        paddingHorizontal: scaleFontSize(20),
        paddingBottom: scaleFontSize(40),
    },
});

