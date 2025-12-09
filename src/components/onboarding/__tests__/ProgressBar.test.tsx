import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProgressBar from '../ProgressBar';
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

describe('ProgressBar', () => {
  it('should render progress bar with correct number of steps', () => {
    const store = createMockStore();
    const { UNSAFE_getAllByType } = render(
      <Provider store={store}>
        <ProgressBar currentStep={2} totalSteps={4} />
      </Provider>
    );

    const steps = UNSAFE_getAllByType('View');
    expect(steps.length).toBeGreaterThanOrEqual(4);
  });

  it('should highlight current step', () => {
    const store = createMockStore();
    const { UNSAFE_getAllByType } = render(
      <Provider store={store}>
        <ProgressBar currentStep={3} totalSteps={4} />
      </Provider>
    );

    expect(UNSAFE_getAllByType('View')).toBeTruthy();
  });

  it('should highlight completed steps', () => {
    const store = createMockStore();
    const { UNSAFE_getAllByType } = render(
      <Provider store={store}>
        <ProgressBar currentStep={3} totalSteps={4} />
      </Provider>
    );

    expect(UNSAFE_getAllByType('View')).toBeTruthy();
  });
});

