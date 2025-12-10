export interface Brand {
    id: string;
    name: string;
    logo_url: string;
    description: string;
    is_active: boolean;
}

export interface BrandsResponse {
    success: boolean;
    data: Brand[];
}

