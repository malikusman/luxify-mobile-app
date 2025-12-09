import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import OnboardingFlow from '../OnboardingFlow';
import themeReducer from '@/src/context/slices/themeSlice';
import onboardingReducer from '@/src/context/slices/onboardingSlice';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      theme: themeReducer,
      onboarding: onboardingReducer,
    },
    preloadedState: {
      theme: { isDarkMode: false },
      onboarding: {
        currentStep: 1,
        totalSteps: 4,
        data: {},
        isCompleted: false,
      },
      ...initialState,
    },
  });
};

describe('OnboardingFlow', () => {
  const mockRouterPush = jest.fn();
  const mockRouterBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-router').useRouter.mockReturnValue({
      push: mockRouterPush,
      back: mockRouterBack,
    });
  });

  it('should render OnboardingFlow', () => {
    const store = createMockStore();
    const { root } = render(
      <Provider store={store}>
        <OnboardingFlow />
      </Provider>
    );

    expect(root).toBeTruthy();
  });

  it('should render Step1 when currentStep is 1', () => {
    const store = createMockStore({
      onboarding: {
        currentStep: 1,
        totalSteps: 4,
        data: {},
        isCompleted: false,
      },
    });
    const { root } = render(
      <Provider store={store}>
        <OnboardingFlow />
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
        <OnboardingFlow />
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
        <OnboardingFlow />
      </Provider>
    );

    expect(root).toBeTruthy();
  });
});

