export interface StylistInfo {
    id: string;
    name: string;
    avatar_url: string | null;
}

export interface Conversation {
    id: string;
    user_id: string;
    stylist: StylistInfo;
    last_message_at: string;
    created_at: string;
    updated_at: string;
}

// Product type from API response
export interface Product {
    id: string;
    title: string;
    price: string;  // e.g., "$53.00" or "Already owned"
    currency: string;  // e.g., "USD" or "N/A"
    image_url: string;
    product_url: string | null;  // null for wardrobe items
    brand: string;
    retailer: string;
    available: boolean;
    description: string | null;
    is_clothing?: boolean;  // Indicates if the item is clothing (for LightX try-on); from API for online products
}

// Wardrobe item type (similar to Product but from wardrobe)
export interface WardrobeItem {
    id: string;
    title: string;
    price: string;
    currency: string;
    image_url: string;  // relative path, needs base URL concatenation
    product_url: null;
    brand: string;
    retailer: string;
    available: boolean;
    description: string | null;
    source: string;  // "wardrobe"
    wardrobe_item_id: string;
    is_clothing?: boolean;  // Indicates if the item is clothing (for LightX generation)
    tags?: Array<{ name: string; category: string }>;
    tags_by_category?: Record<string, string[]>;
}

// Tool output structure
export interface ToolOutput {
    products?: Product[];
    wardrobe_items?: WardrobeItem[];
    query?: string;
    request_count?: number;
    total_found?: number;
    error?: string;
}

// Tool call structure
export interface ToolCall {
    tool_name: string;
    tool_input?: {
        query?: string;
        limit?: number;
        brands?: string[];
        style?: string;
    };
    tool_output?: ToolOutput;
}

// Message metadata structure
export interface MessageMetadata {
    tool_calls?: ToolCall[];
    rag_context?: any | null;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    message_type: 'text' | 'voice';
    audio_url: string | null;
    created_at: string;
    metadata?: MessageMetadata;
}

export interface ConversationsResponse {
    success: boolean;
    data: Conversation[];
}

export interface ConversationResponse {
    success: boolean;
    data: Conversation;
}

export interface MessagesResponse {
    success: boolean;
    data: Message[];
}

export interface SendMessageRequest {
    message: {
        content: string;
        message_type?: 'text' | 'voice';
        audio_url?: string | null;
    };
}

export interface SendMessageResponse {
    success: boolean;
    message: string;
    data: {
        user_message: Message;
        assistant_message: Message;
        conversation_id: string;
    };
    status: number;
}

export interface CreateConversationRequest {
    stylist_id: string;
}

export interface CreateConversationResponse {
    success: boolean;
    message: string;
    data: Conversation;
    status: number;
}

