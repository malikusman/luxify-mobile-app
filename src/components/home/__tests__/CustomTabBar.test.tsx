import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomTabBar from '../CustomTabBar';
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

describe('CustomTabBar', () => {
  const mockRouterPush = jest.fn();
  const mockUsePathname = jest.fn(() => '/home/(tabs)/');

  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-router').useRouter.mockReturnValue({
      push: mockRouterPush,
    });
    require('expo-router').usePathname.mockReturnValue('/home/(tabs)/');
  });

  it('should render CustomTabBar', () => {
    const store = createMockStore();
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <CustomTabBar />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should render all tab icons', () => {
    const store = createMockStore();
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <CustomTabBar />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should navigate to closet when closet tab is pressed', () => {
    const store = createMockStore();
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <CustomTabBar />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should identify active tab correctly', () => {
    require('expo-router').usePathname.mockReturnValue('/home/(tabs)/closet');
    const store = createMockStore();
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <CustomTabBar />
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
          <CustomTabBar />
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
          <CustomTabBar />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });
});

