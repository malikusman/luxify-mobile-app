import React, { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Formik, FormikProps } from 'formik';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { step4Schema } from '@/src/validation/authSchemas';
import { FONTS } from '@/src/constants/fonts';
import CustomInput from '@/src/components/common/CustomInput';
import Step4Icon from '@/src/components/icons/Step4Icon';
import { LIMITS } from '@/src/constants/constants';
import { useBrands, useSearchBrands } from '@/src/services/modules/brands/brandHooks';

interface Step4Props {
    initialValues: { selectedBrands: string[] };
    onSubmit: (values: { selectedBrands: string[] }) => void;
    onBrandSelectionChange?: (count: number, hasMinimum: boolean) => void;
}

export interface Step4Ref {
    submitForm: () => void;
    getSelectedBrandsCount: () => number;
    hasMinimumBrands: () => boolean;
}

const Step4 = forwardRef<Step4Ref, Step4Props>(({ initialValues, onSubmit, onBrandSelectionChange }, ref) => {
    const colors = useThemeColors();
    const t = translations.onboarding;
    const [searchQuery, setSearchQuery] = useState('');
    const formikRef = React.useRef<FormikProps<any>>(null);
    const [selectedBrandsCount, setSelectedBrandsCount] = useState(initialValues.selectedBrands.length);
    const onBrandSelectionChangeRef = React.useRef(onBrandSelectionChange);

    // Use search hook when there's a query, otherwise use all brands hook
    const trimmedSearchQuery = searchQuery.trim();
    const { data: allBrands, isLoading: isLoadingAll, error: allBrandsError } = useBrands();
    const { data: searchResults, isLoading: isLoadingSearch, error: searchError } = useSearchBrands(trimmedSearchQuery);

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            formikRef.current?.submitForm();
        },
        getSelectedBrandsCount: () => selectedBrandsCount,
        hasMinimumBrands: () => selectedBrandsCount >= LIMITS.MIN_BRANDS,
    }));

    // Keep the callback ref updated
    React.useEffect(() => {
        onBrandSelectionChangeRef.current = onBrandSelectionChange;
    }, [onBrandSelectionChange]);

    // Initialize brand selection state on mount
    React.useEffect(() => {
        const count = initialValues.selectedBrands.length;
        const hasMinimum = count >= LIMITS.MIN_BRANDS;
        onBrandSelectionChangeRef.current?.(count, hasMinimum);
    }, []); // Only run on mount

    // Determine which brands to display
    const brandsToDisplay = useMemo(() => {
        if (trimmedSearchQuery.length > 0) {
            return searchResults || [];
        }
        return allBrands || [];
    }, [trimmedSearchQuery, searchResults, allBrands]);

    // Filter to only active brands
    const activeBrands = useMemo(() => {
        return brandsToDisplay.filter((brand) => brand.is_active);
    }, [brandsToDisplay]);

    const isLoading = trimmedSearchQuery.length > 0 ? isLoadingSearch : isLoadingAll;
    const error = trimmedSearchQuery.length > 0 ? searchError : allBrandsError;

    return (
        <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={step4Schema}
            onSubmit={onSubmit}
        >
            {({ values, setFieldValue, errors, touched, handleSubmit }) => {
                // Update the selected brands count whenever values change
                React.useEffect(() => {
                    const count = values.selectedBrands.length;
                    setSelectedBrandsCount(count);
                    const hasMinimum = count >= LIMITS.MIN_BRANDS;
                    onBrandSelectionChangeRef.current?.(count, hasMinimum);
                }, [values.selectedBrands.length]);

                const toggleBrand = (brand: string) => {
                    const currentBrands = values.selectedBrands;
                    if (currentBrands.includes(brand)) {
                        setFieldValue(
                            'selectedBrands',
                            currentBrands.filter((b) => b !== brand)
                        );
                    } else {
                        setFieldValue('selectedBrands', [...currentBrands, brand]);
                    }
                };

                const isSelected = (brand: string) => values.selectedBrands.includes(brand);

                return (
                    <View style={styles.container}>
                        <View style={styles.topSection}>
                            <Text style={[styles.title, { color: colors.text }]}>
                                {t.step4Title}
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {t.step4Subtitle}
                            </Text>
                        </View>

                        <View style={styles.middleSection}>
                            <View style={styles.iconContainer}>
                                <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
                                    <Step4Icon size={scaleFontSize(40)} color={colors.textSecondary} />
                                </View>
                            </View>

                            <CustomInput
                                placeholder={t.findBrands}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCapitalize="none"
                                autoCorrect={false}
                                icon={
                                    <Ionicons
                                        name="search-outline"
                                        size={scaleFontSize(20)}
                                        color={searchQuery ? colors.text : colors.textSecondary}
                                    />
                                }
                            />

                            <ScrollView
                                style={styles.brandList}
                                showsVerticalScrollIndicator={false}
                            >
                                {isLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color={colors.buttonPrimary} />
                                        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                            Loading brands...
                                        </Text>
                                    </View>
                                ) : error ? (
                                    <View style={styles.errorContainer}>
                                        <Text style={[styles.errorText, { color: colors.error }]}>
                                            Failed to load brands. Please try again.
                                        </Text>
                                    </View>
                                ) : activeBrands.length === 0 ? (
                                    <View style={styles.emptyContainer}>
                                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                            {trimmedSearchQuery.length > 0
                                                ? 'No brands found matching your search.'
                                                : 'No brands available.'}
                                        </Text>
                                    </View>
                                ) : (
                                    activeBrands.map((brand) => {
                                        const selected = isSelected(brand.name);
                                        return (
                                            <TouchableOpacity
                                                key={brand.id}
                                                style={[
                                                    styles.brandItem,
                                                    {
                                                        backgroundColor: selected
                                                            ? colors.buttonPrimary
                                                            : colors.surface,
                                                    },
                                                ]}
                                                onPress={() => toggleBrand(brand.name)}
                                                activeOpacity={0.7}
                                            >
                                                <Text
                                                    style={[
                                                        styles.brandText,
                                                        {
                                                            color: selected
                                                                ? colors.buttonText
                                                                : colors.text,
                                                        },
                                                    ]}
                                                >
                                                    {brand.name}
                                                </Text>
                                                <Ionicons
                                                    name={selected ? 'heart' : 'heart-outline'}
                                                    size={scaleFontSize(20)}
                                                    color={selected ? colors.buttonText : colors.textSecondary}
                                                />
                                            </TouchableOpacity>
                                        );
                                    })
                                )}
                            </ScrollView>

                            {touched.selectedBrands && errors.selectedBrands && (
                                <Text style={[styles.errorText, { color: colors.error }]}>
                                    {errors.selectedBrands}
                                </Text>
                            )}
                        </View>
                    </View>
                );
            }}
        </Formik>
    );
});

