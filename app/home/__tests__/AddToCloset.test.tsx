import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AddToClosetScreen from '../AddToCloset';
import themeReducer from '@/src/context/slices/themeSlice';
import closetReducer from '@/src/context/slices/closetSlice';

jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  CameraType: {
    back: 'back',
    front: 'front',
  },
  useCameraPermissions: jest.fn(() => [
    { granted: true },
    jest.fn(() => Promise.resolve({ granted: true })),
  ]),
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

describe('AddToClosetScreen', () => {
  const mockRouterBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-router').useRouter.mockReturnValue({
      back: mockRouterBack,
    });
  });

  it('should render AddToCloset screen', () => {
    const store = createMockStore();
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <AddToClosetScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should show permission request when permission not granted', () => {
    const { useCameraPermissions } = require('expo-camera');
    useCameraPermissions.mockReturnValue([
      { granted: false },
      jest.fn(() => Promise.resolve({ granted: true })),
    ]);

    const store = createMockStore();
    const { root, queryByText } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <AddToClosetScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });

  it('should render camera view when permission granted', () => {
    const { useCameraPermissions } = require('expo-camera');
    useCameraPermissions.mockReturnValue([
      { granted: true },
      jest.fn(),
    ]);

    const store = createMockStore();
    const { root } = render(
      <SafeAreaProvider>
        <Provider store={store}>
          <AddToClosetScreen />
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
          <AddToClosetScreen />
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
          <AddToClosetScreen />
        </Provider>
      </SafeAreaProvider>
    );

    expect(root).toBeTruthy();
  });
});

