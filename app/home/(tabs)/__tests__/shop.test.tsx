import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ShopScreen from '../shop';
import themeReducer from '@/src/context/slices/themeSlice';

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      theme: themeReducer,
    },
    preloadedState: {
      theme: { isDarkMode: false },
      ...initialState,
    },
  });
};

describe('ShopScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render shop screen', () => {
    const store = createMockStore();
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <ShopScreen />
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
          <ShopScreen />
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
          <ShopScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });
});

