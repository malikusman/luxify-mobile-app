import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/src/context/store';
import { setSelectedProduct } from '@/src/context/slices/orderSlice';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import ArrowLeftIcon from '@/src/components/icons/ArrowLeftIcon';
import MicIcon from '@/src/components/icons/MicIcon';
import ShopmodeIcon from '@/src/components/icons/ShopmodeIcon';
import SendIcon from '@/src/components/icons/SendIcon';
import { Ionicons } from '@expo/vector-icons';

interface Product {
    id: string;
    image: any;
    title: string;
    description: string;
    price: string;
    brand?: string;
}

interface ProductDetailViewProps {
    product: Product;
    onClose: () => void;
    onBack: () => void;
    selectedOption: 'existing' | 'new';
}

// Dummy accessory items for the detail view
const accessoryItems = [
    {
        id: 'acc1',
        image: require('@/assets/d1.png'),
        brand: 'Tory Burch',
        title: 'Designer Sandals Pierced Multi-Strap Heeled Sandal',
        price: '$200.00',
    },
    {
        id: 'acc2',
        image: require('@/assets/d2.png'),
        brand: 'Savette',
        title: 'Savette Florence 25 leather tote bag',
        price: '$200.00',
    },
    {
        id: 'acc3',
        image: require('@/assets/d3.png'),
        brand: 'Jil Sander',
        title: 'Jil Sander Twisted hoop earrings',
        price: '$200.00',
    },
    {
        id: 'acc4',
        image: require('@/assets/d4.png'),
        brand: 'Rotate Birger',
        title: 'Designer Sandals Pleated Multi-Strap Heeled Sandal',
        price: '$200.00',
    },
];

