import { Product } from '@/src/services/modules/conversations/conversationTypes';

/**
 * A Look contains products and optionally a lightX generated image URL.
 * Used for conversation look cards and detail view.
 */
export interface Look {
    products: Product[];
    /** Grouped products (wardrobe + online). Each inner array = one "option" row. */
    productGroups?: Product[][];
    /** Titles for productGroups, e.g. ["Option 1", "Option 2"]. */
    groupTitles?: string[];
    lightXImageUrl?: string;
    lightXError?: string;
}
