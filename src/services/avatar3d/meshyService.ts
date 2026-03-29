export interface MeshyAvatarResponse {
    success: boolean;
    modelUrl?: string;
    taskId?: string;
    error?: string;
}

const MESHY_API_BASE_URL = 'https://api.meshy.ai/v2';

const getApiKey = (): string | undefined => {
    try {
        const Constants = require('expo-constants').default;
        return Constants.expoConfig?.extra?.meshyApiKey;
    } catch (error) {
        return undefined;
    }
};

const prepareImageFormData = (imageUri: string): FormData => {
    const formData = new FormData();
    
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    let type = 'image/jpeg';
    if (match) {
        const ext = match[1].toLowerCase();
        if (ext === 'png') type = 'image/png';
        else if (ext === 'jpg' || ext === 'jpeg') type = 'image/jpeg';
        else if (ext === 'gif') type = 'image/gif';
        else if (ext === 'webp') type = 'image/webp';
    }
    
    const fileUri = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
    
    const fileObject = {
        uri: fileUri,
        type: type,
        name: filename,
    };
    
    formData.append('image', fileObject as any);
    
    return formData;
};

export const generateAvatarFromImage = async (
    imageUri: string,
    apiKey?: string
): Promise<MeshyAvatarResponse> => {
    try {
        const finalApiKey = apiKey || getApiKey();
        
        if (!finalApiKey) {
            return {
                success: false,
                error: 'Meshy API key is required. Please set meshyApiKey in app.json',
            };
        }

        const formData = prepareImageFormData(imageUri);

        const submitResponse = await fetch(`${MESHY_API_BASE_URL}/image-to-3d`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${finalApiKey}`,
            },
            body: formData,
        });

        if (!submitResponse.ok) {
            const errorText = await submitResponse.text();
            let errorData: any = {};
            
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText || `HTTP ${submitResponse.status}` };
            }
            
            if (submitResponse.status === 401) {
                return {
                    success: false,
                    error: 'Meshy AI authentication failed. Please check your API key.',
                };
            }
            
            return {
                success: false,
                error: errorData.message || errorData.error || `Meshy API error: ${submitResponse.status}`,
            };
        }

        const submitData = await submitResponse.json();
        const taskId = submitData.result || submitData.task_id || submitData.id;
        
        if (!taskId) {
            return {
                success: false,
                error: 'Failed to get task ID from Meshy AI',
            };
        }

        const modelUrl = await pollForAvatarCompletion(taskId, finalApiKey);
        
        if (!modelUrl) {
            return {
                success: false,
                error: 'Avatar generation timed out or failed',
                taskId: taskId,
            };
        }

        return {
            success: true,
            modelUrl: modelUrl,
            taskId: taskId,
        };
    } catch (error: any) {
        console.error('Error generating avatar with Meshy AI:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate avatar with Meshy AI',
        };
    }
};

const pollForAvatarCompletion = async (
    taskId: string,
    apiKey: string,
    maxAttempts: number = 60,
    pollInterval: number = 5000
): Promise<string | null> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const response = await fetch(`${MESHY_API_BASE_URL}/image-to-3d/${taskId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            if (!response.ok) {
                console.error(`Polling attempt ${attempt + 1} failed: ${response.status}`);
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                continue;
            }

            const data = await response.json();
            
            const status = data.status || data.progress_status || data.state;
            const modelUrl = data.model_urls?.glb || 
                           data.model_urls?.gltf ||
                           data.model_url ||
                           data.result?.model_urls?.glb ||
                           data.result?.model_url ||
                           data.glb_url ||
                           data.url;

            if (status === 'SUCCEEDED' || status === 'COMPLETED' || status === 'DONE') {
                if (modelUrl) {
                    return modelUrl;
                }
            }

            if (status === 'FAILED' || status === 'ERROR') {
                return null;
            }

            if (status === 'PENDING' || status === 'PROCESSING' || status === 'IN_PROGRESS') {
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                continue;
            }

            if (modelUrl) {
                return modelUrl;
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
        } catch (error) {
            console.error(`Polling error on attempt ${attempt + 1}:`, error);
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
    }

    return null;
};

export const getTaskStatus = async (
    taskId: string,
    apiKey?: string
): Promise<MeshyAvatarResponse> => {
    try {
        const finalApiKey = apiKey || getApiKey();
        
        if (!finalApiKey) {
            return {
                success: false,
                error: 'Meshy API key is required',
            };
        }

        const response = await fetch(`${MESHY_API_BASE_URL}/image-to-3d/${taskId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${finalApiKey}`,
            },
        });

        if (!response.ok) {
            return {
                success: false,
                error: `Failed to get task status: ${response.status}`,
            };
        }

        const data = await response.json();
        const modelUrl = data.model_urls?.glb || 
                        data.model_urls?.gltf ||
                        data.model_url ||
                        data.result?.model_urls?.glb ||
                        data.result?.model_url ||
                        data.glb_url ||
                        data.url;

        return {
            success: !!modelUrl,
            modelUrl: modelUrl || undefined,
            taskId: taskId,
            error: modelUrl ? undefined : 'Model not ready yet',
        };
    } catch (error: any) {
        console.error('Error getting task status:', error);
        return {
            success: false,
            error: error.message || 'Failed to get task status',
        };
    }
};

