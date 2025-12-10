import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { scaleFontSize } from '@/src/utils/FontSizeUtil';
import ToastComponent, { ToastData, ToastType } from '@/src/components/common/Toast';
import { setToastContext } from '@/src/utils/toast';

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = 'info', duration: number = 3000) => {
            const id = `toast-${Date.now()}-${Math.random()}`;
            const newToast: ToastData = {
                id,
                message,
                type,
                duration,
            };

            setToasts((prev) => [...prev, newToast]);
        },
        []
    );

    const showSuccess = useCallback(
        (message: string, duration?: number) => {
            showToast(message, 'success', duration);
        },
        [showToast]
    );

    const showError = useCallback(
        (message: string, duration?: number) => {
            showToast(message, 'error', duration || 4000);
        },
        [showToast]
    );

    const showWarning = useCallback(
        (message: string, duration?: number) => {
            showToast(message, 'warning', duration);
        },
        [showToast]
    );

    const showInfo = useCallback(
        (message: string, duration?: number) => {
            showToast(message, 'info', duration);
        },
        [showToast]
    );

    // Initialize toast utility functions
    useEffect(() => {
        setToastContext({
            showToast,
            showSuccess,
            showError,
            showWarning,
            showInfo,
        });
    }, [showToast, showSuccess, showError, showWarning, showInfo]);

    return (
        <ToastContext.Provider
            value={{
                showToast,
                showSuccess,
                showError,
                showWarning,
                showInfo,
            }}
        >
            {children}
            <View style={styles.toastWrapper} pointerEvents="box-none">
                {toasts.map((toast, index) => (
                    <View
                        key={toast.id}
                        style={[
                            styles.toastItem,
                            {
                                top: scaleFontSize(60) + index * scaleFontSize(70),
                            },
                        ]}
                    >
                        <ToastComponent toast={toast} onHide={removeToast} />
                    </View>
                ))}
            </View>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const styles = StyleSheet.create({
    toastWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        pointerEvents: 'box-none',
    },
    toastItem: {
        position: 'absolute',
        left: 0,
        right: 0,
    },
});

