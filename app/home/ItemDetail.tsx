import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/src/context/store';
import { removeItem } from '@/src/context/slices/closetSlice';
import { useWardrobeItem, useDeleteWardrobeItem, useUpdateWardrobeItem } from '@/src/services/modules/wardrobeItems/wardrobeItemsHooks';
import { mapWardrobeItemToClosetItem } from '@/src/utils/wardrobeItemMapper';

// These will be populated from actual tag data
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { Ionicons } from '@expo/vector-icons';
import { translations } from '@/src/constants/translations';

export default function ItemDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ itemId: string }>();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const t = translations.closet;

    // Fetch item details from API
    const { data: wardrobeItem, isLoading, error, refetch } = useWardrobeItem(params.itemId);
    const deleteWardrobeItemMutation = useDeleteWardrobeItem();
    const updateWardrobeItemMutation = useUpdateWardrobeItem();
    
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedNotes, setEditedNotes] = useState('');
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    
    // Group tags by category for better editing
    const tagsByCategory = React.useMemo(() => {
        if (!wardrobeItem) return {};
        const grouped: { [category: string]: typeof wardrobeItem.tags } = {};
        wardrobeItem.tags.forEach(tag => {
            if (!grouped[tag.category]) {
                grouped[tag.category] = [];
            }
            grouped[tag.category].push(tag);
        });
        return grouped;
    }, [wardrobeItem]);

    // Initialize form values when wardrobe item loads
    useEffect(() => {
        if (wardrobeItem) {
            setEditedName(wardrobeItem.name || '');
            setEditedNotes(wardrobeItem.notes || '');
            setSelectedTagIds(wardrobeItem.tags.map(tag => tag.id));
        }
    }, [wardrobeItem]);

    // Map wardrobe item to closet item format for display
    const item = wardrobeItem ? mapWardrobeItemToClosetItem(wardrobeItem) : null;
    
    // Format category key to display name (e.g. clothing_type -> Clothing Type)
    const categoryKeyToDisplayName = (key: string): string =>
        key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

    // Group all tags by category for dynamic display (from tags_by_category and tags)
    const tagsByCategoryGrouped = React.useMemo(() => {
        if (!wardrobeItem) return {};
        const grouped: { [category: string]: { values: string[]; currentValue?: string } } = {};

        // Process tags_by_category – all keys (clothing_type, color, style, fabric, etc.)
        const tagsByCat = wardrobeItem.tags_by_category;
        if (tagsByCat && typeof tagsByCat === 'object') {
            Object.entries(tagsByCat).forEach(([key, values]) => {
                if (Array.isArray(values) && values.length > 0) {
                    const displayName = categoryKeyToDisplayName(key);
                    grouped[displayName] = {
                        values: [...values],
                        currentValue: values[0],
                    };
                }
            });
        }

        // Merge in individual tags (in case tags_by_category is missing or empty)
        const tags = wardrobeItem.tags;
        if (Array.isArray(tags)) {
            tags.forEach((tag) => {
                const categoryName = categoryKeyToDisplayName(tag.category);
                if (!grouped[categoryName]) {
                    grouped[categoryName] = { values: [] };
                }
                if (!grouped[categoryName].values.includes(tag.name)) {
                    grouped[categoryName].values.push(tag.name);
                }
                if (!grouped[categoryName].currentValue) {
                    grouped[categoryName].currentValue = tag.name;
                }
            });
        }

        return grouped;
    }, [wardrobeItem]);
    
    // Get brand name from tags (if available)
    const brandTag = wardrobeItem?.tags.find(tag => 
        tag.category.toLowerCase().includes('brand')
    );
    const brandName = brandTag?.name || '';
    
    // Color mapping for display
    const getColorHex = (colorName: string): string => {
        const colorMap: { [key: string]: string } = {
            'black': '#000000',
            'white': '#FFFFFF',
            'red': '#FF0000',
            'blue': '#0000FF',
            'green': '#008000',
            'yellow': '#FFFF00',
            'orange': '#FFA500',
            'purple': '#800080',
            'pink': '#FFC0CB',
            'brown': '#A52A2A',
            'gray': '#808080',
            'grey': '#808080',
            'navy': '#000080',
            'beige': '#F5F5DC',
            'tan': '#D2B48C',
        };
        return colorMap[colorName.toLowerCase()] || '#000000';
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.buttonPrimary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Loading item details...
                    </Text>
                </View>
            </View>
        );
    }

    if (error || !item || !wardrobeItem) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.text }]}>
                    {error ? 'Failed to load item' : 'Item not found'}
                </Text>
            </View>
        );
    }

    const handleBack = () => {
        router.back();
    };

    const handleEdit = () => {
        setShowMenu(false);
        setIsEditMode(true);
    };

    const handleCancelEdit = () => {
        // Reset to original values
        if (wardrobeItem) {
            setEditedName(wardrobeItem.name || '');
            setEditedNotes(wardrobeItem.notes || '');
            setSelectedTagIds(wardrobeItem.tags.map(tag => tag.id));
        }
        setIsEditMode(false);
    };

    const handleSaveEdit = async () => {
        if (!wardrobeItem) return;
        
        setIsSaving(true);
        try {
            // Check if any data has changed
            const nameChanged = (editedName.trim() || '') !== (wardrobeItem.name || '');
            const notesChanged = (editedNotes.trim() || '') !== (wardrobeItem.notes || '');
            const originalTagIds = wardrobeItem.tags.map(tag => tag.id).sort();
            const currentTagIds = [...selectedTagIds].sort();
            const tagsChanged = JSON.stringify(originalTagIds) !== JSON.stringify(currentTagIds);
            
            // Only proceed if something has changed
            if (!nameChanged && !notesChanged && !tagsChanged) {
                setIsEditMode(false);
                return;
            }
            
            // Prepare updates - always send all fields that can be updated
            const updates: { name?: string; notes?: string; tagIds?: string[] } = {};
            
            // Always send name (even if empty, to clear it)
            if (nameChanged || editedName.trim() !== (wardrobeItem.name || '')) {
                updates.name = editedName.trim() || undefined;
            }
            
            // Always send notes (even if empty, to clear it)
            if (notesChanged || editedNotes.trim() !== (wardrobeItem.notes || '')) {
                updates.notes = editedNotes.trim() || undefined;
            }
            
            // Send tagIds if tags have changed
            if (tagsChanged) {
                updates.tagIds = selectedTagIds;
            }
            
            await updateWardrobeItemMutation.mutateAsync({
                id: wardrobeItem.id,
                updates,
            });
            
            // Refetch to get updated data
            await refetch();
            setIsEditMode(false);
            Alert.alert('Success', 'Item updated successfully');
        } catch (error: any) {
            console.error('Error updating wardrobe item:', error);
            Alert.alert(
                translations.common.error,
                error?.message || 'Failed to update item. Please try again.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleTag = (tagId: string) => {
        setSelectedTagIds(prev => {
            if (prev.includes(tagId)) {
                return prev.filter(id => id !== tagId);
            } else {
                return [...prev, tagId];
            }
        });
    };

    const handleDelete = () => {
        setShowMenu(false);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const response = await deleteWardrobeItemMutation.mutateAsync(item.id);
            
            // Show success message if available
            if (response?.message) {
                // Success - item deleted
                // Also remove from Redux for backward compatibility
                dispatch(removeItem(item.id));
                setShowDeleteModal(false);
                router.back();
            } else {
                // Still success, just no message
                dispatch(removeItem(item.id));
                setShowDeleteModal(false);
                router.back();
            }
        } catch (error: any) {
            console.error('Error deleting wardrobe item:', error);
            
            // Handle 404 error specifically
            const errorMessage = error?.message || 'Failed to delete item. Please try again.';
            const isNotFound = error?.statusCode === 404 || errorMessage.toLowerCase().includes('not found');
            
            Alert.alert(
                translations.common.error,
                isNotFound ? 'Item not found. It may have already been deleted.' : errorMessage
            );
            setShowDeleteModal(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <StatusBar style="dark" />
            <View style={[styles.statusBarBackground, { height: insets.top, backgroundColor: colors.background }]} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + scaleFontSize(12) }]}>
                <TouchableOpacity 
                    onPress={isEditMode ? handleCancelEdit : handleBack} 
                    style={styles.backButton}
                >
                    <Ionicons name={isEditMode ? "close" : "arrow-back"} size={scaleFontSize(24)} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {isEditMode ? (t.editItem || 'Edit Item') : (t.addNewItemTitle || 'Add New item')}
                </Text>
                {isEditMode ? (
                    <TouchableOpacity
                        onPress={handleSaveEdit}
                        style={styles.saveButton}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color={colors.buttonPrimary} />
                        ) : (
                            <Text style={[styles.saveButtonText, { color: colors.buttonPrimary }]}>
                                Save
                            </Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => setShowMenu(!showMenu)}
                        style={styles.menuButton}
                    >
                        <Ionicons name="ellipsis-vertical" size={scaleFontSize(24)} color={colors.text} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Dropdown Menu */}
            {showMenu && (
                <View style={[styles.menuOverlay]} pointerEvents="box-none">
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={() => setShowMenu(false)}
                    />
                    <View style={[styles.menuContainer, { backgroundColor: colors.background }]}>
                        <TouchableOpacity
                            onPress={handleEdit}
                            style={styles.menuItem}
                        >
                            <Ionicons name="create-outline" size={scaleFontSize(20)} color={colors.text} />
                            <Text style={[styles.menuItemText, { color: colors.text }]}>
                                {t.editItem || 'Edit Item'}
                            </Text>
                        </TouchableOpacity>
                        <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                        <TouchableOpacity
                            onPress={handleDelete}
                            style={styles.menuItem}
                        >
                            <Ionicons name="trash-outline" size={scaleFontSize(20)} color={colors.text} />
                            <Text style={[styles.menuItemText, { color: colors.text }]}>
                                {t.deleteItem || 'Delete Item'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Product Image */}
                <View style={styles.imageWrapper}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: item.imageUri }}
                            style={styles.productImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Product Details */}
                <View style={styles.detailsContainer}>
                    {/* Product Name with Brand */}
                    <View style={styles.nameBrandRow}>
                        {isEditMode ? (
                            <TextInput
                                style={[styles.editNameInput, { 
                                    color: colors.text, 
                                    borderColor: colors.border,
                                    backgroundColor: colors.background 
                                }]}
                                value={editedName}
                                onChangeText={setEditedName}
                                placeholder="Enter item name"
                                placeholderTextColor={colors.textSecondary}
                            />
                        ) : (
                            <>
                                <Text style={[styles.productName, { color: colors.text }]}>
                                    {item.itemName || item.category || 'Unnamed Item'}
                                </Text>
                                {brandName && (
                                    <Text style={[styles.brandName, { color: colors.text }]}>
                                        {brandName}
                                    </Text>
                                )}
                            </>
                        )}
                    </View>

                    {/* Tag categories (detail + edit) */}
                    {Object.entries(tagsByCategoryGrouped)
                        .filter(([categoryName]) => !categoryName.toLowerCase().includes('brand'))
                        .filter(([, categoryData]) => categoryData.values.length > 0)
                        .map(([categoryName, categoryData]) => (
                            <View key={categoryName} style={styles.attributeSection}>
                                <Text style={[styles.attributeLabel, { color: colors.text }]}>
                                    {categoryName}
                                </Text>
                                <View style={styles.buttonRow}>
                                    {categoryData.values.map((value) => (
                                        <TouchableOpacity
                                            key={value}
                                            disabled={!isEditMode}
                                            style={[
                                                styles.attributeButton,
                                                {
                                                    backgroundColor: 'transparent',
                                                    borderColor: colors.border,
                                                    borderWidth: scaleFontSize(1),
                                                    opacity: isEditMode ? 1 : 1,
                                                }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.attributeButtonText,
                                                { color: colors.text }
                                            ]}>
                                                {value}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}

                    {/* Notes Section */}
                    <View style={styles.attributeSection}>
                        <Text style={[styles.attributeLabel, { color: colors.text }]}>
                            Notes
                        </Text>
                        {isEditMode ? (
                            <TextInput
                                style={[styles.editTextArea, { 
                                    color: colors.text, 
                                    borderColor: colors.border,
                                    backgroundColor: colors.background 
                                }]}
                                value={editedNotes}
                                onChangeText={setEditedNotes}
                                placeholder="Add notes about this item..."
                                placeholderTextColor={colors.textSecondary}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        ) : (
                            <Text style={[styles.notesText, { color: colors.text }]}>
                                {wardrobeItem.notes || 'No notes added yet'}
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={showDeleteModal}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCancelDelete}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={handleCancelDelete}
                    />
                    <View style={[styles.deleteModalContent, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
                        <View style={styles.modalHandle} />
                        <Text style={[styles.deleteModalTitle, { color: colors.text }]}>
                            {t.deleteItemQuestion || 'Delete item?'}
                        </Text>
                        <Text style={[styles.deleteModalMessage, { color: colors.text }]}>
                            {t.deleteItemConfirm || 'Are you sure want to remove this item?'}
                        </Text>
                        <TouchableOpacity
                            style={[styles.removeItemButton, { backgroundColor: colors.text }]}
                            onPress={handleConfirmDelete}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.removeItemButtonText, { color: colors.background }]}>
                                {t.removeItem || 'Remove Item'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleCancelDelete}
                            style={styles.cancelButton}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                                {t.cancel || 'Cancel'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
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
        paddingHorizontal: scaleFontSize(20),
        paddingBottom: scaleFontSize(16),
        zIndex: 5,
        borderBottomWidth: scaleFontSize(1),
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    backButton: {
        width: scaleFontSize(40),
        height: scaleFontSize(40),
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: scaleFontSize(20),
        fontFamily: FONTS.nunitoBold,
        flex: 1,
        textAlign: 'center',
        letterSpacing: scaleFontSize(0.3),
    },
    menuButton: {
        width: scaleFontSize(40),
        height: scaleFontSize(40),
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    menuOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
    },
    menuContainer: {
        position: 'absolute',
        top: scaleFontSize(60),
        right: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        paddingVertical: scaleFontSize(8),
        minWidth: scaleFontSize(160),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(12),
        gap: scaleFontSize(12),
    },
    menuItemText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
    },
    menuDivider: {
        height: scaleFontSize(1),
        marginVertical: scaleFontSize(4),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: scaleFontSize(40),
    },
    imageWrapper: {
        paddingHorizontal: scaleFontSize(16),
        paddingTop: scaleFontSize(20),
        paddingBottom: scaleFontSize(32),
    },
    imageContainer: {
        width: '100%',
        height: scaleFontSize(400),
        borderRadius: scaleFontSize(12),
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    detailsContainer: {
        paddingHorizontal: scaleFontSize(20),
    },
    nameBrandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: scaleFontSize(28),
        paddingHorizontal: scaleFontSize(4),
    },
    productName: {
        fontSize: scaleFontSize(24),
        fontFamily: FONTS.nunitoBold,
        lineHeight: scaleFontSize(32),
        flex: 1,
    },
    brandName: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.nunitoBold,
        marginLeft: scaleFontSize(12),
    },
    attributeSection: {
        marginBottom: scaleFontSize(24),
    },
    attributeLabel: {
        fontSize: scaleFontSize(13),
        fontFamily: FONTS.nunitoSemiBold,
        marginBottom: scaleFontSize(10),
        color: 'rgba(0, 0, 0, 0.6)',
    },
    buttonRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scaleFontSize(10),
    },
    attributeButton: {
        paddingHorizontal: scaleFontSize(20),
        paddingVertical: scaleFontSize(12),
        borderRadius: scaleFontSize(8),
        borderWidth: scaleFontSize(1),
        minWidth: scaleFontSize(100),
    },
    attributeButtonText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoSemiBold,
        textAlign: 'center',
    },
    colorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleFontSize(10),
    },
    colorSwatch: {
        width: scaleFontSize(24),
        height: scaleFontSize(24),
        borderRadius: scaleFontSize(12),
        borderWidth: scaleFontSize(1),
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    colorText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoSemiBold,
    },
    editNameInput: {
        flex: 1,
        borderWidth: scaleFontSize(1.5),
        borderRadius: scaleFontSize(10),
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(14),
        fontSize: scaleFontSize(24),
        fontFamily: FONTS.nunitoBold,
    },
    sectionCard: {
        borderRadius: scaleFontSize(12),
        padding: scaleFontSize(20),
        marginBottom: scaleFontSize(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.nunitoBold,
        marginBottom: scaleFontSize(16),
    },
    notesText: {
        fontSize: scaleFontSize(15),
        fontFamily: FONTS.nunitoRegular,
        lineHeight: scaleFontSize(22),
    },
    errorText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        marginTop: scaleFontSize(100),
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    deleteModalContent: {
        borderTopLeftRadius: scaleFontSize(20),
        borderTopRightRadius: scaleFontSize(20),
        paddingHorizontal: scaleFontSize(24),
        paddingTop: scaleFontSize(20),
        paddingBottom: scaleFontSize(32),
        alignItems: 'center',
    },
    modalHandle: {
        width: scaleFontSize(40),
        height: scaleFontSize(4),
        borderRadius: scaleFontSize(2),
        backgroundColor: '#CCCCCC',
        alignSelf: 'center',
        marginBottom: scaleFontSize(24),
    },
    deleteModalTitle: {
        fontSize: scaleFontSize(20),
        fontFamily: FONTS.nunitoBold,
        marginBottom: scaleFontSize(12),
        textAlign: 'center',
    },
    deleteModalMessage: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        marginBottom: scaleFontSize(24),
        lineHeight: scaleFontSize(22),
    },
    removeItemButton: {
        width: '100%',
        paddingVertical: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        alignItems: 'center',
        marginBottom: scaleFontSize(16),
    },
    removeItemButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
    },
    cancelButton: {
        paddingVertical: scaleFontSize(12),
    },
    cancelButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(32),
    },
    loadingText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(16),
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scaleFontSize(8),
        marginTop: scaleFontSize(8),
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(14),
        paddingVertical: scaleFontSize(8),
        borderRadius: scaleFontSize(20),
        borderWidth: scaleFontSize(1.5),
        gap: scaleFontSize(6),
        marginRight: scaleFontSize(6),
        marginBottom: scaleFontSize(6),
    },
    tagText: {
        fontSize: scaleFontSize(13),
        fontFamily: FONTS.nunitoSemiBold,
    },
    tagCategory: {
        fontSize: scaleFontSize(11),
        fontFamily: FONTS.nunitoRegular,
    },
    categoryTagSection: {
        marginBottom: scaleFontSize(20),
    },
    categoryTagLabel: {
        fontSize: scaleFontSize(13),
        fontFamily: FONTS.nunitoSemiBold,
        marginBottom: scaleFontSize(10),
        textTransform: 'uppercase',
        letterSpacing: scaleFontSize(0.5),
    },
    saveButton: {
        width: scaleFontSize(60),
        height: scaleFontSize(40),
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    saveButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
    },
    editInput: {
        borderWidth: scaleFontSize(1.5),
        borderRadius: scaleFontSize(10),
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(14),
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(8),
    },
    editTextArea: {
        borderWidth: scaleFontSize(1.5),
        borderRadius: scaleFontSize(10),
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(14),
        fontSize: scaleFontSize(15),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(8),
        minHeight: scaleFontSize(120),
        lineHeight: scaleFontSize(22),
    },
    tagCheckIcon: {
        marginLeft: scaleFontSize(4),
    },
    helperText: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(8),
        fontStyle: 'italic',
    },
});

