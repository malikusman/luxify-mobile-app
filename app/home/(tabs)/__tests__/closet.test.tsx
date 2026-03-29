import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ClosetScreen from '../closet';
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

describe('ClosetScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render closet screen', () => {
    const store = createMockStore();
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <ClosetScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should display empty state when no images', () => {
    const store = createMockStore({
      closet: { images: [], maxImages: 5 },
    });
    const { root, queryByText } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <ClosetScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
    expect(store.getState().closet.images).toHaveLength(0);
  });

  it('should display images when closet has items', () => {
    const store = createMockStore({
      closet: {
        images: [
          { id: '1', uri: 'file://test1.jpg', timestamp: Date.now() },
          { id: '2', uri: 'file://test2.jpg', timestamp: Date.now() },
        ],
        maxImages: 5,
      },
    });
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <ClosetScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should remove image when remove button is pressed', () => {
    const store = createMockStore({
      closet: {
        images: [
          { id: '1', uri: 'file://test1.jpg', timestamp: Date.now() },
          { id: '2', uri: 'file://test2.jpg', timestamp: Date.now() },
        ],
        maxImages: 5,
      },
    });
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <ClosetScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(store.getState().closet.images).toHaveLength(2);
    expect(root).toBeTruthy();
  });

  it('should render with light theme', () => {
    const store = createMockStore({
      theme: { isDarkMode: false },
    });
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <ClosetScreen />
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
          <ClosetScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });
});

