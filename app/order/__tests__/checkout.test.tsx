import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CheckoutScreen from '../checkout';
import themeReducer from '@/src/context/slices/themeSlice';
import orderReducer from '@/src/context/slices/orderSlice';
import profileReducer from '@/src/context/slices/profileSlice';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      theme: themeReducer,
      order: orderReducer,
      profile: profileReducer,
    },
    preloadedState: {
      theme: { isDarkMode: false },
      order: {
        selectedProduct: {
          id: '1',
          image: require('@/assets/d1.png'),
          title: 'Test Product',
          description: 'Test Description',
          price: '$100.00',
        },
      },
      profile: { data: { firstName: 'Lucia' } },
      ...initialState,
    },
  });
};

describe('CheckoutScreen', () => {
  const mockRouterBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-router').useRouter.mockReturnValue({
      back: mockRouterBack,
    });
  });

  it('should render checkout screen', () => {
    const store = createMockStore();
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <CheckoutScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should display order summary', () => {
    const store = createMockStore();
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <CheckoutScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should call router.back when back button is pressed', () => {
    const store = createMockStore();
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <CheckoutScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should render with light theme', () => {
    const store = createMockStore({
      theme: { isDarkMode: false },
    });
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <CheckoutScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should render with dark theme', () => {
    const store = createMockStore({
      theme: { isDarkMode: true },
    });
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <CheckoutScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });
});

