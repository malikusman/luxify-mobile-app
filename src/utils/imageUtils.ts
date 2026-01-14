import * as FileSystem from 'expo-file-system/legacy';

export const convertImageToBase64 = async (uri: string): Promise<string | null> => {
    try {
        const isLocalFileUri = uri.startsWith('file://') || uri.startsWith('/');
        
        if (isLocalFileUri) {
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            
            const mimeType = getMimeTypeFromUri(uri);
            
            return `data:${mimeType};base64,${base64}`;
        } else {
            if (uri.startsWith('data:')) {
                return uri;
            }
            return uri;
        }
    } catch (error) {
        console.error('Error converting image to base64:', error);
        return null;
    }
};

const getMimeTypeFromUri = (uri: string): string => {
    const extension = uri.split('.').pop()?.toLowerCase();
    
    switch (extension) {
        case 'png':
            return 'image/png';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'gif':
            return 'image/gif';
        case 'webp':
            return 'image/webp';
        default:
            return 'image/jpeg';
    }
};

export const isLocalFile = (uri: string | null): boolean => {
    if (!uri) return false;
    return uri.startsWith('file://') || uri.startsWith('/');
};

