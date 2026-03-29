import { WardrobeItem } from '@/src/services/modules/wardrobeItems/wardrobeItemsTypes';
import { ClosetItem } from '@/src/context/slices/closetSlice';

/**
 * Maps a WardrobeItem from the API to a ClosetItem for local state
 */
export const mapWardrobeItemToClosetItem = (wardrobeItem: WardrobeItem): ClosetItem => {
    // Extract category from tags_by_category.clothing_type (take first item)
    const category = wardrobeItem.tags_by_category?.clothing_type?.[0] || undefined;
    
    // Extract color from tags_by_category.color (take first item)
    const color = wardrobeItem.tags_by_category?.color?.[0] || undefined;
    
    // Extract style/fit from tags_by_category.style (take first item)
    const fit = wardrobeItem.tags_by_category?.style?.[0] || undefined;
    
    // Use medium_url or thumbnail_url as fallback, then image_url
    const imageUri = wardrobeItem.medium_url || wardrobeItem.thumbnail_url || wardrobeItem.image_url;
    
    return {
        id: wardrobeItem.id,
        imageUri: imageUri,
        category: category,
        itemName: wardrobeItem.name || undefined,
        color: color,
        fit: fit,
        // Note: size and brandName are not available in the API response
        // They would need to be added manually or through the update API
        size: undefined,
        brandName: undefined,
        timestamp: new Date(wardrobeItem.created_at).getTime(),
    };
};

/**
 * Maps an array of WardrobeItems to ClosetItems
 */
export const mapWardrobeItemsToClosetItems = (wardrobeItems: WardrobeItem[]): ClosetItem[] => {
    return wardrobeItems.map(mapWardrobeItemToClosetItem);
};

