import React, { useState, forwardRef, useImperativeHandle, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
import { useFavoriteBrands, useAddFavoriteBrand, useRemoveFavoriteBrand } from '@/src/services/modules/brands/favoriteBrandHooks';
import { Brand } from '@/src/services/modules/brands/brandTypes';

interface SelectBrandProps {
    initialValues: { selectedBrands: string[] };
    onSubmit: (values: { selectedBrands: string[] }) => void;
    onBrandSelectionChange?: (count: number, hasMinimum: boolean) => void;
    onLoadingChange?: (isLoading: boolean) => void;
}

export interface SelectBrandRef {
    submitForm: () => void;
    getSelectedBrandsCount: () => number;
    hasMinimumBrands: () => boolean;
    isLoading: () => boolean;
}

const SelectBrand = forwardRef<SelectBrandRef, SelectBrandProps>(({ initialValues, onSubmit, onBrandSelectionChange, onLoadingChange }, ref) => {
    const colors = useThemeColors();
    const t = translations.onboarding;
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(true);
    const formikRef = React.useRef<FormikProps<any>>(null);
    const [selectedBrandsCount, setSelectedBrandsCount] = useState(initialValues.selectedBrands.length);
    const onBrandSelectionChangeRef = React.useRef(onBrandSelectionChange);
    const [mergedInitialValues, setMergedInitialValues] = useState<{ selectedBrands: string[] }>(initialValues);
    const [favoriteBrandMap, setFavoriteBrandMap] = useState<Map<string, string>>(new Map()); // Maps brand name to favorite brand ID
    const [initialFavoriteBrandNames, setInitialFavoriteBrandNames] = useState<Set<string>>(new Set()); // Track initial favorites
    const [brandNameToIdMap, setBrandNameToIdMap] = useState<Map<string, string>>(new Map()); // Maps brand name to brand ID
    const [isSyncingFavorites, setIsSyncingFavorites] = useState(false);

    // Use search hook when there's a query, otherwise use all brands hook
    const trimmedSearchQuery = searchQuery.trim();
    const { data: allBrands, isLoading: isLoadingAll, error: allBrandsError } = useBrands();
    const { data: searchResults, isLoading: isLoadingSearch, error: searchError } = useSearchBrands(trimmedSearchQuery);
    
    // Fetch favorite brands
    const { data: favoriteBrands, isLoading: isLoadingFavorites } = useFavoriteBrands();
    const addFavoriteBrandMutation = useAddFavoriteBrand();
    const removeFavoriteBrandMutation = useRemoveFavoriteBrand();

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            formikRef.current?.submitForm();
        },
        getSelectedBrandsCount: () => selectedBrandsCount,
        hasMinimumBrands: () => selectedBrandsCount >= LIMITS.MIN_BRANDS,
        isLoading: () => isSyncingFavorites,
    }));

    // Keep the callback ref updated
    React.useEffect(() => {
        onBrandSelectionChangeRef.current = onBrandSelectionChange;
    }, [onBrandSelectionChange]);

    // Merge favorite brands with initial values on mount
    useEffect(() => {
        if (favoriteBrands && allBrands && !isLoadingFavorites && !isLoadingAll) {
            // Create maps: brand_id to brand name, and brand name to brand_id
            const brandIdToNameMap = new Map<string, string>();
            const nameToIdMap = new Map<string, string>();
            allBrands.forEach((brand: Brand) => {
                brandIdToNameMap.set(brand.id, brand.name);
                nameToIdMap.set(brand.name, brand.id);
            });
            setBrandNameToIdMap(nameToIdMap);

            // Extract favorite brand names and create favorite brand ID map
            const favoriteBrandNames: string[] = [];
            const newFavoriteBrandMap = new Map<string, string>();
            const initialFavoritesSet = new Set<string>();

            favoriteBrands.forEach((favoriteBrand) => {
                const brandName = favoriteBrand.brand?.name || brandIdToNameMap.get(favoriteBrand.brand_id);
                if (brandName) {
                    favoriteBrandNames.push(brandName);
                    newFavoriteBrandMap.set(brandName, favoriteBrand.id);
                    initialFavoritesSet.add(brandName);
                }
            });

            // Merge: prioritize initialValues, then add favorite brands that aren't already selected
            const mergedBrands = [...new Set([...initialValues.selectedBrands, ...favoriteBrandNames])];
            setFavoriteBrandMap(newFavoriteBrandMap);
            setInitialFavoriteBrandNames(initialFavoritesSet);
            setMergedInitialValues({ selectedBrands: mergedBrands });
        }
    }, [favoriteBrands, allBrands, isLoadingFavorites, isLoadingAll]); // Removed initialValues.selectedBrands to prevent infinite loops

    // Initialize brand selection state on mount and when merged values change
    React.useEffect(() => {
        const count = mergedInitialValues.selectedBrands.length;
        const hasMinimum = count >= LIMITS.MIN_BRANDS;
        onBrandSelectionChangeRef.current?.(count, hasMinimum);
    }, [mergedInitialValues.selectedBrands.length]);

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

    // Custom onSubmit handler that syncs favorite brands before calling the original onSubmit
    const handleSubmitWithFavoriteBrands = async (values: { selectedBrands: string[] }) => {
        const selectedBrandNames = new Set(values.selectedBrands);
        
        // Find brands to add (selected but not in initial favorites)
        const brandsToAdd: string[] = [];
        selectedBrandNames.forEach((brandName) => {
            if (!initialFavoriteBrandNames.has(brandName)) {
                const brandId = brandNameToIdMap.get(brandName);
                if (brandId) {
                    brandsToAdd.push(brandId);
                }
            }
        });

        // Find brands to remove (in initial favorites but not selected)
        const brandsToRemove: string[] = [];
        initialFavoriteBrandNames.forEach((brandName) => {
            if (!selectedBrandNames.has(brandName)) {
                const favoriteBrandId = favoriteBrandMap.get(brandName);
                if (favoriteBrandId) {
                    brandsToRemove.push(favoriteBrandId);
                }
            }
        });

        // If no changes, skip API calls and proceed directly
        if (brandsToAdd.length === 0 && brandsToRemove.length === 0) {
            onSubmit(values);
            return;
        }

        // Execute all mutations in parallel
        setIsSyncingFavorites(true);
        onLoadingChange?.(true);
        try {
            await Promise.all([
                ...brandsToAdd.map((brandId) => addFavoriteBrandMutation.mutateAsync(brandId)),
                ...brandsToRemove.map((favoriteBrandId) => removeFavoriteBrandMutation.mutateAsync(favoriteBrandId)),
            ]);
        } catch (error) {
            // Log error but still proceed with form submission
            console.warn('Failed to sync favorite brands:', error);
        } finally {
            setIsSyncingFavorites(false);
            onLoadingChange?.(false);
        }

        // Call the original onSubmit
        onSubmit(values);
    };

    return (
        <Formik
            innerRef={formikRef}
            initialValues={mergedInitialValues}
            enableReinitialize={true}
            validationSchema={step4Schema}
            onSubmit={handleSubmitWithFavoriteBrands}
        >
            {({ values, setFieldValue, errors, touched, handleSubmit }) => {
                // Update the selected brands count whenever values change
                React.useEffect(() => {
                    const count = values.selectedBrands.length;
                    setSelectedBrandsCount(count);
                    const hasMinimum = count >= LIMITS.MIN_BRANDS;
                    onBrandSelectionChangeRef.current?.(count, hasMinimum);
                }, [values.selectedBrands.length]);

                const toggleBrand = (brandName: string) => {
                    const currentBrands = values.selectedBrands;
                    if (currentBrands.includes(brandName)) {
                        // Remove from selection
                        setFieldValue(
                            'selectedBrands',
                            currentBrands.filter((b) => b !== brandName)
                        );
                    } else {
                        // Add to selection
                        setFieldValue('selectedBrands', [...currentBrands, brandName]);
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

                            <TouchableOpacity
                                style={[
                                    styles.dropdownHeader,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                    },
                                ]}
                                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.dropdownHeaderText, { color: colors.text }]}>
                                    Pick Your Fav Brands
                                </Text>
                                <MaterialCommunityIcons
                                    name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                                    size={scaleFontSize(24)}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>

                            {isDropdownOpen && (
                                <View style={styles.brandListContainer}>
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
                                            activeBrands.map((brand, index) => {
                                                const selected = isSelected(brand.name);
                                                return (
                                                    <View key={brand.id}>
                                                        <TouchableOpacity
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
                                                            <View style={styles.checkboxContainer}>
                                                                <View
                                                                    style={[
                                                                        styles.checkbox,
                                                                        {
                                                                            backgroundColor: selected
                                                                                ? '#FFFFFF'
                                                                                : 'transparent',
                                                                            borderColor: selected
                                                                                ? '#FFFFFF'
                                                                                : '#000000',
                                                                        },
                                                                    ]}
                                                                >
                                                                    {selected && (
                                                                        <MaterialCommunityIcons
                                                                            name="check"
                                                                            size={scaleFontSize(16)}
                                                                            color="#000000"
                                                                        />
                                                                    )}
                                                                </View>
                                                            </View>
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
                                                        </TouchableOpacity>
                                                    </View>
                                                );
                                            })
                                        )}
                                    </ScrollView>
                                </View>
                            )}

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

SelectBrand.displayName = 'SelectBrand';

export default SelectBrand;

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
    dropdownHeader: {
        width: '100%',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scaleFontSize(8),
    },
    dropdownHeaderText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    brandListContainer: {
        width: '100%',
        marginTop: scaleFontSize(8),
    },
    brandList: {
        width: '100%',
        maxHeight: 300,
    },
    brandItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(12),
        borderRadius: scaleFontSize(8),
        width: '100%',
        marginBottom: scaleFontSize(8),
        position: 'relative',
    },
    checkboxContainer: {
        position: 'absolute',
        left: scaleFontSize(16),
    },
    checkbox: {
        width: scaleFontSize(20),
        height: scaleFontSize(20),
        borderRadius: scaleFontSize(4),
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
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

