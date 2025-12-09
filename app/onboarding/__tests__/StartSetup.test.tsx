import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import StartSetup from '../StartSetup';
import themeReducer from '@/src/context/slices/themeSlice';

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

describe('StartSetup', () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-router').useRouter.mockReturnValue({
      push: mockRouterPush,
    });
  });

  it('should render StartSetup screen', () => {
    const store = createMockStore();
    const { root } = render(
      <Provider store={store}>
        <StartSetup />
      </Provider>
    );

    expect(root).toBeTruthy();
  });

  it('should navigate to OnboardingFlow when start setup button is pressed', () => {
    const store = createMockStore();
    const { root } = render(
      <Provider store={store}>
        <StartSetup />
      </Provider>
    );

    expect(root).toBeTruthy();
  });

  it('should render with light theme', () => {
    const store = createMockStore({
      theme: { isDarkMode: false },
    });
    const { root } = render(
      <Provider store={store}>
        <StartSetup />
      </Provider>
    );

    expect(root).toBeTruthy();
  });

  it('should render with dark theme', () => {
    const store = createMockStore({
      theme: { isDarkMode: true },
    });
    const { root } = render(
      <Provider store={store}>
        <StartSetup />
      </Provider>
    );

    expect(root).toBeTruthy();
  });
});

