import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import ArrowLeftIcon from '@/src/components/icons/ArrowLeftIcon';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/context/store';
import { DEFAULTS, DEFAULT_ORDER_ITEMS } from '@/src/constants/constants';

export default function CheckoutScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const { data } = useSelector((state: RootState) => state.profile);
    const { selectedProduct } = useSelector((state: RootState) => state.order);
    const firstName = data.firstName || DEFAULTS.FIRST_NAME;
    const [hasVoucher, setHasVoucher] = useState(true);

    const mainProductImage = selectedProduct?.image || require('@/assets/correctImage1.png');

    const orderItems = DEFAULT_ORDER_ITEMS;

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.statusBarBackground, { height: insets.top }]} />
            
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                    activeOpacity={0.7}
                >
                    <View style={styles.backButtonBackground}>
                        <ArrowLeftIcon size={scaleFontSize(12)} color="#A6A6A6" />
                    </View>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Check Out
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.modelImageContainer}>
                    <Image
                        source={mainProductImage}
                        style={styles.modelImage}
                        resizeMode="cover"
                    />
                </View>

                <View style={styles.orderSummarySection}>
                    <Text style={[styles.orderSummaryTitle, { color: colors.text }]}>
                        ORDER SUMMARY
                    </Text>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {orderItems.map((item) => (
                        <View key={item.id} style={styles.orderItem}>
                            <Image
                                source={item.image}
                                style={styles.orderItemImage}
                                resizeMode="cover"
                            />
                            <View style={styles.orderItemInfo}>
                                <Text style={[styles.orderItemBrand, { color: colors.text }]}>
                                    {item.brand}
                                </Text>
                                <Text style={[styles.orderItemTitle, { color: colors.text }]} numberOfLines={2}>
                                    {item.title}
                                </Text>
                                {item.size && (
                                    <Text style={[styles.orderItemSize, { color: colors.textSecondary }]}>
                                        Size: {item.size}
                                    </Text>
                                )}
                                <Text style={[styles.orderItemPrice, { color: colors.text }]}>
                                    {item.price}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.infoSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        DELIVERY ADDRESS
                    </Text>
                    <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
                    <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
                        <View style={styles.infoContent}>
                            <Text style={[styles.addressLine, { color: colors.text }]}>
                                {firstName} +1 (786) 759-5717
                            </Text>
                            <Text style={[styles.addressLine, { color: colors.text }]}>
                                Maxie Orchard 3585 Block 2,
                            </Text>
                            <Text style={[styles.addressLine, { color: colors.text }]}>
                                Kertzmannfort, Wyoming, 75926-5541
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={scaleFontSize(20)} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        SHIPPING OPTION
                    </Text>
                    <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
                    <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
                        <View style={styles.infoContent}>
                            <Text style={[styles.shippingTitle, { color: colors.text }]}>
                                Courier Delivery
                            </Text>
                            <Text style={[styles.shippingSubtitle, { color: colors.textSecondary }]}>
                                Receive in 2 hours
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={scaleFontSize(20)} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        PAYMENT METHOD
                    </Text>
                    <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
                    <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
                        <Text style={[styles.paymentMethod, { color: colors.text }]}>
                            Apple Pay
                        </Text>
                        <Ionicons name="chevron-forward" size={scaleFontSize(20)} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {hasVoucher && (
                        <View style={styles.voucherRow}>
                            <View style={styles.voucherLeft}>
                                <Ionicons name="checkmark-circle" size={scaleFontSize(20)} color="#4CAF50" />
                                <Text style={[styles.voucherText, { color: colors.text }]}>
                                    LuxifyOpenning
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setHasVoucher(false)} activeOpacity={0.7}>
                                <Text style={styles.removeVoucherText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.pricingSection}>
                    <View style={styles.pricingRow}>
                        <Text style={[styles.pricingLabel, { color: colors.text }]}>Subtotal</Text>
                        <Text style={[styles.pricingValue, { color: colors.text }]}>800.00</Text>
                    </View>
                    <View style={styles.pricingRow}>
                        <Text style={[styles.pricingLabel, { color: colors.text }]}>Shipping Fee</Text>
                        <Text style={[styles.pricingValue, { color: colors.text }]}>15.00</Text>
                    </View>
                    <View style={styles.pricingRow}>
                        <Text style={[styles.pricingLabel, { color: colors.text }]}>Luxify Fee</Text>
                        <Text style={[styles.pricingValue, { color: colors.text }]}>5.00</Text>
                    </View>
                    {hasVoucher && (
                        <View style={styles.pricingRow}>
                            <Text style={[styles.pricingLabel, { color: colors.text }]}>Voucher Code</Text>
                            <Text style={[styles.pricingValue, { color: '#F44336' }]}>-20.00</Text>
                        </View>
                    )}
                    <View style={[styles.pricingDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.pricingRow}>
                        <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                        <Text style={[styles.totalValue, { color: colors.text }]}>800.00</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={[
                styles.payButtonContainer,
                {
                    paddingBottom: scaleFontSize(16),
                    backgroundColor: colors.background,
                    borderTopWidth: scaleFontSize(1),
                    borderTopColor: colors.border,
                }
            ]}>
                <TouchableOpacity
                    style={[styles.payButton, { backgroundColor: colors.buttonPrimary }]}
                    activeOpacity={0.8}
                    onPress={() => {
                        console.log('Pay button pressed');
                    }}
                >
                    <Ionicons name="logo-apple" size={scaleFontSize(24)} color="#FFFFFF" />
                    <Text style={[styles.payButtonText, { color: colors.buttonText }]}>
                        Pay
                    </Text>
                </TouchableOpacity>
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
    headerTitle: {
        fontSize: scaleFontSize(20),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: scaleFontSize(32),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: scaleFontSize(120),
    },
    modelImageContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: scaleFontSize(24),
        paddingHorizontal: scaleFontSize(20),
    },
    modelImage: {
        width: '100%',
        height: scaleFontSize(500),
        borderRadius: scaleFontSize(12),
    },
    orderSummarySection: {
        paddingHorizontal: scaleFontSize(20),
    },
    orderSummaryTitle: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
        marginBottom: scaleFontSize(12),
    },
    divider: {
        height: scaleFontSize(1),
        marginBottom: scaleFontSize(20),
    },
    orderItem: {
        flexDirection: 'row',
        marginBottom: scaleFontSize(20),
        gap: scaleFontSize(16),
    },
    orderItemImage: {
        width: scaleFontSize(80),
        height: scaleFontSize(80),
        borderRadius: scaleFontSize(8),
    },
    orderItemInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    orderItemBrand: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
        fontWeight: '600',
        marginBottom: scaleFontSize(4),
    },
    orderItemTitle: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(4),
        lineHeight: scaleFontSize(20),
    },
    orderItemSize: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(4),
    },
    orderItemPrice: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
    },
    infoSection: {
        paddingHorizontal: scaleFontSize(20),
        marginTop: scaleFontSize(24),
    },
    sectionTitle: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
        marginBottom: scaleFontSize(8),
    },
    sectionDivider: {
        height: scaleFontSize(1),
        marginBottom: scaleFontSize(16),
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: scaleFontSize(12),
    },
    infoContent: {
        flex: 1,
    },
    addressLine: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(4),
        lineHeight: scaleFontSize(20),
    },
    shippingTitle: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoMedium,
        fontWeight: '600',
        marginBottom: scaleFontSize(4),
    },
    shippingSubtitle: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
    },
    paymentMethod: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoMedium,
        fontWeight: '600',
    },
    voucherRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: scaleFontSize(12),
        paddingTop: scaleFontSize(12),
        borderTopWidth: scaleFontSize(1),
        borderTopColor: '#E3E5E5',
    },
    voucherLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleFontSize(8),
    },
    voucherText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
    },
    removeVoucherText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
        color: '#F44336',
    },
    pricingSection: {
        paddingHorizontal: scaleFontSize(20),
        marginTop: scaleFontSize(24),
    },
    pricingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scaleFontSize(12),
    },
    pricingLabel: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
    },
    pricingValue: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
        fontWeight: '600',
    },
    pricingDivider: {
        height: scaleFontSize(1),
        marginVertical: scaleFontSize(16),
    },
    totalLabel: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
    },
    totalValue: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
    },
    payButtonContainer: {
        paddingHorizontal: scaleFontSize(20),
        paddingTop: scaleFontSize(16),
    },
    payButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: scaleFontSize(16),
        borderRadius: scaleFontSize(12),
        gap: scaleFontSize(12),
    },
    payButtonText: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
    },
});

