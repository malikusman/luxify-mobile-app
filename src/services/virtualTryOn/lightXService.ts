import * as FileSystem from 'expo-file-system/legacy';

// ==============================
// BASE64 DECODER POLYFILL (for React Native compatibility)
// ==============================

const base64Decode = (base64: string): string => {
    if (typeof atob !== 'undefined') {
        return atob(base64);
    }
    // Fallback for environments without atob
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = base64.replace(/=+$/, '');
    let output = '';
    
    if (str.length % 4 === 1) {
        throw new Error('Invalid base64 string');
    }
    
    for (let i = 0; i < str.length; i += 4) {
        const enc1 = chars.indexOf(str.charAt(i));
        const enc2 = chars.indexOf(str.charAt(i + 1));
        const enc3 = chars.indexOf(str.charAt(i + 2));
        const enc4 = chars.indexOf(str.charAt(i + 3));
        
        const chr1 = (enc1 << 2) | (enc2 >> 4);
        const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        const chr3 = ((enc3 & 3) << 6) | enc4;
        
        output += String.fromCharCode(chr1);
        
        if (enc3 !== 64) {
            output += String.fromCharCode(chr2);
        }
        if (enc4 !== 64) {
            output += String.fromCharCode(chr3);
        }
    }
    
    return output;
};

// ==============================
// TYPES
// ==============================

export interface LightXUploadResponse {
    success: boolean;
    imageUrl?: string;
    error?: string;
}

export interface LightXTryOnResponse {
    success: boolean;
    orderId?: string;
    avgResponseTimeInSec?: number;
    error?: string;
}

export interface LightXStatusResponse {
    success: boolean;
    status?: 'pending' | 'active' | 'failed';
    outputUrl?: string;
    error?: string;
}

export interface LightXTryOnResult {
    success: boolean;
    outputImageUrl?: string;
    error?: string;
}

// ==============================
// CONFIG
// ==============================

const BASE_URL = 'https://api.lightxeditor.com/external/api/v2';

const getApiKey = (): string | undefined => {
    try {
        const Constants = require('expo-constants').default;
        return Constants.expoConfig?.extra?.lightXApiKey;
    } catch (error) {
        return undefined;
    }
};

// ==============================
// HELPERS
// ==============================

const getContentType = (uri: string): string => {
    const ext = uri.toLowerCase().split('.').pop();
    return ext === 'png' ? 'image/png' : 'image/jpeg';
};

const getFileSize = async (uri: string): Promise<number> => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists && 'size' in fileInfo) {
            return fileInfo.size;
        }
        throw new Error('Could not get file size');
    } catch (error) {
        console.error('Error getting file size:', error);
        throw error;
    }
};

// ==============================
// UPLOAD IMAGE
// ==============================

export const uploadImage = async (imageUri: string): Promise<LightXUploadResponse> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            return {
                success: false,
                error: 'LightX API key is required. Please set lightXApiKey in app.json',
            };
        }

        // Check if the input is already a URL (remote image)
        const isRemoteUrl = imageUri.startsWith('http://') || imageUri.startsWith('https://');
        
        if (isRemoteUrl) {
            console.log(`✅ Using remote image URL: ${imageUri}`);
            // If it's already a URL, return it directly without uploading
            return {
                success: true,
                imageUrl: imageUri,
            };
        }

        console.log(`📤 Uploading local image: ${imageUri}`);

        const size = await getFileSize(imageUri);
        const contentType = getContentType(imageUri);

        // Step 1: Request upload URL
        const uploadUrlResponse = await fetch(`${BASE_URL}/uploadImageUrl`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            },
            body: JSON.stringify({
                uploadType: 'imageUrl',
                size: size,
                contentType: contentType,
            }),
        });

        if (!uploadUrlResponse.ok) {
            const errorText = await uploadUrlResponse.text();
            return {
                success: false,
                error: `Failed to get upload URL: ${uploadUrlResponse.status} - ${errorText}`,
            };
        }

        const uploadUrlData = await uploadUrlResponse.json();

        if (uploadUrlData.statusCode !== 2000) {
            return {
                success: false,
                error: uploadUrlData.message || 'Failed to get upload URL',
            };
        }

        const uploadUrl = uploadUrlData.body.uploadImage;
        const imageUrl = uploadUrlData.body.imageUrl;

        // Step 2: Upload binary file
        // Read file as base64 and convert to binary for upload
        const fileContent = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Convert base64 to binary (Uint8Array)
        const binaryString = base64Decode(fileContent);
        
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const putResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
                'Content-Length': size.toString(),
            },
            body: bytes,
        });

        if (!putResponse.ok) {
            return {
                success: false,
                error: `Failed to upload image: ${putResponse.status}`,
            };
        }


        console.log(`✅ Uploaded → ${imageUrl}`);
        return {
            success: true,
            imageUrl: imageUrl,
        };
    } catch (error: any) {
        console.error('Error uploading image:', error);
        return {
            success: false,
            error: error.message || 'Failed to upload image',
        };
    }
};

// ==============================
// CREATE TRY-ON ORDER
// ==============================

