import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { translations } from '@/src/constants/translations';
import { FONTS } from '@/src/constants/fonts';
import CustomButton from '@/src/components/common/CustomButton';
import Logo from '@/src/components/common/Logo';
import GoogleIcon from '@/src/components/icons/GoogleIcon';
import { useOAuth } from '@/src/services/modules/auth/authHooks';
import { OAuthRequest } from '@/src/services/modules/auth/authTypes';
import { toastErrorFromException, toastSuccess } from '@/src/utils/toast';

// Complete the OAuth session properly
WebBrowser.maybeCompleteAuthSession();

export default function Login() {
    const router = useRouter();
    const colors = useThemeColors();
    const t = translations.auth;
    const oauthMutation = useOAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Get OAuth client IDs from app config
    const googleClientId = Constants.expoConfig?.extra?.googleClientId || '';
    const googleClientSecret = Constants.expoConfig?.extra?.googleClientSecret || '';
    const facebookAppId = Constants.expoConfig?.extra?.facebookAppId || '';
    const facebookAppSecret = Constants.expoConfig?.extra?.facebookAppSecret || '';

    // Google OAuth configuration
    const googleDiscovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    // Facebook OAuth configuration
    const facebookDiscovery = {
        authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenEndpoint: 'https://graph.facebook.com/v18.0/oauth/access_token',
    };

    // Helper function to generate a random string for code verifier
    const generateCodeVerifier = (): string => {
        // Generate a random 43-character string (base64url encoded)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        let result = '';
        for (let i = 0; i < 43; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    // Helper function to generate code challenge from verifier using expo-crypto
    const generateCodeChallenge = async (verifier: string): Promise<string> => {
        const { digestStringAsync, CryptoDigestAlgorithm, CryptoEncoding } = await import('expo-crypto');
        const hash = await digestStringAsync(
            CryptoDigestAlgorithm.SHA256,
            verifier,
            { encoding: CryptoEncoding.BASE64 }
        );
        // Convert base64 to base64url
        return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);

            if (!googleClientId) {
                throw new Error('Google Client ID is not configured. Please add it to app.json');
            }

            // Check if we're in Expo Go or standalone build
            const isExpoGo = Constants.executionEnvironment === 'storeClient' || 
                           Constants.appOwnership === 'expo';
            
            // Get initial redirect URI to check format
            const initialRedirectUri = AuthSession.makeRedirectUri();
            
            let redirectUri: string;
            
            // Extract iOS URL scheme from client ID (for iOS OAuth clients)
            // Format: com.googleusercontent.apps.XXXX-XXXXX
            const clientIdPart = googleClientId.split('.apps.googleusercontent.com')[0];
            const iosUrlScheme = `com.googleusercontent.apps.${clientIdPart}`;
            
            if (isExpoGo || initialRedirectUri.startsWith('exp://')) {
                // Expo Go requires Web application OAuth client with proxy
                // Construct the proxy URI manually to ensure it's correct
                const expoUsername = Constants.expoConfig?.owner || 'anonymous';
                const expoSlug = Constants.expoConfig?.slug || 'luxify';
                redirectUri = `https://auth.expo.io/@${expoUsername}/${expoSlug}`;
                
                console.log('=== GOOGLE OAUTH SETUP (Expo Go) ===');
                console.log('⚠️  You are using Expo Go');
                console.log('You need a WEB APPLICATION OAuth client');
                console.log('');
                console.log('🔴 CRITICAL - Add this EXACT redirect URI:');
                console.log('   ' + redirectUri);
                console.log('');
                console.log('Current Client ID:', googleClientId);
                console.log('Make sure this Client ID is from a WEB APPLICATION client');
            } else {
                // Standalone build - can use iOS OAuth client
                // iOS clients use reverse client ID as URL scheme
                redirectUri = `${iosUrlScheme}:/`;
                console.log('=== GOOGLE OAUTH SETUP (Standalone Build) ===');
                console.log('✅ Using iOS OAuth client');
                console.log('Client ID:', googleClientId);
                console.log('iOS URL Scheme:', iosUrlScheme);
                console.log('Redirect URI:', redirectUri);
                console.log('');
                console.log('Verify in Google Cloud Console:');
                console.log('1. Bundle ID matches: com.luxify');
                console.log('2. iOS URL scheme matches:', iosUrlScheme);
                console.log('(No redirect URI needed for iOS clients)');
            }
            
            console.log('==========================');

            // Generate code verifier and challenge for PKCE
            const codeVerifier = generateCodeVerifier();
            const codeChallenge = await generateCodeChallenge(codeVerifier);

            const request = new AuthSession.AuthRequest({
                clientId: googleClientId,
                scopes: ['openid', 'profile', 'email'],
                responseType: AuthSession.ResponseType.Code,
                redirectUri,
                codeChallenge,
                codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
            });

            // For Expo Go with proxy, we need to use the proxy option
            const useProxy = isExpoGo || initialRedirectUri.startsWith('exp://');
            
            console.log('Starting OAuth flow...');
            console.log('Using proxy:', useProxy);
            console.log('Redirect URI:', redirectUri);
            console.log('Client ID:', googleClientId);
            
            const result = await request.promptAsync(googleDiscovery, useProxy ? {
                useProxy: true,
            } as any : undefined);

            console.log('=== OAuth Result ===');
            console.log('Result type:', result.type);
            console.log('Full result:', JSON.stringify(result, null, 2));
            console.log('===================');

            if (result.type === 'success') {
                const { code, state, error } = result.params;
                
                console.log('=== Authorization Success ===');
                console.log('Code received:', code ? 'Yes' : 'No');
                console.log('Code value:', code ? `${code.substring(0, 20)}...` : 'None');
                console.log('State:', state);
                console.log('Error in params:', error);
                
                if (!code) {
                    throw new Error('No authorization code received from Google. Check redirect URI configuration.');
                }
                
                if (error) {
                    throw new Error(`OAuth error: ${error}`);
                }
                
                // Use the redirect URI we configured
                console.log('Token exchange - Using redirect URI:', redirectUri);

                // Exchange code for tokens manually
                // Build the request body
                const tokenRequestBody = new URLSearchParams({
                    client_id: googleClientId,
                    code,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code',
                    code_verifier: codeVerifier,
                });
                
                // Add client secret if available (not required with PKCE, but some setups need it)
                if (googleClientSecret) {
                    tokenRequestBody.append('client_secret', googleClientSecret);
                }
                
                console.log('Token exchange request:', {
                    endpoint: googleDiscovery.tokenEndpoint,
                    client_id: googleClientId,
                    redirect_uri: redirectUri,
                    has_code: !!code,
                    has_verifier: !!codeVerifier,
                });

                const tokenResponse = await fetch(googleDiscovery.tokenEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: tokenRequestBody.toString(),
                });

                const responseText = await tokenResponse.text();
                console.log('Token exchange response status:', tokenResponse.status);
                console.log('Token exchange response text:', responseText);
                
                let tokens;
                try {
                    tokens = JSON.parse(responseText);
                } catch (e) {
                    console.error('Failed to parse token response as JSON:', e);
                    throw new Error(`Token exchange failed: ${responseText}`);
                }
                
                console.log('Token exchange response (parsed):', tokens);

                if (tokens.error) {
                    console.error('Token exchange error:', tokens);
                    console.error('Error details:', {
                        error: tokens.error,
                        error_description: tokens.error_description,
                        redirect_uri_used: redirectUri,
                        client_id: googleClientId,
                    });
                    throw new Error(tokens.error_description || tokens.error || 'Failed to get access token');
                }
                
                if (!tokens.access_token) {
                    throw new Error('No access token received from Google');
                }

                // Get user info from Google
                const userInfoResponse = await fetch(
                    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
                );
                const userInfo = await userInfoResponse.json();

                if (userInfo.error) {
                    throw new Error(userInfo.error.message || 'Failed to get user info');
                }

                // Prepare OAuth data for API
                const expiresAt = new Date(
                    Date.now() + (tokens.expires_in || 3600) * 1000
                ).toISOString();

                const oauthData: OAuthRequest = {
                    oauth: {
                        provider_uid: userInfo.id,
                        email: userInfo.email,
                        first_name: userInfo.given_name || '',
                        last_name: userInfo.family_name || '',
                        access_token: tokens.access_token,
                        id_token: tokens.id_token,
                        refresh_token: tokens.refresh_token,
                        expires_at: expiresAt,
                    },
                };

                // Call OAuth API
                await oauthMutation.mutateAsync({
                    provider: 'google',
                    data: oauthData,
                });

                toastSuccess('Successfully signed in with Google');
                router.replace('/home/(tabs)');
            } else if (result.type === 'error') {
                console.error('Google OAuth error:', result.error);
                console.error('Error code:', result.error?.code);
                console.error('Error params:', result.params);
                throw new Error(result.error?.message || result.error?.code || 'OAuth authentication failed');
            } else if (result.type === 'cancel') {
                // User cancelled - don't show error, just return
                console.log('Google sign-in was cancelled by user');
                return;
            } else {
                console.error('Unknown Google OAuth result type:', result.type);
                console.error('Full result:', JSON.stringify(result, null, 2));
                throw new Error(`Unknown OAuth error occurred. Type: ${result.type}`);
            }
        } catch (error) {
            console.error('Google login error:', error);
            toastErrorFromException(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        try {
            setIsLoading(true);

            if (!facebookAppId) {
                throw new Error('Facebook App ID is not configured. Please add it to app.json');
            }

            const redirectUri = AuthSession.makeRedirectUri({
                scheme: 'luxify',
                path: 'oauth/facebook',
            });

            const request = new AuthSession.AuthRequest({
                clientId: facebookAppId,
                scopes: ['public_profile', 'email'],
                responseType: AuthSession.ResponseType.Code,
                redirectUri,
                usePKCE: false, // Facebook doesn't require PKCE
            });

            const result = await request.promptAsync(facebookDiscovery);

            if (result.type === 'success') {
                const { code } = result.params;

                // Exchange code for tokens - Facebook requires client_secret
                const tokenUrl = new URL(facebookDiscovery.tokenEndpoint);
                tokenUrl.searchParams.append('client_id', facebookAppId);
                tokenUrl.searchParams.append('client_secret', facebookAppSecret);
                tokenUrl.searchParams.append('redirect_uri', redirectUri);
                tokenUrl.searchParams.append('code', code);

                const tokenFetchResponse = await fetch(tokenUrl.toString());
                const tokens = await tokenFetchResponse.json();

                if (tokens.error) {
                    throw new Error(tokens.error.message || 'Failed to get access token');
                }

                // Get user info from Facebook
                const userInfoResponse = await fetch(
                    `https://graph.facebook.com/v18.0/me?fields=id,name,email,first_name,last_name&access_token=${tokens.access_token}`
                );
                const userInfo = await userInfoResponse.json();

                if (userInfo.error) {
                    throw new Error(userInfo.error.message || 'Failed to get user info');
                }

                // Prepare OAuth data for API
                const expiresAt = new Date(
                    Date.now() + (tokens.expires_in || 3600) * 1000
                ).toISOString();

                const oauthData: OAuthRequest = {
                    oauth: {
                        provider_uid: userInfo.id,
                        email: userInfo.email || `${userInfo.id}@facebook.com`,
                        first_name: userInfo.first_name || userInfo.name?.split(' ')[0] || '',
                        last_name: userInfo.last_name || userInfo.name?.split(' ').slice(1).join(' ') || '',
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token,
                        expires_at: expiresAt,
                    },
                };

                // Call OAuth API
                await oauthMutation.mutateAsync({
                    provider: 'facebook',
                    data: oauthData,
                });

                toastSuccess('Successfully signed in with Facebook');
                router.replace('/home/(tabs)');
            } else if (result.type === 'error') {
                throw new Error(result.error?.message || 'OAuth authentication failed');
            }
        } catch (error) {
            console.error('Facebook login error:', error);
            toastErrorFromException(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Logo size={scaleFontSize(80)} />

            <Text style={[styles.welcomeText, { color: colors.text }]}>
                {t.welcome}
            </Text>
            <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
                {t.welcomeSubtitle}
            </Text>

            <CustomButton
                title={t.continueWithGoogle}
                backgroundColor={colors.google}
                textColor={colors.text}
                borderColor={colors.googleBorder}
                icon={<GoogleIcon size={scaleFontSize(20)} />}
                onPress={handleGoogleLogin}
                disabled={isLoading || oauthMutation.isPending}
            />

            <CustomButton
                title={t.continueWithFacebook}
                backgroundColor={colors.facebook}
                textColor="#FFFFFF"
                borderColor={colors.facebook}
                icon={<FontAwesome name="facebook" size={scaleFontSize(20)} color="#FFFFFF" />}
                onPress={handleFacebookLogin}
                disabled={isLoading || oauthMutation.isPending}
            />

            <CustomButton
                title={t.continueWithApple}
                backgroundColor={colors.apple}
                textColor="#FFFFFF"
                borderColor={colors.apple}
                icon={<AntDesign name="apple" size={scaleFontSize(20)} color="#FFFFFF" />}
            />

            <View style={styles.dividerContainer}>
                <View style={{ width: '45%', height: 1, backgroundColor: colors.divider }} />
                <Text style={[styles.dividerText, { color: colors.textTertiary }]}>
                    {translations.common.or}
                </Text>
                <View style={{ width: '45%', height: 1, backgroundColor: colors.divider }} />
            </View>

            <CustomButton
                title={t.signInWithPassword}
                backgroundColor={colors.buttonPrimary}
                textColor={colors.buttonText}
                borderColor={colors.buttonPrimary}
                onPress={() => router.push('/auth/LoginWIthEmail')}
            />

            <View style={styles.signupContainer}>
                <Text style={[styles.signupText, { color: colors.textSecondary }]}>
                    {t.dontHaveAccount}
                </Text>
                <TouchableOpacity onPress={() => router.push('/auth/Signup')} activeOpacity={0.7}>
                    <Text style={[styles.signupLink, { color: colors.text }]}>
                        {t.signUp}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: scaleFontSize(32),
        lineHeight: scaleFontSize(39),
        fontFamily: FONTS.hermannRegular,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitleText: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(25),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(40),
        textAlign: 'center',
    },
    dividerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: scaleFontSize(16),
        marginBottom: scaleFontSize(24),
    },
    dividerText: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.nunitoRegular,
    },
    signupContainer: {
        flexDirection: 'row',
        marginTop: scaleFontSize(24),
    },
    signupText: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.hermannRegular,
    },
    signupLink: {
        fontSize: scaleFontSize(16),
        lineHeight: scaleFontSize(24),
        fontFamily: FONTS.hermannRegular,
    },
});
