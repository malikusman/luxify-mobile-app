export interface Stylist {
    id: string;
    name: string;
    personality_description: string;
    avatar_url?: string | null;
    specialization?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface StylistsResponse {
    success: boolean;
    data: Stylist[];
}

export interface StylistResponse {
    success: boolean;
    data: Stylist;
}

export interface MyStylistResponse {
    success: boolean;
    data: {
        user_stylist: {
            id: string;
            user_id: string;
            stylist_id: string;
            selected_at: string;
            is_active: boolean;
            created_at: string;
        };
        stylist: Stylist;
    } | null;
    message: string | null;
}

export interface SelectStylistResponse {
    success: boolean;
    message: string;
    data: Stylist;
}

export interface DeselectStylistResponse {
    success: boolean;
    message: string;
}

