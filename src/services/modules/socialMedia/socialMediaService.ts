import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok';

export interface SocialMediaAuthResult {
    success: boolean;
    accessToken?: string;
    userId?: string;
    error?: string;
}

export interface SocialMediaConfig {
    clientId: string;
    redirectUri: string;
    scopes: string[];
}

class SocialMediaService {
    private getRedirectUri(): string {
        const scheme = Constants.expoConfig?.scheme || 'luxify';
        const defaultRedirectUri = AuthSession.makeRedirectUri({
            scheme: typeof scheme === 'string' ? scheme : scheme[0],
        });
        
        return defaultRedirectUri;
    }

    private getInstagramConfig(): SocialMediaConfig {
        const facebookAppId = Constants.expoConfig?.extra?.facebookAppId || '';
        const redirectUri = this.getRedirectUri();
        
        const scopes = [
            'instagram_basic',
            'instagram_manage_messages',
            'instagram_manage_comments',
            'instagram_content_publish',
            'instagram_manage_insights',
            'pages_read_engagement',
            'pages_show_list',
        ];
        
        return {
            clientId: facebookAppId,
            redirectUri: redirectUri,
            scopes: scopes,
        };
    }

    private getFacebookConfig(): SocialMediaConfig {
        const appId = Constants.expoConfig?.extra?.facebookAppId || '';
        return {
            clientId: appId,
            redirectUri: this.getRedirectUri(),
            scopes: ['public_profile', 'user_photos'],
        };
    }

    private getTikTokConfig(): SocialMediaConfig {
        const clientKey = Constants.expoConfig?.extra?.tiktokClientKey || '';
        return {
            clientId: clientKey,
            redirectUri: this.getRedirectUri(),
            scopes: ['user.info.basic', 'user.info.profile', 'video.list'],
        };
    }

    async connectInstagram(): Promise<SocialMediaAuthResult> {
        try {
            const config = this.getInstagramConfig();
            const facebookAppSecret = Constants.expoConfig?.extra?.facebookAppSecret || '';

            if (!config.clientId) {
                return {
                    success: false,
                    error: 'Facebook App ID not configured (required for Instagram Graph API)',
                };
            }

            if (!facebookAppSecret) {
                return {
                    success: false,
                    error: 'Facebook App Secret not configured (required for Instagram Graph API)',
                };
            }

            const discovery = {
                authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
                tokenEndpoint: 'https://graph.facebook.com/v18.0/oauth/access_token',
            };

            const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            if (!config.redirectUri) {
                return {
                    success: false,
                    error: 'Redirect URI is not configured',
                };
            }

            const request = new AuthSession.AuthRequest({
                clientId: config.clientId,
                scopes: config.scopes,
                redirectUri: config.redirectUri,
                responseType: AuthSession.ResponseType.Code,
                usePKCE: false,
                state: state,
                extraParams: {
                    auth_type: 'rerequest',
                },
            });

            const result = await request.promptAsync(discovery);

            if (result.type === 'success') {
                const { code } = result.params;

                const tokenUrl = new URL(discovery.tokenEndpoint);
                tokenUrl.searchParams.append('client_id', config.clientId);
                tokenUrl.searchParams.append('client_secret', facebookAppSecret);
                tokenUrl.searchParams.append('redirect_uri', config.redirectUri);
                tokenUrl.searchParams.append('code', code);

                const tokenResponse = await fetch(tokenUrl.toString());
                const tokenData = await tokenResponse.json();

                if (tokenData.error) {
                    return {
                        success: false,
                        error: tokenData.error.message || 'Failed to get Facebook access token',
                    };
                }

                const facebookAccessToken = tokenData.access_token;

                const pagesResponse = await fetch(
                    `https://graph.facebook.com/v18.0/me/accounts?access_token=${facebookAccessToken}&fields=id,name,instagram_business_account`
                );
                const pagesData = await pagesResponse.json();

                if (pagesData.error) {
                    return {
                        success: false,
                        error: pagesData.error.message || 'Failed to get Facebook Pages',
                    };
                }

                const pages = pagesData.data || [];
                const pageWithInstagram = pages.find((page: any) => page.instagram_business_account);

                if (!pageWithInstagram || !pageWithInstagram.instagram_business_account) {
                    return {
                        success: false,
                        error: 'No Instagram Business Account found. Please connect an Instagram Business Account to your Facebook Page.',
                    };
                }

                const instagramAccountId = pageWithInstagram.instagram_business_account.id;

                const longLivedTokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
                longLivedTokenUrl.searchParams.append('grant_type', 'fb_exchange_token');
                longLivedTokenUrl.searchParams.append('client_id', config.clientId);
                longLivedTokenUrl.searchParams.append('client_secret', facebookAppSecret);
                longLivedTokenUrl.searchParams.append('fb_exchange_token', facebookAccessToken);

                const longLivedResponse = await fetch(longLivedTokenUrl.toString());
                const longLivedData = await longLivedResponse.json();

                if (longLivedData.error) {
                    return {
                        success: true,
                        accessToken: facebookAccessToken,
                        userId: instagramAccountId,
                    };
                }

                return {
                    success: true,
                    accessToken: longLivedData.access_token || facebookAccessToken,
                    userId: instagramAccountId,
                };
            }

            return {
                success: false,
                error: result.type === 'cancel' ? 'User canceled' : 'Authentication failed',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to connect Instagram',
            };
        }
    }

