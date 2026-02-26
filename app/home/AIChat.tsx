import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Animated, FlatList, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import Constants from 'expo-constants';
import { Audio } from 'expo-av';
import { RootState } from '@/src/context/store';
import { Look } from '@/src/types/look';
import { useConversationLooks } from '@/src/hooks/useConversationLooks';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import { translations } from '@/src/constants/translations';
import { DEFAULTS, ANIMATION } from '@/src/constants/constants';
import ArrowLeftIcon from '@/src/components/icons/ArrowLeftIcon';
import MicIcon from '@/src/components/icons/MicIcon';
import SendIcon from '@/src/components/icons/SendIcon';
import ProductDetailView from '@/src/components/home/ProductDetailView';
import LookDetailView from '@/src/components/home/LookDetailView';
import { Ionicons } from '@expo/vector-icons';
import {
    SuggestionsList,
    EmptyChatView,
    VoiceCard,
    AudioMessagePlayer,
    LookCard,
    InputBar,
    MenuModal,
    ChangeStylistModal,
    TryOnModal,
    MessageBubble,
} from '@/src/components/AIChat';
import { useUserProfileSelector, useMyStylist, useConversation, useMessages, useCreateConversation, useSendMessage } from '@/src/services';
import { useStylists } from '@/src/services/modules/stylists/stylistHooks';
import { Message, Product, MessageMetadata } from '@/src/services/modules/conversations/conversationTypes';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/services/queryClient';
import { getStylistImage } from '@/src/utils/stylistImageMapper';
import { useSelectStylist } from '@/src/services/modules/stylists/stylistHooks';
import { Stylist } from '@/src/services/modules/stylists/stylistTypes';
import { useStylePhotos } from '@/src/services/modules/stylePhotos/stylePhotosHooks';
import { performVirtualTryOn } from '@/src/services/virtualTryOn/googleVertexAIService';

const { width, height } = Dimensions.get('window');

function getLooksFromMessage(message: Message): Look[] {
    if (!message.metadata) {
        return [];
    }
    
    if (!message.metadata.tool_calls || !Array.isArray(message.metadata.tool_calls)) {
        return [];
    }
    
    try {
        const getBackendUrl = (): string => {
            return Constants.expoConfig?.extra?.backendUrl || '';
        };
        const backendUrl = getBackendUrl();
        
        const hasWardrobeItems = message.metadata.tool_calls.some(
            (tc) => tc.tool_name === 'search_wardrobe_items'
        );
        const hasOnlineProducts = message.metadata.tool_calls.some(
            (tc) => tc.tool_name === 'search_products_online'
        );
        const hasBoth = hasWardrobeItems && hasOnlineProducts;
        
        const wardrobeLooks: Look[] = [];
        const productArrays: Product[][] = [];
        
        for (const toolCall of message.metadata.tool_calls) {
            if (toolCall.tool_name === 'search_products_online') {
                if (toolCall.tool_output?.products && Array.isArray(toolCall.tool_output.products)) {
                    // Keep is_clothing from API so LightX only runs when is_clothing === true
                    const validProducts = toolCall.tool_output.products.filter(
                        (product) => product && product.id && product.title && product.image_url
                    ) as Product[];
                    if (validProducts.length > 0) {
                        productArrays.push(validProducts);
                    }
                }
            } else if (toolCall.tool_name === 'search_wardrobe_items') {
                if (toolCall.tool_output?.wardrobe_items && Array.isArray(toolCall.tool_output.wardrobe_items)) {
                    // Only include wardrobe items that are clothing and available (required for LightX try-on)
                    const filteredWardrobeItems = toolCall.tool_output.wardrobe_items.filter(
                        (item) => item && item.is_clothing === true && item.available === true
                    );
                    
                    for (const wardrobeItem of filteredWardrobeItems) {
                        if (wardrobeItem && wardrobeItem.id && wardrobeItem.title && wardrobeItem.image_url) {
                            const fullImageUrl = wardrobeItem.image_url.startsWith('http://') || wardrobeItem.image_url.startsWith('https://')
                                ? wardrobeItem.image_url
                                : `${backendUrl}${wardrobeItem.image_url.startsWith('/') ? '' : '/'}${wardrobeItem.image_url}`;
                            
                            const product: Product = {
                                id: wardrobeItem.id,
                                title: wardrobeItem.title,
                                price: wardrobeItem.price || 'Already owned',
                                currency: wardrobeItem.currency || 'N/A',
                                image_url: fullImageUrl,
                                product_url: null,
                                brand: wardrobeItem.brand || 'Your Wardrobe',
                                retailer: wardrobeItem.retailer || 'Your Wardrobe',
                                available: wardrobeItem.available ?? true,
                                description: wardrobeItem.description || null,
                                is_clothing: wardrobeItem.is_clothing === true,
                            };
                            
                            wardrobeLooks.push({
                                products: [product],
                                lightXImageUrl: undefined,
                            });
                        }
                    }
                }
            }
        }
        
        if (hasBoth && wardrobeLooks.length > 0 && productArrays.length > 0) {
            const minLength = Math.min(...productArrays.map(arr => arr.length));
            
            if (minLength > 0) {
                const productGroups: Product[][] = [];
                const groupTitles: string[] = [];
                for (let i = 0; i < minLength; i++) {
                    const groupedProducts: Product[] = [];
                    for (const productArray of productArrays) {
                        const p = productArray[i];
                        if (p && p.available) {
                            groupedProducts.push(p);
                        }
                    }
                    if (groupedProducts.length > 0) {
                        productGroups.push(groupedProducts);
                        groupTitles.push(`Option ${productGroups.length}`);
                    }
                }

                wardrobeLooks.forEach((wardrobeLook) => {
                    wardrobeLook.productGroups = productGroups;
                    wardrobeLook.groupTitles = groupTitles;
                });
            }
            
            return wardrobeLooks;
        }
        
        if (!hasWardrobeItems && productArrays.length > 0) {
            const productLooks: Look[] = [];
            const minLength = Math.min(...productArrays.map(arr => arr.length));
            
            if (minLength > 0) {
                const maxLooks = Math.min(3, minLength);
                for (let i = 0; i < maxLooks; i++) {
                    const lookProducts: Product[] = [];
                    for (const productArray of productArrays) {
                        if (productArray[i]) {
                            lookProducts.push(productArray[i]);
                        }
                    }
                    if (lookProducts.length > 0) {
                        productLooks.push({
                            products: lookProducts,
                            lightXImageUrl: undefined,
                        });
                    }
                }
            }
            return productLooks;
        }
        
        return wardrobeLooks;
    } catch (error) {
        return [];
    }
}

/** Returns set of look indices that are try-on eligible (is_clothing === true). Used to hide try-on section when none are clothing. */
function getLookIndicesWithTryOn(metadata: MessageMetadata | undefined, looks: Look[]): Set<number> {
    const indices = new Set<number>();
    if (!metadata?.tool_calls || looks.length === 0) return indices;
    for (let lookIndex = 0; lookIndex < looks.length; lookIndex++) {
        const look = looks[lookIndex];
        const firstProduct = look.products[0];
        if (!firstProduct?.image_url) continue;
        const isWardrobeItem = firstProduct.product_url === null;
        let isClothing = false;
        if (isWardrobeItem) {
            for (const tc of metadata.tool_calls) {
                if (tc.tool_name === 'search_wardrobe_items' && tc.tool_output?.wardrobe_items) {
                    const item = tc.tool_output.wardrobe_items.find((w) => w.id === firstProduct.id);
                    if (item) {
                        isClothing = item.is_clothing === true;
                        break;
                    }
                }
            }
            if (!isClothing && firstProduct.is_clothing === true) isClothing = true;
        } else {
            for (const tc of metadata.tool_calls) {
                if (tc.tool_name === 'search_products_online' && tc.tool_output?.products) {
                    const apiProduct = tc.tool_output.products.find((p) => p && p.id === firstProduct.id) as { is_clothing?: boolean } | undefined;
                    if (apiProduct) {
                        isClothing = apiProduct.is_clothing === true;
                        break;
                    }
                }
            }
            if (!isClothing && firstProduct.is_clothing === true) isClothing = true;
        }
        if (isClothing) indices.add(lookIndex);
    }
    return indices;
}

