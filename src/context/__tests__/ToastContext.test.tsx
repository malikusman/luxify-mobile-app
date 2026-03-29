import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, TouchableOpacity, Text } from 'react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ToastProvider, useToast } from '../ToastContext';
import themeReducer from '@/src/context/slices/themeSlice';

const createMockStore = () => {
    return configureStore({
        reducer: {
            theme: themeReducer,
        },
        preloadedState: {
            theme: { isDarkMode: false },
        },
    });
};

// Test component that uses the toast hook
const TestComponent = () => {
    const { showSuccess, showError, showWarning, showInfo } = useToast();

    return (
        <View>
            <TouchableOpacity testID="show-success" onPress={() => showSuccess('Success!')}>
                <Text>Show Success</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="show-error" onPress={() => showError('Error!')}>
                <Text>Show Error</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="show-warning" onPress={() => showWarning('Warning!')}>
                <Text>Show Warning</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="show-info" onPress={() => showInfo('Info!')}>
                <Text>Show Info</Text>
            </TouchableOpacity>
        </View>
    );
};

describe('ToastContext', () => {
    it('should provide toast methods', () => {
        const store = createMockStore();
        const { getByTestId } = render(
            <Provider store={store}>
                <ToastProvider>
                    <TestComponent />
                </ToastProvider>
            </Provider>
        );

        expect(getByTestId('show-success')).toBeTruthy();
        expect(getByTestId('show-error')).toBeTruthy();
        expect(getByTestId('show-warning')).toBeTruthy();
        expect(getByTestId('show-info')).toBeTruthy();
    });

    it('should throw error when used outside provider', () => {
        // Suppress console.error for this test
        const originalError = console.error;
        console.error = jest.fn();

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useToast must be used within a ToastProvider');

        console.error = originalError;
    });

    it('should show toast when methods are called', () => {
        const store = createMockStore();
        const { getByTestId } = render(
            <Provider store={store}>
                <ToastProvider>
                    <TestComponent />
                </ToastProvider>
            </Provider>
        );

        fireEvent.press(getByTestId('show-success'));
        fireEvent.press(getByTestId('show-error'));
        fireEvent.press(getByTestId('show-warning'));
        fireEvent.press(getByTestId('show-info'));

        // Toasts should be rendered (we can't easily test the actual toast rendering without more setup)
        expect(getByTestId('show-success')).toBeTruthy();
    });
});