export const createTryOnOrder = async (
    personImageUrl: string,
    productImageUrl: string
): Promise<LightXTryOnResponse> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            return {
                success: false,
                error: 'LightX API key is required',
            };
        }

        console.log('👖 Creating virtual try-on order...');

        const response = await fetch(`${BASE_URL}/aivirtualtryon`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            },
            body: JSON.stringify({
                imageUrl: personImageUrl,
                styleImageUrl: productImageUrl,
                segmentationType: 2
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `Failed to create try-on order: ${response.status} - ${errorText}`,
            };
        }

        const data = await response.json();

        if (data.statusCode !== 2000) {
            return {
                success: false,
                error: data.message || 'Failed to create try-on order',
            };
        }

        const body = data.body;
        console.log(`📦 Order ID: ${body.orderId}`);
        console.log(`⏱ Avg time: ${body.avgResponseTimeInSec}s`);

        return {
            success: true,
            orderId: body.orderId,
            avgResponseTimeInSec: body.avgResponseTimeInSec,
        };
    } catch (error: any) {
        console.error('Error creating try-on order:', error);
        return {
            success: false,
            error: error.message || 'Failed to create try-on order',
        };
    }
};

// ==============================
// POLL STATUS
// ==============================

export const pollStatus = async (
    orderId: string,
    avgTimeInSec: number
): Promise<LightXStatusResponse> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            return {
                success: false,
                error: 'LightX API key is required',
            };
        }

        console.log('⏳ Waiting for result...');

        const maxRetries = Math.floor(avgTimeInSec / 3) + 10;
        const pollInterval = 3000; // 3 seconds

        for (let i = 0; i < maxRetries; i++) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));

            const response = await fetch(`${BASE_URL}/order-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                },
                body: JSON.stringify({ orderId }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Polling attempt ${i + 1} failed: ${response.status} - ${errorText}`);
                // Stop polling on HTTP error
                return {
                    success: false,
                    status: 'failed',
                    error: `HTTP error: ${response.status} - ${errorText}`,
                };
            }

            const data = await response.json();
            
            // Check if API returned an error statusCode (like 5044)
            if (data.statusCode && data.statusCode !== 2000) {
                const errorMessage = data.message || data.description || `API error: ${data.statusCode}`;
                console.error(`❌ Order status error: ${errorMessage}`);
                // Stop polling immediately on API error
                return {
                    success: false,
                    status: 'failed',
                    error: errorMessage,
                };
            }

            // Check if status is FAIL
            if (data.status === 'FAIL') {
                const errorMessage = data.message || data.description || 'Order processing failed';
                console.error(`❌ Order status FAIL: ${errorMessage}`);
                return {
                    success: false,
                    status: 'failed',
                    error: errorMessage,
                };
            }

            const status = data.body?.status;

            console.log(`🔄 Status: ${status}`);

            if (status === 'active') {
                return {
                    success: true,
                    status: 'active',
                    outputUrl: data.body.output,
                };
            }

            if (status === 'failed') {
                return {
                    success: false,
                    status: 'failed',
                    error: data.body?.error || 'Try-on failed',
                };
            }
        }

        return {
            success: false,
            error: 'Timed out waiting for try-on result',
        };
    } catch (error: any) {
        console.error('Error polling status:', error);
        return {
            success: false,
            error: error.message || 'Failed to poll status',
        };
    }
};

// ==============================
// MAIN FUNCTION
// ==============================

export const performVirtualTryOn = async (
    personImageUri: string,
    productImageUri: string
): Promise<LightXTryOnResult> => {
    try {
        console.log('\n==============================');
        console.log('🎨 LightX Virtual Try-On');
        console.log('==============================\n');

        // Step 1: Upload person image
        const personUploadResult = await uploadImage(personImageUri);
        if (!personUploadResult.success || !personUploadResult.imageUrl) {
            return {
                success: false,
                error: personUploadResult.error || 'Failed to upload person image',
            };
        }

        // Step 2: Upload product image
        const productUploadResult = await uploadImage(productImageUri);
        if (!productUploadResult.success || !productUploadResult.imageUrl) {
            return {
                success: false,
                error: productUploadResult.error || 'Failed to upload product image',
            };
        }

        // Step 3: Create try-on order
        const orderResult = await createTryOnOrder(
            personUploadResult.imageUrl,
            productUploadResult.imageUrl
        );
        if (!orderResult.success || !orderResult.orderId || !orderResult.avgResponseTimeInSec) {
            return {
                success: false,
                error: orderResult.error || 'Failed to create try-on order',
            };
        }

        // Step 4: Poll for status
        const statusResult = await pollStatus(
            orderResult.orderId,
            orderResult.avgResponseTimeInSec
        );
        if (!statusResult.success || !statusResult.outputUrl) {
            return {
                success: false,
                error: statusResult.error || 'Try-on processing failed',
            };
        }

        console.log('🎉 Virtual try-on completed successfully!');
        return {
            success: true,
            outputImageUrl: statusResult.outputUrl,
        };
    } catch (error: any) {
        console.error('Error performing virtual try-on:', error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred',
        };
    }
};

