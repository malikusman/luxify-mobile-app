import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import { useThemeColors } from '@/src/theme/Colors';
import { FONTS } from '@/src/constants/fonts';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastProps {
    toast: ToastData;
    onHide: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onHide }) => {
    const colors = useThemeColors();
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Slide in animation
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto hide after duration
        const timer = setTimeout(() => {
            hideToast();
        }, toast.duration || 3000);

        return () => clearTimeout(timer);
    }, []);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide(toast.id);
        });
    };

    const getToastStyles = () => {
        switch (toast.type) {
            case 'success':
                return {
                    backgroundColor: '#10B981',
                    icon: 'checkmark-circle',
                    iconColor: '#FFFFFF',
                };
            case 'error':
                return {
                    backgroundColor: '#EF4444',
                    icon: 'close-circle',
                    iconColor: '#FFFFFF',
                };
            case 'warning':
                return {
                    backgroundColor: '#F59E0B',
                    icon: 'warning',
                    iconColor: '#FFFFFF',
                };
            case 'info':
            default:
                return {
                    backgroundColor: colors.buttonPrimary || '#3B82F6',
                    icon: 'information-circle',
                    iconColor: '#FFFFFF',
                };
        }
    };

    const toastStyles = getToastStyles();

    return (
        <Animated.View
            style={[
                styles.toastContainer,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                    backgroundColor: toastStyles.backgroundColor,
                },
            ]}
        >
            <TouchableOpacity
                style={styles.toastContent}
                onPress={hideToast}
                activeOpacity={0.8}
            >
                <Ionicons
                    name={toastStyles.icon as any}
                    size={scaleFontSize(20)}
                    color={toastStyles.iconColor}
                />
                <Text style={[styles.toastMessage, { color: '#FFFFFF' }]}>
                    {toast.message}
                </Text>
                <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
                    <Ionicons
                        name="close"
                        size={scaleFontSize(18)}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: scaleFontSize(60),
        left: scaleFontSize(16),
        right: scaleFontSize(16),
        borderRadius: scaleFontSize(12),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 9999,
    },
    toastContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scaleFontSize(16),
        paddingVertical: scaleFontSize(12),
        gap: scaleFontSize(12),
    },
    toastMessage: {
        flex: 1,
        fontSize: scaleFontSize(14),
        lineHeight: scaleFontSize(20),
        fontFamily: FONTS.nunitoRegular,
    },
    closeButton: {
        padding: scaleFontSize(4),
    },
});

export default ToastComponent;

