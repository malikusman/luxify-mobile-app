import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/context/store';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import { translations } from '@/src/constants/translations';
import ArrowLeftIcon from '@/src/components/icons/ArrowLeftIcon';
import MicIcon from '@/src/components/icons/MicIcon';
import ShopmodeIcon from '@/src/components/icons/ShopmodeIcon';
import SendIcon from '@/src/components/icons/SendIcon';
import { Ionicons } from '@expo/vector-icons';

export default function AIChatScreen() {
    const router = useRouter();
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

    const handleBack = () => {
        router.push('/home/(tabs)/' as any);
    };

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
            </View>

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
                            <TouchableOpacity style={[styles.shopmodeButton, { backgroundColor: colors.bottomBarButtonBackground }]} activeOpacity={0.7}>
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
        paddingHorizontal: scaleFontSize(20),
        paddingTop: scaleFontSize(12),
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
});

