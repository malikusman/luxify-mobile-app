import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/context/store';
import { addImage, addMultipleImages } from '@/src/context/slices/closetSlice';
import { pickMultipleImagesFromGallery } from '@/src/services/imagePickerService';
import { LIMITS, IMAGE_QUALITY } from '@/src/constants/constants';

export default function AddToClosetScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const t = translations.closet;
    const { images, maxImages } = useSelector((state: RootState) => state.closet);
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraType, setCameraType] = useState<CameraType>('back');
    const cameraRef = useRef<CameraView>(null);
    
    const remainingSlots = maxImages - images.length;

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    const handleClose = () => {
        router.back();
    };

    const handleTakePhoto = async () => {
        if (remainingSlots <= 0) {
            Alert.alert(t.maximumReached);
            return;
        }

        if (!cameraRef.current) {
            return;
        }

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: IMAGE_QUALITY.DEFAULT,
            });

            if (photo?.uri) {
                dispatch(addImage(photo.uri));
                router.back();
            }
        } catch (error) {
            Alert.alert(translations.common.error, 'Failed to take photo. Please try again.');
        }
    };

    const handlePickFromGallery = async () => {
        if (remainingSlots <= 0) {
            Alert.alert(t.maximumReached);
            return;
        }

        const maxToSelect = Math.min(remainingSlots, LIMITS.MAX_PHOTOS_SELECT);
        const result = await pickMultipleImagesFromGallery(maxToSelect);
        
        if (result.success) {
            if (result.uris && result.uris.length > 0) {
                dispatch(addMultipleImages(result.uris));
                router.back();
            } else if (result.uri) {
                dispatch(addImage(result.uri));
                router.back();
            }
        } else if (result.error) {
            Alert.alert(translations.common.error, result.error);
        }
    };

    const handleFlipCamera = () => {
        setCameraType((current: CameraType) => (current === 'back' ? 'front' : 'back'));
    };

    if (!permission) {
        return <View style={styles.wrapper} />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.wrapper, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={[styles.errorText, { color: colors.text }]}>
                    Camera permission is required
                </Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={[styles.permissionButtonText, { color: colors.buttonPrimary }]}>
                        Grant Permission
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.wrapper}>
            <StatusBar style="light" />
            <View style={[styles.statusBarBackground, { height: insets.top }]} />
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={cameraType}
            >
                <View style={[styles.header, { paddingTop: insets.top }]}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>{t.close}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.infoBox}>
                        <Text style={styles.title}>{t.addToClosetTitle}</Text>
                        <Text style={styles.description}>{t.addToClosetDescription}</Text>
                    </View>
                </View>

                <View style={[styles.controls, { paddingBottom: insets.bottom }]}>
                    <TouchableOpacity onPress={handlePickFromGallery} style={styles.controlButton}>
                        <Text style={styles.controlText}>{t.photos}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={handleTakePhoto} style={styles.shutterButton}>
                        <View style={styles.shutterInner} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={handleFlipCamera} style={styles.controlButton}>
                        <Text style={styles.controlText}>{t.flip}</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    statusBarBackground: {
        backgroundColor: 'transparent',
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 10,
    },
    camera: {
        flex: 1,
    },
    header: {
        paddingHorizontal: scaleFontSize(20),
        paddingTop: scaleFontSize(12),
        alignItems: 'flex-end',
        zIndex: 10,
    },
    closeButton: {
        padding: scaleFontSize(8),
    },
    closeText: {
        color: '#FFFFFF',
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
        letterSpacing: scaleFontSize(1),
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(24),
    },
    infoBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: scaleFontSize(12),
        padding: scaleFontSize(24),
        maxWidth: '90%',
    },
    title: {
        fontSize: scaleFontSize(24),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        color: '#FFFFFF',
        marginBottom: scaleFontSize(16),
        textAlign: 'center',
    },
    description: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        color: '#FFFFFF',
        lineHeight: scaleFontSize(24),
        textAlign: 'center',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(24),
        paddingBottom: scaleFontSize(20),
        paddingTop: scaleFontSize(20),
    },
    controlButton: {
        padding: scaleFontSize(12),
    },
    controlText: {
        color: '#FFFFFF',
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoBold,
        letterSpacing: scaleFontSize(1),
    },
    shutterButton: {
        width: scaleFontSize(70),
        height: scaleFontSize(70),
        borderRadius: scaleFontSize(35),
        borderWidth: scaleFontSize(3),
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    shutterInner: {
        width: scaleFontSize(60),
        height: scaleFontSize(60),
        borderRadius: scaleFontSize(30),
        backgroundColor: '#FFFFFF',
    },
    errorText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        marginBottom: scaleFontSize(16),
    },
    permissionButton: {
        padding: scaleFontSize(12),
        borderRadius: scaleFontSize(8),
    },
    permissionButtonText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
    },
});

