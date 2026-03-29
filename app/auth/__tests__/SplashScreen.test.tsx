import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SplashScreen from '../SplashScreen';
import themeReducer from '@/src/context/slices/themeSlice';
import authReducer from '@/src/context/slices/authSlice';

const mockRouterReplace = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({
        replace: mockRouterReplace,
    }),
}));

const createMockStore = (authState = {}) => {
    return configureStore({
        reducer: {
            theme: themeReducer,
            auth: authReducer,
        },
        preloadedState: {
            theme: { isDarkMode: false },
            auth: {
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                user: null,
                ...authState,
            },
        },
    });
};

describe('SplashScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('should render splash screen', () => {
        const store = createMockStore();
        const { UNSAFE_getByType } = render(
            <Provider store={store}>
                <SplashScreen />
            </Provider>
        );
        const image = UNSAFE_getByType('Image');
        expect(image).toBeTruthy();
    });

    it('should navigate to login when user is not authenticated', async () => {
        const store = createMockStore({
            isAuthenticated: false,
            accessToken: null,
        });

        render(
            <Provider store={store}>
                <SplashScreen />
            </Provider>
        );

        expect(mockRouterReplace).not.toHaveBeenCalled();

        jest.advanceTimersByTime(2000);

        await waitFor(() => {
            expect(mockRouterReplace).toHaveBeenCalledWith('/auth/login');
        });
    });

    it('should navigate to home when user is authenticated', async () => {
        const store = createMockStore({
            isAuthenticated: true,
            accessToken: 'test-token',
            user: {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
            },
        });

        render(
            <Provider store={store}>
                <SplashScreen />
            </Provider>
        );

        expect(mockRouterReplace).not.toHaveBeenCalled();

        jest.advanceTimersByTime(2000);

        await waitFor(() => {
            expect(mockRouterReplace).toHaveBeenCalledWith('/home/(tabs)');
        });
    });

    it('should not navigate before 2 seconds', () => {
        const store = createMockStore();
        render(
            <Provider store={store}>
                <SplashScreen />
            </Provider>
        );

        jest.advanceTimersByTime(1000);

        expect(mockRouterReplace).not.toHaveBeenCalled();
    });
});

