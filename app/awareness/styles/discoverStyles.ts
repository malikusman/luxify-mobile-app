import { StyleSheet, Dimensions } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { FONTS } from '@/src/constants/fonts';

const { width, height } = Dimensions.get('window');

export const discoverStyles = StyleSheet.create({
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
    contentContainer: {
        flex: 1,
    },
    textSection: {
        paddingHorizontal: scaleFontSize(20),
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
        marginBottom: scaleFontSize(30),
    },
    subtitle: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        lineHeight: scaleFontSize(22),
        paddingHorizontal: scaleFontSize(20),
    },
    sliderContainer: {
        flex: 1,
        marginVertical: scaleFontSize(20),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: scaleFontSize(50),
        alignItems: 'center',
    },
    slideContainer: {
        width: width - scaleFontSize(100),
        marginRight: scaleFontSize(20),
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageCard: {
        width: '100%',
        borderRadius: scaleFontSize(20),
        padding: scaleFontSize(8),
    },
    imageContainer: {
        width: '100%',
        height: (width - scaleFontSize(96)) * 1.2,
        borderRadius: scaleFontSize(12),
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: scaleFontSize(20),
        marginBottom: scaleFontSize(20),
    },
    paginationDot: {
        width: scaleFontSize(8),
        height: scaleFontSize(8),
        borderRadius: scaleFontSize(4),
        borderWidth: scaleFontSize(1),
        borderColor: '#000000',
        marginHorizontal: scaleFontSize(4),
    },
    paginationDotActive: {
        borderWidth: 0,
        width: scaleFontSize(24),
    },
    buttonContainer: {
        paddingHorizontal: scaleFontSize(20),
        paddingBottom: scaleFontSize(40),
    },
});

