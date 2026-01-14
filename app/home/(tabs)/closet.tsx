import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/context/store';
import { ClosetItem } from '@/src/context/slices/closetSlice';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import CustomTabBar from '@/src/components/home/CustomTabBar';
import Header from '@/src/components/home/Header';
import { Ionicons } from '@expo/vector-icons';
import { translations } from '@/src/constants/translations';
import { useWardrobeItems } from '@/src/services/modules/wardrobeItems/wardrobeItemsHooks';
import { mapWardrobeItemsToClosetItems } from '@/src/utils/wardrobeItemMapper';

export default function ClosetScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const { data: wardrobeItems = [], isLoading, error } = useWardrobeItems();
    const t = translations.closet;
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Map API wardrobe items to ClosetItem format
    const items = useMemo(() => {
        return mapWardrobeItemsToClosetItems(wardrobeItems);
    }, [wardrobeItems]);

    // Get filter params from Filters screen
    const filterCategories = params.selectedCategories ? JSON.parse(params.selectedCategories as string) : [];
    const filterOccasions = params.selectedOccasions ? JSON.parse(params.selectedOccasions as string) : [];
    const filterFits = params.selectedFits ? JSON.parse(params.selectedFits as string) : [];
    const filterBrands = params.selectedBrands ? JSON.parse(params.selectedBrands as string) : [];

    // Get unique categories from items
    const categories = useMemo(() => {
        const uniqueCategories = new Set<string>();
        items?.forEach((item) => {
            if (item.category) {
                uniqueCategories.add(item.category);
            }
        });
        return Array.from(uniqueCategories).sort();
    }, [items]);

    // Filter items based on selected category, search, and filter params
    const filteredItems = useMemo(() => {
        let filtered = items || [];
        
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }
        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.itemName?.toLowerCase().includes(query) ||
                item.category?.toLowerCase().includes(query) ||
                item.brandName?.toLowerCase().includes(query)
            );
        }

        // Apply filters from Filters screen
        if (filterCategories.length > 0) {
            filtered = filtered.filter(item => item.category && filterCategories.includes(item.category));
        }

        if (filterFits.length > 0) {
            filtered = filtered.filter(item => item.fit && filterFits.includes(item.fit));
        }

        if (filterBrands.length > 0) {
            filtered = filtered.filter(item => item.brandName && filterBrands.includes(item.brandName));
        }
        
        return filtered;
    }, [items, selectedCategory, searchQuery, filterCategories, filterOccasions, filterFits, filterBrands]);

    // Group items by category for display
    const itemsByCategory = useMemo(() => {
        const grouped: { [key: string]: ClosetItem[] } = {};
        filteredItems.forEach((item) => {
            const category = item.category || 'Other';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        });
        return grouped;
    }, [filteredItems]);

    const handleAddItem = () => {
        router.push('/home/AddNewItem' as any);
    };

    const getCategoryCount = (category: string) => {
        if (category === 'All') {
            return items?.length || 0;
        }
        return items?.filter(item => item.category === category).length || 0;
    };

    // Get icon for category
    const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('dress')) return 'shirt-outline';
        if (categoryLower.includes('t-shirt') || categoryLower.includes('tshirt') || categoryLower === 'shirt') return 'shirt-outline';
        if (categoryLower.includes('jeans') || categoryLower.includes('pant') || categoryLower.includes('trouser')) return 'shirt-outline';
        if (categoryLower.includes('shoe') || categoryLower.includes('sneaker')) return 'footsteps-outline';
        if (categoryLower.includes('watch')) return 'time-outline';
        if (categoryLower.includes('hoodie') || categoryLower.includes('sweater')) return 'shirt-outline';
        if (categoryLower.includes('jacket') || categoryLower.includes('coat') || categoryLower.includes('blazer')) return 'shirt-outline';
        return 'shirt-outline';
    };

    const centerContent = (
        <>
            <View style={[styles.closetIconContainer, { backgroundColor: colors.text }]}>
                <Ionicons name="shirt-outline" size={scaleFontSize(18)} color={colors.background} />
            </View>
            <Text style={[styles.closetText, { color: colors.text }]}>Closet</Text>
        </>
    );

    const rightContent = (
        <TouchableOpacity onPress={handleAddItem} style={styles.addButtonContainer}>
            <View style={[styles.addButtonBorder, { borderColor: colors.border }]}>
                <Ionicons name="add" size={scaleFontSize(24)} color={colors.text} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.wrapper}>
            <StatusBar style="dark" backgroundColor="#FFFFFF" />
            <View style={[styles.statusBarBackground, { height: insets.top, backgroundColor: colors.background }]} />
            <View style={styles.container}>
                <View style={{ paddingTop: insets.top }}>
                    <Header centerContent={centerContent} rightContent={rightContent} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={(!items || items.length === 0) ? styles.scrollContentEmpty : styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.buttonPrimary} />
                                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                    Loading items...
                                </Text>
                            </View>
                        ) : error ? (
                            <View style={styles.emptyState}>
                                <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
                                    <Ionicons name="alert-circle-outline" size={scaleFontSize(48)} color={colors.textSecondary} />
                                </View>
                                <Text style={[styles.emptyText, { color: colors.text }]}>
                                    Error loading items
                                </Text>
                                <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                                    Please try again later
                                </Text>
                            </View>
                        ) : (!items || items.length === 0) ? (
                            <View style={styles.emptyState}>
                                <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
                                    <Ionicons name="shirt-outline" size={scaleFontSize(48)} color={colors.textSecondary} />
                                </View>
                                <Text style={[styles.emptyText, { color: colors.text }]}>
                                    {t.noItems || 'No Items'}
                                </Text>
                                <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                                    {t.noItemsDescription || 'Start building your closet by adding your first item'}
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* Header Section */}
                                <View style={styles.headerSection}>
                                    <Text style={[styles.allClothesTitle, { color: colors.text }]}>
                                        {t.allClothes}
                                    </Text>
                                    <TouchableOpacity 
                                        style={[styles.filterButton, { borderColor: colors.border }]}
                                        activeOpacity={0.7}
                                        onPress={() => router.push('/home/Filters' as any)}
                                    >
                                        <Ionicons name="options-outline" size={scaleFontSize(18)} color={colors.text} />
                                        <Text style={[styles.filterText, { color: colors.text }]}>
                                            {t.filter}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Search Bar */}
                                <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Ionicons name="search-outline" size={scaleFontSize(20)} color={colors.textSecondary} />
                                    <TextInput
                                        style={[styles.searchInput, { color: colors.text }]}
                                        placeholder={t.search}
                                        placeholderTextColor={colors.textSecondary}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>

                                {/* Category Tabs */}
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.categoryTabsContainer}
                                    contentContainerStyle={styles.categoryTabsContent}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.categoryTab,
                                            {
                                                backgroundColor: selectedCategory === 'All' ? colors.text : colors.background,
                                                borderColor: selectedCategory === 'All' ? colors.text : colors.border,
                                            }
                                        ]}
                                        onPress={() => setSelectedCategory('All')}
                                    >
                                        <Ionicons 
                                            name="grid-outline" 
                                            size={scaleFontSize(16)} 
                                            color={selectedCategory === 'All' ? colors.background : colors.text} 
                                            style={styles.categoryTabIcon}
                                        />
                                        <Text style={[
                                            styles.categoryTabText,
                                            {
                                                color: selectedCategory === 'All' ? colors.background : colors.text,
                                            }
                                        ]}>
                                            {t.all}
                                        </Text>
                                    </TouchableOpacity>
                                    {categories.map((category) => (
                                        <TouchableOpacity
                                            key={category}
                                            style={[
                                                styles.categoryTab,
                                                {
                                                    backgroundColor: selectedCategory === category ? colors.text : colors.background,
                                                    borderColor: selectedCategory === category ? colors.text : colors.border,
                                                }
                                            ]}
                                            onPress={() => setSelectedCategory(category)}
                                        >
                                            <Ionicons 
                                                name={getCategoryIcon(category)} 
                                                size={scaleFontSize(16)} 
                                                color={selectedCategory === category ? colors.background : colors.text} 
                                                style={styles.categoryTabIcon}
                                            />
                                            <Text style={[
                                                styles.categoryTabText,
                                                {
                                                    color: selectedCategory === category ? colors.background : colors.text,
                                                }
                                            ]}>
                                                {category}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Items Grid */}
                                <View style={styles.categoryGrid}>
                                    {filteredItems.map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[styles.productCard, { backgroundColor: colors.surface }]}
                                            onPress={() => router.push({
                                                pathname: '/home/ItemDetail',
                                                params: { itemId: item.id },
                                            } as any)}
                                            activeOpacity={0.8}
                                        >
                                            <View style={[styles.productImageContainer, { backgroundColor: colors.surface }]}>
                                                <Image
                                                    source={{ uri: item.imageUri }}
                                                    style={styles.productImage}
                                                    resizeMode="contain"
                                                />
                                            </View>
                                            <View style={styles.productInfo}>
                                                <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={1}>
                                                    {item.itemName || item.category || 'Unnamed Item'}
                                                </Text>
                                                <Text style={[styles.productDetails, { color: colors.textSecondary }]} numberOfLines={1}>
                                                    {item.category || 'Item'}{item.brandName ? ` | ${item.brandName}` : ''}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}
                    </View>
                </ScrollView>
                <CustomTabBar />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    statusBarBackground: {
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 10,
    },
    container: {
        flex: 1,
        width: '100%',
    },
    closetIconContainer: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    closetText: {
        fontSize: scaleFontSize(15),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
    },
    addButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonBorder: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(8),
        borderWidth: scaleFontSize(1),
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: scaleFontSize(20),
    },
    scrollContentEmpty: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: scaleFontSize(20),
    },
    content: {
        paddingHorizontal: scaleFontSize(16),
        paddingTop: scaleFontSize(24),
        paddingBottom: scaleFontSize(100),
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: scaleFontSize(400),
        paddingHorizontal: scaleFontSize(32),
    },
    emptyIconContainer: {
        width: scaleFontSize(100),
        height: scaleFontSize(100),
        borderRadius: scaleFontSize(50),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scaleFontSize(16),
    },
    emptyText: {
        fontSize: scaleFontSize(20),
        fontFamily: FONTS.nunitoBold,
        textAlign: 'center',
        marginBottom: scaleFontSize(8),
    },
    emptyDescription: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        lineHeight: scaleFontSize(20),
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scaleFontSize(16),
        minHeight: scaleFontSize(40),
    },
    allClothesTitle: {
        fontSize: scaleFontSize(20),
        fontFamily: FONTS.nunitoBold,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scaleFontSize(6),
        paddingHorizontal: scaleFontSize(12),
        paddingVertical: 0,
        borderRadius: scaleFontSize(8),
        borderWidth: scaleFontSize(1),
        height: scaleFontSize(36),
    },
    filterText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(12),
        paddingVertical: scaleFontSize(12),
        borderRadius: scaleFontSize(8),
        borderWidth: scaleFontSize(1),
        marginBottom: scaleFontSize(16),
        gap: scaleFontSize(8),
    },
    searchInput: {
        flex: 1,
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
    },
    categoryTabsContainer: {
        marginBottom: scaleFontSize(20),
    },
    categoryTabsContent: {
        gap: scaleFontSize(8),
        paddingRight: scaleFontSize(16),
    },
    categoryTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: 0,
        borderRadius: scaleFontSize(20),
        borderWidth: scaleFontSize(1),
        borderColor: '#E3E5E5',
        height: scaleFontSize(36),
        justifyContent: 'center',
        gap: scaleFontSize(6),
    },
    categoryTabIcon: {
        marginRight: 0,
    },
    categoryTabText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: scaleFontSize(12),
        marginTop: scaleFontSize(0),
    },
    productCard: {
        width: '48%',
        marginBottom: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
    },
    productImageContainer: {
        width: '100%',
        height: scaleFontSize(180),
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    productInfo: {
        padding: scaleFontSize(12),
    },
    productTitle: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoBold,
        marginBottom: scaleFontSize(4),
    },
    productDetails: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: scaleFontSize(400),
        paddingHorizontal: scaleFontSize(32),
    },
    loadingText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(16),
    },
});

