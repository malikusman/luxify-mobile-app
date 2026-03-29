export interface WardrobeItemTag {
    id: string;
    name: string;
    category: string;
}

export interface WardrobeItemTagsByCategory {
    clothing_type?: string[];
    color?: string[];
    style?: string[];
    fabric?: string[];
    pattern?: string[];
    sleeve_type?: string[];
}

export interface WardrobeItem {
    id: string;
    user_id: string;
    name: string | null;
    notes: string | null;
    is_active: boolean;
    image_url: string;
    thumbnail_url: string;
    medium_url: string;
    tags: WardrobeItemTag[];
    tags_by_category: WardrobeItemTagsByCategory;
    created_at: string;
    updated_at: string;
}

export interface WardrobeItemsResponse {
    success: boolean;
    data: WardrobeItem[];
}

export interface WardrobeItemResponse {
    success: boolean;
    data: WardrobeItem;
}

export interface CreateWardrobeItemRequest {
    image: {
        uri: string;
        type: string;
        name: string;
    };
    name?: string;
    notes?: string;
}

export interface BulkCreateWardrobeItemsRequest {
    images: Array<{
        uri: string;
        type: string;
        name: string;
    }>;
}

export interface UpdateWardrobeItemRequest {
    wardrobe_item: {
        name?: string;
        notes?: string;
    };
    tag_ids?: string[];
}

export interface CreateWardrobeItemResponse {
    success: boolean;
    message: string;
    data: WardrobeItem;
}

export interface BulkCreateWardrobeItemsResponse {
    success: boolean;
    message: string;
    data: WardrobeItem[];
}

export interface UpdateWardrobeItemResponse {
    success: boolean;
    message: string;
    data: WardrobeItem;
}

export interface DeleteWardrobeItemResponse {
    success: boolean;
    message: string;
}

