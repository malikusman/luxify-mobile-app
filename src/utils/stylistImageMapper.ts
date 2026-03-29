import { ImageSourcePropType } from 'react-native';

/**
 * Maps a stylist name to the corresponding static image
 * Maps: AVA/Ava -> AVA.jpeg, Adrian -> Adrian.jpeg, Harper -> Harper.png, Celine -> Celine.png
 */
export function getStylistImage(stylistId: string | null | undefined, stylistIndex?: number, stylistName?: string | null): ImageSourcePropType {
    // First, try to map by stylist name (case-insensitive)
    if (stylistName) {
        const normalizedName = stylistName.trim().toLowerCase();
        
        if (normalizedName === 'ava') {
            return require('@/assets/AVA.jpeg');
        } else if (normalizedName === 'adrian') {
            return require('@/assets/Adrian.jpeg');
        } else if (normalizedName === 'harper') {
            return require('@/assets/Harper.png');
        } else if (normalizedName === 'celine') {
            return require('@/assets/Celine.png');
        }
    }

    // Fallback to old behavior if name mapping fails
    if (!stylistId) {
        return require('@/assets/AVA.jpeg');
    }

    // If index is provided, use it directly for consistent mapping
    if (stylistIndex !== undefined) {
        const imageIndex = stylistIndex % 4;
        switch (imageIndex) {
            case 0:
                return require('@/assets/AVA.jpeg');
            case 1:
                return require('@/assets/Adrian.jpeg');
            case 2:
                return require('@/assets/Harper.png');
            case 3:
                return require('@/assets/Celine.png');
            default:
                return require('@/assets/AVA.jpeg');
        }
    }

    // Fallback: Improved hash function using FNV-1a algorithm for better distribution
    let hash = 2166136261; // FNV offset basis
    for (let i = 0; i < stylistId.length; i++) {
        const char = stylistId.charCodeAt(i);
        hash ^= char;
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    
    // Convert to positive and map to one of 4 images
    const imageIndex = Math.abs(hash) % 4;
    
    switch (imageIndex) {
        case 0:
            return require('@/assets/AVA.jpeg');
        case 1:
            return require('@/assets/Adrian.jpeg');
        case 2:
            return require('@/assets/Harper.png');
        case 3:
            return require('@/assets/Celine.png');
        default:
            return require('@/assets/AVA.jpeg');
    }
}

