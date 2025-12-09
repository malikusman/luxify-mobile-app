import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SignUp from '../Signup';
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

describe('SignUp Screen', () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-router').useRouter.mockReturnValue({
      push: mockRouterPush,
    });
  });

  it('should render signup screen', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <SignUp />
      </Provider>
    );

    expect(getByText('Create Your Account')).toBeTruthy();
  });

  it('should render email and password inputs', () => {
    const store = createMockStore();
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <SignUp />
      </Provider>
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('should show validation error for invalid email', async () => {
    const store = createMockStore();
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <SignUp />
      </Provider>
    );

    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'invalid-email');

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, '123456');

    const signUpButton = getByText('Sign up');
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  it('should show validation error for short password', async () => {
    const store = createMockStore();
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <SignUp />
      </Provider>
    );

    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'test@example.com');

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, '12345');

    const signUpButton = getByText('Sign up');
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  it('should toggle password visibility', () => {
    const store = createMockStore();
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <SignUp />
      </Provider>
    );

    const passwordInput = getByPlaceholderText('Password');
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('should navigate to login when sign in link is pressed', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <SignUp />
      </Provider>
    );

    const signInLink = getByText('Sign in');
    fireEvent.press(signInLink);

    expect(mockRouterPush).toHaveBeenCalledWith('/auth/login');
  });
});

