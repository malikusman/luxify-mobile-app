import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/context/store';
import { ClosetItem } from '@/src/context/slices/closetSlice';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { Ionicons } from '@expo/vector-icons';
import { translations } from '@/src/constants/translations';

const OCCASIONS = ['Casual', 'Work', 'Party', 'Formal'];
const FIT_TYPES = ['Loose Fit', 'Tight', 'Normal'];

export default function FiltersScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const { items } = useSelector((state: RootState) => state.closet);
    const t = translations.closet;

    // Get unique categories and brands from items
    const availableCategories = Array.from(new Set(items?.map(item => item.category).filter(Boolean) || [])).sort();
    const availableBrands = Array.from(new Set(items?.map(item => item.brandName).filter(Boolean) || [])).sort();

    // Initialize filters from params or defaults
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        params.selectedCategories ? JSON.parse(params.selectedCategories as string) : []
    );
    const [selectedOccasions, setSelectedOccasions] = useState<string[]>(
        params.selectedOccasions ? JSON.parse(params.selectedOccasions as string) : []
    );
    const [selectedFits, setSelectedFits] = useState<string[]>(
        params.selectedFits ? JSON.parse(params.selectedFits as string) : []
    );
    const [selectedBrands, setSelectedBrands] = useState<string[]>(
        params.selectedBrands ? JSON.parse(params.selectedBrands as string) : []
    );

    // Calculate filtered results count
    const filteredCount = getFilteredCount();

    function getFilteredCount(): number {
        if (!items || items.length === 0) return 0;
        
        return items.filter(item => {
            // Category filter
            if (selectedCategories.length > 0 && item.category && !selectedCategories.includes(item.category)) {
                return false;
            }
            
            // Occasion filter (if we add occasion to items later)
            // For now, skip this check
            
            // Fit filter
            if (selectedFits.length > 0 && item.fit && !selectedFits.includes(item.fit)) {
                return false;
            }
            
            // Brand filter
            if (selectedBrands.length > 0 && item.brandName && !selectedBrands.includes(item.brandName)) {
                return false;
            }
            
            return true;
        }).length;
    }

    const handleToggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleToggleOccasion = (occasion: string) => {
        setSelectedOccasions(prev =>
            prev.includes(occasion)
                ? prev.filter(o => o !== occasion)
                : [...prev, occasion]
        );
    };

    const handleToggleFit = (fit: string) => {
        setSelectedFits(prev =>
            prev.includes(fit)
                ? prev.filter(f => f !== fit)
                : [...prev, fit]
        );
    };

    const handleToggleBrand = (brand: string) => {
        setSelectedBrands(prev =>
            prev.includes(brand)
                ? prev.filter(b => b !== brand)
                : [...prev, brand]
        );
    };

    const handleReset = () => {
        setSelectedCategories([]);
        setSelectedOccasions([]);
        setSelectedFits([]);
        setSelectedBrands([]);
    };

    const handleApplyFilters = () => {
        router.push({
            pathname: '/home/(tabs)/closet',
            params: {
                selectedCategories: JSON.stringify(selectedCategories),
                selectedOccasions: JSON.stringify(selectedOccasions),
                selectedFits: JSON.stringify(selectedFits),
                selectedBrands: JSON.stringify(selectedBrands),
            },
        } as any);
    };

    const handleBack = () => {
        router.back();
    };

    const handleClose = () => {
        router.back();
    };

    const renderCheckbox = (isSelected: boolean) => (
        <View style={[styles.checkbox, { borderColor: colors.border }]}>
            {isSelected && (
                <View style={[styles.checkboxInner, { backgroundColor: colors.text }]} />
            )}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style="dark" />
            <View style={[styles.statusBarBackground, { height: insets.top, backgroundColor: colors.background }]} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + scaleFontSize(12) }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={scaleFontSize(24)} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {t.filters || 'Filters'}
                </Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Ionicons name="close" size={scaleFontSize(24)} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Category Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t.category || 'Category'}
                    </Text>
                    {availableCategories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={styles.optionRow}
                            onPress={() => handleToggleCategory(category)}
                            activeOpacity={0.7}
                        >
                            {renderCheckbox(selectedCategories.includes(category))}
                            <Text style={[styles.optionText, { color: colors.text }]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Occasion Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t.occasion || 'Occasion'}
                    </Text>
                    {OCCASIONS.map((occasion) => (
                        <TouchableOpacity
                            key={occasion}
                            style={styles.optionRow}
                            onPress={() => handleToggleOccasion(occasion)}
                            activeOpacity={0.7}
                        >
                            {renderCheckbox(selectedOccasions.includes(occasion))}
                            <Text style={[styles.optionText, { color: colors.text }]}>
                                {occasion}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Fit Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t.fit || 'Fit'}
                    </Text>
                    {FIT_TYPES.map((fit) => (
                        <TouchableOpacity
                            key={fit}
                            style={styles.optionRow}
                            onPress={() => handleToggleFit(fit)}
                            activeOpacity={0.7}
                        >
                            {renderCheckbox(selectedFits.includes(fit))}
                            <Text style={[styles.optionText, { color: colors.text }]}>
                                {fit}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Brands Section */}
                {availableBrands.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {t.brands || 'Brands'}
                        </Text>
                        {availableBrands.map((brand) => (
                            <TouchableOpacity
                                key={brand}
                                style={styles.optionRow}
                                onPress={() => handleToggleBrand(brand)}
                                activeOpacity={0.7}
                            >
                                {renderCheckbox(selectedBrands.includes(brand))}
                                <Text style={[styles.optionText, { color: colors.text }]}>
                                    {brand}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.bottomActions, { paddingBottom: insets.bottom }]}>
                <TouchableOpacity
                    style={[styles.showResultsButton, { backgroundColor: colors.text }]}
                    onPress={handleApplyFilters}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.showResultsText, { color: colors.background }]}>
                        {t.showResults || 'Show'} {filteredCount} {t.results || 'results'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                    <Text style={[styles.resetText, { color: colors.text }]}>
                        {t.reset || 'Reset'}
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
        position: 'absolute',
        top: 0,
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scaleFontSize(16),
        paddingBottom: scaleFontSize(12),
        zIndex: 5,
    },
    backButton: {
        width: scaleFontSize(40),
        height: scaleFontSize(40),
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.nunitoBold,
        flex: 1,
        textAlign: 'center',
    },
    closeButton: {
        width: scaleFontSize(40),
        height: scaleFontSize(40),
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: scaleFontSize(16),
        paddingTop: scaleFontSize(24),
        paddingBottom: scaleFontSize(100),
    },
    section: {
        marginBottom: scaleFontSize(32),
    },
    sectionTitle: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.nunitoBold,
        marginBottom: scaleFontSize(16),
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: scaleFontSize(12),
        gap: scaleFontSize(12),
    },
    checkbox: {
        width: scaleFontSize(20),
        height: scaleFontSize(20),
        borderRadius: scaleFontSize(4),
        borderWidth: scaleFontSize(2),
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxInner: {
        width: scaleFontSize(12),
        height: scaleFontSize(12),
        borderRadius: scaleFontSize(2),
    },
    optionText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
    bottomActions: {
        paddingHorizontal: scaleFontSize(16),
        paddingTop: scaleFontSize(16),
        borderTopWidth: scaleFontSize(1),
        borderTopColor: '#E3E5E5',
    },
    showResultsButton: {
        width: '100%',
        paddingVertical: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        alignItems: 'center',
        marginBottom: scaleFontSize(12),
    },
    showResultsText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
    },
    resetButton: {
        paddingVertical: scaleFontSize(12),
        alignItems: 'center',
    },
    resetText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
});

