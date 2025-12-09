import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/context/store';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import { translations } from '@/src/constants/translations';
import { DEFAULTS, AI_CHAT_PRODUCTS, ANIMATION } from '@/src/constants/constants';
import ArrowLeftIcon from '@/src/components/icons/ArrowLeftIcon';
import MicIcon from '@/src/components/icons/MicIcon';
import ShopmodeIcon from '@/src/components/icons/ShopmodeIcon';
import SendIcon from '@/src/components/icons/SendIcon';
import ProductDetailView from '@/src/components/home/ProductDetailView';
import { Ionicons } from '@expo/vector-icons';

export default function AIChatScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const { data } = useSelector((state: RootState) => state.onboarding);
    const firstName = data.firstName || DEFAULTS.FIRST_NAME;
    const [refineText, setRefineText] = useState('');
    const [isShopmodeActive, setIsShopmodeActive] = useState(false);
    const [selectedOption, setSelectedOption] = useState<'existing' | 'new'>('existing');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // Get products based on selected option
    const dummyProducts = selectedOption === 'existing' ? AI_CHAT_PRODUCTS.existing : AI_CHAT_PRODUCTS.newLook;

    const outerPulse = useRef(new Animated.Value(1)).current;
    const middlePulse = useRef(new Animated.Value(1)).current;
    const innerPulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const createPulseAnimation = (animatedValue: Animated.Value, delay: number = 0) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(animatedValue, {
                        toValue: ANIMATION.PULSE_SCALE_TO,
                        duration: ANIMATION.PULSE_DURATION,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: ANIMATION.PULSE_SCALE_FROM,
                        duration: ANIMATION.PULSE_DURATION,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const outerAnim = createPulseAnimation(outerPulse, ANIMATION.OUTER_PULSE_DELAY);
        const middleAnim = createPulseAnimation(middlePulse, ANIMATION.MIDDLE_PULSE_DELAY);
        const innerAnim = createPulseAnimation(innerPulse, ANIMATION.INNER_PULSE_DELAY);

        outerAnim.start();
        middleAnim.start();
        innerAnim.start();

        return () => {
            outerAnim.stop();
            middleAnim.stop();
            innerAnim.stop();
        };
    }, [outerPulse, middlePulse, innerPulse]);

    const handleBack = () => {
        router.push('/home/(tabs)/' as any);
    };

    const handleShopmodeToggle = () => {
        setIsShopmodeActive(true);
    };

    const handleCloseShopmode = () => {
        setIsShopmodeActive(false);
    };

    const handleBuyItem = (productId: string) => {
        const product = dummyProducts.find(p => p.id === productId);
        if (product) {
            setSelectedProduct(product);
        }
    };

    const handleCloseProductDetail = () => {
        setSelectedProduct(null);
    };

    const handleBackFromDetail = () => {
        setSelectedProduct(null);
    };

    // If product is selected, show detail view
    if (selectedProduct) {
        return (
            <ProductDetailView
                product={selectedProduct}
                onClose={handleCloseProductDetail}
                onBack={handleBackFromDetail}
                selectedOption={selectedOption}
            />
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.aiChatBackground }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <StatusBar style="dark" backgroundColor="#FFFFFF" />
            <View style={[styles.statusBarBackground, { height: insets.top }]} />
            
            <View style={[styles.header, { }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                    activeOpacity={0.7}
                >
                    <View style={styles.backButtonBackground}>
                        <ArrowLeftIcon size={scaleFontSize(12)} color="#A6A6A6" />
                    </View>
                </TouchableOpacity>
                {isShopmodeActive && (
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleCloseShopmode}
                        activeOpacity={0.7}
                    >
                        <View style={styles.closeButtonBackground}>
                            <Ionicons name="close" size={scaleFontSize(16)} color="#A6A6A6" />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            {isShopmodeActive ? (
                <ScrollView 
                    style={styles.shopmodeContent}
                    contentContainerStyle={styles.shopmodeContentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Style Brief Section */}
                    <View style={styles.styleBriefSection}>
                        <View style={styles.styleBriefHeader}>
                            <Image
                                source={require('@/assets/s1.png')}
                                style={styles.avatarImage}
                                resizeMode="cover"
                            />
                            <Text style={[styles.styleBriefTitle, { color: colors.text }]}>
                                Style Brief
                            </Text>
                        </View>
                        <Text style={[styles.styleBriefQuestion, { color: colors.text }]}>
                            Would you like me to put this outfit together using pieces you already have in your closet, or are you open to trying something new and shopping for a few items?
                        </Text>
                        <View style={styles.optionButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.optionButton,
                                    selectedOption === 'existing' && styles.optionButtonSelected,
                                    { backgroundColor: selectedOption === 'existing' ? colors.buttonPrimary : colors.buttonSecondary }
                                ]}
                                onPress={() => setSelectedOption('existing')}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.optionButtonText,
                                    { color: selectedOption === 'existing' ? colors.buttonText : colors.buttonTextSecondary }
                                ]}>
                                    Use existing pieces
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.optionButton,
                                    selectedOption === 'new' && styles.optionButtonSelected,
                                    { backgroundColor: selectedOption === 'new' ? colors.buttonPrimary : colors.buttonSecondary }
                                ]}
                                onPress={() => setSelectedOption('new')}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.optionButtonText,
                                    { color: selectedOption === 'new' ? colors.buttonText : colors.buttonTextSecondary }
                                ]}>
                                    Shop new look
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Event Description */}
                    <View style={styles.eventDescriptionSection}>
                        <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>
                            {firstName}, a Cartagena wedding at 5 PM calls for breezy elegance! We're going for a look that's polished yet relaxed perfect for golden hour vows by the sea. Think breathable fabrics, light colors, and details that pop just enough to stand out without overshadowing the couple...
                        </Text>
                    </View>

                    {/* Outfit Suggestions Section */}
                    <View style={styles.outfitSuggestionsSection}>
                        <Text style={[styles.outfitSuggestionsTitle, { color: colors.text }]}>
                            Golden Hour Nuptials
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.productsScrollContainer}
                            style={styles.productsScrollView}
                        >
                            {dummyProducts.map((product, index) => (
                                <View key={product.id} style={[styles.productCard, { backgroundColor: colors.card }]}>
                                    <Image
                                        source={product.image}
                                        style={styles.productImage}
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity
                                        style={[
                                            styles.buyButton,
                                            { 
                                                backgroundColor: index === 0 
                                                    ? colors.buttonPrimary 
                                                    : colors.bottomBarButtonBackground 
                                            }
                                        ]}
                                        onPress={() => handleBuyItem(product.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.buyButtonText,
                                            { 
                                                color: index === 0 
                                                    ? colors.buttonText 
                                                    : colors.textSecondary 
                                            }
                                        ]}>
                                            {selectedOption === 'existing' ? 'USE ITEM' : 'BUY ITEM'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <Image
                        source={require('@/assets/s1.png')}
                        style={styles.imageStyle}
                        resizeMode="contain"
                    />
                </View>

                <Text style={[styles.greeting, { color: colors.text }]}>
                    {translations.aiChat.greeting.replace('{firstName}', firstName)}
                </Text>

                <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    {translations.aiChat.instruction}
                </Text>

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
            )}

            <View style={[styles.bottomBarContainer, {  }]}>
                <View style={[styles.bottomBar, { backgroundColor: 'white' }]}>
                    <TextInput
                        style={[styles.refineInput, { color: colors.text }]}
                        placeholder={translations.aiChat.refinePlaceholder}
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
                                onPress={handleShopmodeToggle}
                            >
                                <ShopmodeIcon size={scaleFontSize(16)} color={colors.textSecondary} />
                                <Text style={[styles.shopmodeText, { color: colors.text }]}>{translations.aiChat.shopmode}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.circleButton, { backgroundColor: colors.bottomBarButtonBackground }]} activeOpacity={0.7}>
                            <SendIcon size={scaleFontSize(12)} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
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
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: scaleFontSize(24),
        paddingTop: scaleFontSize(20),
    },
    imageContainer: {
        marginBottom: scaleFontSize(24),
    },
    imageStyle: {
        width: scaleFontSize(200),
        height: scaleFontSize(240),
    },
    greeting: {
        fontSize: scaleFontSize(32),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(16),
        textAlign: 'center',
    },
    instruction: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        lineHeight: scaleFontSize(24),
        textAlign: 'center',
        marginBottom: scaleFontSize(48),
        paddingHorizontal: scaleFontSize(20),
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
        marginBottom: scaleFontSize(12)
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
    closeButton: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonBackground: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shopmodeContent: {
        flex: 1,
    },
    shopmodeContentContainer: {
        paddingHorizontal: scaleFontSize(20),
        paddingTop: scaleFontSize(16),
        paddingBottom: scaleFontSize(100),
    },
    styleBriefSection: {
        marginBottom: scaleFontSize(24),
    },
    styleBriefHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scaleFontSize(16),
        gap: scaleFontSize(12),
    },
    avatarImage: {
        width: scaleFontSize(40),
        height: scaleFontSize(40),
        borderRadius: scaleFontSize(20),
    },
    styleBriefTitle: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
    },
    styleBriefQuestion: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        lineHeight: scaleFontSize(24),
        marginBottom: scaleFontSize(16),
    },
    optionButtons: {
        flexDirection: 'row',
        gap: scaleFontSize(12),
    },
    optionButton: {
        flex: 1,
        paddingVertical: scaleFontSize(12),
        paddingHorizontal: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        borderWidth: 1,
        borderColor: '#E3E5E5',
    },
    optionButtonSelected: {
        borderColor: '#000000',
    },
    optionButtonText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
        textAlign: 'center',
    },
    eventDescriptionSection: {
        marginBottom: scaleFontSize(32),
    },
    eventDescription: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        lineHeight: scaleFontSize(20),
    },
    outfitSuggestionsSection: {
        marginBottom: scaleFontSize(24),
    },
    outfitSuggestionsTitle: {
        fontSize: scaleFontSize(24),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(20),
    },
    productsScrollView: {
        marginHorizontal: scaleFontSize(-20),
    },
    productsScrollContainer: {
        paddingHorizontal: scaleFontSize(20),
        paddingRight: scaleFontSize(32),
    },
    productCard: {
        width: scaleFontSize(240),
        borderRadius: scaleFontSize(12),
        overflow: 'hidden',
        position: 'relative',
        marginRight: scaleFontSize(12),
    },
    productImage: {
        width: '100%',
        height: scaleFontSize(280),
    },
    buyButton: {
        position: 'absolute',
        bottom: scaleFontSize(12),
        left: scaleFontSize(12),
        paddingVertical: scaleFontSize(8),
        paddingHorizontal: scaleFontSize(16),
        borderRadius: scaleFontSize(6),
    },
    buyButtonText: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
    },
});

