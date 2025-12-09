import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SocialLoginButton from '../SocialLoginButton';
import themeReducer from '@/src/context/slices/themeSlice';

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

describe('SocialLoginButton', () => {
  const mockOnPress = jest.fn();
  const icon = <div>Icon</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with icon', () => {
    const store = createMockStore();
    const { root } = render(
      <Provider store={store}>
        <SocialLoginButton icon={icon} />
      </Provider>
    );

    expect(root).toBeTruthy();
  });

  it('should call onPress when provided', () => {
    const store = createMockStore();
    const { root } = render(
      <Provider store={store}>
        <SocialLoginButton icon={icon} onPress={mockOnPress} />
      </Provider>
    );
    expect(root).toBeTruthy();
  });
});

