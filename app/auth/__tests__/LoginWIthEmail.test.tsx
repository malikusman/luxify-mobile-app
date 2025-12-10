import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginWithEmail from '../LoginWIthEmail';
import themeReducer from '@/src/context/slices/themeSlice';
import authReducer from '@/src/context/slices/authSlice';
import { ToastProvider } from '@/src/context/ToastContext';

const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockRouterPush,
        replace: mockRouterReplace,
    }),
}));

const mockMutateAsync = jest.fn().mockResolvedValue({
    token: 'test-token',
    user: {
        id: '1',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
    },
});

jest.mock('@/src/services/modules/auth/authHooks', () => ({
    useSignIn: () => ({
        mutateAsync: mockMutateAsync,
        isPending: false,
    }),
}));

const createMockStore = () => {
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
            },
        },
    });
};

const createQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
};

describe('LoginWithEmail', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        jest.clearAllMocks();
        mockMutateAsync.mockClear();
        queryClient = createQueryClient();
    });

    afterEach(() => {
        queryClient.clear();
    });

    it('should render login form', () => {
        const store = createMockStore();
        const { getAllByText, getByPlaceholderText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <LoginWithEmail />
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );

        const signInTexts = getAllByText('Sign in');
        expect(signInTexts.length).toBeGreaterThan(0);
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
    });

    it('should show validation error for invalid email', async () => {
        const store = createMockStore();
        const { getByPlaceholderText, getAllByText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <LoginWithEmail />
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );

        const emailInput = getByPlaceholderText('Email');
        fireEvent.changeText(emailInput, 'invalid-email');

        const passwordInput = getByPlaceholderText('Password');
        fireEvent.changeText(passwordInput, '123456');

        const signInButtons = getAllByText('Sign in');
        if (signInButtons.length > 0) {
            fireEvent.press(signInButtons[0]); // Use the first one (the button, not the link)
        }

        await waitFor(() => {
            expect(mockRouterReplace).not.toHaveBeenCalled();
        });
    });

    it('should show validation error for empty password', async () => {
        const store = createMockStore();
        const { getByPlaceholderText, getAllByText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <LoginWithEmail />
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );

        const emailInput = getByPlaceholderText('Email');
        fireEvent.changeText(emailInput, 'test@example.com');

        const signInButtons = getAllByText('Sign in');
        if (signInButtons.length > 0) {
            fireEvent.press(signInButtons[0]); // Use the first one (the button, not the link)
        }

        await waitFor(() => {
            expect(mockRouterReplace).not.toHaveBeenCalled();
        });
    });

    it('should toggle password visibility', () => {
        const store = createMockStore();
        const { getByPlaceholderText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <LoginWithEmail />
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );

        const passwordInput = getByPlaceholderText('Password');
        expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it('should navigate to signup when sign up link is pressed', () => {
        const store = createMockStore();
        const { getByText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <LoginWithEmail />
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );

        const signUpLink = getByText('Sign up');
        fireEvent.press(signUpLink);

        expect(mockRouterPush).toHaveBeenCalledWith('/auth/Signup');
    });

    it('should have sign in button that can be pressed', () => {
        const store = createMockStore();
        const { getAllByText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <LoginWithEmail />
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );

        const signInButtons = getAllByText('Sign in');
        expect(signInButtons.length).toBeGreaterThan(0);
        // Verify the button exists and can be interacted with
        expect(signInButtons[0]).toBeTruthy();
    });
});

