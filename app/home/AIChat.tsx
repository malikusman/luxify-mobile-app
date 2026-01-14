import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Animated, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { RootState } from '@/src/context/store';
import { setMessageProducts } from '@/src/context/slices/conversationProductsSlice';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';
import { translations } from '@/src/constants/translations';
import { DEFAULTS, ANIMATION } from '@/src/constants/constants';
import ArrowLeftIcon from '@/src/components/icons/ArrowLeftIcon';
import MicIcon from '@/src/components/icons/MicIcon';
import SendIcon from '@/src/components/icons/SendIcon';
import ProductDetailView from '@/src/components/home/ProductDetailView';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfileSelector, useMyStylist, useConversation, useMessages, useCreateConversation, useSendMessage } from '@/src/services';
import { Message, Product, MessageMetadata } from '@/src/services/modules/conversations/conversationTypes';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/services/queryClient';
import { Linking } from 'react-native';

function getProductsFromMessage(message: Message): Product[] {
    if (!message.metadata) {
        return [];
    }
    
    if (!message.metadata.tool_calls || !Array.isArray(message.metadata.tool_calls)) {
        return [];
    }
    
    try {
        const products: Product[] = [];
        
        for (const toolCall of message.metadata.tool_calls) {
            if (toolCall.tool_name === 'search_products_online') {
                if (toolCall.tool_output?.products && Array.isArray(toolCall.tool_output.products)) {
                    for (const product of toolCall.tool_output.products) {
                        if (product && product.id && product.title && product.image_url) {
                            products.push(product);
                        }
                    }
                }
            }
        }
        
        return products;
    } catch (error) {
        console.error('Error extracting products from message:', error, message);
        return [];
    }
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
    
    const [conversationId, setConversationId] = useState<string | null>(params.conversationId || null);
    
    const emptyProducts = React.useRef<Record<string, Product[]>>({});
    
    const cachedProducts = useSelector((state: RootState) => {
        if (!conversationId) return emptyProducts.current;
        const products = state.conversationProducts[conversationId] || emptyProducts.current;
        console.log('Redux cachedProducts for conversation:', conversationId, products);
        return products;
    }, shallowEqual);
    const [messageText, setMessageText] = useState('');
    const [isMicActive, setIsMicActive] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    
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
        { enabled: !!conversationId && !isMicActive }
    );
    
    const queryClient = useQueryClient();
    const scrollViewRef = useRef<ScrollView>(null);
    const messagesEndRef = useRef<View>(null);
    const hasScrolledToBottom = useRef(false);
    const isInitialLoad = useRef(true);
    const messagesWithMetadataRef = useRef<Map<string, MessageMetadata>>(new Map());
    const processedMessagesRef = useRef<Set<string>>(new Set());
    const messagesIdsRef = useRef<string>('');

    useEffect(() => {
        if (!conversationId || messages.length === 0) return;
        
        const currentMessagesIds = messages.map(m => m.id).join(',');
        if (currentMessagesIds === messagesIdsRef.current) return;
        messagesIdsRef.current = currentMessagesIds;
        
        messages.forEach(msg => {
            const messageKey = `${conversationId}-${msg.id}`;
            if (processedMessagesRef.current.has(messageKey)) return;
            
            if (msg.metadata && msg.metadata.tool_calls && msg.metadata.tool_calls.length > 0) {
                messagesWithMetadataRef.current.set(msg.id, msg.metadata);
                
                const products = getProductsFromMessage(msg);
                if (products.length > 0) {
                    const existingCached = cachedProducts[msg.id];
                    if (!existingCached || existingCached.length === 0) {
                        dispatch(setMessageProducts({
                            conversationId,
                            messageId: msg.id,
                            products,
                        }));
                    }
                }
            }
            
            processedMessagesRef.current.add(messageKey);
        });
    }, [messages.length, conversationId, dispatch]);

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
        isInitialLoad.current = true;
        hasScrolledToBottom.current = false;
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
                console.error('Stylist ID is missing:', stylist);
                return;
            }
            setIsCreatingConversation(true);
            createConversationMutation.mutate(stylistId, {
                onSuccess: (newConversation) => {
                    setConversationId(newConversation.id);
                    setIsCreatingConversation(false);
                },
                onError: (error) => {
                    console.error('Failed to create conversation:', error);
                    setIsCreatingConversation(false);
                },
            });
        }
    }, [stylist?.id, conversationId, isLoadingStylist, createConversationMutation.isPending, isCreatingConversation]);

    useEffect(() => {
        if (messages.length > 0 && scrollViewRef.current) {
            if (isInitialLoad.current) {
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: false });
                    isInitialLoad.current = false;
                    hasScrolledToBottom.current = true;
                }, 100);
            } else if (hasScrolledToBottom.current) {
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        }
    }, [messages.length]);


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

    const handleMicToggle = () => {
        setIsMicActive(true);
    };

    const handleCloseMic = () => {
        setIsMicActive(false);
    };

    const handleCloseProductDetail = () => {
        setSelectedProduct(null);
    };

    const handleBackFromDetail = () => {
        setSelectedProduct(null);
    };

    const handleSendMessage = () => {
        if (!messageText.trim() || !conversationId || sendMessageMutation.isPending) return;

        const userMessageContent = messageText.trim();
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

        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

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
                                    const products = getProductsFromMessage(data.assistant_message);
                                    if (products.length > 0) {
                                        dispatch(setMessageProducts({
                                            conversationId,
                                            messageId: data.assistant_message.id,
                                            products,
                                        }));
                                        console.log(`Cached ${products.length} products for message ${data.assistant_message.id} in Redux`);
                                    }
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
                                            const products = getProductsFromMessage(data.assistant_message);
                                            if (products.length > 0) {
                                                dispatch(setMessageProducts({
                                                    conversationId,
                                                    messageId: data.assistant_message.id,
                                                    products,
                                                }));
                                            }
                                        }
                                    }
                                }
                            }
                            
                            return [...withoutOptimistic, ...toAdd];
                        }
                    );
                    setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 100);
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

    const handleProductPress = async (product: Product) => {
        if (product.product_url) {
            try {
                const canOpen = await Linking.canOpenURL(product.product_url);
                if (canOpen) {
                    await Linking.openURL(product.product_url);
                }
            } catch (error) {
                console.error('Error opening product URL:', error);
            }
        }
    };

    const renderProductCard = (product: Product, index: number) => {
        return (
            <TouchableOpacity
                key={product.id}
                style={[styles.messageProductCard, { backgroundColor: colors.card }]}
                onPress={() => handleProductPress(product)}
                activeOpacity={0.7}
            >
                <Image
                    source={{ uri: product.image_url }}
                    style={styles.messageProductImage}
                    resizeMode="cover"
                />
                <View style={styles.messageProductInfo}>
                    <Text style={[styles.messageProductTitle, { color: colors.text }]} numberOfLines={2}>
                        {product.title}
                    </Text>
                    {product.brand && (
                        <Text style={[styles.messageProductBrand, { color: colors.textSecondary }]} numberOfLines={1}>
                            {product.brand}
                        </Text>
                    )}
                    <Text style={[styles.messageProductPrice, { color: colors.text }]}>
                        {product.price}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const getProductsForMessage = React.useCallback((message: Message): Product[] => {
        if (message.role === 'user') {
            return [];
        }
        
        const messageProducts = getProductsFromMessage(message);
        if (messageProducts.length > 0) {
            console.log(`Products from message metadata for ${message.id}:`, messageProducts.length);
            return messageProducts;
        }
        
        if (conversationId) {
            const cached = cachedProducts[message.id];
            if (cached && cached.length > 0) {
                console.log(`Products from Redux for message ${message.id}:`, cached.length, cached);
                return cached;
            } else {
                console.log(`No products in Redux for message ${message.id}, cachedProducts:`, cachedProducts);
            }
        }
        
        const preservedMetadata = messagesWithMetadataRef.current.get(message.id);
        if (preservedMetadata) {
            const messageWithMetadata = { ...message, metadata: preservedMetadata };
            const products = getProductsFromMessage(messageWithMetadata);
            if (products.length > 0) {
                console.log(`Products from preserved metadata for ${message.id}:`, products.length);
            }
            return products;
        }
        
        return [];
    }, [conversationId, cachedProducts]);

    const renderMessage = (message: Message, index: number) => {
        const isUser = message.role === 'user';
        const isLoading = message.id.startsWith('loading-');
        const avatarSource = displayStylist?.avatar_url
            ? { uri: displayStylist.avatar_url }
            : require('@/assets/ava.png');
        
        const products = getProductsForMessage(message);
        const hasProducts = products.length > 0;
        

        return (
            <View key={message.id}>
                <View
                    style={[
                        styles.messageContainer,
                        isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
                    ]}
                >
                    {!isUser && (
                        <Image
                            source={avatarSource}
                            style={styles.messageAvatar}
                            resizeMode="cover"
                        />
                    )}
                    <View
                        style={[
                            styles.messageBubble,
                            isUser
                                ? { backgroundColor: colors.buttonPrimary }
                                : { backgroundColor: colors.card },
                        ]}
                    >
                        {isLoading ? (
                            <View style={styles.loadingMessageContainer}>
                                <ActivityIndicator size="small" color={colors.textSecondary} />
                                <Text
                                    style={[
                                        styles.messageText,
                                        { color: colors.textSecondary, marginLeft: scaleFontSize(8) },
                                    ]}
                                >
                                    {message.content}
                                </Text>
                            </View>
                        ) : (
                            <Text
                                style={[
                                    styles.messageText,
                                    { color: isUser ? colors.buttonText : colors.text },
                                ]}
                            >
                                {message.content}
                            </Text>
                        )}
                    </View>
                </View>
                
                {hasProducts && products.length > 0 && (
                    <View style={styles.messageProductsSection}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.messageProductsScrollContainer}
                            style={styles.messageProductsScrollView}
                        >
                            {products.map((product, productIndex) => {
                                if (!product || !product.id || !product.title || !product.image_url) {
                                    return null;
                                }
                                return renderProductCard(product, productIndex);
                            })}
                        </ScrollView>
                    </View>
                )}
            </View>
        );
    };

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

    const avatarSource = displayStylist?.avatar_url
        ? { uri: displayStylist.avatar_url }
        : require('@/assets/ava.png');

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
                {isMicActive && (
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleCloseMic}
                        activeOpacity={0.7}
                    >
                        <View style={styles.closeButtonBackground}>
                            <Ionicons name="close" size={scaleFontSize(16)} color="#A6A6A6" />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            {isMicActive ? (
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
            ) : conversationId ? (
                <View style={styles.chatContainer}>
                    {isLoadingMessages ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.text} />
                        </View>
                    ) : messages.length === 0 ? (
                        <View style={styles.emptyChatContainer}>
                            <Image
                                source={avatarSource}
                                style={styles.emptyChatAvatar}
                                resizeMode="contain"
                            />
                            <Text style={[styles.greeting, { color: colors.text }]}>
                                {translations.aiChat.greeting.replace('{firstName}', firstName)}
                            </Text>
                            <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                                {translations.aiChat.instruction}
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.messagesList}
                            contentContainerStyle={styles.messagesContent}
                            showsVerticalScrollIndicator={false}
                            onContentSizeChange={() => {
                                if (isInitialLoad.current || hasScrolledToBottom.current) {
                                    setTimeout(() => {
                                        scrollViewRef.current?.scrollToEnd({ 
                                            animated: !isInitialLoad.current 
                                        });
                                        if (isInitialLoad.current) {
                                            isInitialLoad.current = false;
                                            hasScrolledToBottom.current = true;
                                        }
                                    }, 50);
                                }
                            }}
                        >
                            {messages.map((message, index) => renderMessage(message, index))}
                            <View ref={messagesEndRef} />
                        </ScrollView>
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

            {conversationId && !isMicActive && (
                <View style={styles.bottomBarContainer}>
                    <View style={[styles.bottomBar, { backgroundColor: 'white' }]}>
                        <TextInput
                            style={[styles.messageInput, { color: colors.text }]}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.textSecondary}
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline={false}
                            onSubmitEditing={handleSendMessage}
                            returnKeyType="send"
                            editable={!sendMessageMutation.isPending}
                        />
                        <View style={styles.buttonsRow}>
                            <View style={styles.leftButtons}>
                                <TouchableOpacity style={[styles.circleButton, { backgroundColor: colors.bottomBarButtonBackground }]} activeOpacity={0.7}>
                                    <Ionicons name="add" size={scaleFontSize(20)} color={colors.text} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.circleButton, { backgroundColor: colors.bottomBarButtonBackground }]} 
                                    activeOpacity={0.7}
                                    onPress={handleMicToggle}
                                >
                                    <MicIcon size={scaleFontSize(20)} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity 
                                style={[
                                    styles.circleButton, 
                                    { 
                                        backgroundColor: messageText.trim() ? colors.buttonPrimary : colors.bottomBarButtonBackground 
                                    }
                                ]} 
                                activeOpacity={0.7}
                                onPress={handleSendMessage}
                                disabled={!messageText.trim() || sendMessageMutation.isPending}
                            >
                                {sendMessageMutation.isPending ? (
                                    <ActivityIndicator size="small" color={colors.buttonText} />
                                ) : (
                                    <SendIcon size={scaleFontSize(12)} color={messageText.trim() ? colors.buttonText : colors.textSecondary} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {!conversationId && !isMicActive && (
                <View style={styles.bottomBarContainer}>
                    <View style={[styles.bottomBar, { backgroundColor: 'white' }]}>
                        <TextInput
                            style={[styles.refineInput, { color: colors.text }]}
                            placeholder={translations.aiChat.refinePlaceholder}
                            placeholderTextColor={colors.textSecondary}
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline={false}
                        />
                        <View style={styles.buttonsRow}>
                            <View style={styles.leftButtons}>
                                <TouchableOpacity style={[styles.circleButton, { backgroundColor: colors.bottomBarButtonBackground }]} activeOpacity={0.7}>
                                    <Ionicons name="add" size={scaleFontSize(20)} color={colors.text} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.circleButton, { backgroundColor: colors.bottomBarButtonBackground }]} 
                                    activeOpacity={0.7}
                                    onPress={handleMicToggle}
                                >
                                    <MicIcon size={scaleFontSize(20)} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={[styles.circleButton, { backgroundColor: colors.bottomBarButtonBackground }]} activeOpacity={0.7}>
                                <SendIcon size={scaleFontSize(12)} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
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
    messageContainer: {
        flexDirection: 'row',
        marginBottom: scaleFontSize(16),
        alignItems: 'flex-end',
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
    },
    assistantMessageContainer: {
        justifyContent: 'flex-start',
    },
    messageAvatar: {
        width: scaleFontSize(32),
        height: scaleFontSize(32),
        borderRadius: scaleFontSize(16),
        marginRight: scaleFontSize(8),
    },
    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(12),
        borderRadius: scaleFontSize(16),
    },
    messageText: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoRegular,
        lineHeight: scaleFontSize(20),
    },
    loadingMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emptyChatContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scaleFontSize(24),
    },
    emptyChatAvatar: {
        width: scaleFontSize(200),
        height: scaleFontSize(240),
        marginBottom: scaleFontSize(24),
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
        marginBottom: scaleFontSize(48),
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
    messageProductsSection: {
        marginTop: scaleFontSize(12),
        marginBottom: scaleFontSize(16),
        paddingHorizontal: scaleFontSize(20),
    },
    messageProductsScrollView: {
        marginHorizontal: scaleFontSize(-20),
    },
    messageProductsScrollContainer: {
        paddingHorizontal: scaleFontSize(20),
        paddingRight: scaleFontSize(32),
    },
    messageProductCard: {
        width: scaleFontSize(200),
        marginRight: scaleFontSize(12),
        borderRadius: scaleFontSize(12),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    messageProductImage: {
        width: '100%',
        height: scaleFontSize(200),
        backgroundColor: '#f0f0f0',
    },
    messageProductInfo: {
        padding: scaleFontSize(12),
    },
    messageProductTitle: {
        fontSize: scaleFontSize(14),
        fontFamily: FONTS.nunitoMedium,
        fontWeight: '600',
        marginBottom: scaleFontSize(4),
        lineHeight: scaleFontSize(18),
    },
    messageProductBrand: {
        fontSize: scaleFontSize(12),
        fontFamily: FONTS.nunitoRegular,
        marginBottom: scaleFontSize(4),
    },
    messageProductPrice: {
        fontSize: scaleFontSize(16),
        fontFamily: FONTS.nunitoBold,
        fontWeight: '700',
        marginTop: scaleFontSize(4),
    },
});
