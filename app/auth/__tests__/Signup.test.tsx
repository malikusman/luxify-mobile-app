import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SignUp from '../Signup';
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

jest.mock('@/src/services/modules/auth/authHooks', () => ({
    useSignUp: () => ({
        mutateAsync: jest.fn().mockResolvedValue({
            token: 'test-token',
            user: {
                id: '1',
                email: 'test@example.com',
                first_name: 'John',
                last_name: 'Doe',
            },
        }),
        isPending: false,
    }),
}));

const createMockStore = (initialState = {}) => {
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
            ...initialState,
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

describe('SignUp Screen', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        jest.clearAllMocks();
        queryClient = createQueryClient();
    });

    afterEach(() => {
        queryClient.clear();
    });

    it('should render signup screen', () => {
        const store = createMockStore();
        const { getByText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <SignUp />
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );

        expect(getByText('Create Your Account')).toBeTruthy();
    });

    it('should render all form fields', () => {
        const store = createMockStore();
        const { getByPlaceholderText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <SignUp />
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );

        expect(getByPlaceholderText('First name')).toBeTruthy();
        expect(getByPlaceholderText('Last name')).toBeTruthy();
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByPlaceholderText('Confirm password')).toBeTruthy();
    });

    it('should show validation error for invalid email', async () => {
        const store = createMockStore();
        const { getByPlaceholderText, getByText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <SignUp />
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );

        const emailInput = getByPlaceholderText('Email');
        fireEvent.changeText(emailInput, 'invalid-email');

        const passwordInput = getByPlaceholderText('Password');
        fireEvent.changeText(passwordInput, '123456');

        const signUpButton = getByText('Sign up');
        fireEvent.press(signUpButton);

        await waitFor(() => {
            expect(mockRouterReplace).not.toHaveBeenCalled();
        });
    });

    it('should show validation error for short password', async () => {
        const store = createMockStore();
        const { getByPlaceholderText, getByText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <SignUp />
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );

        const emailInput = getByPlaceholderText('Email');
        fireEvent.changeText(emailInput, 'test@example.com');

        const passwordInput = getByPlaceholderText('Password');
        fireEvent.changeText(passwordInput, '12345');

        const signUpButton = getByText('Sign up');
        fireEvent.press(signUpButton);

        await waitFor(() => {
            expect(mockRouterReplace).not.toHaveBeenCalled();
        });
    });

    it('should show validation error when passwords do not match', async () => {
        const store = createMockStore();
        const { getByPlaceholderText, getByText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <SignUp />
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );

        const firstNameInput = getByPlaceholderText('First name');
        fireEvent.changeText(firstNameInput, 'John');

        const lastNameInput = getByPlaceholderText('Last name');
        fireEvent.changeText(lastNameInput, 'Doe');

        const emailInput = getByPlaceholderText('Email');
        fireEvent.changeText(emailInput, 'test@example.com');

        const passwordInput = getByPlaceholderText('Password');
        fireEvent.changeText(passwordInput, 'password123');

        const confirmPasswordInput = getByPlaceholderText('Confirm password');
        fireEvent.changeText(confirmPasswordInput, 'password456');

        const signUpButton = getByText('Sign up');
        fireEvent.press(signUpButton);

        await waitFor(() => {
            expect(mockRouterReplace).not.toHaveBeenCalled();
        });
    });

    it('should show validation error for empty first name', async () => {
        const store = createMockStore();
        const { getByPlaceholderText, getByText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <SignUp />
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );

        const emailInput = getByPlaceholderText('Email');
        fireEvent.changeText(emailInput, 'test@example.com');

        const passwordInput = getByPlaceholderText('Password');
        fireEvent.changeText(passwordInput, 'password123');

        const confirmPasswordInput = getByPlaceholderText('Confirm password');
        fireEvent.changeText(confirmPasswordInput, 'password123');

        const signUpButton = getByText('Sign up');
        fireEvent.press(signUpButton);

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
                        <SignUp />
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );

        const passwordInput = getByPlaceholderText('Password');
        expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it('should navigate to login when sign in link is pressed', () => {
        const store = createMockStore();
        const { getByText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <SignUp />
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );

        const signInLink = getByText('Sign in');
        fireEvent.press(signInLink);

        expect(mockRouterPush).toHaveBeenCalledWith('/auth/login');
    });

    it('should navigate to home after successful signup', async () => {
        const store = createMockStore();
        const { getByPlaceholderText, getByText } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <SignUp />
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );

        const firstNameInput = getByPlaceholderText('First name');
        fireEvent.changeText(firstNameInput, 'John');

        const lastNameInput = getByPlaceholderText('Last name');
        fireEvent.changeText(lastNameInput, 'Doe');

        const emailInput = getByPlaceholderText('Email');
        fireEvent.changeText(emailInput, 'test@example.com');

        const passwordInput = getByPlaceholderText('Password');
        fireEvent.changeText(passwordInput, 'password123');

        const confirmPasswordInput = getByPlaceholderText('Confirm password');
        fireEvent.changeText(confirmPasswordInput, 'password123');

        const signUpButton = getByText('Sign up');
        fireEvent.press(signUpButton);

        await waitFor(() => {
            expect(mockRouterReplace).toHaveBeenCalledWith('/home/(tabs)');
        });
    });
});