    async connectFacebook(): Promise<SocialMediaAuthResult> {
        try {
            const config = this.getFacebookConfig();
            
            if (!config.clientId) {
                return {
                    success: false,
                    error: 'Facebook App ID not configured',
                };
            }

            const discovery = {
                authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
                tokenEndpoint: 'https://graph.facebook.com/v18.0/oauth/access_token',
            };

            const request = new AuthSession.AuthRequest({
                clientId: config.clientId,
                scopes: config.scopes,
                redirectUri: config.redirectUri,
                responseType: AuthSession.ResponseType.Code,
                usePKCE: false,
            });

            const result = await request.promptAsync(discovery);

            if (result.type === 'success') {
                const { code } = result.params;
                const clientSecret = Constants.expoConfig?.extra?.facebookAppSecret || '';

                const tokenUrl = new URL(discovery.tokenEndpoint);
                tokenUrl.searchParams.append('client_id', config.clientId);
                tokenUrl.searchParams.append('client_secret', clientSecret);
                tokenUrl.searchParams.append('redirect_uri', config.redirectUri);
                tokenUrl.searchParams.append('code', code);

                const tokenResponse = await fetch(tokenUrl.toString());
                const tokenData = await tokenResponse.json();

                if (tokenData.error) {
                    return {
                        success: false,
                        error: tokenData.error.message || 'Failed to get access token',
                    };
                }

                const userInfoResponse = await fetch(
                    `https://graph.facebook.com/v18.0/me?access_token=${tokenData.access_token}`
                );
                const userInfo = await userInfoResponse.json();

                return {
                    success: true,
                    accessToken: tokenData.access_token,
                    userId: userInfo.id,
                };
            }

            return {
                success: false,
                error: result.type === 'cancel' ? 'User canceled' : 'Authentication failed',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to connect Facebook',
            };
        }
    }

    async connectTikTok(): Promise<SocialMediaAuthResult> {
        try {
            const config = this.getTikTokConfig();
            
            if (!config.clientId) {
                return {
                    success: false,
                    error: 'TikTok client key not configured',
                };
            }

            const discovery = {
                authorizationEndpoint: 'https://www.tiktok.com/v2/auth/authorize',
                tokenEndpoint: 'https://open.tiktokapis.com/v2/oauth/token/',
            };

            const request = new AuthSession.AuthRequest({
                clientId: config.clientId,
                scopes: config.scopes,
                redirectUri: config.redirectUri,
                responseType: AuthSession.ResponseType.Code,
                usePKCE: true,
            });

            const result = await request.promptAsync(discovery);

            if (result.type === 'success') {
                const { code } = result.params;
                const clientSecret = Constants.expoConfig?.extra?.tiktokClientSecret || '';

                const tokenResponse = await fetch(discovery.tokenEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        client_key: config.clientId,
                        client_secret: clientSecret,
                        code: code,
                        grant_type: 'authorization_code',
                        redirect_uri: config.redirectUri,
                        code_verifier: request.codeVerifier || '',
                    }).toString(),
                });

                const tokenData = await tokenResponse.json();

                if (tokenData.error) {
                    return {
                        success: false,
                        error: tokenData.error_description || 'Failed to get access token',
                    };
                }

                return {
                    success: true,
                    accessToken: tokenData.access_token,
                    userId: tokenData.open_id,
                };
            }

            return {
                success: false,
                error: result.type === 'cancel' ? 'User canceled' : 'Authentication failed',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to connect TikTok',
            };
        }
    }

    async connectPlatform(platform: SocialPlatform): Promise<SocialMediaAuthResult> {
        switch (platform) {
            case 'instagram':
                return this.connectInstagram();
            case 'facebook':
                return this.connectFacebook();
            case 'tiktok':
                return this.connectTikTok();
            default:
                return {
                    success: false,
                    error: 'Unsupported platform',
                };
        }
    }
}

export const socialMediaService = new SocialMediaService();

