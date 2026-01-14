import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { saveItem, updateItem, ClosetItem } from '@/src/context/slices/closetSlice';
import { RootState } from '@/src/context/store';
import { useUpdateWardrobeItem } from '@/src/services/modules/wardrobeItems/wardrobeItemsHooks';

const CATEGORIES = [
    'T-shirt',
    'Pant/Trouser',
    'Shirt',
    'Dress',
    'Jacket',
    'Sweater',
    'Jeans',
    'Shorts',
    'Skirt',
    'Blazer',
    'Coat',
    'Hoodie',
    'Polo',
    'Tank Top',
    'Other',
];

export default function AddNewItemScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ 
        imageUri?: string; 
        itemId?: string; 
        edit?: string;
        wardrobeItemId?: string;
        preFilledCategory?: string;
        preFilledColor?: string;
        preFilledFit?: string;
    }>();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const { items } = useSelector((state: RootState) => state.closet);
    const updateWardrobeItemMutation = useUpdateWardrobeItem();
    const t = translations.closet;
    const hasItems = items && items.length > 0;
    const isEditMode = params.edit === 'true';
    const editingItem = isEditMode && params.itemId ? items?.find((i: ClosetItem) => i.id === params.itemId) : null;
    const wardrobeItemId = params.wardrobeItemId; // ID from API when creating new item

    const [imageUri, setImageUri] = useState<string | null>(
        params.imageUri || editingItem?.imageUri || null
    );
    const [category, setCategory] = useState(
        params.preFilledCategory || editingItem?.category || ''
    );
    const [itemName, setItemName] = useState(editingItem?.itemName || '');
    const [size, setSize] = useState(editingItem?.size || '');
    const [color, setColor] = useState(
        params.preFilledColor || editingItem?.color || ''
    );
    const [brandName, setBrandName] = useState(editingItem?.brandName || '');
    const [fit, setFit] = useState(
        params.preFilledFit || editingItem?.fit || ''
    );
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const inputRefs = {
        category: useRef<TextInput>(null),
        itemName: useRef<TextInput>(null),
        size: useRef<TextInput>(null),
        color: useRef<TextInput>(null),
        brandName: useRef<TextInput>(null),
        fit: useRef<TextInput>(null),
    };

    useEffect(() => {
        if (params.imageUri) {
            setImageUri(params.imageUri);
        }
    }, [params.imageUri]);

    useEffect(() => {
        if (editingItem) {
            setImageUri(editingItem.imageUri);
            setCategory(editingItem.category || '');
            setItemName(editingItem.itemName || '');
            setSize(editingItem.size || '');
            setColor(editingItem.color || '');
            setBrandName(editingItem.brandName || '');
            setFit(editingItem.fit || '');
        }
    }, [editingItem]);

    const scrollToInput = (inputName: keyof typeof inputRefs) => {
        // Simple scroll approach - scroll a bit when input is focused
        setTimeout(() => {
            const inputIndex = Object.keys(inputRefs).indexOf(inputName);
            if (inputIndex >= 0 && scrollViewRef.current) {
                // Scroll based on input position (approximate)
                const scrollOffset = (inputIndex + 1) * scaleFontSize(100);
                scrollViewRef.current.scrollTo({
                    y: scrollOffset,
                    animated: true,
                });
            }
        }, 300);
    };

    const handleBack = () => {
        router.back();
    };

    const handleTakePhoto = () => {
        router.push({
            pathname: '/home/AddToCloset',
            params: { fromAddNewItem: 'true' },
        } as any);
    };

    const handleOpenCategoryModal = () => {
        setIsCategoryModalVisible(true);
    };

    const handleCloseCategoryModal = () => {
        setIsCategoryModalVisible(false);
    };

    const handleSelectCategory = (selectedCategory: string) => {
        setCategory(selectedCategory);
        setIsCategoryModalVisible(false);
    };

    const handleSaveItem = async () => {
        if (!imageUri) {
            Alert.alert(translations.common.error, 'Please select an image first');
            return;
        }

        if (isSaving) return;
        setIsSaving(true);

        try {
            // If we have a wardrobeItemId (from API) or editing an item, update via API
            const itemIdToUpdate = wardrobeItemId || (isEditMode && params.itemId ? params.itemId : null);
            
            if (itemIdToUpdate) {
                // Update via API
                await updateWardrobeItemMutation.mutateAsync({
                    id: itemIdToUpdate,
                    updates: {
                        name: itemName || undefined,
                        notes: undefined, // Notes field not in form yet
                    },
                });

                // Also update local Redux for backward compatibility
                if (isEditMode && editingItem) {
                    dispatch(updateItem({
                        ...editingItem,
                        imageUri,
                        category: category || undefined,
                        itemName: itemName || undefined,
                        size: size || undefined,
                        color: color || undefined,
                        brandName: brandName || undefined,
                        fit: fit || undefined,
                    }));
                }

                Alert.alert('Success', 'Item updated successfully', [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]);
            } else {
                // Create new item in Redux (for backward compatibility)
                dispatch(saveItem({
                    imageUri,
                    category: category || undefined,
                    itemName: itemName || undefined,
                    size: size || undefined,
                    color: color || undefined,
                    brandName: brandName || undefined,
                    fit: fit || undefined,
                }));

                Alert.alert('Success', 'Item saved successfully', [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]);
            }
        } catch (error: any) {
            console.error('Error saving item:', error);
            Alert.alert(
                translations.common.error,
                error?.message || 'Failed to save item. Please try again.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.wrapper, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <StatusBar style="dark" />
            <View style={[styles.statusBarBackground, { height: insets.top, backgroundColor: colors.background }]} />
            
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + scaleFontSize(12) }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={scaleFontSize(24)} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {isEditMode ? (t.editItem || 'Edit Item') : t.addNewItemTitle}
                </Text>
                <View style={styles.headerRight} />
            </View>

            {/* Content */}
            <ScrollView 
                ref={scrollViewRef}
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                {!imageUri ? (
                    <>
                        {/* Description at top */}
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            {t.addNewItemDescription}
                        </Text>

                        {/* Dashed Box Container - Centered in middle */}
                        <View style={styles.centeredSection}>
                            <View style={[styles.dashedContainer, { borderColor: colors.border }]}>
                                <Ionicons name="camera-outline" size={scaleFontSize(48)} color={colors.textSecondary} />
                                <Text style={[styles.addFirstItemText, { color: colors.text }]}>
                                    {hasItems ? t.addAnotherItem : t.addYourFirstItem}
                                </Text>
                                <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                                    {t.takePhotoOrUpload}
                                </Text>
                                <TouchableOpacity
                                    onPress={handleTakePhoto}
                                    style={[styles.takePhotoButton, { backgroundColor: colors.buttonPrimary }]}
                                >
                                    <Text style={[styles.takePhotoButtonText, { color: colors.buttonText }]}>
                                        {t.takePhoto}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Footer text */}
                            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                                {t.addAtLeastOneItem}
                            </Text>
                        </View>
                    </>
                ) : (
                    <>
                        {/* Image Display */}
                        <View style={[styles.imageContainer, { backgroundColor: colors.border }]}>
                            <Image 
                                source={{ uri: imageUri }} 
                                style={styles.itemImage}
                                resizeMode="cover"
                            />
                        </View>

                        {/* Form Fields */}
                        <View style={styles.formContainer}>
                            {/* Category */}
                            <View style={styles.formSection}>
                                <View style={styles.radioButtonContainer}>
                                    <View style={[styles.radioButton, { backgroundColor: colors.text }]} />
                                    <Text style={[styles.fieldLabel, { color: colors.text }]}>
                                        {t.whichTypeOfClothing}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={handleOpenCategoryModal}
                                    style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}
                                >
                                    <Text style={[styles.input, styles.categoryInput, { color: category ? colors.text : colors.textSecondary }]}>
                                        {category || t.selectCategory}
                                    </Text>
                                    <Ionicons name="chevron-down" size={scaleFontSize(20)} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Item Name */}
                            <View style={styles.formSection}>
                                <View style={styles.radioButtonContainer}>
                                    <View style={[styles.radioButtonUnfilled, { borderColor: colors.border }]} />
                                    <Text style={[styles.fieldLabel, { color: colors.text }]}>
                                        {t.itemName}
                                    </Text>
                                </View>
                                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                    <TextInput
                                        ref={inputRefs.itemName}
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Black T-Shirt"
                                        placeholderTextColor={colors.textSecondary}
                                        value={itemName}
                                        onChangeText={setItemName}
                                        onFocus={() => scrollToInput('itemName')}
                                    />
                                </View>
                            </View>

                            {/* Size and Color Row */}
                            <View style={styles.rowContainer}>
                                <View style={[styles.formSection, styles.halfWidth]}>
                                    <View style={styles.radioButtonContainer}>
                                        <View style={[styles.radioButtonUnfilled, { borderColor: colors.border }]} />
                                        <Text style={[styles.fieldLabel, { color: colors.text }]}>
                                            {t.addSize}
                                        </Text>
                                    </View>
                                    <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                        <TextInput
                                            ref={inputRefs.size}
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="L"
                                            placeholderTextColor={colors.textSecondary}
                                            value={size}
                                            onChangeText={setSize}
                                            onFocus={() => scrollToInput('size')}
                                        />
                                    </View>
                                </View>

                                <View style={[styles.formSection, styles.halfWidth]}>
                                    <View style={styles.radioButtonContainer}>
                                        <View style={[styles.radioButtonUnfilled, { borderColor: colors.border }]} />
                                        <Text style={[styles.fieldLabel, { color: colors.text }]}>
                                            {t.addColor}
                                        </Text>
                                    </View>
                                    <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                        <TextInput
                                            ref={inputRefs.color}
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="Black"
                                            placeholderTextColor={colors.textSecondary}
                                            value={color}
                                            onChangeText={setColor}
                                            onFocus={() => scrollToInput('color')}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Brand Name and Fit Row */}
                            <View style={styles.rowContainer}>
                                <View style={[styles.formSection, styles.halfWidth]}>
                                    <View style={styles.radioButtonContainer}>
                                        <View style={[styles.radioButtonUnfilled, { borderColor: colors.border }]} />
                                        <Text style={[styles.fieldLabel, { color: colors.text }]}>
                                            {t.brandName}
                                        </Text>
                                    </View>
                                    <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                        <TextInput
                                            ref={inputRefs.brandName}
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="Zara"
                                            placeholderTextColor={colors.textSecondary}
                                            value={brandName}
                                            onChangeText={setBrandName}
                                            onFocus={() => scrollToInput('brandName')}
                                        />
                                    </View>
                                </View>

                                <View style={[styles.formSection, styles.halfWidth]}>
                                    <View style={styles.radioButtonContainer}>
                                        <View style={[styles.radioButtonUnfilled, { borderColor: colors.border }]} />
                                        <Text style={[styles.fieldLabel, { color: colors.text }]}>
                                            {t.howDoesItFit}
                                        </Text>
                                    </View>
                                    <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                        <TextInput
                                            ref={inputRefs.fit}
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="Loose fit"
                                            placeholderTextColor={colors.textSecondary}
                                            value={fit}
                                            onChangeText={setFit}
                                            onFocus={() => scrollToInput('fit')}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            onPress={handleSaveItem}
                            style={[
                                styles.saveButton, 
                                { 
                                    backgroundColor: isSaving ? colors.textSecondary : colors.buttonPrimary,
                                    opacity: isSaving ? 0.6 : 1,
                                }
                            ]}
                            disabled={isSaving}
                        >
                            <Text style={[styles.saveButtonText, { color: colors.buttonText }]}>
                                {isSaving 
                                    ? 'Saving...' 
                                    : (isEditMode ? (t.updateItem || 'Update Item') : t.saveItem)
                                }
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            {/* Category Modal Bottom Sheet */}
            <Modal
                visible={isCategoryModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseCategoryModal}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={handleCloseCategoryModal}
                    />
                    <View style={[styles.modalContent, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
                        <View style={styles.modalHandle} />
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {t.selectCategory}
                        </Text>
                        <View style={styles.categoryListContainer}>
                            <ScrollView
                                style={styles.categoryList}
                                contentContainerStyle={styles.categoryListContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryItem,
                                            {
                                                backgroundColor: category === cat ? colors.surface : 'transparent',
                                                borderBottomColor: colors.border,
                                            }
                                        ]}
                                        onPress={() => handleSelectCategory(cat)}
                                    >
                                        <Text style={[styles.categoryItemText, { color: colors.text }]}>
                                            {cat}
                                        </Text>
                                        {category === cat && (
                                            <Ionicons name="checkmark" size={scaleFontSize(20)} color={colors.buttonPrimary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
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
        paddingBottom: scaleFontSize(12),
        zIndex: 10,
    },
    backButton: {
        padding: scaleFontSize(8),
    },
    headerTitle: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.nunitoBold,
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: scaleFontSize(40),
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: scaleFontSize(24),
        paddingTop: scaleFontSize(24),
        paddingBottom: scaleFontSize(100),
    },
    description: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        lineHeight: scaleFontSize(20),
        textAlign: 'center',
        marginBottom: scaleFontSize(24),
    },
    centeredSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scaleFontSize(40),
        minHeight: scaleFontSize(500),
    },
    dashedContainer: {
        borderWidth: scaleFontSize(2),
        borderStyle: 'dashed',
        borderRadius: scaleFontSize(12),
        padding: scaleFontSize(32),
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: scaleFontSize(300),
        width: '100%',
        marginBottom: scaleFontSize(16),
    },
    addFirstItemText: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.nunitoBold,
        marginTop: scaleFontSize(16),
        marginBottom: scaleFontSize(8),
        textAlign: 'center',
    },
    instructionText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        marginBottom: scaleFontSize(24),
    },
    takePhotoButton: {
        paddingVertical: scaleFontSize(14),
        paddingHorizontal: scaleFontSize(32),
        borderRadius: scaleFontSize(8),
        minWidth: scaleFontSize(150),
    },
    takePhotoButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
        textAlign: 'center',
    },
    footerText: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        marginTop: scaleFontSize(16),
    },
    imageContainer: {
        width: '100%',
        height: scaleFontSize(300),
        borderRadius: scaleFontSize(12),
        overflow: 'hidden',
        marginBottom: scaleFontSize(24),
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    formContainer: {
        marginBottom: scaleFontSize(24),
    },
    formSection: {
        marginBottom: scaleFontSize(20),
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: scaleFontSize(12),
    },
    halfWidth: {
        flex: 1,
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scaleFontSize(8),
        gap: scaleFontSize(8),
    },
    radioButton: {
        width: scaleFontSize(16),
        height: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
    },
    radioButtonUnfilled: {
        width: scaleFontSize(16),
        height: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        borderWidth: scaleFontSize(1),
    },
    fieldLabel: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: scaleFontSize(1),
        borderRadius: scaleFontSize(8),
        paddingHorizontal: scaleFontSize(12),
        paddingVertical: scaleFontSize(12),
    },
    input: {
        flex: 1,
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
    },
    saveButton: {
        paddingVertical: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        alignItems: 'center',
        marginBottom: scaleFontSize(24),
    },
    saveButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
    },
    categoryInput: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        borderTopLeftRadius: scaleFontSize(20),
        borderTopRightRadius: scaleFontSize(20),
        paddingHorizontal: scaleFontSize(24),
        paddingTop: scaleFontSize(20),
        maxHeight: '75%',
        minHeight: scaleFontSize(400),
    },
    modalHandle: {
        width: scaleFontSize(40),
        height: scaleFontSize(4),
        borderRadius: scaleFontSize(2),
        backgroundColor: '#CCCCCC',
        alignSelf: 'center',
        marginBottom: scaleFontSize(20),
    },
    modalTitle: {
        fontSize: scaleFontSize(20),
        fontFamily: FONTS.nunitoBold,
        marginBottom: scaleFontSize(20),
    },
    categoryListContainer: {
        flex: 1,
        minHeight: scaleFontSize(300),
    },
    categoryList: {
        flex: 1,
    },
    categoryListContent: {
        paddingBottom: scaleFontSize(20),
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: scaleFontSize(16),
        paddingHorizontal: scaleFontSize(16),
        borderBottomWidth: scaleFontSize(1),
    },
    categoryItemText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
    },
});

