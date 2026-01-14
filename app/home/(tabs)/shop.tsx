import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions, Image } from 'react-native';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import CustomTabBar from '@/src/components/home/CustomTabBar';
import { pickImageFromGallery, takePhotoWithCamera, showImageSourceDialog } from '@/src/services/imagePickerService';
import { IMAGE_QUALITY } from '@/src/constants/constants';
import { generateAvatarFromImage } from '@/src/services/avatar3d/meshyService';
import Avatar3D from '@/src/components/avatar3d/Avatar3D';

const { width, height } = Dimensions.get('window');

export default function ShopScreen() {
    const colors = useThemeColors();
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
    const [avatarModelUrl, setAvatarModelUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<string>('');

    const handleImageSelect = async (imageUri: string) => {
        setSelectedImageUri(imageUri);
        setAvatarModelUrl(null);
        setError(null);
        setProgress('Uploading image...');
        
        // Auto-start processing after a brief delay to show the preview
        setTimeout(() => {
            processAvatarGeneration(imageUri);
        }, 500);
    };

    const processAvatarGeneration = async (imageUri: string) => {
        setIsGenerating(true);
        setProgress('Submitting to Meshy AI...');

        try {
            // Generate 3D avatar from the selected image using Meshy AI
            const result = await generateAvatarFromImage(imageUri);

            if (result.success && result.modelUrl) {
                setProgress('');
                setAvatarModelUrl(result.modelUrl);
            } else {
                const errorMessage = result.error || 'Failed to generate avatar';
                setError(errorMessage);
                setProgress('');
                
                // Show helpful message if API key is missing
                if (errorMessage.includes('API key')) {
                    Alert.alert(
                        'API Key Required',
                        'Please add your Meshy AI API key to app.json:\n\n"extra": {\n  "meshyApiKey": "your-api-key-here"\n}\n\nGet your API key at: https://meshy.ai',
                        [{ text: 'OK' }]
                    );
                } else {
                    Alert.alert(
                        'Generation Failed',
                        errorMessage,
                        [{ text: 'OK' }]
                    );
                }
            }
        } catch (err: any) {
            const errorMessage = err.message || 'An unexpected error occurred';
            setError(errorMessage);
            setProgress('');
            Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePickImage = () => {
        const onTakePhoto = async () => {
            const result = await takePhotoWithCamera({
                quality: IMAGE_QUALITY.DEFAULT,
                allowsEditing: true,
            });

            if (result.success && result.uri) {
                await handleImageSelect(result.uri);
            } else if (result.error) {
                Alert.alert('Error', result.error);
            }
        };

        const onPickFromGallery = async () => {
            const result = await pickImageFromGallery({
                quality: IMAGE_QUALITY.DEFAULT,
                allowsEditing: true,
            });

            if (result.success && result.uri) {
                await handleImageSelect(result.uri);
            } else if (result.error) {
                Alert.alert('Error', result.error);
            }
        };

        showImageSourceDialog(onTakePhoto, onPickFromGallery);
    };

    const handleReset = () => {
        setSelectedImageUri(null);
        setAvatarModelUrl(null);
        setError(null);
        setIsGenerating(false);
        setProgress('');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>3D Avatar Generator</Text>
                <Text style={[styles.subtitle, { color: colors.text }]}>
                    Create your 3D avatar with Meshy AI
                </Text>

                {!selectedImageUri && !avatarModelUrl && (
                    <View style={styles.placeholderContainer}>
                        <Text style={[styles.placeholderText, { color: colors.text }]}>
                            Upload an image to generate your 3D avatar
                        </Text>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.buttonPrimary || '#000' }]}
                            onPress={handlePickImage}
                        >
                            <Text style={styles.buttonText}>Choose Image</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {isGenerating && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.buttonPrimary || '#000'} />
                        <Text style={[styles.loadingText, { color: colors.text }]}>
                            {progress || 'Generating 3D avatar...'}
                        </Text>
                        <Text style={[styles.loadingSubtext, { color: colors.text }]}>
                            This may take 1-2 minutes. Please wait...
                        </Text>
                    </View>
                )}

                {error && !isGenerating && (
                    <View style={styles.errorContainer}>
                        <Text style={[styles.errorText, { color: '#FF3B30' }]}>{error}</Text>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.buttonPrimary || '#000' }]}
                            onPress={handleReset}
                        >
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {avatarModelUrl && !isGenerating && (
                    <View style={styles.avatarContainer}>
                        <Avatar3D modelUrl={avatarModelUrl} scale={1.5} position={[0, -1, 0]} />
                        <TouchableOpacity
                            style={[styles.button, styles.resetButton, { borderColor: colors.buttonPrimary || '#000' }]}
                            onPress={handleReset}
                        >
                            <Text style={[styles.buttonText, { color: colors.buttonPrimary || '#000' }]}>
                                Generate New Avatar
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {selectedImageUri && !avatarModelUrl && !isGenerating && !error && (
                    <View style={styles.previewContainer}>
                        <Image 
                            source={{ uri: selectedImageUri }} 
                            style={styles.previewImage}
                            resizeMode="contain"
                        />
                        <Text style={[styles.previewText, { color: colors.text }]}>
                            Your image is ready. Processing will start automatically...
                        </Text>
                    </View>
                )}
            </View>
            <CustomTabBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: scaleFontSize(24),
        paddingTop: scaleFontSize(20),
    },
    title: {
        fontSize: scaleFontSize(28),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(8),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(32),
        textAlign: 'center',
        opacity: 0.7,
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scaleFontSize(40),
    },
    placeholderText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(24),
        textAlign: 'center',
    },
    button: {
        paddingHorizontal: scaleFontSize(32),
        paddingVertical: scaleFontSize(16),
        borderRadius: scaleFontSize(8),
        minWidth: scaleFontSize(200),
        alignItems: 'center',
    },
    resetButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        marginTop: scaleFontSize(16),
    },
    buttonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
        color: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scaleFontSize(40),
    },
    loadingText: {
        fontSize: scaleFontSize(18),
        fontFamily: FONTS.nunitoBold,
        marginTop: scaleFontSize(16),
        textAlign: 'center',
    },
    loadingSubtext: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(8),
        textAlign: 'center',
        opacity: 0.7,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scaleFontSize(40),
    },
    errorText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(24),
        textAlign: 'center',
    },
    avatarContainer: {
        flex: 1,
        width: '100%',
        height: height * 0.6,
        marginTop: scaleFontSize(20),
        borderRadius: scaleFontSize(12),
        overflow: 'hidden',
    },
    previewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scaleFontSize(40),
    },
    previewImage: {
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: scaleFontSize(12),
        marginBottom: scaleFontSize(20),
    },
    previewText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        paddingHorizontal: scaleFontSize(20),
    },
});