export default function AIChatScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ conversationId?: string }>();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const { data } = useSelector((state: RootState) => state.profile);
    const userProfile = useUserProfileSelector();
    const firstName = userProfile?.first_name || data.firstName || DEFAULTS.FIRST_NAME;
    
    const { data: stylist, isLoading: isLoadingStylist } = useMyStylist();
    const { data: allStylists = [] } = useStylists();
    
    const stylistIndexMap = React.useMemo(() => {
        const map = new Map<string, number>();
        const sortedStylists = [...allStylists].sort((a, b) => a.id.localeCompare(b.id));
        sortedStylists.forEach((s, index) => {
            map.set(s.id, index);
        });
        return map;
    }, [allStylists]);
    
    const [conversationId, setConversationId] = useState<string | null>(params.conversationId || null);

    const userId = useSelector((state: RootState) => state.auth?.user?.id) ?? null;
    const conversationLooks = useConversationLooks(userId, conversationId);
    const { looksByMessageId, getLooksForMessage: getCachedLooks, setLooks: setLooksForMessage, hydrateForMessages, updateLookLightX, updateLookLightXError, clearLookLightXError } = conversationLooks;

    const [messageText, setMessageText] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const MAX_RECORDING_DURATION = 60;
    const recordingDurationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const playbackPositionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const recordingDurationRef = useRef<number>(0);
    const soundRef = useRef<Audio.Sound | null>(null);
    const messageSoundsRef = useRef<Map<string, Audio.Sound>>(new Map());
    
    const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
    const [messageSounds, setMessageSounds] = useState<Map<string, Audio.Sound>>(new Map());
    const [messagePlaybackPositions, setMessagePlaybackPositions] = useState<Map<string, number>>(new Map());
    const [messageDurations, setMessageDurations] = useState<Map<string, number>>(new Map());
    const messagePlaybackIntervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
    const [showMenuModal, setShowMenuModal] = useState(false);
    const [showChangeStylistModal, setShowChangeStylistModal] = useState(false);
    const [selectedStylistForChange, setSelectedStylistForChange] = useState<Stylist | null>(null);
    const selectStylistMutation = useSelectStylist();
    
    const { data: stylePhotos = [] } = useStylePhotos();
    const [tryOnResult, setTryOnResult] = useState<{ productId: string; resultUrl: string } | null>(null);
    const [showTryOnModal, setShowTryOnModal] = useState(false);
    
    const [generatingLightXImages, setGeneratingLightXImages] = useState<Set<string>>(new Set());
    const processingMessagesRef = useRef<Set<string>>(new Set());
    
    const [selectedLook, setSelectedLook] = useState<{ messageId: string; lookIndex: number; look: Look } | null>(null);
    
    const { data: conversation, isLoading: isLoadingConversation } = useConversation(conversationId);
    
    const displayStylist: { id: string; name: string; avatar_url: string | null | undefined; specialization?: string } | null | undefined = 
        conversation?.stylist 
            ? {
                id: conversation.stylist.id,
                name: conversation.stylist.name,
                avatar_url: conversation.stylist.avatar_url ?? null,
                specialization: undefined,
              }
            : stylist ? {
                id: stylist.id,
                name: stylist.name,
                avatar_url: stylist.avatar_url ?? null,
                specialization: stylist.specialization,
              } : null;
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);
    const createConversationMutation = useCreateConversation();
    const sendMessageMutation = useSendMessage();
    
    const { data: messages = [], isLoading: isLoadingMessages } = useMessages(
        conversationId, 
        { enabled: !!conversationId }
    );

    const durationLoadRequestedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (messages.length > 0) {
            console.log('messages response', JSON.stringify(messages, null, 2));
        }
    }, [messages]);

    useEffect(() => {
        durationLoadRequestedRef.current.clear();
    }, [conversationId]);
    
    const queryClient = useQueryClient();
    const messagesWithMetadataRef = useRef<Map<string, MessageMetadata>>(new Map());
    const processedMessagesRef = useRef<Set<string>>(new Set());
    const messagesIdsRef = useRef<string>('');

    const generateLightXImagesForLooks = React.useCallback(
        async (
            convId: string,
            msgId: string,
            looks: Look[],
            getCurrentCachedLooks: () => Look[],
            onSetLightXImage: (messageId: string, lookIndex: number, lightXImageUrl: string) => void,
            onSetLightXError: (messageId: string, lookIndex: number, error: string) => void,
            options?: { isRetry?: boolean; retryLookIndex?: number }
        ) => {
            const isRetry = options?.isRetry === true;
            const retryLookIndex = options?.retryLookIndex;
            const messageKey = isRetry ? `${convId}-${msgId}-retry` : `${convId}-${msgId}`;
            if (processingMessagesRef.current.has(messageKey)) {
                return;
            }
            processingMessagesRef.current.add(messageKey);

            try {
                const personImageUrl = getPersonImageUrl();
                if (!personImageUrl) {
                    return;
                }

                await new Promise((resolve) => setTimeout(resolve, 50));
                let currentCachedLooks = getCurrentCachedLooks();

            for (let lookIndex = 0; lookIndex < looks.length; lookIndex++) {
                const look = looks[lookIndex];
                
                currentCachedLooks = getCurrentCachedLooks();
                
                const firstProductId = look.products[0]?.id;
                const cachedLookIndex = firstProductId 
                    ? currentCachedLooks.findIndex(cached => 
                        cached.products[0]?.id === firstProductId
                    )
                    : lookIndex;
                
                const cachedLook = cachedLookIndex >= 0 ? currentCachedLooks[cachedLookIndex] : null;
                const actualLookIndex = cachedLookIndex >= 0 ? cachedLookIndex : lookIndex;
                
                if (cachedLook?.lightXImageUrl) {
                    continue;
                }
                
                if (!isRetry && (cachedLook?.lightXError || look.lightXError)) {
                    continue;
                }
                
                if (look.lightXImageUrl) {
                    continue;
                }

                if (look.products.length === 0) {
                    continue;
                }

                const firstProduct = look.products[0];
                if (!firstProduct.image_url) {
                    continue;
                }

                // Only generate LightX try-on when is_clothing is true (for both wardrobe and online products)
                const isWardrobeItem = firstProduct.product_url === null;
                const messageMetadata = messagesWithMetadataRef.current.get(msgId);
                let isClothing = false;

                if (isWardrobeItem) {
                    if (messageMetadata?.tool_calls) {
                        for (const toolCall of messageMetadata.tool_calls) {
                            if (toolCall.tool_name === 'search_wardrobe_items' && toolCall.tool_output?.wardrobe_items) {
                                const wardrobeItem = toolCall.tool_output.wardrobe_items.find(
                                    (item) => item.id === firstProduct.id
                                );
                                if (wardrobeItem) {
                                    isClothing = wardrobeItem.is_clothing === true;
                                    break;
                                }
                            }
                        }
                    }
                    if (!isClothing && firstProduct.is_clothing === true) isClothing = true;
                } else {
                    // Online product: resolve is_clothing from metadata (source of truth) so we never generate when false
                    if (messageMetadata?.tool_calls) {
                        for (const toolCall of messageMetadata.tool_calls) {
                            if (toolCall.tool_name === 'search_products_online' && toolCall.tool_output?.products) {
                                const apiProduct = toolCall.tool_output.products.find(
                                    (p) => p && p.id === firstProduct.id
                                ) as { is_clothing?: boolean } | undefined;
                                if (apiProduct) {
                                    isClothing = apiProduct.is_clothing === true;
                                    break;
                                }
                            }
                        }
                    }
                    if (!isClothing && firstProduct.is_clothing === true) isClothing = true;
                }

                if (!isClothing) {
                    continue; // Skip LightX – not clothing or could not confirm
                }

                const lookKey = isRetry && retryLookIndex !== undefined ? `${msgId}-${retryLookIndex}` : `${msgId}-${lookIndex}`;
                setGeneratingLightXImages(prev => new Set(prev).add(lookKey));

                try {
                    const result = await performVirtualTryOn(personImageUrl, firstProduct.image_url);
                    
                    if (result.success && result.outputImageUrl) {
                        currentCachedLooks = getCurrentCachedLooks();
                        
                        const finalCachedLookIndex = firstProductId 
                            ? currentCachedLooks.findIndex(cached => 
                                cached.products[0]?.id === firstProductId
                            )
                            : lookIndex;
                        
                        const finalLookIndex = finalCachedLookIndex >= 0 ? finalCachedLookIndex : lookIndex;
                        
                        if (finalLookIndex < currentCachedLooks.length) {
                            onSetLightXImage(msgId, finalLookIndex, result.outputImageUrl);
                        } else {
                            onSetLightXImage(msgId, lookIndex, result.outputImageUrl);
                        }
                    } else {
                        const errorMessage = result.error || 'Failed to generate image';
                        currentCachedLooks = getCurrentCachedLooks();
                        const finalCachedLookIndex = firstProductId 
                            ? currentCachedLooks.findIndex(cached => 
                                cached.products[0]?.id === firstProductId
                            )
                            : lookIndex;
                        const finalLookIndex = finalCachedLookIndex >= 0 ? finalCachedLookIndex : lookIndex;
                        onSetLightXError(msgId, finalLookIndex < currentCachedLooks.length ? finalLookIndex : lookIndex, errorMessage);
                    }
                } catch (error: any) {
                    const errorMessage = error?.message || error?.toString() || 'An unexpected error occurred';
                    currentCachedLooks = getCurrentCachedLooks();
                    const finalCachedLookIndex = firstProductId 
                        ? currentCachedLooks.findIndex(cached => 
                            cached.products[0]?.id === firstProductId
                        )
                        : lookIndex;
                    const finalLookIndex = finalCachedLookIndex >= 0 ? finalCachedLookIndex : lookIndex;
                    onSetLightXError(msgId, finalLookIndex < currentCachedLooks.length ? finalLookIndex : lookIndex, errorMessage);
                } finally {
                    setGeneratingLightXImages(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(lookKey);
                        return newSet;
                    });
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        } finally {
            processingMessagesRef.current.delete(messageKey);
        }
    }, [stylePhotos]);

    useEffect(() => {
        if (!userId || !conversationId || messages.length === 0) return;

        const currentMessagesIds = messages.map((m) => m.id).join(',');
        if (currentMessagesIds === messagesIdsRef.current) return;
        messagesIdsRef.current = currentMessagesIds;

        const messageIdsWithLooks = messages
            .filter((m) => m.metadata?.tool_calls?.length)
            .map((m) => m.id);
        if (messageIdsWithLooks.length === 0) return;

        let cancelled = false;
        (async () => {
            const hydrated = await hydrateForMessages(messageIdsWithLooks);
            if (cancelled) return;

            messages.forEach((msg) => {
                const messageKey = `${conversationId}-${msg.id}`;
                if (processedMessagesRef.current.has(messageKey)) return;

                if (msg.metadata && msg.metadata.tool_calls && msg.metadata.tool_calls.length > 0) {
                    messagesWithMetadataRef.current.set(msg.id, msg.metadata);

                    const looks = getLooksFromMessage(msg);
                    if (looks.length === 0) return;

                    const existingCached = hydrated[msg.id] ?? getCachedLooks(msg.id);

                    if (!existingCached || existingCached.length === 0) {
                        setLooksForMessage(msg.id, looks).then(() => {
                            if (cancelled) return;
                            setTimeout(() => {
                                generateLightXImagesForLooks(
                                    conversationId,
                                    msg.id,
                                    looks,
                                    () => getCachedLooks(msg.id) ?? [],
                                    updateLookLightX,
                                    updateLookLightXError
                                );
                            }, 100);
                        });
                    } else {
                        const looksNeedingGeneration: Look[] = [];
                        const mergedLooks: Look[] = [];

                        for (let index = 0; index < looks.length; index++) {
                            const newLook = looks[index];
                            const cachedLook = existingCached[index];

                            if (cachedLook) {
                                if (cachedLook.lightXImageUrl) {
                                    const productsMatch =
                                        cachedLook.products.length === newLook.products.length &&
                                        cachedLook.products.every((p, i) => p.id === newLook.products[i]?.id);
                                    if (productsMatch) {
                                        mergedLooks.push(cachedLook);
                                        continue;
                                    }
                                }
                                const productsMatch =
                                    cachedLook.products.length === newLook.products.length &&
                                    cachedLook.products.every((p, i) => p.id === newLook.products[i]?.id);
                                if (productsMatch) {
                                    looksNeedingGeneration.push(cachedLook);
                                    mergedLooks.push(cachedLook);
                                    continue;
                                }
                            }
                            looksNeedingGeneration.push(newLook);
                            mergedLooks.push(newLook);
                        }

                        const needsUpdate = mergedLooks.length !== existingCached.length ||
                            mergedLooks.some((l, i) => l !== existingCached[i]);
                        if (needsUpdate) {
                            setLooksForMessage(msg.id, mergedLooks).then(() => {
                                if (cancelled) return;
                                if (looksNeedingGeneration.length > 0) {
                                    generateLightXImagesForLooks(
                                        conversationId,
                                        msg.id,
                                        looksNeedingGeneration,
                                        () => getCachedLooks(msg.id) ?? [],
                                        updateLookLightX,
                                        updateLookLightXError
                                    );
                                }
                            });
                        } else if (looksNeedingGeneration.length > 0) {
                            generateLightXImagesForLooks(
                                conversationId,
                                msg.id,
                                looksNeedingGeneration,
                                () => getCachedLooks(msg.id) ?? [],
                                updateLookLightX,
                                updateLookLightXError
                            );
                        }
                    }
                }

                processedMessagesRef.current.add(messageKey);
            });
        })();

        return () => {
            cancelled = true;
        };
    }, [messages.length, conversationId, userId, hydrateForMessages, getCachedLooks, setLooksForMessage, generateLightXImagesForLooks, updateLookLightX, updateLookLightXError]);

    useEffect(() => {
        if (!conversationId || messages.length === 0) return;
        
        const queryKey = queryKeys.conversations.messages(conversationId);
        
        const needsMerge = messages.some(msg => {
            const hasMetadataInRef = messagesWithMetadataRef.current.has(msg.id);
            const hasMetadataInMessage = msg.metadata && msg.metadata.tool_calls && msg.metadata.tool_calls.length > 0;
            return hasMetadataInRef && !hasMetadataInMessage;
        });
        
        if (needsMerge) {
            const merged = messages.map(msg => {
                const preservedMetadata = messagesWithMetadataRef.current.get(msg.id);
                const hasMetadataInMessage = msg.metadata && msg.metadata.tool_calls && msg.metadata.tool_calls.length > 0;
                
                if (preservedMetadata && !hasMetadataInMessage) {
                    return { ...msg, metadata: preservedMetadata };
                }
                return msg;
            });
            
            queryClient.setQueryData(queryKey, merged);
        }
    }, [messages, conversationId, queryClient]);

    useEffect(() => {
        processedMessagesRef.current.clear();
        messagesWithMetadataRef.current.clear();
        messagesIdsRef.current = '';
    }, [conversationId]);
    useEffect(() => {
        if (
            stylist && 
            stylist.id && 
            !conversationId && 
            !isLoadingStylist && 
            !createConversationMutation.isPending &&
            !isCreatingConversation
        ) {
            const stylistId = stylist.id;
            if (!stylistId) {
                return;
            }
            setIsCreatingConversation(true);
            createConversationMutation.mutate(stylistId, {
                onSuccess: (newConversation) => {
                    setConversationId(newConversation.id);
                    setIsCreatingConversation(false);
                },
                onError: () => {
                    setIsCreatingConversation(false);
                },
            });
        }
    }, [stylist?.id, conversationId, isLoadingStylist, createConversationMutation.isPending, isCreatingConversation]);



    const outerPulse = useRef(new Animated.Value(1)).current;
    const middlePulse = useRef(new Animated.Value(1)).current;
    const innerPulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const createPulseAnimation = (animatedValue: Animated.Value, delay: number = 0) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(animatedValue, {
                        toValue: ANIMATION.PULSE_SCALE_TO,
                        duration: ANIMATION.PULSE_DURATION,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: ANIMATION.PULSE_SCALE_FROM,
                        duration: ANIMATION.PULSE_DURATION,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const outerAnim = createPulseAnimation(outerPulse, ANIMATION.OUTER_PULSE_DELAY);
        const middleAnim = createPulseAnimation(middlePulse, ANIMATION.MIDDLE_PULSE_DELAY);
        const innerAnim = createPulseAnimation(innerPulse, ANIMATION.INNER_PULSE_DELAY);

        outerAnim.start();
        middleAnim.start();
        innerAnim.start();

        return () => {
            outerAnim.stop();
            middleAnim.stop();
            innerAnim.stop();
        };
    }, [outerPulse, middlePulse, innerPulse]);

    const handleBack = () => {
        router.dismissAll();
        router.replace('/home/(tabs)/' as any);    
    };

    const handleMenuPress = () => {
        setShowMenuModal(true);
    };

    const handleCloseMenuModal = () => {
        setShowMenuModal(false);
    };

    const handleViewChatHistory = () => {
        setShowMenuModal(false);
        router.push('/home/(tabs)/chat' as any);
    };

    const handleChangeStylistPress = () => {
        setShowMenuModal(false);
        setShowChangeStylistModal(true);
    };

    const handleCloseChangeStylistModal = () => {
        setShowChangeStylistModal(false);
        setSelectedStylistForChange(null);
    };

    const handleStylistSelection = (stylist: Stylist) => {
        if (stylist.id !== displayStylist?.id) {
            setSelectedStylistForChange(stylist);
            
            selectStylistMutation.mutate(stylist.id, {
                onSuccess: () => {
                    createConversationMutation.mutate(stylist.id, {
                        onSuccess: (newConversation) => {
                            setConversationId(newConversation.id);
                            setShowChangeStylistModal(false);
                            setSelectedStylistForChange(null);
                            queryClient.invalidateQueries({ queryKey: queryKeys.stylists.myStylist() });
                            queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() });
                        },
                        onError: () => {},
                    });
                },
                onError: () => {},
            });
        } else {
            setShowChangeStylistModal(false);
            setSelectedStylistForChange(null);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                await Audio.requestPermissionsAsync();
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
            } catch (_err) {
            }
        })();
    }, []);

    useEffect(() => {
        return () => {
            const currentSound = soundRef?.current;
            if (currentSound) {
                currentSound.unloadAsync().catch(() => {});
            }
            if (recordingRef.current) {
                recordingRef.current.stopAndUnloadAsync().catch(() => {});
            }
            if (recordingDurationIntervalRef.current) {
                clearInterval(recordingDurationIntervalRef.current);
            }
            if (playbackPositionIntervalRef.current) {
                clearInterval(playbackPositionIntervalRef.current);
            }
            if (messageSoundsRef?.current) {
                messageSoundsRef.current.forEach((messageSound) => {
                    messageSound.unloadAsync().catch(() => {});
                });
            }
            messagePlaybackIntervalsRef.current.forEach((interval) => {
                clearInterval(interval);
            });
        };
    }, []);

    const startRecording = async () => {
        try {
            try {
                const { status } = await Audio.requestPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Required', 'Microphone permission is required to record audio.');
                    return;
                }
                
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
                
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (audioModeError) {
                Alert.alert('Error', 'Failed to configure audio for recording. Please try again.');
                return;
            }

            const currentRecording = recording || recordingRef.current;
            if (currentRecording) {
                try {
                    await currentRecording.stopAndUnloadAsync();
                } catch (_err: any) {
                }
            }

            if (sound) {
                try {
                    await sound.unloadAsync();
                    await new Promise(resolve => setTimeout(resolve, 150));
                } catch (_err) {
                }
                setSound(null);
                soundRef.current = null;
                setIsPlaying(false);
            }
            
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
            } catch (_audioModeError2) {
            }

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            
            const initialStatus = await newRecording.getStatusAsync();
            
            if (!initialStatus.canRecord) {
                try {
                    await newRecording.stopAndUnloadAsync();
                } catch (_unloadErr: any) {
                }
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
                Alert.alert('Error', 'Cannot start recording. Please ensure microphone permissions are granted and no other app is using the microphone.');
                return;
            }
            
            if (initialStatus.isDoneRecording) {
                try {
                    await newRecording.stopAndUnloadAsync();
                } catch (_unloadErr: any) {
                }
                Alert.alert('Error', 'Failed to start recording. The recording stopped immediately. Please check your microphone permissions and try again.');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
            const statusAfterDelay = await newRecording.getStatusAsync();
            
            if (statusAfterDelay.isDoneRecording || !statusAfterDelay.isRecording) {
                try {
                    await newRecording.stopAndUnloadAsync();
                } catch (_unloadErr: any) {
                }
                Alert.alert('Error', 'Failed to start recording. Please check your microphone permissions and ensure no other app is using the microphone.');
                return;
            }
            
            if (!statusAfterDelay.canRecord) {
                try {
                    await newRecording.stopAndUnloadAsync();
                } catch (_unloadErr: any) {
                }
                Alert.alert('Error', 'Recording lost ability to record. Please try again.');
                return;
            }
            
            setRecording(newRecording);
            recordingRef.current = newRecording;
            setIsRecording(true);
            setRecordedAudioUri(null);
            
            if (recordingDurationIntervalRef.current) {
                clearInterval(recordingDurationIntervalRef.current);
                recordingDurationIntervalRef.current = null;
            }
            
            recordingDurationRef.current = 0;
            setRecordingDuration(0);
            setPlaybackPosition(0);

            recordingDurationIntervalRef.current = setInterval(async () => {
                if (recordingRef.current) {
                    try {
                        const status = await recordingRef.current.getStatusAsync();
                        
                        if (status.isDoneRecording || !status.isRecording) {
                            if (recordingDurationIntervalRef.current) {
                                clearInterval(recordingDurationIntervalRef.current);
                                recordingDurationIntervalRef.current = null;
                            }
                            
                            const actualDuration = status.durationMillis 
                                ? Math.floor(status.durationMillis / 1000) 
                                : recordingDurationRef.current;
                            
                            const uri = recordingRef.current.getURI();
                            setRecording(null);
                            recordingRef.current = null;
                            setIsRecording(false);
                            setRecordingDuration(actualDuration);
                            recordingDurationRef.current = actualDuration;
                            
                            if (uri) {
                                setRecordedAudioUri(uri);
                            }
                            return;
                        }
                        
                        if (status.durationMillis) {
                            const actualDuration = Math.floor(status.durationMillis / 1000);
                            if (actualDuration > recordingDurationRef.current) {
                                recordingDurationRef.current = actualDuration;
                                setRecordingDuration(actualDuration);
                            }
                        } else {
                            const currentDuration = recordingDurationRef.current + 1;
                            recordingDurationRef.current = currentDuration;
                            setRecordingDuration(currentDuration);
                        }
                        
                        const currentDuration = recordingDurationRef.current;
                        if (currentDuration >= MAX_RECORDING_DURATION) {
                            if (recordingDurationIntervalRef.current) {
                                clearInterval(recordingDurationIntervalRef.current);
                                recordingDurationIntervalRef.current = null;
                            }
                            if (recordingRef.current) {
                                const finalDuration = MAX_RECORDING_DURATION;
                                const recordingToStop = recordingRef.current;
                                
                                recordingToStop.stopAndUnloadAsync()
                                    .then(() => {
                                        const uri = recordingToStop.getURI();
                                        setRecording(null);
                                        recordingRef.current = null;
                                        setIsRecording(false);
                                        setRecordingDuration(finalDuration);
                                        recordingDurationRef.current = finalDuration;
                                        if (uri) {
                                            setRecordedAudioUri(uri);
                                        }
                                    })
                                    .catch(() => {
                                        setRecording(null);
                                        recordingRef.current = null;
                                        setIsRecording(false);
                                    });
                            }
                        }
                    } catch (_statusErr) {
                        const currentDuration = recordingDurationRef.current + 1;
                        recordingDurationRef.current = currentDuration;
                        setRecordingDuration(currentDuration);
                    }
                }
            }, 1000);
        } catch (err) {
            Alert.alert('Error', 'Failed to start recording. Please check your microphone permissions.');
        }
    };

    const stopRecording = async () => {
        try {
            const currentRecording = recording || recordingRef.current;
            if (!currentRecording) {
                return;
            }

            if (recordingDurationIntervalRef.current) {
                clearInterval(recordingDurationIntervalRef.current);
                recordingDurationIntervalRef.current = null;
            }

            let finalDuration = recordingDurationRef.current;
            let uri: string | null = null;

            try {
                const status = await currentRecording.getStatusAsync();

                if (status.durationMillis) {
                    const actualDuration = Math.floor(status.durationMillis / 1000);
                    if (actualDuration > 0) {
                        finalDuration = actualDuration;
                        recordingDurationRef.current = actualDuration;
                    }
                }

                try {
                    uri = currentRecording.getURI();
                } catch (_uriErr) {
                }

                if (status.isRecording) {
                    try {
                        await currentRecording.stopAndUnloadAsync();
                    } catch (_stopErr: any) {
                    }
                }
                
                if (!uri) {
                    try {
                        uri = currentRecording.getURI();
                    } catch (_uriErr2) {
                    }
                }
            } catch (_err: any) {
                if (!uri) {
                    try {
                        uri = currentRecording.getURI();
                    } catch (_uriErr3) {
                    }
                }
            }
            
            setRecording(null);
            recordingRef.current = null;
            setIsRecording(false);
            
            if (uri) {
                setRecordedAudioUri(uri);
                setRecordingDuration(finalDuration);
                recordingDurationRef.current = finalDuration;
            } else if (finalDuration > 0) {
                setRecordingDuration(finalDuration);
                recordingDurationRef.current = finalDuration;
            }
        } catch (_err: any) {
            setRecording(null);
            recordingRef.current = null;
            setIsRecording(false);
        }
    };

    const playRecordedAudio = async () => {
        if (!recordedAudioUri) return;

        try {
            if (sound) {
                await sound.unloadAsync();
            }

            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
            } catch (_audioModeError) {
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: recordedAudioUri },
                { 
                    shouldPlay: true,
                    volume: 1.0,
                }
            );
            
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
            } catch (_audioModeError2) {
            }

            setSound(newSound);
            soundRef.current = newSound;
            setIsPlaying(true);
            setPlaybackPosition(0);

            if (playbackPositionIntervalRef.current) {
                clearInterval(playbackPositionIntervalRef.current);
            }

            playbackPositionIntervalRef.current = setInterval(() => {
                setPlaybackPosition(prev => {
                    const newPosition = prev + 1;
                    if (newPosition >= recordingDuration) {
                        if (playbackPositionIntervalRef.current) {
                            clearInterval(playbackPositionIntervalRef.current);
                            playbackPositionIntervalRef.current = null;
                        }
                        return recordingDuration;
                    }
                    return newPosition;
                });
            }, 1000);

            newSound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.isLoaded) {
                    if (status.didJustFinish) {
                        setIsPlaying(false);
                        setPlaybackPosition(0);
                        if (playbackPositionIntervalRef.current) {
                            clearInterval(playbackPositionIntervalRef.current);
                            playbackPositionIntervalRef.current = null;
                        }
                        await newSound.unloadAsync();
                        setSound(null);
                        soundRef.current = null;
                        
                        try {
                            await Audio.setAudioModeAsync({
                                allowsRecordingIOS: true,
                                playsInSilentModeIOS: true,
                                staysActiveInBackground: false,
                                shouldDuckAndroid: true,
                                playThroughEarpieceAndroid: false,
                            });
                        } catch (_audioModeError) {
                        }
                    }
                }
            });
        } catch (err) {
            Alert.alert('Error', 'Failed to play audio.');
        }
    };

    const stopPlayback = async () => {
        if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
            setSound(null);
            soundRef.current = null;
            setIsPlaying(false);
            setPlaybackPosition(0);
        }
        if (playbackPositionIntervalRef.current) {
            clearInterval(playbackPositionIntervalRef.current);
            playbackPositionIntervalRef.current = null;
        }
        
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });
        } catch (_audioModeError) {
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleMicToggle = async () => {
        if (isRecording) {
            await stopRecording();
        } else {
            await startRecording();
        }
    };

    const handleCancelRecording = async () => {
        if (isRecording) {
            await stopRecording();
        }
        setRecordedAudioUri(null);
        setRecordingDuration(0);
        recordingDurationRef.current = 0;
        setPlaybackPosition(0);
        if (sound) {
            await stopPlayback();
        }
    };

    const handlePlayMessageAudio = async (message: Message) => {
        if (!message.audio_url) {
            return;
        }

        if (playingMessageId === message.id) {
            await handleStopMessageAudio(message.id);
            return;
        }

        if (playingMessageId) {
            await handleStopMessageAudio(playingMessageId);
        }

        if (sound) {
            await stopPlayback();
        }

        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });
        } catch (_audioModeError) {
            // ignore
        }

        const audioUrl = resolveMessageAudioUrl(message.audio_url);

        try {
            // Load sound without playing first so it's ready before we start
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: false, volume: 1.0 }
            );

            // Wait for sound to be loaded before playing (fixes intermittent "sometimes plays, sometimes not")
            let duration = 0;
            for (let attempt = 0; attempt < 20; attempt++) {
                const status = await newSound.getStatusAsync();
                if (status.isLoaded) {
                    if (status.durationMillis) {
                        duration = Math.floor(status.durationMillis / 1000);
                    }
                    break;
                }
                await new Promise((r) => setTimeout(r, 100));
            }

            setMessageSounds(prev => {
                const newMap = new Map(prev).set(message.id, newSound);
                messageSoundsRef.current = newMap;
                return newMap;
            });
            setPlayingMessageId(message.id);
            setMessagePlaybackPositions(prev => new Map(prev).set(message.id, 0));
            if (duration > 0) {
                setMessageDurations(prev => new Map(prev).set(message.id, duration));
            }

            const messageDuration = duration;
            const interval = setInterval(() => {
                setMessagePlaybackPositions(prev => {
                    const currentPosition = prev.get(message.id) || 0;
                    const newPosition = currentPosition + 1;
                    const newMap = new Map(prev);
                    if (messageDuration > 0 && newPosition >= messageDuration) {
                        if (messagePlaybackIntervalsRef.current.has(message.id)) {
                            clearInterval(messagePlaybackIntervalsRef.current.get(message.id)!);
                            messagePlaybackIntervalsRef.current.delete(message.id);
                        }
                        newMap.set(message.id, messageDuration);
                    } else {
                        newMap.set(message.id, newPosition);
                    }
                    return newMap;
                });
            }, 1000);

            messagePlaybackIntervalsRef.current.set(message.id, interval);

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    if (status.durationMillis && duration === 0) {
                        const newDuration = Math.floor(status.durationMillis / 1000);
                        setMessageDurations(prev => new Map(prev).set(message.id, newDuration));
                    }
                    if (status.didJustFinish) {
                        handleStopMessageAudio(message.id);
                    } else if (status.positionMillis !== undefined) {
                        const position = Math.floor(status.positionMillis / 1000);
                        setMessagePlaybackPositions(prev => new Map(prev).set(message.id, position));
                    }
                }
            });

            // Start playback only after sound is loaded
            await newSound.playAsync();
        } catch (err) {
            Alert.alert('Error', `Failed to play audio message: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const handleStopMessageAudio = async (messageId: string) => {
        const messageSound = messageSounds.get(messageId);
        if (messageSound) {
            await messageSound.stopAsync();
            await messageSound.unloadAsync();
            setMessageSounds(prev => {
                const newMap = new Map(prev);
                newMap.delete(messageId);
                messageSoundsRef.current = newMap;
                return newMap;
            });
        }
        setPlayingMessageId(null);
        setMessagePlaybackPositions(prev => {
            const newMap = new Map(prev);
            newMap.set(messageId, 0);
            return newMap;
        });
        const interval = messagePlaybackIntervalsRef.current.get(messageId);
        if (interval) {
            clearInterval(interval);
            messagePlaybackIntervalsRef.current.delete(messageId);
        }
    };

    const handleCloseProductDetail = () => {
        setSelectedProduct(null);
    };

    const handleBookmarkLook = (_look: Look) => {
    };

    const handleBackFromDetail = () => {
        setSelectedProduct(null);
    };

    const handleSuggestionClick = (suggestionText: string) => {
        if (!conversationId || sendMessageMutation.isPending) return;
        handleSendMessageWithText(suggestionText);
    };

    const handleSendMessageWithText = (text?: string) => {
        const messageToSend = (text || messageText).trim();
        if (!messageToSend || !conversationId || sendMessageMutation.isPending) return;

        const userMessageContent = messageToSend;
        const queryKey = queryKeys.conversations.messages(conversationId);
        
        const optimisticUserMessage: Message = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: userMessageContent,
            message_type: 'text',
            audio_url: null,
            created_at: new Date().toISOString(),
        };
        
        const currentMessages = queryClient.getQueryData<Message[]>(queryKey) || [];
        const hasOptimistic = currentMessages.some(msg => 
            msg.id.startsWith('temp-') && msg.content === userMessageContent
        );
        if (!hasOptimistic) {
            const loadingMessage: Message = {
                id: `loading-${Date.now()}`,
                role: 'assistant',
                content: 'AI is generating response...',
                message_type: 'text',
                audio_url: null,
                created_at: new Date().toISOString(),
            };
            queryClient.setQueryData(queryKey, [...currentMessages, optimisticUserMessage, loadingMessage]);
        }
        
        setMessageText('');

        sendMessageMutation.mutate(
            {
                conversationId,
                messageData: {
                    message: {
                        content: userMessageContent,
                        message_type: 'text',
                    },
                },
            },
            {
                onSuccess: (data) => {
                    queryClient.setQueryData(
                        queryKey,
                        (oldMessages: Message[] = []) => {
                            const withoutOptimistic = oldMessages.filter(
                                msg => !msg.id.startsWith('temp-') && !msg.id.startsWith('loading-')
                            );
                            
                            const existingIds = new Set(withoutOptimistic.map(m => m.id));
                            const toAdd: Message[] = [];
                            
                            if (!existingIds.has(data.user_message.id)) {
                                toAdd.push(data.user_message);
                            }
                            
                            if (!existingIds.has(data.assistant_message.id)) {
                                toAdd.push(data.assistant_message);
                                
                                if (data.assistant_message.metadata?.tool_calls && conversationId) {
                                    ensureLooksForMessage(data.assistant_message.id, data.assistant_message);
                                }
                            } else {
                                const existingIndex = withoutOptimistic.findIndex(m => m.id === data.assistant_message.id);
                                if (existingIndex >= 0) {
                                    const existing = withoutOptimistic[existingIndex];
                                    if (data.assistant_message.metadata && !existing.metadata) {
                                        withoutOptimistic[existingIndex] = {
                                            ...existing,
                                            metadata: data.assistant_message.metadata
                                        };
                                        
                                        if (conversationId) {
                                            ensureLooksForMessage(data.assistant_message.id, data.assistant_message);
                                        }
                                    }
                                }
                            }

                            return [...withoutOptimistic, ...toAdd];
                        }
                    );
                },
                onError: () => {
                    queryClient.setQueryData(
                        queryKey,
                        (oldMessages: Message[] = []) => {
                            return oldMessages.filter(msg => !msg.id.startsWith('temp-') && !msg.id.startsWith('loading-'));
                        }
                    );
                },
            }
        );
    };

    const handleSendMessage = () => {
        handleSendMessageWithText();
    };

    const prepareAudioFormData = (audioUri: string): FormData => {
        const formData = new FormData();
        
        const filename = audioUri.split('/').pop() || 'recording.m4a';
        const match = /\.(\w+)$/.exec(filename);
        let type = 'audio/m4a'; // Default to m4a for iOS recordings
        if (match) {
            const ext = match[1].toLowerCase();
            if (ext === 'm4a') type = 'audio/m4a';
            else if (ext === 'mp3') type = 'audio/mp3';
            else if (ext === 'wav') type = 'audio/wav';
            else if (ext === 'aac') type = 'audio/aac';
            else type = 'audio/m4a'; // Default
        }
        
        const fileUri = audioUri.startsWith('file://') ? audioUri : `file://${audioUri}`;
        
        const fileObject = {
            uri: fileUri,
            type: type,
            name: filename,
        };
        
        formData.append('message[audio]', fileObject as any);
        formData.append('message[message_type]', 'voice');
        formData.append('message[content]', '');
        
        return formData;
    };

    const handleSendAudioMessage = async () => {
        if (!recordedAudioUri || !conversationId || sendMessageMutation.isPending) return;

        try {
            if (sound) {
                await stopPlayback();
            }
            
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
            } catch (_audioModeError) {
            }

            const queryKey = queryKeys.conversations.messages(conversationId);
            
            const finalDuration = recordingDurationRef.current || recordingDuration;
            const optimisticMessageId = `temp-${Date.now()}`;
            const optimisticUserMessage: Message = {
                id: optimisticMessageId,
                role: 'user',
                content: '',
                message_type: 'voice',
                audio_url: recordedAudioUri,
                created_at: new Date().toISOString(),
            };
            
            if (finalDuration > 0) {
                setMessageDurations(prev => new Map(prev).set(optimisticMessageId, finalDuration));
            }
            
            const currentMessages = queryClient.getQueryData<Message[]>(queryKey) || [];
            const hasOptimistic = currentMessages.some(msg => 
                msg.id.startsWith('temp-') && msg.message_type === 'voice'
            );
            
            if (!hasOptimistic) {
                const loadingMessage: Message = {
                    id: `loading-${Date.now()}`,
                    role: 'assistant',
                    content: 'AI is generating response...',
                    message_type: 'text',
                    audio_url: null,
                    created_at: new Date().toISOString(),
                };
                queryClient.setQueryData(queryKey, [...currentMessages, optimisticUserMessage, loadingMessage]);
            }
            
            const formData = prepareAudioFormData(recordedAudioUri);
            
            const audioUriToSend = recordedAudioUri;
            setRecordedAudioUri(null);
            setRecordingDuration(0);
            recordingDurationRef.current = 0;
            setPlaybackPosition(0);

            sendMessageMutation.mutate(
                {
                    conversationId,
                    messageData: formData as any, // Send FormData directly
                },
                {
                    onSuccess: (data) => {
                        queryClient.setQueryData(
                            queryKey,
                            (oldMessages: Message[] = []) => {
                                const withoutOptimistic = oldMessages.filter(
                                    msg => !msg.id.startsWith('temp-') && !msg.id.startsWith('loading-')
                                );
                                
                                const existingIds = new Set(withoutOptimistic.map(m => m.id));
                                const toAdd: Message[] = [];
                                
                                if (!existingIds.has(data.user_message.id)) {
                                    toAdd.push(data.user_message);
                                    const optimisticDuration = messageDurations.get(optimisticMessageId);
                                    if (optimisticDuration && optimisticDuration > 0) {
                                        setMessageDurations(prev => new Map(prev).set(data.user_message.id, optimisticDuration));
                                    }
                                }
                                
                                if (!existingIds.has(data.assistant_message.id)) {
                                    toAdd.push(data.assistant_message);
                                    if (data.assistant_message.metadata?.tool_calls && conversationId) {
                                        ensureLooksForMessage(data.assistant_message.id, data.assistant_message);
                                    }
                                } else {
                                    const existingIndex = withoutOptimistic.findIndex(m => m.id === data.assistant_message.id);
                                    if (existingIndex >= 0) {
                                        const existing = withoutOptimistic[existingIndex];
                                        if (data.assistant_message.metadata && !existing.metadata) {
                                            withoutOptimistic[existingIndex] = {
                                                ...existing,
                                                metadata: data.assistant_message.metadata
                                            };
                                            
                                            if (conversationId) {
                                                ensureLooksForMessage(data.assistant_message.id, data.assistant_message);
                                            }
                                        }
                                    }
                                }

                                return [...withoutOptimistic, ...toAdd];
                            }
                        );
                    },
                    onError: () => {
                        setRecordedAudioUri(audioUriToSend);
                        queryClient.setQueryData(
                            queryKey,
                            (oldMessages: Message[] = []) => {
                                return oldMessages.filter(msg => !msg.id.startsWith('temp-') && !msg.id.startsWith('loading-'));
                            }
                        );
                    },
                }
            );
        } catch (err) {
            Alert.alert('Error', 'Failed to send audio message. Please try again.');
        }
    };

    const getBackendUrl = (): string => {
        return Constants.expoConfig?.extra?.backendUrl || '';
    };

    const resolveMessageAudioUrl = React.useCallback((audioUrl: string): string => {
        let url = audioUrl;
        const backendUrl = getBackendUrl();
        if (url.includes('http://backend:') || url.includes('https://backend:')) {
            url = url.replace(/https?:\/\/backend:\d+/, backendUrl);
        } else if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
            url = `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        }
        return url;
    }, []);

    // Pre-load duration for voice messages so we show correct time (e.g. "0:15") instead of 0:00
    useEffect(() => {
        if (!conversationId || messages.length === 0) return;
        const voiceMessages = messages.filter(
            (m) => m.message_type === 'voice' && m.audio_url && !m.id.startsWith('temp-') && !m.id.startsWith('loading-')
        );
        if (voiceMessages.length === 0) return;
        let cancelled = false;
        (async () => {
            for (const message of voiceMessages) {
                if (cancelled) return;
                if (durationLoadRequestedRef.current.has(message.id)) continue;
                durationLoadRequestedRef.current.add(message.id);
                try {
                    const audioUrl = resolveMessageAudioUrl(message.audio_url!);
                    const { sound: loadSound } = await Audio.Sound.createAsync(
                        { uri: audioUrl },
                        { shouldPlay: false }
                    );
                    if (cancelled) {
                        loadSound.unloadAsync().catch(() => {});
                        return;
                    }
                    let duration = 0;
                    for (let attempt = 0; attempt < 15; attempt++) {
                        const status = await loadSound.getStatusAsync();
                        if (status.isLoaded && status.durationMillis) {
                            duration = Math.floor(status.durationMillis / 1000);
                            break;
                        }
                        await new Promise((r) => setTimeout(r, 100));
                    }
                    if (duration > 0) {
                        setMessageDurations((prev) => new Map(prev).set(message.id, duration));
                    }
                    await loadSound.unloadAsync();
                } catch {
                    durationLoadRequestedRef.current.delete(message.id);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [messages, conversationId, resolveMessageAudioUrl]);

    const getPersonImageUrl = (): string | null => {
        if (stylePhotos.length === 0) return null;
        const sortedPhotos = [...stylePhotos].sort((a, b) => a.position - b.position);
        const firstPhoto = sortedPhotos[0];
        
        if (firstPhoto && firstPhoto.image_url) {
            const backendUrl = getBackendUrl();
            return firstPhoto.image_url.startsWith('http://') || firstPhoto.image_url.startsWith('https://')
                ? firstPhoto.image_url
                : `${backendUrl}${firstPhoto.image_url}`;
        }
        return null;
    };

    const handleCloseTryOnModal = () => {
        setShowTryOnModal(false);
        setTryOnResult(null);
    };

    const getLooksForMessage = React.useCallback((message: Message): Look[] => {
        if (message.role === 'user') return [];

        if (conversationId) {
            const cached = getCachedLooks(message.id);
            if (cached && cached.length > 0) return cached;
        }

        const messageLooks = getLooksFromMessage(message);
        if (messageLooks.length > 0) return messageLooks;

        const preservedMetadata = messagesWithMetadataRef.current.get(message.id);
        if (preservedMetadata) {
            const messageWithMetadata = { ...message, metadata: preservedMetadata };
            return getLooksFromMessage(messageWithMetadata);
        }
        return [];
    }, [conversationId, getCachedLooks]);

    const handleRetryLook = React.useCallback(
        (messageId: string, lookIndex: number, look: Look) => {
            if (!conversationId) return;
            clearLookLightXError(messageId, lookIndex);
            generateLightXImagesForLooks(
                conversationId,
                messageId,
                [{ ...look, lightXError: undefined }],
                () => getCachedLooks(messageId) ?? [],
                updateLookLightX,
                updateLookLightXError,
                { isRetry: true, retryLookIndex: lookIndex }
            );
        },
        [
            conversationId,
            clearLookLightXError,
            getCachedLooks,
            generateLightXImagesForLooks,
            updateLookLightX,
            updateLookLightXError,
        ]
    );

    const ensureLooksForMessage = React.useCallback(
        (messageId: string, messageWithMetadata: Message) => {
            if (!conversationId) return;
            const looks = getLooksFromMessage(messageWithMetadata);
            if (looks.length === 0) return;

            const existingCached = getCachedLooks(messageId);
            if (!existingCached || existingCached.length === 0) {
                setLooksForMessage(messageId, looks).then(() => {
                    generateLightXImagesForLooks(
                        conversationId,
                        messageId,
                        looks,
                        () => getCachedLooks(messageId) ?? [],
                        updateLookLightX,
                        updateLookLightXError
                    );
                });
                return;
            }

            const mergedLooks: Look[] = [];
            const looksNeedingGeneration: Look[] = [];
            for (let index = 0; index < looks.length; index++) {
                const newLook = looks[index];
                const cachedLook = existingCached[index];
                if (cachedLook) {
                    if (cachedLook.lightXImageUrl) {
                        const productsMatch =
                            cachedLook.products.length === newLook.products.length &&
                            cachedLook.products.every((p, i) => p.id === newLook.products[i]?.id);
                        if (productsMatch) {
                            mergedLooks.push(cachedLook);
                            continue;
                        }
                    }
                    const productsMatch =
                        cachedLook.products.length === newLook.products.length &&
                        cachedLook.products.every((p, i) => p.id === newLook.products[i]?.id);
                    if (productsMatch) {
                        looksNeedingGeneration.push(cachedLook);
                        mergedLooks.push(cachedLook);
                        continue;
                    }
                }
                looksNeedingGeneration.push(newLook);
                mergedLooks.push(newLook);
            }
            setLooksForMessage(messageId, mergedLooks).then(() => {
                if (looksNeedingGeneration.length > 0) {
                    generateLightXImagesForLooks(
                        conversationId,
                        messageId,
                        looksNeedingGeneration,
                        () => getCachedLooks(messageId) ?? [],
                        updateLookLightX,
                        updateLookLightXError
                    );
                }
            });
        },
        [
            conversationId,
            getCachedLooks,
            setLooksForMessage,
            generateLightXImagesForLooks,
            updateLookLightX,
            updateLookLightXError,
        ]
    );

    if (selectedProduct) {
        return (
            <ProductDetailView
                product={selectedProduct}
                onClose={handleCloseProductDetail}
                onBack={handleBackFromDetail}
                selectedOption="existing"
            />
        );
    }

    if (selectedLook) {
        return (
            <LookDetailView
                look={selectedLook.look}
                onClose={() => setSelectedLook(null)}
                onBack={() => setSelectedLook(null)}
            />
        );
    }

    if (
        (conversationId && isLoadingConversation) ||
        (!conversationId && (isLoadingStylist || createConversationMutation.isPending || isCreatingConversation))
    ) {
        return (
            <View style={[styles.container, { backgroundColor: colors.aiChatBackground }]}>
                <StatusBar style="dark" backgroundColor="#FFFFFF" />
                <View style={[styles.statusBarBackground, { height: insets.top }]} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.text} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Setting up chat...
                    </Text>
                </View>
            </View>
        );
    }

    if (!conversationId && (!stylist || !stylist.id) && !isLoadingStylist) {
        return (
            <View style={[styles.container, { backgroundColor: colors.aiChatBackground }]}>
                <StatusBar style="dark" backgroundColor="#FFFFFF" />
                <View style={[styles.statusBarBackground, { height: insets.top }]} />
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.text }]}>
                        {!stylist 
                            ? 'No stylist selected. Please select a stylist first.'
                            : 'Stylist information is incomplete. Please try again.'}
                    </Text>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.buttonPrimary, paddingHorizontal: scaleFontSize(24), paddingVertical: scaleFontSize(12), borderRadius: scaleFontSize(8) }]}
                        onPress={handleBack}
                    >
                        <Text style={[styles.errorText, { color: colors.buttonText }]}>
                            Go Back
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const stylistIndex = displayStylist?.id ? (stylistIndexMap.get(displayStylist.id) ?? 0) : 0;
    const avatarSource = getStylistImage(displayStylist?.id, stylistIndex, displayStylist?.name);

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.aiChatBackground }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <StatusBar style="dark" backgroundColor="#FFFFFF" />
            <View style={[styles.statusBarBackground, { height: insets.top }]} />
            
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                    activeOpacity={0.7}
                >
                    <View style={styles.backButtonBackground}>
                        <ArrowLeftIcon size={scaleFontSize(12)} color="#A6A6A6" />
                    </View>
                </TouchableOpacity>
                {displayStylist && (
                    <View style={styles.stylistHeaderInfo}>
                        <Image
                            source={avatarSource}
                            style={styles.headerAvatar}
                            resizeMode="cover"
                        />
                        <View style={styles.stylistInfo}>
                            <Text style={[styles.stylistNameHeader, { color: colors.text }]} numberOfLines={1}>
                                {displayStylist.name}
                            </Text>
                            {displayStylist.specialization && (
                                <Text style={[styles.stylistSpecialization, { color: colors.textSecondary }]} numberOfLines={1}>
                                    {displayStylist.specialization}
                                </Text>
                            )}
                        </View>
                    </View>
                )}
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={handleMenuPress}
                    activeOpacity={0.7}
                >
                    <View style={styles.menuButtonBackground}>
                        <Ionicons name="ellipsis-horizontal" size={scaleFontSize(20)} color="#A6A6A6" />
                    </View>
                </TouchableOpacity>
            </View>

            {conversationId ? (
                <View style={styles.chatContainer}>
                    {isLoadingMessages ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.text} />
                        </View>
                    ) : messages.length === 0 ? (
                        <EmptyChatView
                            avatarSource={avatarSource}
                            firstName={firstName}
                            onSuggestionClick={handleSuggestionClick}
                        />
                    ) : (
                        <FlatList
                            data={[...messages].reverse()}
                            keyExtractor={(item) => item.id}
                            inverted
                            style={styles.messagesList}
                            contentContainerStyle={styles.messagesContent}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item: message }) => {
                                const isUser = message.role === 'user';
                                const stylistIndex = displayStylist?.id ? (stylistIndexMap.get(displayStylist.id) ?? 0) : 0;
                                const messageAvatarSource = getStylistImage(displayStylist?.id, stylistIndex, displayStylist?.name);
                                const looks = getLooksForMessage(message);
                                const messageMetadata = message.metadata ?? messagesWithMetadataRef.current.get(message.id);
                                const lookIndicesWithTryOn = getLookIndicesWithTryOn(messageMetadata, looks);
                                const isPlaying = playingMessageId === message.id;
                                const playbackPosition = messagePlaybackPositions.get(message.id) || 0;
                                const messageDuration = messageDurations.get(message.id) || 0;

                                return (
                                    <MessageBubble
                                        message={message}
                                        isUser={isUser}
                                        avatarSource={messageAvatarSource}
                                        looks={looks}
                                        lookIndicesWithTryOn={lookIndicesWithTryOn}
                                        generatingLightXImages={generatingLightXImages}
                                        isPlaying={isPlaying}
                                        playbackPosition={playbackPosition}
                                        messageDuration={messageDuration}
                                        onPlayAudio={() => handlePlayMessageAudio(message)}
                                        onStopAudio={() => handleStopMessageAudio(message.id)}
                                        onLookPress={(messageId, lookIndex, look) => {
                                            setSelectedLook({
                                                messageId,
                                                lookIndex,
                                                look,
                                            });
                                        }}
                                        onBookmarkLook={handleBookmarkLook}
                                        onRetryLook={handleRetryLook}
                                        formatDuration={formatDuration}
                                    />
                                );
                            }}
                        />
                    )}
                </View>
            ) : (
                <View style={styles.content}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={avatarSource}
                            style={styles.imageStyle}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={[styles.greeting, { color: colors.text }]}>
                        {translations.aiChat.greeting.replace('{firstName}', firstName)}
                    </Text>

                    <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                        {translations.aiChat.instruction}
                    </Text>

                    <TouchableOpacity style={styles.microphoneButton} activeOpacity={0.8}>
                        <View style={styles.micContainer}>
                            <Animated.View
                                style={[
                                    styles.micOuter,
                                    {
                                        backgroundColor: '#E3E5E5',
                                        transform: [{ scale: outerPulse }],
                                    },
                                ]}
                                renderToHardwareTextureAndroid={true}
                                shouldRasterizeIOS={true}
                            >
                                <Animated.View
                                    style={[
                                        styles.micMiddle,
                                        {
                                            backgroundColor: colors.micInner,
                                            transform: [{ scale: middlePulse }],
                                        },
                                    ]}
                                    renderToHardwareTextureAndroid={true}
                                    shouldRasterizeIOS={true}
                                >
                                    <Animated.View
                                        style={[
                                            styles.micInner,
                                            {
                                                backgroundColor: colors.micMiddle,
                                                borderWidth: scaleFontSize(2),
                                                borderColor: '#FFFFFF',
                                                transform: [{ scale: innerPulse }],
                                            },
                                        ]}
                                        renderToHardwareTextureAndroid={true}
                                        shouldRasterizeIOS={true}
                                    />
                                </Animated.View>
                            </Animated.View>
                            <View style={styles.micIconContainer}>
                                <MicIcon size={scaleFontSize(24)} color="#FFFFFF" />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {conversationId && (
                <View style={styles.bottomBarContainer}>
                    <View style={[styles.bottomBar, { backgroundColor: 'white' }]}>
                        {isRecording || recordedAudioUri ? (
                            <VoiceCard
                                isRecording={isRecording}
                                recordedAudioUri={recordedAudioUri}
                                recordingDuration={recordingDuration}
                                playbackPosition={playbackPosition}
                                isPlaying={isPlaying}
                                isSending={sendMessageMutation.isPending}
                                maxDuration={MAX_RECORDING_DURATION}
                                onMicToggle={handleMicToggle}
                                onCancel={handleCancelRecording}
                                onPlay={playRecordedAudio}
                                onStopPlayback={stopPlayback}
                                onSend={handleSendAudioMessage}
                                formatDuration={formatDuration}
                            />
                        ) : (
                            <InputBar
                                messageText={messageText}
                                onMessageTextChange={setMessageText}
                                onSend={handleSendMessage}
                                onMicPress={handleMicToggle}
                                isSending={sendMessageMutation.isPending}
                            />
                        )}
                    </View>
                </View>
            )}

            {!conversationId && (
                <View style={styles.bottomBarContainer}>
                    <View style={[styles.bottomBar, { backgroundColor: 'white' }]}>
                        {isRecording || recordedAudioUri ? (
                            <VoiceCard
                                isRecording={isRecording}
                                recordedAudioUri={recordedAudioUri}
                                recordingDuration={recordingDuration}
                                playbackPosition={playbackPosition}
                                isPlaying={isPlaying}
                                isSending={sendMessageMutation.isPending}
                                maxDuration={MAX_RECORDING_DURATION}
                                onMicToggle={handleMicToggle}
                                onCancel={handleCancelRecording}
                                onPlay={playRecordedAudio}
                                onStopPlayback={stopPlayback}
                                onSend={handleSendAudioMessage}
                                formatDuration={formatDuration}
                            />
                        ) : (
                            <InputBar
                                messageText={messageText}
                                onMessageTextChange={setMessageText}
                                onSend={handleSendMessage}
                                onMicPress={handleMicToggle}
                                isSending={sendMessageMutation.isPending}
                                showRefineInput={true}
                            />
                        )}
                    </View>
                </View>
            )}

            <MenuModal
                visible={showMenuModal}
                onClose={handleCloseMenuModal}
                onViewChatHistory={handleViewChatHistory}
                onChangeStylist={handleChangeStylistPress}
            />

            <ChangeStylistModal
                visible={showChangeStylistModal}
                onClose={handleCloseChangeStylistModal}
                selectedStylist={selectedStylistForChange}
                currentStylist={stylist || null}
                onSelectStylist={handleStylistSelection}
            />

            <TryOnModal
                visible={showTryOnModal}
                onClose={handleCloseTryOnModal}
                resultUrl={tryOnResult?.resultUrl || null}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statusBarBackground: {
        width: '100%',
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(20),
        paddingTop: scaleFontSize(12),
        paddingBottom: scaleFontSize(16),
        position: 'relative',
        zIndex: 1,
    },
    stylistHeaderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: scaleFontSize(16),
    },
    headerAvatar: {
        width: scaleFontSize(40),
        height: scaleFontSize(40),
        borderRadius: scaleFontSize(20),
        marginRight: scaleFontSize(12),
    },
    stylistInfo: {
        flex: 1,
    },
    stylistNameHeader: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
        marginBottom: scaleFontSize(2),
    },
    stylistSpecialization: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
    },
    backButton: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonBackground: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginTop: scaleFontSize(12),
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(24),
    },
    errorText: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        textAlign: 'center',
        marginBottom: scaleFontSize(24),
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: scaleFontSize(24),
        paddingTop: scaleFontSize(20),
    },
    chatContainer: {
        flex: 1,
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        paddingHorizontal: scaleFontSize(20),
        paddingTop: scaleFontSize(16),
        paddingBottom: scaleFontSize(16),
    },
    imageContainer: {
        marginBottom: scaleFontSize(24),
    },
    imageStyle: {
        width: scaleFontSize(200),
        height: scaleFontSize(240),
    },
    greeting: {
        fontSize: scaleFontSize(32),
        fontFamily: FONTS.hermannRegular,
        fontWeight: '400',
        marginBottom: scaleFontSize(16),
        textAlign: 'center',
    },
    instruction: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoRegular,
        lineHeight: scaleFontSize(24),
        textAlign: 'center',
        marginBottom: scaleFontSize(24),
        paddingHorizontal: scaleFontSize(20),
    },
    microphoneButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    micContainer: {
        width: scaleFontSize(120),
        height: scaleFontSize(120),
        alignItems: 'center',
        justifyContent: 'center',
    },
    micIconContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: scaleFontSize(42),
        height: scaleFontSize(42),
    },
    micOuter: {
        width: scaleFontSize(100),
        height: scaleFontSize(100),
        borderRadius: scaleFontSize(24),
        justifyContent: 'center',
        alignItems: 'center',
    },
    micMiddle: {
        width: scaleFontSize(70),
        height: scaleFontSize(70),
        borderRadius: scaleFontSize(18),
        justifyContent: 'center',
        alignItems: 'center',
    },
    micInner: {
        width: scaleFontSize(42),
        height: scaleFontSize(42),
        borderRadius: scaleFontSize(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomBarContainer: {
        paddingTop: scaleFontSize(8),
    },
    bottomBar: {
        borderTopLeftRadius: scaleFontSize(20),
        borderTopRightRadius: scaleFontSize(20),
        paddingHorizontal: scaleFontSize(20),
        paddingTop: scaleFontSize(16),
        paddingBottom: scaleFontSize(24),
    },
    messageInput: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(12),
    },
    refineInput: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(12),
        borderWidth: 1,
        borderColor: '#E3E5E5',
        borderRadius: scaleFontSize(8),
        paddingHorizontal: scaleFontSize(12),
        paddingVertical: scaleFontSize(10),
    },
    buttonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleFontSize(12),
    },
    circleButton: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonBackground: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuButton: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuButtonBackground: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

