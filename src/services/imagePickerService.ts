import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { translations } from '@/src/constants/translations';

export interface ImagePickerOptions {
    quality?: number;
    allowsEditing?: boolean;
    allowsMultipleSelection?: boolean;
    selectionLimit?: number;
}

export interface ImagePickerResult {
    success: boolean;
    uri?: string;
    uris?: string[];
    error?: string;
}

export const requestImagePermissions = async (showAlert: boolean = true): Promise<boolean> => {
    try {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
            if (showAlert) {
                Alert.alert(
                    translations.imagePicker.permissionsRequired,
                    translations.imagePicker.permissionsMessage,
                    [{ text: translations.common.ok }]
                );
            }
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error requesting permissions:', error);
        return false;
    }
};

export const pickImageFromGallery = async (
    options: ImagePickerOptions = {}
): Promise<ImagePickerResult> => {
    try {
        const hasPermission = await requestImagePermissions();
        if (!hasPermission) {
            return {
                success: false,
                error: translations.imagePicker.permissionsNotGranted,
            };
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: options.quality ?? 0.8,
            allowsEditing: options.allowsEditing ?? false,
            allowsMultipleSelection: options.allowsMultipleSelection ?? false,
            selectionLimit: options.selectionLimit,
        });

        if (result.canceled) {
            return {
                success: false,
                error: translations.imagePicker.userCanceled,
            };
        }

        if (result.assets && result.assets.length > 0) {
            if (options.allowsMultipleSelection && result.assets.length > 1) {
                return {
                    success: true,
                    uris: result.assets.map(asset => asset.uri),
                };
            }
            return {
                success: true,
                uri: result.assets[0].uri,
            };
        }

        return {
            success: false,
            error: translations.imagePicker.noImageSelected,
        };
    } catch (error) {
        console.error('Error picking image:', error);
        return {
            success: false,
            error: translations.imagePicker.pickImageError,
        };
    }
};

export const pickMultipleImagesFromGallery = async (
    maxSelection: number,
    options: ImagePickerOptions = {}
): Promise<ImagePickerResult> => {
    return pickImageFromGallery({
        ...options,
        allowsMultipleSelection: true,
        selectionLimit: maxSelection,
    });
};

export const takePhotoWithCamera = async (
    options: ImagePickerOptions = {}
): Promise<ImagePickerResult> => {
    try {
        const hasPermission = await requestImagePermissions();
        if (!hasPermission) {
            return {
                success: false,
                error: translations.imagePicker.permissionsNotGranted,
            };
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: options.quality ?? 0.8,
            allowsEditing: options.allowsEditing ?? true,
        });

        if (result.canceled) {
            return {
                success: false,
                error: translations.imagePicker.userCanceled,
            };
        }

        if (result.assets && result.assets.length > 0) {
            return {
                success: true,
                uri: result.assets[0].uri,
            };
        }

        return {
            success: false,
            error: translations.imagePicker.noImageCaptured,
        };
    } catch (error) {
        console.error('Error taking photo:', error);
        return {
            success: false,
            error: translations.imagePicker.takePhotoError,
        };
    }
};

export const showImageSourceDialog = (
    onTakePhoto: () => void,
    onPickFromGallery: () => void,
    onRemove?: () => void,
    title?: string
): void => {
    const dialogTitle = title || translations.imagePicker.addPhoto;
    const buttons: any[] = [
        {
            text: translations.imagePicker.takePhoto,
            onPress: onTakePhoto,
        },
        {
            text: translations.imagePicker.chooseFromGallery,
            onPress: onPickFromGallery,
        },
    ];

    if (onRemove) {
        buttons.push({
            text: translations.common.remove,
            style: 'destructive' as const,
            onPress: onRemove,
        });
    }

    buttons.push({
        text: translations.common.cancel,
        style: 'cancel' as const,
    });

    Alert.alert(dialogTitle, translations.imagePicker.chooseOption, buttons);
};

