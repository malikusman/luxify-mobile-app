export interface FavoriteBrand {
    id: string;
    brand_id: string;
    brand?: {
        id: string;
        name: string;
        logo_url: string;
        description: string;
        is_active: boolean;
    };
    created_at: string;
    updated_at: string;
}

export interface AddFavoriteBrandRequest {
    favorite_brand: {
        brand_id: string;
    };
}

export interface FavoriteBrandsResponse {
    success: boolean;
    data: FavoriteBrand[];
}

