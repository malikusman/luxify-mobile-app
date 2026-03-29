import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Login from '../login';
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

describe('Login Screen', () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-router').useRouter.mockReturnValue({
      push: mockRouterPush,
      replace: jest.fn(),
    });
  });

  it('should render login screen', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    expect(getByText('Welcome to Luxify')).toBeTruthy();
  });

  it('should render all social login buttons', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    expect(getByText('Continue with Google')).toBeTruthy();
    expect(getByText('Continue with Facebook')).toBeTruthy();
    expect(getByText('Continue with Apple')).toBeTruthy();
  });

  it('should navigate to home when Google button is pressed', () => {
    const mockRouterReplace = jest.fn();
    require('expo-router').useRouter.mockReturnValue({
      push: mockRouterPush,
      replace: mockRouterReplace,
    });

    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    const googleButton = getByText('Continue with Google');
    fireEvent.press(googleButton);

    expect(mockRouterReplace).toHaveBeenCalledWith('/home/(tabs)');
  });

  it('should navigate to signup when sign up link is pressed', () => {
    const mockRouterPush = jest.fn();
    require('expo-router').useRouter.mockReturnValue({
      push: mockRouterPush,
    });

    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    const signUpLink = getByText('Sign up');
    fireEvent.press(signUpLink);

    expect(mockRouterPush).toHaveBeenCalledWith('/auth/Signup');
  });

  it('should render sign in with password button', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    expect(getByText('Sign in with password')).toBeTruthy();
  });
});

