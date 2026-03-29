import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import {
  requestImagePermissions,
  pickImageFromGallery,
  pickMultipleImagesFromGallery,
  takePhotoWithCamera,
  showImageSourceDialog,
} from '../imagePickerService';

jest.mock('expo-image-picker');

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('imagePickerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestImagePermissions', () => {
    it('should return true when permissions are granted', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await requestImagePermissions();

      expect(result).toBe(true);
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('should return false and show alert when camera permission is denied', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await requestImagePermissions();

      expect(result).toBe(false);
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should return false and show alert when media library permission is denied', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await requestImagePermissions();

      expect(result).toBe(false);
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should not show alert when showAlert is false', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await requestImagePermissions(false);

      expect(result).toBe(false);
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission error')
      );

      const result = await requestImagePermissions();

      expect(result).toBe(false);
    });
  });

  describe('pickImageFromGallery', () => {
    it('should successfully pick a single image', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://test-image.jpg' }],
      });

      const result = await pickImageFromGallery();

      expect(result.success).toBe(true);
      expect(result.uri).toBe('file://test-image.jpg');
      expect(result.uris).toBeUndefined();
    });

    it('should return error when permissions are not granted', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await pickImageFromGallery();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error when user cancels', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const result = await pickImageFromGallery();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle multiple selection when enabled', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          { uri: 'file://test1.jpg' },
          { uri: 'file://test2.jpg' },
        ],
      });

      const result = await pickImageFromGallery({ allowsMultipleSelection: true });

      expect(result.success).toBe(true);
      expect(result.uris).toEqual(['file://test1.jpg', 'file://test2.jpg']);
    });

    it('should handle errors', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockRejectedValue(
        new Error('Picker error')
      );

      const result = await pickImageFromGallery();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('pickMultipleImagesFromGallery', () => {
    it('should pick multiple images with limit', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          { uri: 'file://test1.jpg' },
          { uri: 'file://test2.jpg' },
        ],
      });

      const result = await pickMultipleImagesFromGallery(5);

      expect(result.success).toBe(true);
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          allowsMultipleSelection: true,
          selectionLimit: 5,
        })
      );
    });
  });

  describe('takePhotoWithCamera', () => {
    it('should successfully take a photo', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://camera-photo.jpg' }],
      });

      const result = await takePhotoWithCamera();

      expect(result.success).toBe(true);
      expect(result.uri).toBe('file://camera-photo.jpg');
    });

    it('should return error when permissions are not granted', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await takePhotoWithCamera();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error when user cancels', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const result = await takePhotoWithCamera();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle errors', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockRejectedValue(
        new Error('Camera error')
      );

      const result = await takePhotoWithCamera();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('showImageSourceDialog', () => {
    it('should show dialog with take photo and choose from gallery options', () => {
      const onTakePhoto = jest.fn();
      const onPickFromGallery = jest.fn();

      showImageSourceDialog(onTakePhoto, onPickFromGallery);

      expect(Alert.alert).toHaveBeenCalled();
      const callArgs = (Alert.alert as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBeDefined();
      expect(callArgs[1]).toBeDefined();
      expect(callArgs[2]).toHaveLength(3); // Take Photo, Choose from Gallery, Cancel
    });

    it('should include remove option when provided', () => {
      const onTakePhoto = jest.fn();
      const onPickFromGallery = jest.fn();
      const onRemove = jest.fn();

      showImageSourceDialog(onTakePhoto, onPickFromGallery, onRemove);

      expect(Alert.alert).toHaveBeenCalled();
      const callArgs = (Alert.alert as jest.Mock).mock.calls[0];
      expect(callArgs[2]).toHaveLength(4); // Take Photo, Choose from Gallery, Remove, Cancel
    });

    it('should use custom title when provided', () => {
      const onTakePhoto = jest.fn();
      const onPickFromGallery = jest.fn();
      const customTitle = 'Custom Title';

      showImageSourceDialog(onTakePhoto, onPickFromGallery, undefined, customTitle);

      expect(Alert.alert).toHaveBeenCalled();
      const callArgs = (Alert.alert as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBe(customTitle);
    });
  });
});

