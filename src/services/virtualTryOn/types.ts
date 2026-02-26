/**
 * Shared result type for virtual try-on services (LightX, Google Vertex AI, etc.).
 */
export interface VirtualTryOnResult {
    success: boolean;
    outputImageUrl?: string;
    error?: string;
}
