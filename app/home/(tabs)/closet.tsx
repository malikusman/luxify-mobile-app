import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/src/context/store';
import { removeImage } from '@/src/context/slices/closetSlice';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import CustomTabBar from '@/src/components/home/CustomTabBar';
import Header from '@/src/components/home/Header';
import { Ionicons } from '@expo/vector-icons';

export default function ClosetScreen() {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const { images } = useSelector((state: RootState) => state.closet);

    const handleRemoveImage = (imageId: string) => {
        dispatch(removeImage(imageId));
    };

    return (
        <View style={styles.wrapper}>
            <StatusBar style="dark" backgroundColor="#FFFFFF" />
            <View style={[styles.statusBarBackground, { height: insets.top }]} />
            <View style={styles.container}>
                <Header />
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        {images.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                    No items in your closet yet
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.grid}>
                                {images.map((image) => (
                                    <View key={image.id} style={styles.imageContainer}>
                                        <Image
                                            source={{ uri: image.uri }}
                                            style={styles.image}
                                            resizeMode="cover"
                                        />
                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={() => handleRemoveImage(image.id)}
                                        >
                                            <Ionicons
                                                name="close-circle"
                                                size={scaleFontSize(24)}
                                                color={colors.text}
                                            />
                                        </TouchableOpacity>
                                        <View style={[styles.imageLabel, { backgroundColor: colors.text }]}>
                                            <Text style={[styles.labelText, { color: colors.textSecondary }]}>
                                                Outfit name
                                            </Text>
                                            <Text style={[styles.categoryText, { color: colors.surface }]}>
                                                Category
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
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
        backgroundColor: '#FFFFFF',
        width: '100%',
    },
    container: {
        flex: 1,
        width: '100%',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: scaleFontSize(16),
        paddingTop: scaleFontSize(24),
        paddingBottom: scaleFontSize(100),
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scaleFontSize(100),
    },
    emptyText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: scaleFontSize(12),
    },
    imageContainer: {
        width: '48%',
        marginBottom: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        overflow: 'hidden',
        backgroundColor: 'black',
    },
    image: {
        height: scaleFontSize(200),
        margin: scaleFontSize(5),
    },
    removeButton: {
        position: 'absolute',
        top: scaleFontSize(8),
        right: scaleFontSize(8),
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: scaleFontSize(12),
        padding: scaleFontSize(4),
    },
    imageLabel: {
        padding: scaleFontSize(12),
    },
    labelText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
        marginBottom: scaleFontSize(4),
    },
    categoryText: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
    },
});

