import Constants from 'expo-constants';
import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '@/src/constants/api';
import { 
    WardrobeItem, 
    CreateWardrobeItemRequest, 
    BulkCreateWardrobeItemsRequest,
    UpdateWardrobeItemRequest,
    CreateWardrobeItemResponse,
    BulkCreateWardrobeItemsResponse,
    UpdateWardrobeItemResponse,
    DeleteWardrobeItemResponse
} from './wardrobeItemsTypes';

const getBackendUrl = (): string => {
    return Constants.expoConfig?.extra?.backendUrl || 'https://luxify.pebbleintelligentsolutions.com';
};

const getFullImageUrl = (relativeUrl: string | null | undefined): string => {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('http')) return relativeUrl;
    const backendUrl = getBackendUrl();
    return `${backendUrl}${relativeUrl}`;
};

const processWardrobeItem = (item: WardrobeItem): WardrobeItem => {
    return {
        ...item,
        image_url: getFullImageUrl(item.image_url),
        thumbnail_url: getFullImageUrl(item.thumbnail_url),
        medium_url: getFullImageUrl(item.medium_url),
    };
};

const prepareImageFormData = (imageUri: string, name?: string, notes?: string): FormData => {
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
    
    formData.append('wardrobe_item[image]', fileObject as any);
    
    if (name) {
        formData.append('wardrobe_item[name]', name);
    }
    
    if (notes) {
        formData.append('wardrobe_item[notes]', notes);
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
        
        formData.append(`wardrobe_items[${index}][image]`, fileObject as any);
    });
    
    return formData;
};

export const wardrobeItemsApi = {
    getWardrobeItems: async (): Promise<WardrobeItem[]> => {
        const response = await apiClient.get<WardrobeItem[]>(
            API_ENDPOINTS.WARDROBE_ITEMS.ALL
        );
        
        const items = Array.isArray(response) ? response : [];
        
        return items.map(processWardrobeItem);
    },

    getWardrobeItem: async (id: string): Promise<WardrobeItem> => {
        const item = await apiClient.get<WardrobeItem>(
            API_ENDPOINTS.WARDROBE_ITEMS.GET(id)
        );
        
        return processWardrobeItem(item);
    },

    createWardrobeItem: async (
        imageUri: string, 
        name?: string, 
        notes?: string
    ): Promise<WardrobeItem> => {
        const formData = prepareImageFormData(imageUri, name, notes);
        
        const item = await apiClient.post<WardrobeItem>(
            API_ENDPOINTS.WARDROBE_ITEMS.ALL,
            formData
        );
        
        return processWardrobeItem(item);
    },

    bulkCreateWardrobeItems: async (
        imageUris: string[]
    ): Promise<WardrobeItem[]> => {
        const formData = prepareBulkUploadFormData(imageUris);
        
        const response = await apiClient.post<WardrobeItem[]>(
            API_ENDPOINTS.WARDROBE_ITEMS.ALL,
            formData
        );
        
        const items = Array.isArray(response) ? response : [];
        
        return items.map(processWardrobeItem);
    },

    updateWardrobeItem: async (
        id: string, 
        updates: { name?: string; notes?: string; tagIds?: string[] }
    ): Promise<WardrobeItem> => {
        const requestBody: UpdateWardrobeItemRequest = {
            wardrobe_item: {},
        };
        
        if (updates.name !== undefined) {
            requestBody.wardrobe_item.name = updates.name;
        }
        
        if (updates.notes !== undefined) {
            requestBody.wardrobe_item.notes = updates.notes;
        }
        
        if (updates.tagIds !== undefined) {
            requestBody.tag_ids = updates.tagIds;
        }
        
        const item = await apiClient.patch<WardrobeItem>(
            API_ENDPOINTS.WARDROBE_ITEMS.UPDATE(id),
            requestBody
        );
        
        return processWardrobeItem(item);
    },

    deleteWardrobeItem: async (id: string): Promise<DeleteWardrobeItemResponse> => {
        const response = await apiClient.delete<DeleteWardrobeItemResponse>(
            API_ENDPOINTS.WARDROBE_ITEMS.DELETE(id)
        );
        
        if (response && typeof response === 'object' && 'success' in response) {
            return response;
        }
        
        return {
            success: true,
            message: 'Wardrobe item deleted successfully',
        };
    },
};

