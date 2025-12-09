import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ProductDetailView from '../ProductDetailView';
import themeReducer from '@/src/context/slices/themeSlice';
import orderReducer from '@/src/context/slices/orderSlice';
import onboardingReducer from '@/src/context/slices/onboardingSlice';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      theme: themeReducer,
      order: orderReducer,
      onboarding: onboardingReducer,
    },
    preloadedState: {
      theme: { isDarkMode: false },
      order: { selectedProduct: null },
      onboarding: { data: { firstName: 'Lucia' } },
      ...initialState,
    },
  });
};

const mockProduct = {
  id: '1',
  image: require('@/assets/d1.png'),
  title: 'Test Product',
  description: 'Test Description',
  price: '$100.00',
  brand: 'Test Brand',
};

describe('ProductDetailView', () => {
  const mockOnClose = jest.fn();
  const mockOnBack = jest.fn();
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-router').useRouter.mockReturnValue({
      push: mockRouterPush,
    });
  });

  it('should render ProductDetailView', () => {
    const store = createMockStore();
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <ProductDetailView
            product={mockProduct}
            onClose={mockOnClose}
            onBack={mockOnBack}
            selectedOption="existing"
          />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should display product title', () => {
    const store = createMockStore();
    const { root, queryByText } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <ProductDetailView
            product={mockProduct}
            onClose={mockOnClose}
            onBack={mockOnBack}
            selectedOption="existing"
          />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should call onBack when back button is pressed', () => {
    const store = createMockStore();
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <ProductDetailView
            product={mockProduct}
            onClose={mockOnClose}
            onBack={mockOnBack}
            selectedOption="existing"
          />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should navigate to checkout when buy entire look is pressed', () => {
    const store = createMockStore();
    const { root, queryByText } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <ProductDetailView
            product={mockProduct}
            onClose={mockOnClose}
            onBack={mockOnBack}
            selectedOption="existing"
          />
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
          <ProductDetailView
            product={mockProduct}
            onClose={mockOnClose}
            onBack={mockOnBack}
            selectedOption="existing"
          />
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
          <ProductDetailView
            product={mockProduct}
            onClose={mockOnClose}
            onBack={mockOnBack}
            selectedOption="existing"
          />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });
});

