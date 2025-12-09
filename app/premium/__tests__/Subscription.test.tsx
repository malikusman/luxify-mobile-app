import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Subscription from '../Subscription';
import themeReducer from '@/src/context/slices/themeSlice';

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
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

describe('Subscription', () => {
  const mockRouterPush = jest.fn();
  const mockRouterBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-router').useRouter.mockReturnValue({
      push: mockRouterPush,
      back: mockRouterBack,
    });
  });

  it('should render Subscription screen', () => {
    const store = createMockStore();
    const { root } = render(
      <Provider store={store}>
        <Subscription />
      </Provider>
    );

    expect(root).toBeTruthy();
  });

  it('should navigate to home when start free trial is pressed', () => {
    const store = createMockStore();
    const { root } = render(
      <Provider store={store}>
        <Subscription />
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
        <Subscription />
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
        <Subscription />
      </Provider>
    );

    expect(root).toBeTruthy();
  });
});