Step4.displayName = 'Step4';

export default Step4;

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    topSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: scaleFontSize(40),
    },
    title: {
        fontSize: scaleFontSize(24),
        lineHeight: scaleFontSize(32),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(8),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    middleSection: {
        width: '100%',
        alignItems: 'center',
        marginTop: scaleFontSize(32),
    },
    iconContainer: {
        marginBottom: scaleFontSize(32),
    },
    iconCircle: {
        width: scaleFontSize(80),
        height: scaleFontSize(80),
        borderRadius: scaleFontSize(40),
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandList: {
        width: '100%',
        maxHeight: 300,
        marginTop: scaleFontSize(16),
        marginBottom: scaleFontSize(16),
    },
    brandItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(12),
        marginBottom: scaleFontSize(8),
        borderRadius: 4,
    },
    brandText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    errorText: {
        width: '100%',
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginTop: 8,
        paddingLeft: 4,
        textAlign: 'center',
    },
    loadingContainer: {
        width: '100%',
        paddingVertical: scaleFontSize(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(12),
        textAlign: 'center',
    },
    errorContainer: {
        width: '100%',
        paddingVertical: scaleFontSize(20),
        paddingHorizontal: scaleFontSize(16),
    },
    emptyContainer: {
        width: '100%',
        paddingVertical: scaleFontSize(40),
        paddingHorizontal: scaleFontSize(16),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
});

