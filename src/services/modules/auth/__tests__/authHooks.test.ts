import { QueryClient } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';
import { useSignIn, useSignUp, useSignOut } from '../authHooks';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import authReducer from '@/src/context/slices/authSlice';

// Mock the authApi
jest.mock('../authApi', () => ({
    authApi: {
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
    },
}));

// Mock the store
jest.mock('@/src/context/store', () => {
    const store = configureStore({
        reducer: {
            auth: authReducer,
        },
    });
    return { store };
});

describe('authHooks', () => {
    let queryClient: QueryClient;
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        jest.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
        store = configureStore({
            reducer: {
                auth: authReducer,
            },
        });
    });

    afterEach(() => {
        queryClient.clear();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    );

    describe('useSignIn', () => {
        it('should be defined', () => {
            const { result } = renderHook(() => useSignIn(), { wrapper });
            expect(result.current).toBeDefined();
        });

        it('should have mutateAsync method', () => {
            const { result } = renderHook(() => useSignIn(), { wrapper });
            expect(result.current.mutateAsync).toBeDefined();
            expect(typeof result.current.mutateAsync).toBe('function');
        });
    });

    describe('useSignUp', () => {
        it('should be defined', () => {
            const { result } = renderHook(() => useSignUp(), { wrapper });
            expect(result.current).toBeDefined();
        });

        it('should have mutateAsync method', () => {
            const { result } = renderHook(() => useSignUp(), { wrapper });
            expect(result.current.mutateAsync).toBeDefined();
            expect(typeof result.current.mutateAsync).toBe('function');
        });
    });

    describe('useSignOut', () => {
        it('should be defined', () => {
            const { result } = renderHook(() => useSignOut(), { wrapper });
            expect(result.current).toBeDefined();
        });

        it('should have mutateAsync method', () => {
            const { result } = renderHook(() => useSignOut(), { wrapper });
            expect(result.current.mutateAsync).toBeDefined();
            expect(typeof result.current.mutateAsync).toBe('function');
        });
    });
});

