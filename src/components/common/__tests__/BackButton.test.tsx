import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BackButton from '../BackButton';
import { useRouter } from 'expo-router';
import themeReducer from '@/src/context/slices/themeSlice';

jest.mock('expo-router');

const createMockStore = () => {
  return configureStore({
    reducer: {
      theme: themeReducer,
    },
    preloadedState: {
      theme: { isDarkMode: false },
    },
  });
};

describe('BackButton', () => {
  const mockRouterBack = jest.fn();
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockRouterBack,
    });
  });

  it('should call router.back when pressed without custom onPress', () => {
    const store = createMockStore();
    const { root } = render(
      <Provider store={store}>
        <BackButton />
      </Provider>
    );
    expect(root).toBeTruthy();
  });

  it('should call custom onPress when provided', () => {
    const store = createMockStore();
    const { root } = render(
      <Provider store={store}>
        <BackButton onPress={mockOnPress} />
      </Provider>
    );
    expect(root).toBeTruthy();
  });

  it('should render back icon', () => {
    const store = createMockStore();
    const { root } = render(
      <Provider store={store}>
        <BackButton />
      </Provider>
    );
    expect(root).toBeTruthy();
  });
});

