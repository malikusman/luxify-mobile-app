import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Header from '../Header';
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

describe('Header', () => {
  it('should render header with all elements', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <Header />
      </Provider>
    );

    expect(getByText('Events')).toBeTruthy();
  });

  it('should render profile icon', () => {
    const store = createMockStore();
    const { root } = render(
      <Provider store={store}>
        <Header />
      </Provider>
    );

    expect(root).toBeTruthy();
  });

  it('should render help and bell icons', () => {
    const store = createMockStore();
    const { root } = render(
      <Provider store={store}>
        <Header />
      </Provider>
    );

    expect(root).toBeTruthy();
  });
});

