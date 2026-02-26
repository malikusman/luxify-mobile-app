import Constants from 'expo-constants';
import { Buffer } from 'buffer';
import type { VirtualTryOnResult } from './types';

const jsrsasign = require('jsrsasign') as {
    KEYUTIL: { getKey: (pem: string) => { isPrivate: boolean } | null };
    KJUR: { jws: { JWS: { sign: (alg: string, header: string, payload: string, key: unknown) => string } } };
};

const TOKEN_EXPIRY_SEC = 3600;
const TOKEN_REFRESH_BUFFER_SEC = 300;
const REQUEST_TIMEOUT_MS = 120000;
const VERTEX_MODEL = 'virtual-try-on-001';
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

let tokenCache: { token: string; expiresAt: number } | null = null;

interface VertexConfig {
    clientEmail: string;
    privateKey: string;
    projectId: string;
    region: string;
}

interface GoogleTokenResponse {
    access_token?: string;
    expires_in?: number;
}

interface VertexPredictResponse {
    error?: { message?: string };
    predictions?: Array<{ bytesBase64Encoded?: string }>;
}

function getVertexConfig(): VertexConfig | null {
    const extra = Constants.expoConfig?.extra as Record<string, string | undefined> | undefined;
    const clientEmail = extra?.googleVertexClientEmail;
    const privateKey = extra?.googleVertexPrivateKey;
    const projectId = extra?.googleVertexProjectId;
    if (!clientEmail || !privateKey || !projectId) return null;
    const region = extra?.googleVertexRegion || 'us-central1';
    return { clientEmail, privateKey, projectId, region };
}

function toRawBase64(value: string): string {
    const s = typeof value === 'string' ? value : '';
    const match = s.match(/^data:image\/\w+;base64,(.+)$/);
    return match ? match[1] : s;
}

async function urlToBase64(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl, { method: 'GET' });
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
}

async function toPersonAndProductBase64(
    personImageUri: string,
    productImageUri: string
): Promise<{ personBase64: string; productBase64: string }> {
    const isUrl = (s: string) => s.startsWith('http://') || s.startsWith('https://');
    const personBase64 = isUrl(personImageUri)
        ? await urlToBase64(personImageUri)
        : toRawBase64(personImageUri);
    const productBase64 = isUrl(productImageUri)
        ? await urlToBase64(productImageUri)
        : toRawBase64(productImageUri);
    if (!personBase64 || !productBase64) {
        throw new Error('Missing or invalid person or product image');
    }
    return { personBase64, productBase64 };
}

async function fetchGoogleAccessToken(clientEmail: string, privateKeyPem: string): Promise<string> {
    const key = privateKeyPem.replace(/\\n/g, '\n');
    const prvKey = jsrsasign.KEYUTIL.getKey(key);
    if (!prvKey) {
        throw new Error('Invalid private key');
    }
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/cloud-platform',
        aud: OAUTH_TOKEN_URL,
        iat: now,
        exp: now + TOKEN_EXPIRY_SEC,
    };
    const header = { alg: 'RS256', typ: 'JWT' };
    const jwt = jsrsasign.KJUR.jws.JWS.sign('RS256', JSON.stringify(header), JSON.stringify(payload), prvKey);

    const tokenRes = await fetch(OAUTH_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }).toString(),
    });
    if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        throw new Error(`Failed to get access token: ${tokenRes.status} ${errText}`);
    }
    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenData.access_token) {
        throw new Error('No access_token in response');
    }
    return tokenData.access_token;
}

async function getGoogleAccessToken(clientEmail: string, privateKeyPem: string): Promise<string> {
    const nowSec = Math.floor(Date.now() / 1000);
    const cached = tokenCache;
    if (cached && cached.expiresAt > nowSec + TOKEN_REFRESH_BUFFER_SEC) {
        return cached.token;
    }
    const token = await fetchGoogleAccessToken(clientEmail, privateKeyPem);
    tokenCache = { token, expiresAt: nowSec + TOKEN_EXPIRY_SEC };
    return token;
}

function normalizeError(error: unknown): string {
    if (error instanceof Error) {
        if (error.name === 'AbortError') {
            return 'Request timed out. Please try again.';
        }
        return error.message;
    }
    if (typeof error === 'string') return error;
    return 'Virtual try-on failed';
}

export async function performVirtualTryOn(
    personImageUri: string,
    productImageUri: string
): Promise<VirtualTryOnResult> {
    try {
        const config = getVertexConfig();
        if (!config) {
            return {
                success: false,
                error:
                    'Vertex credentials not set. Add googleVertexClientEmail, googleVertexPrivateKey, googleVertexProjectId in app.json extra.',
            };
        }

        const [personBase64, productBase64] = await Promise.all([
            Promise.resolve(personImageUri).then((uri) =>
                uri.startsWith('http://') || uri.startsWith('https://')
                    ? urlToBase64(uri)
                    : toRawBase64(uri)
            ),
            Promise.resolve(productImageUri).then((uri) =>
                uri.startsWith('http://') || uri.startsWith('https://')
                    ? urlToBase64(uri)
                    : toRawBase64(uri)
            ),
        ]);
        if (!personBase64 || !productBase64) {
            return { success: false, error: 'Missing or invalid person or product image' };
        }

        const accessToken = await getGoogleAccessToken(config.clientEmail, config.privateKey);

        const url = `https://${config.region}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.region}/publishers/google/models/${VERTEX_MODEL}:predict`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    instances: [
                        {
                            personImage: { image: { bytesBase64Encoded: personBase64 } },
                            productImages: [{ image: { bytesBase64Encoded: productBase64 } }],
                        },
                    ],
                    parameters: { sampleCount: 1 },
                }),
            });

            const data = (await response.json().catch(() => ({}))) as VertexPredictResponse;

            if (!response.ok) {
                const errMsg = data?.error?.message ?? `Vertex AI error: ${response.status}`;
                return { success: false, error: errMsg };
            }

            const outputB64 = data?.predictions?.[0]?.bytesBase64Encoded;
            if (outputB64) {
                return {
                    success: true,
                    outputImageUrl: `data:image/jpeg;base64,${outputB64}`,
                };
            }

            return {
                success: false,
                error: (data as { error?: string })?.error ?? 'Vertex AI returned no image',
            };
        } finally {
            clearTimeout(timeoutId);
        }
    } catch (error: unknown) {
        return { success: false, error: normalizeError(error) };
    }
}

export interface VertexTryOnRequest {
    person_image_url: string;
    product_image_url: string;
}
