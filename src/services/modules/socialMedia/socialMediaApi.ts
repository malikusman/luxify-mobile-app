import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '@/src/constants/api';
import { SocialPlatform } from './socialMediaService';

export interface SocialMediaPhoto {
    id: string;
    url: string;
    thumbnailUrl?: string;
    timestamp?: string;
    caption?: string;
}

export interface FetchPhotosResponse {
    success: boolean;
    photos: SocialMediaPhoto[];
    error?: string;
}

export interface SaveSelectedPhotosRequest {
    platform: SocialPlatform;
    photoIds: string[];
}

export interface SaveSelectedPhotosResponse {
    success: boolean;
    message: string;
    savedPhotos: SocialMediaPhoto[];
}

export const socialMediaApi = {
    fetchPhotos: async (
        platform: SocialPlatform,
        accessToken: string,
        instagramAccountId?: string
    ): Promise<FetchPhotosResponse> => {
        try {
            if (platform === 'instagram') {
                return await socialMediaApi.fetchInstagramPhotosDirect(accessToken, instagramAccountId);
            }

            return await apiClient.post<FetchPhotosResponse>(
                `${API_ENDPOINTS.SOCIAL_MEDIA.FETCH_PHOTOS}/${platform}`,
                { access_token: accessToken }
            );
        } catch (error: any) {
            return {
                success: false,
                photos: [],
                error: error.message || 'Failed to fetch photos',
            };
        }
    },

    fetchInstagramPhotosDirect: async (
        accessToken: string,
        instagramAccountId?: string
    ): Promise<FetchPhotosResponse> => {
        try {
            if (!accessToken) {
                return {
                    success: false,
                    photos: [],
                    error: 'Access token is required',
                };
            }

            let accountId = instagramAccountId;
            
            if (!accountId) {
                const pagesResponse = await fetch(
                    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}&fields=instagram_business_account`
                );
                const pagesData = await pagesResponse.json();
                
                if (!pagesData.error && pagesData.data && pagesData.data.length > 0) {
                    const pageWithInstagram = pagesData.data.find((page: any) => page.instagram_business_account);
                    if (pageWithInstagram?.instagram_business_account?.id) {
                        accountId = pageWithInstagram.instagram_business_account.id;
                    }
                }
            }

            if (!accountId) {
                return {
                    success: false,
                    photos: [],
                    error: 'Instagram Business Account ID not found. Please connect an Instagram Business Account to your Facebook Page.',
                };
            }

            const apiUrl = `https://graph.facebook.com/v18.0/${accountId}/media?fields=id,media_type,media_url,thumbnail_url,timestamp,caption,permalink&access_token=${accessToken}&limit=25`;
            
            const mediaResponse = await fetch(apiUrl);
            const mediaData = await mediaResponse.json();

            if (mediaData.error) {
                return {
                    success: false,
                    photos: [],
                    error: mediaData.error.message || 'Failed to fetch media',
                };
            }

            const photos: SocialMediaPhoto[] = (mediaData.data || [])
                .filter((item: any) => {
                    const mediaType = item.media_type;
                    return mediaType === 'IMAGE' || mediaType === 'CAROUSEL_ALBUM';
                })
                .map((item: any) => ({
                    id: item.id,
                    url: item.media_url || '',
                    thumbnailUrl: item.thumbnail_url || item.media_url || '',
                    timestamp: item.timestamp || '',
                    caption: item.caption || '',
                }));

            return {
                success: true,
                photos,
            };
        } catch (error: any) {
            return {
                success: false,
                photos: [],
                error: error.message || 'Failed to fetch Instagram photos',
            };
        }
    },

    saveSelectedPhotos: async (
        data: SaveSelectedPhotosRequest
    ): Promise<SaveSelectedPhotosResponse> => {
        return await apiClient.post<SaveSelectedPhotosResponse>(
            API_ENDPOINTS.SOCIAL_MEDIA.SAVE_PHOTOS,
            data
        );
    },
};

