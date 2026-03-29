export interface StylePhoto {
    id: string;
    image_url: string;
    position: number;
    created_at: string;
    updated_at: string;
}

export interface StylePhotosResponse {
    success: boolean;
    data: StylePhoto[];
}

export interface StylePhotoResponse {
    success: boolean;
    data: StylePhoto;
}

export interface UploadStylePhotoRequest {
    image: {
        uri: string;
        type: string;
        name: string;
    };
}

export interface BulkUploadStylePhotosRequest {
    photos: Array<{
        uri: string;
        type: string;
        name: string;
    }>;
}

export interface UpdateStylePhotoRequest {
    style_photo: {
        position: number;
    };
}

export interface UploadStylePhotoResponse {
    success: boolean;
    message: string;
    data: StylePhoto;
}

export interface BulkUploadStylePhotosResponse {
    success: boolean;
    message: string;
    data: StylePhoto[];
}

export interface UpdateStylePhotoResponse {
    success: boolean;
    message: string;
    data: StylePhoto;
}

export interface DeleteStylePhotoResponse {
    success: boolean;
    message: string;
}

