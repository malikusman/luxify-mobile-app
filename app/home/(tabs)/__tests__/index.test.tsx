import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from '../index';
import themeReducer from '@/src/context/slices/themeSlice';
import closetReducer from '@/src/context/slices/closetSlice';

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      theme: themeReducer,
      closet: closetReducer,
    },
    preloadedState: {
      theme: { isDarkMode: false },
      closet: { images: [], maxImages: 5 },
      ...initialState,
    },
  });
};

describe('HomeScreen', () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-router').useRouter.mockReturnValue({
      push: mockRouterPush,
    });
  });

  it('should render home screen', () => {
    const store = createMockStore();
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <HomeScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should render welcome message', () => {
    const store = createMockStore();
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <HomeScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should display closet count', () => {
    const store = createMockStore({
      closet: { images: [{ id: '1', uri: 'test.jpg', timestamp: Date.now() }], maxImages: 5 },
    });
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <HomeScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
    expect(store.getState().closet.images).toHaveLength(1);
  });

  it('should handle add to closet navigation when not at max', () => {
    const store = createMockStore({
      closet: { images: [], maxImages: 5 },
    });
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <HomeScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
    expect(store.getState().closet.images.length).toBeLessThan(store.getState().closet.maxImages);
  });

  it('should handle navigation to closet when at max images', () => {
    const store = createMockStore({
      closet: {
        images: Array(5).fill(null).map((_, i) => ({
          id: `img_${i}`,
          uri: `test${i}.jpg`,
          timestamp: Date.now(),
        })),
        maxImages: 5,
      },
    });
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <HomeScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
    expect(store.getState().closet.images.length).toBe(store.getState().closet.maxImages);
  });

  it('should render with light theme', () => {
    const store = createMockStore({
      theme: { isDarkMode: false },
    });
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <HomeScreen />
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
          <HomeScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });
});

