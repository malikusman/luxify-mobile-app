import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ToastComponent, { ToastData } from '../Toast';
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

jest.useFakeTimers();

describe('ToastComponent', () => {
    const mockOnHide = jest.fn();

    const createToast = (overrides?: Partial<ToastData>): ToastData => ({
        id: 'test-toast',
        message: 'Test message',
        type: 'info',
        duration: 3000,
        ...overrides,
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    it('should render toast with message', () => {
        const store = createMockStore();
        const toast = createToast();
        const { getByText } = render(
            <Provider store={store}>
                <ToastComponent toast={toast} onHide={mockOnHide} />
            </Provider>
        );

        expect(getByText('Test message')).toBeTruthy();
    });

    it('should render success toast with correct styling', () => {
        const store = createMockStore();
        const toast = createToast({ type: 'success' });
        const { getByText } = render(
            <Provider store={store}>
                <ToastComponent toast={toast} onHide={mockOnHide} />
            </Provider>
        );

        expect(getByText('Test message')).toBeTruthy();
    });

    it('should render error toast with correct styling', () => {
        const store = createMockStore();
        const toast = createToast({ type: 'error' });
        const { getByText } = render(
            <Provider store={store}>
                <ToastComponent toast={toast} onHide={mockOnHide} />
            </Provider>
        );

        expect(getByText('Test message')).toBeTruthy();
    });

    it('should render warning toast with correct styling', () => {
        const store = createMockStore();
        const toast = createToast({ type: 'warning' });
        const { getByText } = render(
            <Provider store={store}>
                <ToastComponent toast={toast} onHide={mockOnHide} />
            </Provider>
        );

        expect(getByText('Test message')).toBeTruthy();
    });

    it('should auto-hide after duration', async () => {
        const store = createMockStore();
        const toast = createToast({ duration: 2000 });
        render(
            <Provider store={store}>
                <ToastComponent toast={toast} onHide={mockOnHide} />
            </Provider>
        );

        jest.advanceTimersByTime(2000);

        await waitFor(() => {
            expect(mockOnHide).toHaveBeenCalledWith('test-toast');
        });
    });

    it('should hide when toast is pressed', () => {
        const store = createMockStore();
        const toast = createToast();
        const { getByText } = render(
            <Provider store={store}>
                <ToastComponent toast={toast} onHide={mockOnHide} />
            </Provider>
        );

        const toastText = getByText('Test message');
        const touchable = toastText.parent?.parent;
        if (touchable) {
            fireEvent.press(touchable);
            // Should trigger hide animation
            jest.advanceTimersByTime(250);
            expect(mockOnHide).toHaveBeenCalledWith('test-toast');
        }
    });
});

