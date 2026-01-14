import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '@/src/constants/api';
import { 
    StylePhoto, 
    UploadStylePhotoRequest, 
    BulkUploadStylePhotosRequest,
    UpdateStylePhotoRequest,
    UploadStylePhotoResponse,
    BulkUploadStylePhotosResponse,
    UpdateStylePhotoResponse,
    DeleteStylePhotoResponse
} from './stylePhotosTypes';

const prepareImageFormData = (imageUri: string, position?: number): FormData => {
    const formData = new FormData();
    
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    let type = 'image/jpeg';
    if (match) {
        const ext = match[1].toLowerCase();
        if (ext === 'png') type = 'image/png';
        else if (ext === 'jpg' || ext === 'jpeg') type = 'image/jpeg';
        else if (ext === 'gif') type = 'image/gif';
        else if (ext === 'webp') type = 'image/webp';
    }
    
    const fileUri = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
    
    const fileObject = {
        uri: fileUri,
        type: type,
        name: filename,
    };
    
    // API expects: style_photo[image] for the image file
    // API expects: style_photo[position] for optional position
    formData.append('style_photo[image]', fileObject as any);
    
    // Add position if provided (API will auto-assign if not provided)
    if (position !== undefined) {
        formData.append('style_photo[position]', position.toString());
    }
    
    return formData;
};

const prepareBulkUploadFormData = (imageUris: string[]): FormData => {
    const formData = new FormData();
    
    imageUris.forEach((imageUri, index) => {
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        let type = 'image/jpeg';
        if (match) {
            const ext = match[1].toLowerCase();
            if (ext === 'png') type = 'image/png';
            else if (ext === 'jpg' || ext === 'jpeg') type = 'image/jpeg';
            else if (ext === 'gif') type = 'image/gif';
            else if (ext === 'webp') type = 'image/webp';
        }
        
        const fileUri = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
        
        const fileObject = {
            uri: fileUri,
            type: type,
            name: filename,
        };
        
        formData.append('photos[]', fileObject as any);
    });
    
    return formData;
};

export const stylePhotosApi = {
    getStylePhotos: async (): Promise<StylePhoto[]> => {
        return await apiClient.get<StylePhoto[]>(API_ENDPOINTS.STYLE_PHOTOS.ALL);
    },

    uploadStylePhoto: async (imageUri: string, position?: number): Promise<StylePhoto> => {
        const formData = prepareImageFormData(imageUri, position);
        
        return await apiClient.post<StylePhoto>(
            API_ENDPOINTS.STYLE_PHOTOS.ALL,
            formData
        );
    },

    bulkUploadStylePhotos: async (imageUris: string[]): Promise<StylePhoto[]> => {
        const formData = prepareBulkUploadFormData(imageUris);
        return await apiClient.post<StylePhoto[]>(
            API_ENDPOINTS.STYLE_PHOTOS.BULK_UPLOAD,
            formData
        );
    },

    updateStylePhoto: async (id: string, position: number): Promise<StylePhoto> => {
        return await apiClient.patch<StylePhoto>(
            API_ENDPOINTS.STYLE_PHOTOS.UPDATE(id),
            {
                style_photo: {
                    position,
                },
            }
        );
    },

    deleteStylePhoto: async (id: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.STYLE_PHOTOS.DELETE(id));
    },
};