export default function ProductDetailView({ product, onClose, onBack, selectedOption }: ProductDetailViewProps) {
    const router = useRouter();
    const dispatch = useDispatch();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const { data } = useSelector((state: RootState) => state.onboarding);
    const firstName = data.firstName || 'Lucia';
    const [refineText, setRefineText] = useState('');

    const outerPulse = useRef(new Animated.Value(1)).current;
    const middlePulse = useRef(new Animated.Value(1)).current;
    const innerPulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const createPulseAnimation = (animatedValue: Animated.Value, delay: number = 0) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(animatedValue, {
                        toValue: 1.05,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const outerAnim = createPulseAnimation(outerPulse, 0);
        const middleAnim = createPulseAnimation(middlePulse, 300);
        const innerAnim = createPulseAnimation(innerPulse, 600);

        outerAnim.start();
        middleAnim.start();
        innerAnim.start();

        return () => {
            outerAnim.stop();
            middleAnim.stop();
            innerAnim.stop();
        };
    }, [outerPulse, middlePulse, innerPulse]);

    const totalPrice = '$1,371.00';

    return (
        <View style={[styles.container, { backgroundColor: colors.aiChatBackground }]}>
            <View style={[styles.statusBarBackground, { height: insets.top }]} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                    activeOpacity={0.7}
                >
                    <View style={styles.backButtonBackground}>
                        <ArrowLeftIcon size={scaleFontSize(12)} color="#A6A6A6" />
                    </View>
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <Image
                        source={require('@/assets/s1.png')}
                        style={styles.avatarImage}
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        style={styles.changeStylistButton}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.changeStylistText, { color: colors.text }]}>
                            Change your stylist
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <Text style={[styles.title, { color: colors.text }]}>
                    Golden Hour Nuptials
                </Text>

                {/* Buy Entire Look Button */}
                <TouchableOpacity
                    style={[styles.buyEntireLookButton, { backgroundColor: colors.buttonPrimary }]}
                    activeOpacity={0.8}
                    onPress={() => {
                        // Store selected product in Redux before navigating
                        dispatch(setSelectedProduct(product));
                        // Navigate to checkout page
                        router.push('/order/checkout' as any);
                    }}
                >
                    <Ionicons name="logo-apple" size={scaleFontSize(20)} color="#FFFFFF" />
                    <Text style={[styles.buyEntireLookText, { color: colors.buttonText }]}>
                        BUY ENTIRE LOOK FOR {totalPrice}
                    </Text>
                </TouchableOpacity>

                {/* Main Product Display - Two Separate Views */}
                <View style={styles.productDisplayContainer}>
                    {/* View 1: Full Main Image */}
                    <View style={[styles.mainImageView, { backgroundColor: colors.card }]}>
                        <TouchableOpacity style={styles.bookmarkButton} activeOpacity={0.7}>
                            <Ionicons name="bookmark-outline" size={scaleFontSize(24)} color={colors.text} />
                        </TouchableOpacity>
                        <Image
                            source={product.image}
                            style={styles.mainLookImage}
                            resizeMode="cover"
                        />
                    </View>

                    {/* View 2: Items Listing */}
                    <View style={[styles.itemsListView, { backgroundColor: colors.card }]}>
                        <ScrollView 
                            style={styles.accessoriesScrollView}
                            contentContainerStyle={styles.accessoriesScrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {accessoryItems.map((item, index) => (
                                <View key={item.id} style={[styles.accessoryCard, { backgroundColor: colors.background }]}>
                                    <Image
                                        source={item.image}
                                        style={styles.accessoryImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.accessoryInfo}>
                                        <Text style={[styles.accessoryBrand, { color: colors.text }]}>
                                            {item.brand}
                                        </Text>
                                        <Text style={[styles.accessoryTitle, { color: colors.text }]} numberOfLines={2}>
                                            {item.title}
                                        </Text>
                                        <Text style={[styles.accessoryPrice, { color: colors.text }]}>
                                            {item.price}
                                        </Text>
                                        <TouchableOpacity
                                            style={[styles.buyItemButton, { backgroundColor: colors.buttonPrimary }]}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.buyItemButtonText, { color: colors.buttonText }]}>
                                                BUY ITEM
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* More Options Button */}
                <TouchableOpacity
                    style={[styles.moreOptionsButton, { backgroundColor: "#0000001F" }]}
                    activeOpacity={0.7}
                    onPress={() => {
                        // Handle more options action
                        console.log('More options pressed');
                    }}
                >
                    <Text style={[styles.moreOptionsText, { color: colors.textSecondary }]}>
                        MORE OPTIONS
                    </Text>
                </TouchableOpacity>

                {/* Voice Input Section */}
                <View style={styles.voiceInputSection}>
                    <TouchableOpacity style={styles.microphoneButton} activeOpacity={0.8}>
                        <View style={styles.micContainer}>
                            <Animated.View
                                style={[
                                    styles.micOuter,
                                    {
                                        backgroundColor: '#E3E5E5',
                                        transform: [{ scale: outerPulse }],
                                    },
                                ]}
                                renderToHardwareTextureAndroid={true}
                                shouldRasterizeIOS={true}
                            >
                                <Animated.View
                                    style={[
                                        styles.micMiddle,
                                        {
                                            backgroundColor: colors.micInner,
                                            transform: [{ scale: middlePulse }],
                                        },
                                    ]}
                                    renderToHardwareTextureAndroid={true}
                                    shouldRasterizeIOS={true}
                                >
                                    <Animated.View
                                        style={[
                                            styles.micInner,
                                            {
                                                backgroundColor: colors.micMiddle,
                                                borderWidth: scaleFontSize(2),
                                                borderColor: '#FFFFFF',
                                                transform: [{ scale: innerPulse }],
                                            },
                                        ]}
                                        renderToHardwareTextureAndroid={true}
                                        shouldRasterizeIOS={true}
                                    />
                                </Animated.View>
                            </Animated.View>
                            <View style={styles.micIconContainer}>
                                <MicIcon size={scaleFontSize(24)} color="#FFFFFF" />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBarContainer}>
                <View style={[styles.bottomBar, { backgroundColor: 'white' }]}>
                    <TextInput
                        style={[styles.refineInput, { color: colors.text }]}
                        placeholder="Refine your looks..."
                        placeholderTextColor={colors.textSecondary}
                        value={refineText}
                        onChangeText={setRefineText}
                        multiline={false}
                    />
                    <View style={styles.buttonsRow}>
                        <View style={styles.leftButtons}>
                            <TouchableOpacity style={[styles.circleButton, { backgroundColor: colors.bottomBarButtonBackground }]} activeOpacity={0.7}>
                                <Ionicons name="add" size={scaleFontSize(20)} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.shopmodeButton, { backgroundColor: colors.bottomBarButtonBackground }]} 
                                activeOpacity={0.7}
                            >
                                <ShopmodeIcon size={scaleFontSize(16)} color={colors.textSecondary} />
                                <Text style={[styles.shopmodeText, { color: colors.text }]}>Shopmode</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.circleButton, { backgroundColor: colors.bottomBarButtonBackground }]} activeOpacity={0.7}>
                            <SendIcon size={scaleFontSize(12)} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statusBarBackground: {
        width: '100%',
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(20),
        paddingTop: scaleFontSize(12),
        paddingBottom: scaleFontSize(16),
    },
    backButton: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonBackground: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleFontSize(12),
    },
    avatarImage: {
        width: scaleFontSize(40),
        height: scaleFontSize(40),
        borderRadius: scaleFontSize(20),
    },
    changeStylistButton: {
        paddingHorizontal: scaleFontSize(12),
        paddingVertical: scaleFontSize(6),
    },
    changeStylistText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: scaleFontSize(20),
        paddingBottom: scaleFontSize(100),
    },
    title: {
        fontSize: scaleFontSize(32),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(20),
        textAlign: 'center',
    },
    buyEntireLookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: scaleFontSize(16),
        borderRadius: scaleFontSize(12),
        marginBottom: scaleFontSize(24),
        gap: scaleFontSize(12),
    },
    buyEntireLookText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
    },
    productDisplayContainer: {
        flexDirection: 'row',
        marginBottom: scaleFontSize(24),
        justifyContent: 'space-between',
        gap: scaleFontSize(10),
        flex: 2
    },
    mainImageView: {
        flex: 1,
        borderRadius: scaleFontSize(16),
        padding: scaleFontSize(16),
        height: scaleFontSize(400),
        position: 'relative',
        overflow: 'hidden',
    },
    bookmarkButton: {
        position: 'absolute',
        top: scaleFontSize(28),
        right: scaleFontSize(28),
        zIndex: 10,
        width: scaleFontSize(40),
        height: scaleFontSize(40),
        borderRadius: scaleFontSize(20),
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainLookImage: {
        width: '100%',
        height: scaleFontSize(400),
        // minHeight: scaleFontSize(400),
        borderRadius: scaleFontSize(12),
    },
    itemsListView: {
        flex: 1,
        borderRadius: scaleFontSize(16),
        padding: scaleFontSize(16),
        height: scaleFontSize(400),
        overflow: 'hidden',
    },
    accessoriesScrollView: {
        flex: 1,
    },
    accessoriesScrollContent: {
        gap: scaleFontSize(12),
    },
    accessoryCard: {
        flexDirection: 'row',
        borderRadius: scaleFontSize(12),
        overflow: 'hidden',
        marginBottom: scaleFontSize(12),
        gap: scaleFontSize(12),
    },
    accessoryImage: {
        width: scaleFontSize(50),
        height: scaleFontSize(50),
        borderRadius: scaleFontSize(8),
    },
    accessoryInfo: {
        flex: 1,
        padding: scaleFontSize(5),
        justifyContent: 'space-between',
    },
    accessoryBrand: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoMedium,
        marginBottom: scaleFontSize(4),
    },
    accessoryTitle: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(4),
        lineHeight: scaleFontSize(16),
    },
    accessoryPrice: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoBold,
        marginBottom: scaleFontSize(8),
    },
    buyItemButton: {
        paddingVertical: scaleFontSize(8),
        paddingHorizontal: scaleFontSize(12),
        borderRadius: scaleFontSize(6),
        alignSelf: 'flex-start',
    },
    buyItemButtonText: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
    },
    moreOptionsButton: {
        width: '40%',
        paddingHorizontal: scaleFontSize(24),
        borderRadius: scaleFontSize(12),
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        paddingVertical: scaleFontSize(10),
        marginBottom: scaleFontSize(10),
    },
    moreOptionsText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '600',
        letterSpacing: scaleFontSize(0.8),
        textTransform: 'uppercase',
    },
    voiceInputSection: {
        alignItems: 'center',
        marginBottom: scaleFontSize(24),
    },
    microphoneButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    micContainer: {
        width: scaleFontSize(120),
        height: scaleFontSize(120),
        alignItems: 'center',
        justifyContent: 'center',
    },
    micIconContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: scaleFontSize(42),
        height: scaleFontSize(42),
    },
    micOuter: {
        width: scaleFontSize(100),
        height: scaleFontSize(100),
        borderRadius: scaleFontSize(24),
        justifyContent: 'center',
        alignItems: 'center',
    },
    micMiddle: {
        width: scaleFontSize(70),
        height: scaleFontSize(70),
        borderRadius: scaleFontSize(18),
        justifyContent: 'center',
        alignItems: 'center',
    },
    micInner: {
        width: scaleFontSize(42),
        height: scaleFontSize(42),
        borderRadius: scaleFontSize(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomBarContainer: {
        paddingTop: scaleFontSize(8),
    },
    bottomBar: {
        borderTopLeftRadius: scaleFontSize(20),
        borderTopRightRadius: scaleFontSize(20),
        paddingHorizontal: scaleFontSize(20),
        paddingTop: scaleFontSize(16),
        paddingBottom: scaleFontSize(24),
    },
    refineInput: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(12),
    },
    buttonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleFontSize(12),
    },
    circleButton: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    shopmodeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(8),
        borderRadius: scaleFontSize(20),
        gap: scaleFontSize(6),
    },
    shopmodeText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
    },
});

